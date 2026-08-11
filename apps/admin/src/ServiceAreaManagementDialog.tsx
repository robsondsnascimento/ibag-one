import { useState } from 'react'
import type { FormEvent } from 'react'
import { updateServiceArea, updateServiceTeam } from './api/service-areas'
import type { ServiceAreaDetail } from './api/service-areas'
import './ServiceAreaManagementDialog.css'

type ManagementTarget =
  | { kind: 'area'; area: ServiceAreaDetail }
  | { kind: 'team'; area: ServiceAreaDetail; team: ServiceAreaDetail['teams'][number] }

export function ServiceAreaManagementDialog({
  target,
  accessToken,
  onClose,
  onSaved,
  onNotice,
}: {
  target: ManagementTarget
  accessToken: string
  onClose: () => void
  onSaved: (areaIsActive: boolean) => void
  onNotice: (message: string) => void
}) {
  const isArea = target.kind === 'area'
  const current = isArea ? target.area : target.team
  const [isActive, setIsActive] = useState(current.ativo)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const nome = String(form.get('nome') ?? '').trim()
    const descricao = String(form.get('descricao') ?? '').trim()
    if (!nome) {
      setError('Informe o nome.')
      return
    }

    setError('')
    setIsSaving(true)
    try {
      if (isArea) {
        const area = await updateServiceArea(accessToken, target.area.id, { nome, descricao: descricao || null, ativo: isActive })
        onSaved(area.ativo)
        onNotice(isActive ? 'Área de Serviço atualizada.' : 'Área de Serviço inativada. As equipes ativas também foram inativadas.')
      } else {
        await updateServiceTeam(accessToken, target.team.id, { nome, descricao: descricao || null, ativo: isActive })
        onSaved(target.area.ativo)
        onNotice(isActive ? 'Equipe atualizada.' : 'Equipe inativada. O histórico foi preservado.')
      }
      onClose()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível salvar as alterações.')
    } finally {
      setIsSaving(false)
    }
  }

  const title = isArea ? 'Configurar área' : 'Configurar equipe'
  const description = isArea
    ? 'Atualize o nome, a descrição e a disponibilidade da Área de Serviço.'
    : `Atualize a equipe de ${target.team.campus.nome}, sem alterar seu campus de origem.`

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="event-dialog service-area-management-dialog" role="dialog" aria-modal="true" aria-labelledby="service-area-management-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" aria-label="Fechar" onClick={onClose}>×</button>
        <p className="eyebrow">Áreas de Serviço</p>
        <h2 id="service-area-management-title">{title}</h2>
        <p className="dialog-description">{description}</p>

        <form className="event-form" onSubmit={save}>
          <label>Nome<input name="nome" defaultValue={current.nome} minLength={3} maxLength={150} autoFocus /></label>
          <label>Descrição <small className="field-help">(opcional)</small><input name="descricao" defaultValue={current.descricao ?? ''} maxLength={1000} /></label>
          <label className="service-area-status-option">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            <span><strong>{isActive ? 'Ativa' : 'Inativa'}</strong>{isArea ? ' Disponível para gestão, vínculos e escalas.' : ' Disponível para pessoas e escalas desta equipe.'}</span>
          </label>

          {isArea && !isActive && <p className="record-detail-note"><strong>Atenção:</strong> ao inativar a área, todas as equipes ativas dela também serão inativadas. Nenhuma pessoa, escala ou histórico será apagado.</p>}
          {isArea && isActive && !current.ativo && <p className="record-detail-note">As equipes permanecem inativas após a reativação da área. Reative somente as que voltarem a operar.</p>}
          {!isArea && !isActive && <p className="record-detail-note">Pessoas, funções e escalas já registradas permanecem no histórico; novos vínculos e escalas ficam indisponíveis enquanto a equipe estiver inativa.</p>}
          {!isArea && isActive && !target.area.ativo && <p className="record-detail-note">Esta equipe não pode ser reativada enquanto sua Área de Serviço estiver inativa.</p>}

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving || (!isArea && isActive && !target.area.ativo)}>{isSaving ? 'Salvando...' : 'Salvar alterações'}</button></div>
        </form>
      </section>
    </div>
  )
}
