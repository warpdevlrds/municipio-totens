import { useEffect, useCallback, useRef, useState } from 'react'
import { heartbeat } from '@municipio-totens/supabase-client'
import { syncEvaluations } from '@municipio-totens/supabase-client'
import { getPendingEvaluations, markAsSynced, getSyncStats, type PendingEvaluation } from '@municipio-totens/offline-sync'

const HEARTBEAT_INTERVAL = 30000
const SYNC_DEBOUNCE = 5000

interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncAt: string | null
  pendingCount: number
  error: string | null
}

export function useSyncManager(totemId: string | null) {
  const [state, setState] = useState<SyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncAt: null,
    pendingCount: 0,
    error: null
  })

  const heartbeatIntervalRef = useRef<number | null>(null)
  const syncTimeoutRef = useRef<number | null>(null)

  const updatePendingCount = useCallback(async () => {
    if (!totemId) return
    const stats = await getSyncStats()
    setState(prev => ({ ...prev, pendingCount: stats.pending }))
  }, [totemId])

  const performSync = useCallback(async () => {
    if (!totemId || state.isSyncing) return

    setState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      const pending: PendingEvaluation[] = await getPendingEvaluations()

      if (pending.length === 0) {
        setState(prev => ({ ...prev, isSyncing: false, lastSyncAt: new Date().toISOString() }))
        return
      }

      const result = await syncEvaluations(
        totemId,
        pending.map(p => ({
          client_id: p.client_id,
          session_id: p.session_id,
          questionario_id: p.questionario_id,
          respostas: p.respostas,
          created_at: p.created_at
        }))
      )

      if (result.success) {
        await markAsSynced(result.synced_ids)
        await updatePendingCount()
        setState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncAt: new Date().toISOString()
        }))
      } else {
        setState(prev => ({
          ...prev,
          isSyncing: false,
          error: 'Erro ao sincronizar'
        }))
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      }))
    }
  }, [totemId, state.isSyncing, updatePendingCount])

  const scheduleSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    syncTimeoutRef.current = window.setTimeout(() => {
      performSync()
    }, SYNC_DEBOUNCE)
  }, [performSync])

  const performHeartbeat = useCallback(async () => {
    if (!totemId) return

    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      const { ip } = await ipResponse.json()
      await heartbeat(totemId, ip)
    } catch {
      await heartbeat(totemId)
    }
  }, [totemId])

  useEffect(() => {
    if (!totemId) return

    updatePendingCount()

    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }))
      scheduleSync()
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    performHeartbeat()
    heartbeatIntervalRef.current = window.setInterval(performHeartbeat, HEARTBEAT_INTERVAL)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [totemId, performHeartbeat, scheduleSync, updatePendingCount])

  return {
    ...state,
    triggerSync: performSync,
    triggerHeartbeat: performHeartbeat
  }
}
