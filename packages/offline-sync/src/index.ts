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

// ============================================
// SYNC QUEUE - Sistema de fila de sincronização
// ============================================

export interface SyncQueueItem {
  id?: number
  type: 'evaluation'
  payload: PendingEvaluation
  retries: number
  maxRetries: number
  nextRetryAt: number
  createdAt: string
  lastError?: string
}

class SyncQueueDatabase extends Dexie {
  queue!: Table<SyncQueueItem, number>

  constructor() {
    super('SyncQueueDB')
    
    this.version(1).stores({
      queue: '++id, type, nextRetryAt, retries'
    })
  }
}

export const syncQueueDb = new SyncQueueDatabase()

const INITIAL_RETRY_DELAY = 1000 // 1 segundo
const MAX_RETRY_DELAY = 300000 // 5 minutos
const DEFAULT_MAX_RETRIES = 5
const BATCH_SIZE = 10

function calculateBackoff(retries: number): number {
  const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retries), MAX_RETRY_DELAY)
  // Adiciona jitter de até 10%
  const jitter = delay * 0.1 * Math.random()
  return delay + jitter
}

export async function addToSyncQueue(evaluation: PendingEvaluation): Promise<number> {
  return syncQueueDb.queue.add({
    type: 'evaluation',
    payload: evaluation,
    retries: 0,
    maxRetries: DEFAULT_MAX_RETRIES,
    nextRetryAt: Date.now(),
    createdAt: new Date().toISOString()
  })
}

export async function getReadyQueueItems(): Promise<SyncQueueItem[]> {
  const now = Date.now()
  return syncQueueDb.queue
    .where('nextRetryAt')
    .belowOrEqual(now)
    .limit(BATCH_SIZE)
    .toArray()
}

export async function markQueueItemFailed(id: number, error: string): Promise<void> {
  const item = await syncQueueDb.queue.get(id)
  if (!item) return

  const newRetries = item.retries + 1
  
  if (newRetries >= item.maxRetries) {
    // Move para "morto" - não tenta mais
    await syncQueueDb.queue.update(id, {
      retries: newRetries,
      lastError: error,
      nextRetryAt: Number.MAX_SAFE_INTEGER // Nunca mais será processado
    })
  } else {
    const backoff = calculateBackoff(newRetries)
    await syncQueueDb.queue.update(id, {
      retries: newRetries,
      lastError: error,
      nextRetryAt: Date.now() + backoff
    })
  }
}

export async function removeFromQueue(id: number): Promise<void> {
  await syncQueueDb.queue.delete(id)
}

export async function getQueueStats(): Promise<{
  total: number
  pending: number
  failed: number
  nextRetryIn: number | null
}> {
  const all = await syncQueueDb.queue.toArray()
  const now = Date.now()
  
  const pending = all.filter(item => 
    item.retries < item.maxRetries && item.nextRetryAt <= now
  ).length
  
  const failed = all.filter(item => 
    item.retries >= item.maxRetries
  ).length
  
  const nextItem = all
    .filter(item => item.retries < item.maxRetries && item.nextRetryAt > now)
    .sort((a, b) => a.nextRetryAt - b.nextRetryAt)[0]
  
  return {
    total: all.length,
    pending,
    failed,
    nextRetryIn: nextItem ? nextItem.nextRetryAt - now : null
  }
}

export async function clearFailedItems(): Promise<number> {
  const failed = await syncQueueDb.queue
    .filter(item => item.retries >= item.maxRetries)
    .toArray()
  
  await syncQueueDb.queue.bulkDelete(failed.map(f => f.id!))
  return failed.length
}

export async function retryFailedItems(): Promise<number> {
  const failed = await syncQueueDb.queue
    .filter(item => item.retries >= item.maxRetries)
    .toArray()
  
  for (const item of failed) {
    await syncQueueDb.queue.update(item.id!, {
      retries: 0,
      nextRetryAt: Date.now(),
      lastError: undefined
    })
  }
  
  return failed.length
}

// Classe SyncManager com queue integrada
type SyncFunction = (totemId: string, avaliacoes: any[]) => Promise<{
  success: boolean
  synced_ids: string[]
}>

export class SyncManager {
  private isProcessing = false
  private totemId: string | null = null
  private syncFunction: SyncFunction | null = null
  private intervalId: number | null = null
  private onStatusChange?: (status: SyncStatus) => void

  setTotemId(id: string): void {
    this.totemId = id
  }

  setSyncFunction(fn: SyncFunction): void {
    this.syncFunction = fn
  }

  setStatusCallback(callback: (status: SyncStatus) => void): void {
    this.onStatusChange = callback
  }

  async start(intervalMs: number = 5000): Promise<void> {
    if (this.intervalId) return
    
    this.intervalId = window.setInterval(() => {
      this.processQueue()
    }, intervalMs)

    // Processa imediatamente
    await this.processQueue()
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !this.totemId || !this.syncFunction) return
    if (!navigator.onLine) return

    this.isProcessing = true
    this.notifyStatus('syncing')

    try {
      // Primeiro, move avaliações pendentes para a queue
      const pendingEvals = await getPendingEvaluations()
      for (const eval_ of pendingEvals) {
        const exists = await syncQueueDb.queue
          .filter(item => item.payload.client_id === eval_.client_id)
          .first()
        
        if (!exists) {
          await addToSyncQueue(eval_)
        }
      }

      // Processa items da queue prontos para retry
      const readyItems = await getReadyQueueItems()
      
      if (readyItems.length === 0) {
        this.notifyStatus('idle')
        this.isProcessing = false
        return
      }

      const evaluationsToSync = readyItems.map(item => ({
        client_id: item.payload.client_id,
        session_id: item.payload.session_id,
        questionario_id: item.payload.questionario_id,
        respostas: item.payload.respostas,
        created_at: item.payload.created_at
      }))

      const result = await this.syncFunction(this.totemId, evaluationsToSync)

      if (result.success) {
        // Remove items sincronizados da queue
        for (const item of readyItems) {
          if (result.synced_ids.includes(item.payload.client_id)) {
            await removeFromQueue(item.id!)
            await markAsSynced([item.payload.client_id])
          } else {
            await markQueueItemFailed(item.id!, 'Não retornado na lista de sincronizados')
          }
        }
        this.notifyStatus('success')
      } else {
        // Marca todos como falha
        for (const item of readyItems) {
          await markQueueItemFailed(item.id!, 'Sync retornou success=false')
        }
        this.notifyStatus('error')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      const readyItems = await getReadyQueueItems()
      for (const item of readyItems) {
        await markQueueItemFailed(item.id!, errorMsg)
      }
      this.notifyStatus('error')
    } finally {
      this.isProcessing = false
    }
  }

  private notifyStatus(status: SyncStatus): void {
    if (this.onStatusChange) {
      this.onStatusChange(status)
    }
  }
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

// Singleton do SyncManager
export const syncManager = new SyncManager()
