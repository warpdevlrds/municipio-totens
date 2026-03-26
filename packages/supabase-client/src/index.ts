import { createClient as createSupabaseClient } from '@supabase/supabase-js'

type ViteEnv = {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

const viteEnv: ViteEnv = typeof import.meta !== 'undefined'
  ? ((import.meta as ImportMeta & { env?: ViteEnv }).env ?? {})
  : {}

const supabaseUrl = viteEnv.VITE_SUPABASE_URL || ''
const supabaseAnonKey = viteEnv.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export interface TotemActivationResponse {
  success: boolean
  totem_id: string
  totem_codigo: string
  unidade_id: string
  questionarios: any[]
  ativado_em: string
  device_token: string
  error?: string
}

export interface SyncResponse {
  success: boolean
  synced: number
  errors: number
  synced_ids: string[]
  error_details: { client_id: string; error: string }[]
}

export interface HeartbeatResponse {
  success: boolean
  timestamp: string
  totem_status: string
  questionarios: { id: string; versao: number; updated_at: string }[]
}

export async function activateTotem(
  chaveAtivacao: string,
  codigoTotem: string,
  versaoApp: string
): Promise<TotemActivationResponse> {
  const { data, error } = await supabase.functions.invoke('activate-totem', {
    body: { chave_ativacao: chaveAtivacao, codigo_totem: codigoTotem, versao_app: versaoApp }
  })

  if (error) {
    return { success: false, totem_id: '', totem_codigo: '', unidade_id: '', questionarios: [], ativado_em: '', device_token: '', error: error.message }
  }

  return data as TotemActivationResponse
}

export async function syncEvaluations(
  totemId: string,
  avaliacoes: any[],
  deviceToken: string
): Promise<SyncResponse> {
  if (!deviceToken) {
    return { success: false, synced: 0, errors: avaliacoes.length, synced_ids: [], error_details: [{ client_id: '', error: 'Token do dispositivo ausente' }] }
  }

  const { data, error } = await supabase.functions.invoke('sync-evaluations', {
    headers: {
      'x-totem-token': deviceToken,
    },
    body: { totem_id: totemId, avaliacoes }
  })

  if (error) {
    return { success: false, synced: 0, errors: avaliacoes.length, synced_ids: [], error_details: [] }
  }

  return data as SyncResponse
}

export async function heartbeat(
  totemId: string,
  ipAddress?: string,
  deviceToken?: string
): Promise<HeartbeatResponse> {
  if (!deviceToken) {
    return { success: false, timestamp: '', totem_status: '', questionarios: [] }
  }

  const { data, error } = await supabase.functions.invoke('heartbeat', {
    headers: {
      'x-totem-token': deviceToken,
    },
    body: { totem_id: totemId, ip_address: ipAddress }
  })

  if (error) {
    return { success: false, timestamp: '', totem_status: '', questionarios: [] }
  }

  return data as HeartbeatResponse
}

export { supabase as createClient }
