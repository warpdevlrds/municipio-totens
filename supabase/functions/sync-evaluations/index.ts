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
    const { totem_id, avaliacoes } = await req.json()

    if (!totem_id || !avaliacoes || !Array.isArray(avaliacoes)) {
      return new Response(
        JSON.stringify({ error: 'totem_id e avaliacoes são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date().toISOString()
    const syncedIds: string[] = []
    const errors: { client_id: string; error: string }[] = []

    for (const avaliacao of avaliacoes) {
      try {
        const { client_id, questionario_id, session_id, ip_address, respostas } = avaliacao

        // Verificar se já foi sincronizada
        const { data: existing } = await supabase
          .from('avaliacoes')
          .select('id')
          .eq('session_id', session_id)
          .eq('client_id', client_id)
          .single()

        if (existing) {
          syncedIds.push(client_id)
          continue
        }

        // Inserir avaliação
        const { data: newAvaliacao, error: avaliacaoError } = await supabase
          .from('avaliacoes')
          .insert({
            totem_id,
            questionario_id,
            session_id,
            ip_address: ip_address || null,
            status: 'processada',
            synced_at: now,
            client_id,
            created_at: avaliacao.created_at || now
          })
          .select('id')
          .single()

        if (avaliacaoError) {
          errors.push({ client_id, error: avaliacaoError.message })
          continue
        }

        // Inserir respostas
        if (respostas && respostas.length > 0) {
          const respostasToInsert = respostas.map((r: any) => ({
            avaliacao_id: newAvaliacao.id,
            questao_id: r.questao_id,
            valor_texto: r.valor_texto || null,
            valor_nota: r.valor_nota || null,
            created_at: now
          }))

          const { error: respostasError } = await supabase
            .from('respostas')
            .insert(respostasToInsert)

          if (respostasError) {
            errors.push({ client_id, error: `Erro ao salvar respostas: ${respostasError.message}` })
          }
        }

        syncedIds.push(client_id)

      } catch (err) {
        errors.push({ client_id: avaliacao.client_id, error: err.message })
      }
    }

    // Atualizar totem (último ping)
    await supabase
      .from('totens')
      .update({ ultimo_ping: now })
      .eq('id', totem_id)

    // Registrar log de sincronização
    await supabase
      .from('sync_log')
      .insert({
        totem_id,
        tipo: 'sync_evaluations',
        registros: { synced: syncedIds, errors },
        sucesso: errors.length === 0,
        created_at: now
      })

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedIds.length,
        errors: errors.length,
        synced_ids: syncedIds,
        error_details: errors
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
