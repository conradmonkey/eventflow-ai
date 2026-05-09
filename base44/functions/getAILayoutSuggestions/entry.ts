import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { designType, parameters } = await req.json();

    if (!designType || !parameters) {
      return Response.json({ error: 'Missing designType or parameters' }, { status: 400 });
    }

    let prompt = '';

    switch (designType) {
      case 'room':
        prompt = `You are an expert event planner and room designer. Analyze these room design parameters and provide specific, actionable suggestions for optimal layout:

Room Dimensions: ${parameters.roomLength}' x ${parameters.roomWidth}'
Event Type: ${parameters.eventType || 'Not specified'}
Attendee Count: ${parameters.attendeeCount || 'Not specified'}
${parameters.stageLength ? `Stage: ${parameters.stageLength}' x ${parameters.stageWidth}'` : ''}
${parameters.danceFloorLength ? `Dance Floor: ${parameters.danceFloorLength}' x ${parameters.danceFloorWidth}'` : ''}
${parameters.barLength ? `Bar: ${parameters.barLength}' x ${parameters.barWidth}'` : ''}
${parameters.videoWallHeight ? `Video Wall: ${parameters.videoWallHeight}m x ${parameters.videoWallWidth}m` : ''}
Tables: 8ft(${parameters.table8ft}), 6ft(${parameters.table6ft}), 5ft Round(${parameters.table5ftRound}), 6ft Round(${parameters.table6ftRound}), Cocktail(${parameters.cocktailTables})
Table Color: ${parameters.tableColor}

Provide specific suggestions for:
1. Optimal placement of stage relative to entrance and seating
2. Dance floor positioning and size recommendations
3. Table arrangement pattern (e.g., classroom, banquet, clusters)
4. Bar and service station locations
5. Video wall placement for maximum visibility
6. Traffic flow and guest movement patterns
7. Lighting zone recommendations

Keep suggestions practical and specific to the room dimensions.`;
        break;

      case 'tent':
        prompt = `You are an expert tent and outdoor event designer. Analyze these tent event parameters and provide specific layout suggestions:

Event Type: ${parameters.eventType || 'Not specified'}
Attendee Count: ${parameters.attendeeCount || 'Not specified'}
Seating Arrangement: ${parameters.seatingArrangement || 'Not specified'}
Tent Style: ${parameters.tentStyle || 'Not specified'}
Tent Dimensions: ${parameters.tentWidth}' x ${parameters.tentLength}'
${parameters.stages ? `Stages: ${parameters.stages.length}` : 'No stages'}
${parameters.videoWalls ? `Video Walls: ${parameters.videoWalls.length}` : 'No video walls'}
${parameters.danceFloors ? `Dance Floors: ${parameters.danceFloors.length}` : 'No dance floors'}
${parameters.bars ? `Bars: ${parameters.bars.length}` : 'No bars'}
Tables: 8ft(${parameters.tables8ft || 0}), 6ft(${parameters.tables6ft || 0}), 5ft(${parameters.tables5ft || 0})
${parameters.cocktailTables ? `Cocktail Tables: ${parameters.cocktailTables.length}` : ''}

Provide specific suggestions for:
1. Optimal tent configuration and entry point placement
2. Stage positioning for audience sight lines
3. Table arrangement patterns based on attendee count
4. Dance floor and bar placement
5. Video wall positioning for visibility
6. Power and cable routing considerations
7. Guest flow and exit strategies
8. Lighting placement recommendations
9. Any missing elements that would enhance the event

Be practical about the ${parameters.tentWidth}' x ${parameters.tentLength}' space.`;
        break;

      case 'outdoor':
        prompt = `You are an expert outdoor event layout designer. Analyze these outdoor event parameters and suggest optimal item placement:

Event Type: ${parameters.eventType || 'Not specified'}
Attendee Count: ${parameters.attendeeCount || 'Not specified'}
Space Scale: 1 pixel = ${parameters.scale} feet
Total Items: ${parameters.itemCount || 0}
${parameters.itemTypes ? `Item Types: ${parameters.itemTypes}` : ''}

Provide specific suggestions for:
1. Item spacing and clearance requirements
2. Traffic flow patterns through the space
3. Grouping related items (e.g., facilities near entrances)
4. Sight line considerations for stages and video walls
5. Wind and weather protection positioning
6. Power source accessibility
7. Accessible routes for emergency vehicles
8. Guest comfort zones (shade, shelter)

Focus on practical, space-efficient arrangements that maximize guest experience.`;
        break;

      case 'videowall':
        prompt = `You are an expert video wall technician and event designer. Analyze these video wall parameters and suggest optimal configuration:

Project Type: ${parameters.projectType || 'Not specified'}
Event Space: ${parameters.eventSpace || 'Not specified'}
Wall Dimensions: ${parameters.wallHeight}m x ${parameters.wallWidth}m
Height Off Ground: ${parameters.heightOffGround}m
Space Width: ${parameters.spaceWidth || 'Not specified'}
Viewing Distance: ${parameters.viewingDistance || 'Not specified'}

Provide specific suggestions for:
1. Optimal pixel pitch (mm) for the viewing distance
2. Recommended LED module configuration
3. Best placement height and angle for audience
4. Viewing angle coverage and optimal seating positions
5. Content resolution and refresh rate recommendations
6. Power distribution strategy
7. Ventilation and heat management considerations
8. Rigging and structural support requirements

Ensure recommendations account for the ${parameters.wallHeight}m x ${parameters.wallWidth}m dimensions.`;
        break;

      default:
        return Response.json({ error: 'Unknown design type' }, { status: 400 });
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    return Response.json({
      success: true,
      suggestions: response,
      designType
    });
  } catch (error) {
    console.error('Error generating layout suggestions:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate suggestions',
      details: error.toString()
    }, { status: 500 });
  }
});