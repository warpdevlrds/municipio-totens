import { useState, useEffect, useCallback } from 'react'
import { activateTotem, type TotemActivationResponse } from '@municipio-totens/supabase-client'
import { setSetting, getSetting, cacheQuestionarios, type CachedQuestionario } from '@municipio-totens/offline-sync'
import type { Questionario } from '@municipio-totens/types'

const APP_VERSION = '1.0.0'

export interface TotemState {
  totemId: string | null
  totemCode: string | null
  unidadeId: string | null
  isActivated: boolean
  isActivating: boolean
  error: string | null
  questionarios: Questionario[]
}

export function useTotem() {
  const [state, setState] = useState<TotemState>({
    totemId: null,
    totemCode: null,
    unidadeId: null,
    isActivated: false,
    isActivating: false,
    error: null,
    questionarios: []
  })

  useEffect(() => {
    checkStoredActivation()
  }, [])

  const checkStoredActivation = async () => {
    const storedTotemId = await getSetting<string>('totem_id')
    const storedTotemCode = await getSetting<string>('totem_code')
    const storedUnidadeId = await getSetting<string>('unidade_id')
    const cachedQuestionarios = await getSetting<CachedQuestionario[]>('questionarios')

    if (storedTotemId) {
      setState(prev => ({
        ...prev,
        totemId: storedTotemId,
        totemCode: storedTotemCode || null,
        unidadeId: storedUnidadeId || null,
        isActivated: true,
        questionarios: cachedQuestionarios || []
      }))
    }
  }

  const activate = useCallback(async (codigoTotem: string, chaveAtivacao: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isActivating: true, error: null }))

    try {
      const result: TotemActivationResponse = await activateTotem(chaveAtivacao, codigoTotem, APP_VERSION)

      if (!result.success) {
        setState(prev => ({
          ...prev,
          isActivating: false,
          error: result.error || 'Erro ao ativar totem'
        }))
        return false
      }

      const questionarios = result.questionarios as Questionario[]

      await setSetting('totem_id', result.totem_id)
      await setSetting('totem_code', result.totem_codigo)
      await setSetting('unidade_id', result.unidade_id)
      await setSetting('ativado_em', result.ativado_em)

      const toCache: CachedQuestionario[] = questionarios.map(q => ({
        ...q,
        questoes: [],
        cached_at: new Date().toISOString()
      }))
      await cacheQuestionarios(toCache)
      await setSetting('questionarios', questionarios)

      setState({
        totemId: result.totem_id,
        totemCode: result.totem_codigo,
        unidadeId: result.unidade_id,
        isActivated: true,
        isActivating: false,
        error: null,
        questionarios
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setState(prev => ({
        ...prev,
        isActivating: false,
        error: errorMessage
      }))
      return false
    }
  }, [])

  const deactivate = useCallback(async () => {
    await setSetting('totem_id', '')
    await setSetting('totem_code', '')
    await setSetting('unidade_id', '')
    await setSetting('ativado_em', '')
    await setSetting('questionarios', [])

    setState({
      totemId: null,
      totemCode: null,
      unidadeId: null,
      isActivated: false,
      isActivating: false,
      error: null,
      questionarios: []
    })
  }, [])

  return {
    ...state,
    activate,
    deactivate
  }
}
