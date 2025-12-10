import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const PLACE_ID = 'ChIJ1aZJvMBtXz4RLrOI1vITjBU';
const API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJ1aZJvMBtXz4RLrOI1vITjBU&fields=name,opening_hours&key=AIzaSyBcD7hYodf1KBgvfejaxk9Lk-vVEcV1go8`;
    const response = await fetch(url);
    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});