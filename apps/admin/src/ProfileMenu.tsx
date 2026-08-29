import { useState } from 'react'
import type { FormEvent } from 'react'
import { changeOwnPassword } from './api/users'

type Theme = 'light' | 'night'

type ProfileMenuProps = {
  personName: string
  roleLabel: string
  theme: Theme
  onOpenProfile: () => void
  onChangePassword: () => void
  onOpenPermissions: () => void
  onOpenNotifications: () => void
  onToggleTheme: () => void
  onOpenSupport: () => void
  onSignOut: () => void
}

type DialogProps = {
  onClose: () => void
}

export function ProfileMenu({
  personName,
  roleLabel,
  theme,
  onOpenProfile,
  onChangePassword,
  onOpenPermissions,
  onOpenNotifications,
  onToggleTheme,
  onOpenSupport,
  onSignOut,
}: ProfileMenuProps) {
  return (
    <section className="profile-menu" role="menu" aria-label="Opções do perfil">
      <div className="profile-menu-heading">
        <strong>{personName}</strong>
        <span>{roleLabel}</span>
      </div>

      <div className="profile-menu-section">
        <button type="button" role="menuitem" onClick={onOpenProfile}><span aria-hidden="true">◉</span>Configurações do perfil</button>
        <button type="button" role="menuitem" onClick={onChangePassword}><span aria-hidden="true">⌘</span>Alterar senha</button>
        <button type="button" role="menuitem" onClick={onOpenPermissions}><span aria-hidden="true">◇</span>Minhas permissões</button>
      </div>

      <div className="profile-menu-section">
        <button type="button" role="menuitem" onClick={onOpenNotifications}><span aria-hidden="true">◌</span>Notificações</button>
        <button type="button" role="menuitem" onClick={onToggleTheme}><span aria-hidden="true">◐</span>Usar tema {theme === 'light' ? 'noturno' : 'claro'}</button>
        <button type="button" role="menuitem" onClick={onOpenSupport}><span aria-hidden="true">?</span>Central de suporte</button>
      </div>

      <button className="profile-menu-signout" type="button" role="menuitem" onClick={onSignOut}><span aria-hidden="true">↪</span>Sair da conta</button>
    </section>
  )
}

type ChangePasswordDialogProps = DialogProps & {
  accessToken: string
  onSuccess: () => void
}

export function ChangePasswordDialog({ accessToken, onClose, onSuccess }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('A confirmação não corresponde à nova senha.')
      return
    }

    setError('')
    setIsSaving(true)
    try {
      await changeOwnPassword(accessToken, { currentPassword, newPassword })
      onSuccess()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível alterar a senha.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="event-dialog profile-password-dialog" role="dialog" aria-modal="true" aria-labelledby="change-password-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fechar">×</button>
        <p className="eyebrow">Segurança da conta</p>
        <h2 id="change-password-title">Alterar senha</h2>
        <p className="dialog-description">Informe a senha atual e escolha uma nova senha para o seu acesso institucional.</p>

        <form className="event-form" onSubmit={(event) => void submit(event)}>
          <label>Senha atual<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label>
          <label>Nova senha<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={6} required /></label>
          <label>Confirmar nova senha<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={6} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar nova senha'}</button></div>
        </form>
      </section>
    </div>
  )
}

type PermissionsDialogProps = DialogProps & {
  roleLabel: string
}

export function PermissionsDialog({ roleLabel, onClose }: PermissionsDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="event-dialog profile-info-dialog" role="dialog" aria-modal="true" aria-labelledby="permissions-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fechar">×</button>
        <p className="eyebrow">Acesso da conta</p>
        <h2 id="permissions-title">Minhas permissões</h2>
        <p className="dialog-description">Seu perfil de acesso atual define os recursos que você pode consultar e administrar dentro da organização.</p>
        <div className="profile-info-list"><span>Perfil atual</span><strong>{roleLabel}</strong></div>
        <p className="profile-info-note">Caso seja necessário ampliar ou ajustar este acesso, solicite a alteração à administração do IBAG One.</p>
        <div className="dialog-actions"><button className="primary-button" type="button" onClick={onClose}>Entendi</button></div>
      </section>
    </div>
  )
}

export function SupportDialog({ onClose }: DialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="event-dialog profile-info-dialog" role="dialog" aria-modal="true" aria-labelledby="support-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fechar">×</button>
        <p className="eyebrow">Suporte</p>
        <h2 id="support-title">Central de suporte</h2>
        <p className="dialog-description">Para dúvidas de operação, permissões ou cadastros, procure a secretaria ou a administração da sua organização.</p>
        <p className="profile-info-note">O atendimento por mensagem será integrado futuramente. Enquanto isso, a equipe responsável consegue orientar e corrigir o acesso diretamente pelo painel.</p>
        <div className="dialog-actions"><button className="primary-button" type="button" onClick={onClose}>Fechar</button></div>
      </section>
    </div>
  )
}
