import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function isQuestionarioDisponivel(
  questionario: { data_inicio?: string | null; data_fim?: string | null },
  referenceDate: Date,
) {
  const startsAt = questionario.data_inicio ? new Date(questionario.data_inicio) : null
  const endsAt = questionario.data_fim ? new Date(questionario.data_fim) : null

  if (startsAt && startsAt > referenceDate) {
    return false
  }

  if (endsAt && endsAt < referenceDate) {
    return false
  }

  return true
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

    const nowDate = new Date()
    const now = nowDate.toISOString()

    // Atualizar totem
    const { error: updateError } = await supabase
      .from('totens')
      .update({ 
        ultimo_ping: now,
        status: 'online',
        updated_at: now
      })
      .eq('id', totem_id)
    
    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Totem não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: totem, error: totemError } = await supabase
      .from('totens')
      .select('id, status, unidade_id')
      .eq('id', totem_id)
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
    const { data: questionariosData } = await supabase
      .from('questionarios')
      .select('id, versao, updated_at, data_inicio, data_fim')
      .eq('ativo', true)
      .or(`unidade_id.eq.${totem.unidade_id},unidade_id.is.null`)

    const questionarios = (questionariosData || [])
      .filter((questionario) => isQuestionarioDisponivel(questionario, nowDate))
      .map(({ id, versao, updated_at }) => ({ id, versao, updated_at }))

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
