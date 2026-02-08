import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const subscriptions = await base44.entities.Subscription.filter({ 
      email,
      status: 'active'
    });

    const isActive = subscriptions.length > 0;

    return Response.json({ 
      isActive,
      subscription: isActive ? subscriptions[0] : null
    });
  } catch (error) {
    console.error('Check subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});