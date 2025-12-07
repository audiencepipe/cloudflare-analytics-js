import { CfEvents } from '@audiencepipe/cloudflare-analytics-node';

export default {
  async fetch(request, env, ctx) {
    console.log('Worker invoked');
    
    // Check if binding exists
    if (!env.WEBSITE_PROD_STREAM) {
      console.error('WEBSITE_PROD_STREAM binding is missing!');
      return new Response('Binding missing', { status: 500 });
    }
    
    console.log('Initializing CfEvents with binding');
    
    const cfevents = new CfEvents({
      cloudflarePipelineBinding: env.WEBSITE_PROD_STREAM,
      flushInterval: 1 // Short interval for testing
    });

    console.log('Tracking event...');
    
    try {
        // Wrap in promise to wait for it
        await new Promise<void>((resolve, reject) => {
            cfevents.track({
                event: 'sample_event222',
                userId: 'sample_userId',
                properties: {
                    example: 'json_data'
                }
            }, (err, ctx) => {
                console.log('Callback invoked with err:', err, 'ctx:', ctx ? 'defined' : 'undefined');
                try {
                    if (err) {
                        console.error('Event delivery failed:', err);
                        reject(err);
                    } else {
                        console.log('Event delivered successfully');
                        resolve();
                    }
                } catch (e) {
                    console.error('Callback error:', e);
                    reject(e);
                }
            });
        });
        
        return new Response('Event tracked');
    } catch (e) {
        console.error('Error tracking event:', e);
        return new Response('Error tracking event', { status: 500 });
    }
  },
};
