'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { applyClassification, DEFAULT_RULES, normalizeText } from '@/lib/classifier'
import { canApprove, canEdit, canImport, canManageRules } from '@/lib/auth'
import type { Contrato, UsuarioSistema, PerfilUsuario } from '@/lib/types'

const STORAGE_KEY = 'custo-patrimonial-cloudflare-v1'
const COLORS = ['#111827', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#0f766e']
const SECRETARIAS = ['SEDUC', 'SESAU', 'SEMAS', 'SEFAZ', 'SEOP', 'SECET', 'SESEP', 'SDRA', 'SEGOV', 'PGM', 'CGM', 'SEAD', 'OUTROS']
const PERFIS = ['operacional', 'contador', 'controladoria', 'administrador'] as const

export default function Page() {
  const [store, setStore] = useState<any>({ users: [], contracts: [], currentUserId: null })
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  // ✅ CORREÇÃO AQUI
  const [newUser, setNewUser] = useState<{
    nome: string
    email: string
    perfil: PerfilUsuario
    secretaria: string
  }>({
    nome: '',
    email: '',
    perfil: 'operacional',
    secretaria: 'OUTROS'
  })

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setStore(JSON.parse(raw))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  function addUser() {
    if (!newUser.nome || !newUser.email) return

    const user: UsuarioSistema = {
      id: crypto.randomUUID(),
      nome: newUser.nome,
      email: newUser.email,
      perfil: newUser.perfil,
      secretaria: newUser.secretaria
    }

    setStore((prev: any) => ({
      ...prev,
      users: [...prev.users, user]
    }))

    setNotice('Usuário adicionado com sucesso.')

    setNewUser({
      nome: '',
      email: '',
      perfil: 'operacional',
      secretaria: 'OUTROS'
    })
  }

  return (
    <main className="p-6">
      <h1>Sistema de Custo Patrimonial</h1>

      {notice && <p>{notice}</p>}

      <div style={{ marginTop: 20 }}>
        <h2>Novo Usuário</h2>

        <input
          placeholder="Nome"
          value={newUser.nome}
          onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
        />

        <input
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />

        {/* ✅ CORREÇÃO AQUI */}
        <select
          value={newUser.perfil}
          onChange={(e) =>
            setNewUser({ ...newUser, perfil: e.target.value as PerfilUsuario })
          }
        >
          {PERFIS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={newUser.secretaria}
          onChange={(e) =>
            setNewUser({ ...newUser, secretaria: e.target.value })
          }
        >
          {SECRETARIAS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button onClick={addUser}>Adicionar</button>
      </div>
    </main>
  )
}
