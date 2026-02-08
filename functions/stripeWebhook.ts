import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { stripe as stripeLib } from 'npm:stripe@16.0.0';

const stripe = new stripeLib(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    const base44 = createClientFromRequest(req);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.metadata.email;

      // Create or update subscription record
      const existing = await base44.entities.Subscription.filter({ email });

      if (existing.length > 0) {
        await base44.entities.Subscription.update(existing[0].id, {
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active'
        });
      } else {
        await base44.entities.Subscription.create({
          email,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active'
        });
      }
    }

    // Handle customer.subscription.updated
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const subs = await base44.entities.Subscription.filter({
        stripe_subscription_id: subscription.id
      });

      if (subs.length > 0) {
        await base44.entities.Subscription.update(subs[0].id, {
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        });
      }
    }

    // Handle customer.subscription.deleted
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const subs = await base44.entities.Subscription.filter({
        stripe_subscription_id: subscription.id
      });

      if (subs.length > 0) {
        await base44.entities.Subscription.update(subs[0].id, {
          status: 'canceled'
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});