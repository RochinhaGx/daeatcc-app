import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-esp32-key',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('ESP32 control endpoint called');

    // Validate API key from ESP32
    const espApiKey = req.headers.get('x-esp32-key');
    const validApiKey = Deno.env.get('ESP32_API_KEY');

    if (!espApiKey || espApiKey !== validApiKey) {
      console.error('Invalid or missing ESP32 API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get device_id from query params
    const url = new URL(req.url);
    const deviceId = url.searchParams.get('device_id');

    if (!deviceId) {
      console.error('Missing device_id parameter');
      return new Response(
        JSON.stringify({ error: 'device_id parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Checking status for device:', deviceId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get device status
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, name, status, user_id')
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      console.error('Device not found:', deviceError);
      return new Response(
        JSON.stringify({ error: 'Device not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Device found:', device);
    console.log('Current status:', device.status);

    return new Response(
      JSON.stringify({ 
        success: true,
        device_id: device.id,
        device_name: device.name,
        status: device.status,
        message: `Device is ${device.status}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in esp32-control function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
