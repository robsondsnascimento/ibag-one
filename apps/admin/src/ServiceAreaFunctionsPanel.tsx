import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { updateServiceAreaFunctions } from './api/service-areas'
import type { ServiceAreaDetail } from './api/service-areas'
import './ServiceAreaFunctionsPanel.css'

function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR')
}

export function ServiceAreaFunctionsPanel({ area, accessToken, canManage, onUpdated, onNotice }: {
  area: ServiceAreaDetail
  accessToken: string
  canManage: boolean
  onUpdated: () => void
  onNotice: (message: string) => void
}) {
  const [functions, setFunctions] = useState(area.funcoes)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setFunctions(area.funcoes)
    setError('')
  }, [area.funcoes, area.id])

  const save = async (nextFunctions: string[]) => {
    setError('')
    setIsSaving(true)
    try {
      const updated = await updateServiceAreaFunctions(accessToken, area.id, nextFunctions)
      setFunctions(updated.funcoes)
      onUpdated()
      onNotice('Funções da Área de Serviço atualizadas.')
      return true
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar as funções desta área.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const name = String(new FormData(form).get('functionName') ?? '').trim().replace(/\s+/g, ' ')
    if (name.length < 2) {
      setError('Informe uma função com pelo menos 2 caracteres.')
      return
    }
    if (functions.some((item) => normalized(item) === normalized(name))) {
      setError('Esta função já está cadastrada na área.')
      return
    }
    void save([...functions, name]).then((saved) => {
      if (saved) form.reset()
    })
  }

  return <section className="service-area-panel service-area-functions-panel">
    <header><div><p className="eyebrow">Funções</p><h2>Funções de escala</h2></div><span>{functions.length}</span></header>
    <p>Defina as funções disponíveis nesta Área de Serviço. Depois elas poderão ser atribuídas às pessoas e escolhidas nas escalas.</p>
    {functions.length ? <div className="service-area-function-list">{functions.map((functionName) => <span key={functionName}>{functionName}{canManage && <button type="button" aria-label={`Remover ${functionName}`} disabled={isSaving} onClick={() => void save(functions.filter((item) => item !== functionName))}>×</button>}</span>)}</div> : <p className="service-area-empty">Ainda não há funções cadastradas nesta área.</p>}
    {canManage && <form className="service-area-function-form" onSubmit={add}><input name="functionName" minLength={2} maxLength={100} disabled={isSaving} placeholder="Ex.: Recepção, Iluminação" /><button className="secondary-button" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : '+ Adicionar função'}</button></form>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>
}
