'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function Home() {
  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }, [])

  const [newUser, setNewUser] = useState({
    nome: '',
    email: '',
    perfil: 'operacional',
    secretaria: 'OUTROS'
  })

  async function addUser() {
    if (!newUser.nome || !newUser.email) {
      alert('Preencha nome e email')
      return
    }

    const { error } = await supabase.from('usuarios').insert([
      {
        nome: newUser.nome,
        email: newUser.email,
        perfil: newUser.perfil,
        secretaria: newUser.secretaria
      }
    ])

    if (error) {
      console.error(error)
      alert('Erro ao salvar usuário')
      return
    }

    alert('Usuário salvo com sucesso!')

    setNewUser({
      nome: '',
      email: '',
      perfil: 'operacional',
      secretaria: 'OUTROS'
    })
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Sistema de Custo Patrimonial</h1>

      <h2>Novo Usuário</h2>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          placeholder="Nome"
          value={newUser.nome}
          onChange={(e) =>
            setNewUser({ ...newUser, nome: e.target.value })
          }
        />

        <input
          placeholder="Email"
          value={newUser.email}
          onChange={(e) =>
            setNewUser({ ...newUser, email: e.target.value })
          }
        />

        <select
          value={newUser.perfil}
          onChange={(e) =>
            setNewUser({ ...newUser, perfil: e.target.value })
          }
        >
          <option value="operacional">operacional</option>
          <option value="contador">contador</option>
          <option value="controladoria">controladoria</option>
          <option value="administrador">administrador</option>
        </select>

        <select
          value={newUser.secretaria}
          onChange={(e) =>
            setNewUser({ ...newUser, secretaria: e.target.value })
          }
        >
          <option value="OUTROS">OUTROS</option>
          <option value="SEFAZ">SEFAZ</option>
          <option value="SESAU">SESAU</option>
          <option value="SEDUC">SEDUC</option>
          <option value="SEAD">SEAD</option>
        </select>

        <button onClick={addUser}>Adicionar</button>
      </div>
    </main>
  )
}