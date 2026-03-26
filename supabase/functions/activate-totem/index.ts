import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-token',
}

async function sha256Hex(input: string): Promise<string> {
  const payload = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', payload)
  return Array.from(new Uint8Array(hashBuffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

function generateDeviceToken(): string {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`
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
    const { chave_ativacao, codigo_totem, versao_app } = await req.json()

    if (!chave_ativacao || !codigo_totem) {
      return new Response(
        JSON.stringify({ error: 'chave_ativacao e codigo_totem são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar se totem existe
    const { data: totem, error: totemError } = await supabase
      .from('totens')
      .select('*')
      .eq('codigo', codigo_totem)
      .single()

    if (totemError || !totem) {
      return new Response(
        JSON.stringify({ error: 'Totem não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se a chave de ativação é válida e pertence a este totem
    const { data: ativacao, error: ativacaoError } = await supabase
      .from('totem_ativacoes')
      .select('*')
      .eq('chave_ativacao', chave_ativacao)
      .eq('totem_id', totem.id)
      .eq('ativo', true)
      .single()

    if (ativacaoError || !ativacao) {
      return new Response(
        JSON.stringify({ error: 'Chave de ativação inválida ou já utilizada' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se não expirou
    if (ativacao.expira_em && new Date(ativacao.expira_em) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Chave de ativação expirada' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se já está ativada (por este totem)
    if (ativacao.ativado_em) {
      return new Response(
        JSON.stringify({ 
          error: 'Chave de ativação já utilizada',
          ativado_em: ativacao.ativado_em 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ativar a chave
    const nowDate = new Date()
    const now = nowDate.toISOString()
    const { error: updateAtivacaoError } = await supabase
      .from('totem_ativacoes')
      .update({ 
        ativado_em: now,
        ativo: false // Desativar após uso único
      })
      .eq('id', ativacao.id)

    if (updateAtivacaoError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao ativar totem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const deviceToken = generateDeviceToken()
    const deviceTokenHash = await sha256Hex(deviceToken)

    // Atualizar totem para online
    await supabase
      .from('totens')
      .update({ 
        status: 'online',
        versao_app,
        ultimo_ping: now,
        updated_at: now,
        device_token_hash: deviceTokenHash,
        device_token_rotated_at: now
      })
      .eq('id', totem.id)

    // Buscar questionários ativos para este totem
    const { data: questionariosData } = await supabase
      .from('questionarios')
      .select(`
        *,
        questoes (*)
      `)
      .eq('ativo', true)
      .or(`unidade_id.eq.${totem.unidade_id},unidade_id.is.null`)
      .order('nome')

    const questionarios = (questionariosData || [])
      .filter((questionario) => isQuestionarioDisponivel(questionario, nowDate))
      .map((questionario) => ({
        ...questionario,
        questoes: [...(questionario.questoes || [])].sort((a, b) => a.ordem - b.ordem),
      }))

    return new Response(
      JSON.stringify({
        success: true,
        totem_id: totem.id,
        totem_codigo: totem.codigo,
        unidade_id: totem.unidade_id,
        questionarios: questionarios || [],
        ativado_em: now,
        device_token: deviceToken
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
