import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { totem_id, ip_address } = await req.json()

    if (!totem_id) {
      return new Response(
        JSON.stringify({ error: 'totem_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date().toISOString()

    // Atualizar totem
    const { data: totem, error: totemError } = await supabase
      .from('totens')
      .update({ 
        ultimo_ping: now,
        status: 'online',
        updated_at: now
      })
      .eq('id', totem_id)
      .select('id, status')
      .single()

    if (totemError || !totem) {
      return new Response(
        JSON.stringify({ error: 'Totem não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Atualizar ou criar sessão
    const { data: existingSession } = await supabase
      .from('totem_sessoes')
      .select('id')
      .eq('totem_id', totem_id)
      .single()

    if (existingSession) {
      await supabase
        .from('totem_sessoes')
        .update({ 
          ultimo_ping: now,
          ip_address: ip_address || null
        })
        .eq('id', existingSession.id)
    } else {
      await supabase
        .from('totem_sessoes')
        .insert({
          totem_id,
          ultimo_ping: now,
          ip_address: ip_address || null
        })
    }

    // Buscar questionários atualizados (se houver novos)
    const { data: questionarios } = await supabase
      .from('questionarios')
      .select('id, versao, updated_at')
      .eq('unidade_id', totem.unidade_id)
      .eq('ativo', true)

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now,
        totem_status: totem.status,
        questionarios: questionarios || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
