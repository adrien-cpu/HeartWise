import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, points_to_add } = await req.json()

    if (!user_id || !points_to_add) {
      throw new Error('Missing user_id or points_to_add')
    }

    // Update user points
    const { data, error } = await supabaseClient
      .from('users')
      .update({ 
        points: supabaseClient.raw(`points + ${points_to_add}`),
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select('points')
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify(data.points),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})