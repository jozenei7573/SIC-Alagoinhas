import type { PerfilUsuario } from './types'

export function canImport(perfil?: PerfilUsuario) {
  return ['operacional', 'contador', 'administrador'].includes(perfil || '')
}

export function canEdit(perfil?: PerfilUsuario) {
  return ['contador', 'controladoria', 'administrador'].includes(perfil || '')
}

export function canApprove(perfil?: PerfilUsuario) {
  return ['contador', 'controladoria', 'administrador'].includes(perfil || '')
}

export function canManageRules(perfil?: PerfilUsuario) {
  return ['controladoria', 'administrador'].includes(perfil || '')
}
