import { useEffect, useState } from 'react'
import './ServiceFunctionsField.css'

export const musicServiceFunctions = [
  'Ministro',
  'Backing Vocal',
  'Guitarra',
  'Violão',
  'Baixo',
  'Tecladista',
  'Bateria',
  'Percussão',
] as const

function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR')
}

export function isMusicServiceArea(areaName: string) {
  return ['musica', 'ministerio de musica'].includes(normalized(areaName))
}

export function ServiceFunctionsField({
  areaName,
  value,
  onChange,
  disabled = false,
  inputName = 'funcoes',
}: {
  areaName: string
  value: string[]
  onChange: (functions: string[]) => void
  disabled?: boolean
  inputName?: string
}) {
  const [customFunctions, setCustomFunctions] = useState(value.join(', '))

  useEffect(() => {
    setCustomFunctions(value.join(', '))
  }, [areaName])

  if (!isMusicServiceArea(areaName)) {
    return <label>Funções de serviço <span className="field-optional">(opcional)</span><input name={inputName} value={customFunctions} onChange={(event) => { setCustomFunctions(event.target.value); onChange(event.target.value.split(',').map((item) => item.trim()).filter(Boolean)) }} disabled={disabled} maxLength={500} placeholder="Ex.: Organização, Apoio" /><small className="field-help">Separe por vírgulas.</small></label>
  }

  const toggle = (functionName: string) => {
    onChange(value.includes(functionName) ? value.filter((item) => item !== functionName) : [...value, functionName])
  }

  return <fieldset className="service-functions-field" disabled={disabled}>
    <legend>Funções na Música <span className="field-optional">(opcional)</span></legend>
    <p>Selecione uma ou mais funções que a pessoa pode exercer na escala.</p>
    <div className="service-functions-options">
      {musicServiceFunctions.map((functionName) => <label key={functionName}><input type="checkbox" checked={value.includes(functionName)} onChange={() => toggle(functionName)} /><span>{functionName}</span></label>)}
    </div>
    <small className="field-help">Ao marcar Ministro, a pessoa poderá preparar e enviar o repertório dos cultos em que estiver escalada e confirmada. Essa função pode coexistir com qualquer outra.</small>
  </fieldset>
}
