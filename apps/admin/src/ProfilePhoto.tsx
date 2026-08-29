import { useEffect, useState } from 'react'
import { loadPersonProfilePhoto, uploadPersonProfilePhoto } from './api/directory'
import type { PersonListItem } from './api/directory'

type AvatarProps = {
  accessToken: string
  personId: string
  personName: string
  photoUpdatedAt?: string | null
  version?: number
  className?: string
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function ProfileAvatar({ accessToken, personId, personName, photoUpdatedAt, version = 0, className = 'profile-avatar' }: AvatarProps) {
  const [source, setSource] = useState<string | null>(null)

  useEffect(() => {
    if (!photoUpdatedAt) {
      setSource(null)
      return
    }

    let active = true
    let objectUrl: string | null = null
    void loadPersonProfilePhoto(accessToken, personId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        if (active) setSource(objectUrl)
      })
      .catch(() => {
        if (active) setSource(null)
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [accessToken, personId, photoUpdatedAt, version])

  return <span className={className}>{source ? <img src={source} alt={`Foto de ${personName}`} /> : initials(personName)}</span>
}

type FieldProps = {
  accessToken: string
  person: PersonListItem
  canEdit: boolean
  onPersonChange: (person: PersonListItem) => void
  onPhotoChanged?: () => void
}

export function ProfilePhotoField({ accessToken, person, canEdit, onPersonChange, onPhotoChanged }: FieldProps) {
  const [version, setVersion] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const changePhoto = (file?: File) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setError('Envie uma imagem JPG, PNG ou WEBP de até 3 MB.')
      return
    }

    setError('')
    setIsSaving(true)
    void uploadPersonProfilePhoto(accessToken, person.id, file)
      .then((updated) => {
        onPersonChange(updated)
        setVersion((current) => current + 1)
        onPhotoChanged?.()
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar a foto de perfil.'))
      .finally(() => setIsSaving(false))
  }

  return <section className="profile-photo-field">
    <ProfileAvatar accessToken={accessToken} personId={person.id} personName={person.nome} photoUpdatedAt={person.fotoPerfilAtualizadaEm} version={version} className="person-profile-avatar" />
    <div>
      <h3>Foto de perfil</h3>
      <p>Use uma imagem JPG, PNG ou WEBP de até 3 MB.</p>
      {canEdit ? <label className="secondary-button profile-photo-upload">{isSaving ? 'Enviando foto...' : person.fotoPerfilAtualizadaEm ? 'Alterar foto' : 'Adicionar foto'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={isSaving} onChange={(event) => changePhoto(event.target.files?.[0])} /></label> : <small>Somente a própria pessoa ou a administração pode alterar esta foto.</small>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  </section>
}
