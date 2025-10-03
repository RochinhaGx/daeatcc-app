import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-esp32-key',
};

interface SensorData {
  device_id: string;
  temperature?: number;
  humidity?: number;
  water_level?: number;
  evaporation_rate?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('ESP32 data endpoint called');

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

    // Parse request body
    const data: SensorData = await req.json();
    console.log('Received sensor data:', data);

    // Validate required fields
    if (!data.device_id) {
      console.error('Missing device_id');
      return new Response(
        JSON.stringify({ error: 'device_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get device to verify it exists and get user_id
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('user_id, status')
      .eq('id', data.device_id)
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

    // Update device status to 'ligado' if it's not already
    if (device.status !== 'ligado') {
      const { error: updateError } = await supabase
        .from('devices')
        .update({ status: 'ligado' })
        .eq('id', data.device_id);

      if (updateError) {
        console.error('Error updating device status:', updateError);
      } else {
        console.log('Device status updated to ligado');
      }
    }

    // Insert sensor data
    const { data: insertedData, error: insertError } = await supabase
      .from('sensor_data')
      .insert({
        device_id: data.device_id,
        user_id: device.user_id,
        temperature: data.temperature,
        humidity: data.humidity,
        water_level: data.water_level,
        evaporation_rate: data.evaporation_rate,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting sensor data:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert sensor data', details: insertError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Sensor data inserted successfully:', insertedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sensor data saved successfully',
        data: insertedData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in esp32-data function:', error);
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
