import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || ''
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || ''

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export interface TotemActivationResponse {
  success: boolean
  totem_id: string
  totem_codigo: string
  unidade_id: string
  questionarios: any[]
  ativado_em: string
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
    return { success: false, totem_id: '', totem_codigo: '', unidade_id: '', questionarios: [], ativado_em: '', error: error.message }
  }

  return data as TotemActivationResponse
}

export async function syncEvaluations(
  totemId: string,
  avaliacoes: any[]
): Promise<SyncResponse> {
  const { data, error } = await supabase.functions.invoke('sync-evaluations', {
    body: { totem_id: totemId, avaliacoes }
  })

  if (error) {
    return { success: false, synced: 0, errors: avaliacoes.length, synced_ids: [], error_details: [] }
  }

  return data as SyncResponse
}

export async function heartbeat(
  totemId: string,
  ipAddress?: string
): Promise<HeartbeatResponse> {
  const { data, error } = await supabase.functions.invoke('heartbeat', {
    body: { totem_id: totemId, ip_address: ipAddress }
  })

  if (error) {
    return { success: false, timestamp: '', totem_status: '', questionarios: [] }
  }

  return data as HeartbeatResponse
}

export { supabase as createClient }
