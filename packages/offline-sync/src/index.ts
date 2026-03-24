import Dexie, { Table } from 'dexie'
import type { Questionario, Questao } from '@municipio-totens/types'

export interface PendingEvaluation {
  id?: number
  client_id: string
  totem_id: string
  questionario_id: string
  session_id: string
  ip_address?: string
  respostas: PendingResposta[]
  created_at: string
  synced: boolean
  synced_at?: string
}

export interface PendingResposta {
  client_id: string
  questao_id: string
  valor_texto?: string
  valor_nota?: number
}

export interface CachedQuestionario extends Omit<Questionario, 'questoes'> {
  questoes: Questao[]
  cached_at: string
}

function generateUUID(): string {
  return crypto.randomUUID()
}

class TotensDatabase extends Dexie {
  avaliacoes!: Table<PendingEvaluation, number>
  questionarios!: Table<CachedQuestionario, string>
  settings!: Table<{ key: string; value: any }, string>

  constructor() {
    super('TotensDB')
    
    this.version(1).stores({
      avaliacoes: '++id, client_id, totem_id, questionario_id, session_id, synced, created_at',
      questionarios: 'id, cached_at',
      settings: 'key'
    })
  }
}

export const db = new TotensDatabase()

export async function saveEvaluation(
  totem_id: string,
  questionario_id: string,
  respostas: Omit<PendingResposta, 'client_id'>[]
): Promise<string> {
  const client_id = generateUUID()
  const session_id = `sess_${Date.now()}`
  const now = new Date().toISOString()

  const pendingRespostas: PendingResposta[] = respostas.map(r => ({
    ...r,
    client_id: generateUUID()
  }))

  await db.avaliacoes.add({
    client_id,
    totem_id,
    questionario_id,
    session_id,
    respostas: pendingRespostas,
    created_at: now,
    synced: false
  })

  return client_id
}

export async function getPendingEvaluations(): Promise<PendingEvaluation[]> {
  return db.avaliacoes.where('synced').equals(0).toArray()
}

export async function markAsSynced(client_ids: string[]): Promise<void> {
  const now = new Date().toISOString()
  await db.avaliacoes
    .where('client_id')
    .anyOf(client_ids)
    .modify({ synced: true, synced_at: now })
}

export async function getCachedQuestionarios(): Promise<CachedQuestionario[]> {
  return db.questionarios.toArray()
}

export async function cacheQuestionarios(questionarios: CachedQuestionario[]): Promise<void> {
  const now = new Date().toISOString()
  const toCache = questionarios.map(q => ({ ...q, cached_at: now }))
  await db.questionarios.bulkPut(toCache)
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const setting = await db.settings.get(key)
  return setting?.value as T | undefined
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({ key, value })
}

export async function clearAllData(): Promise<void> {
  await db.avaliacoes.clear()
  await db.questionarios.clear()
}

export async function getSyncStats(): Promise<{ total: number; synced: number; pending: number }> {
  const all = await db.avaliacoes.count()
  const synced = await db.avaliacoes.where('synced').equals(1).count()
  return {
    total: all,
    synced,
    pending: all - synced
  }
}
