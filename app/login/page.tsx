'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <img src="/brasao.png" alt="Brasão" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-2xl font-bold">Entrar no Sistema</h1>
            <p className="text-sm text-slate-500">Custo Patrimonial - Alagoinhas</p>
          </div>
        </div>
        <input className="w-full rounded-2xl border p-3" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-2xl border p-3" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white">Entrar</button>
      </form>
    </main>
  )
}
