'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { applyClassification, DEFAULT_RULES, normalizeText } from '@/lib/classifier'
import { canApprove, canEdit, canImport, canManageRules } from '@/lib/auth'
import type { Contrato, UsuarioSistema } from '@/lib/types'

const STORAGE_KEY = 'custo-patrimonial-cloudflare-v1'
const COLORS = ['#111827', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#0f766e']
const SECRETARIAS = ['SEDUC', 'SESAU', 'SEMAS', 'SEFAZ', 'SEOP', 'SECET', 'SESEP', 'SDRA', 'SEGOV', 'PGM', 'CGM', 'SEAD', 'OUTROS']
const PERFIS = ['operacional', 'contador', 'controladoria', 'administrador'] as const

const SAMPLE_USERS: UsuarioSistema[] = [
  { id: crypto.randomUUID(), nome: 'Administrador Master', email: 'admin@alagoinhas.ba.gov.br', perfil: 'administrador', secretaria: 'SEAD' },
  { id: crypto.randomUUID(), nome: 'Contador Patrimonial', email: 'contador@alagoinhas.ba.gov.br', perfil: 'contador', secretaria: 'SEFAZ' },
  { id: crypto.randomUUID(), nome: 'Controladoria', email: 'controladoria@alagoinhas.ba.gov.br', perfil: 'controladoria', secretaria: 'CGM' },
  { id: crypto.randomUUID(), nome: 'Operacional SEDUC', email: 'seduc@alagoinhas.ba.gov.br', perfil: 'operacional', secretaria: 'SEDUC' }
]

const SAMPLE_CONTRACTS: Contrato[] = [
  {
    id: crypto.randomUUID(), numero_contrato: '044-2025', ano_contrato: 2025, fornecedor: 'COOMAP', cnpj_cpf: '02.021.980/0001-34',
    objeto: 'Contratação de empresa para prestação de serviço de locação de veículos automotores, com e sem motorista, sem combustível, com seguro total, de forma continuada, por demanda.',
    modalidade: 'Pregão Eletrônico', processo: 'PE0109-2023', data_assinatura: '2025-03-26', data_publicacao: '2025-04-02', vigencia_inicio: '2025-03-26', vigencia_fim: '2026-03-25', valor_contrato: 2611369.19, situacao: 'VIGENTE', secretaria: 'SEAD', centro_custo: 'ADM-GERAL', unidade_executora: 'Secretaria Municipal da Administração', segmento_contabil: 'Apoio administrativo', objeto_custo: 'Frota administrativa'
  },
  {
    id: crypto.randomUUID(), numero_contrato: '013-2026', ano_contrato: 2026, fornecedor: 'XAYTECH TECNOLOGIA E SISTEMA LTDA', cnpj_cpf: '37.988.803/0001-06',
    objeto: 'Aquisição de computadores de mesa desktop destinados a atender as demandas da diretoria de projetos e orçamentos da secretaria municipal de obras.',
    modalidade: 'Dispensa de Licitação', processo: 'DL0052-2025', data_assinatura: '2026-01-07', data_publicacao: '2026-01-15', vigencia_inicio: '2026-01-07', vigencia_fim: '2027-01-06', valor_contrato: 59985.40, situacao: 'VIGENTE', secretaria: 'SEOP', centro_custo: 'OBRAS-PROJETOS', unidade_executora: 'Diretoria de Projetos', segmento_contabil: 'Infraestrutura', objeto_custo: 'Equipamentos de TI'
  },
  {
    id: crypto.randomUUID(), numero_contrato: '005-2024', ano_contrato: 2024, fornecedor: 'COOPERATIVA DOS AGRICULTORES FAMILIARES', cnpj_cpf: '06.183.625/0001-12',
    objeto: 'Aquisição de gêneros alimentícios da agricultura familiar para a alimentação escolar, contemplando os alunos da educação infantil, ensino fundamental e EJA.',
    modalidade: 'Chamada Pública', processo: '336-2023', data_assinatura: '2024-02-08', data_publicacao: '2024-02-27', vigencia_inicio: '2024-02-08', vigencia_fim: '2025-02-08', valor_contrato: 1559997.05, situacao: 'VENCIDO', secretaria: 'SEDUC', centro_custo: 'ALIMENTACAO-ESCOLAR', unidade_executora: 'Rede Municipal de Ensino', segmento_contabil: 'Educação', objeto_custo: 'Merenda escolar'
  }
]

type Store = {
  users: UsuarioSistema[]
  currentUserId: string | null
  contracts: Contrato[]
}

function money(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0))
}

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (!lines.length) return [] as Record<string, string>[]
  const delimiter = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(delimiter).map(h => h.trim())
  return lines.slice(1).map(line => {
    const cols = line.split(delimiter)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (cols[i] || '').trim() })
    return row
  })
}

function buildSeed(): Store {
  return {
    users: SAMPLE_USERS,
    currentUserId: SAMPLE_USERS[0].id,
    contracts: SAMPLE_CONTRACTS.map(c => ({
      ...applyClassification(c, DEFAULT_RULES),
      historico: [{ at: new Date().toISOString(), event: 'Contrato inicial carregado no sistema.' }]
    }))
  }
}

export default function Page() {
  const [store, setStore] = useState<Store>(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    return raw ? JSON.parse(raw) : buildSeed()
  })
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [newUser, setNewUser] = useState({ nome: '', email: '', perfil: 'operacional', secretaria: 'OUTROS' })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  const currentUser = store.users.find(u => u.id === store.currentUserId) || null
  const selected = store.contracts.find(c => c.id === selectedId) || null

  const contracts = useMemo(() => {
    const term = normalizeText(search)
    return store.contracts.filter(c => !term || normalizeText(`${c.numero_contrato} ${c.fornecedor} ${c.objeto} ${c.secretaria}`).includes(term))
  }, [store.contracts, search])

  const chartCategory = useMemo(() => {
    const map: Record<string, number> = {}
    store.contracts.forEach(c => { map[c.categoria_patrimonial || 'Sem categoria'] = (map[c.categoria_patrimonial || 'Sem categoria'] || 0) + Number(c.valor_contrato || 0) })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [store.contracts])

  const chartNBC = useMemo(() => {
    const map: Record<string, number> = {}
    store.contracts.forEach(c => { map[c.nbc_tsp_principal || 'A definir'] = (map[c.nbc_tsp_principal || 'A definir'] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [store.contracts])

  function updateContract(id: string, patch: Partial<Contrato>, log?: string) {
    setStore(prev => ({
      ...prev,
      contracts: prev.contracts.map(c => c.id === id ? { ...c, ...patch, historico: log ? [...(c.historico || []), { at: new Date().toISOString(), event: log }] : c.historico } : c)
    }))
  }

  function importCSVFile(file: File) {
    if (!canImport(currentUser?.perfil)) {
      setNotice('Seu perfil não pode importar contratos.')
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      const rows = parseCSV(String(e.target?.result || ''))
      const imported: Contrato[] = rows.map(row => {
        const base: Contrato = {
          id: crypto.randomUUID(),
          numero_contrato: row.numero_contrato || row.contrato || '',
          ano_contrato: Number(row.ano_contrato || new Date().getFullYear()),
          fornecedor: row.fornecedor || '',
          cnpj_cpf: row.cnpj_cpf || '',
          objeto: row.objeto || '',
          modalidade: row.modalidade || '',
          processo: row.processo || '',
          data_assinatura: row.data_assinatura || '',
          data_publicacao: row.data_publicacao || '',
          vigencia_inicio: row.vigencia_inicio || '',
          vigencia_fim: row.vigencia_fim || '',
          valor_contrato: Number(String(row.valor_contrato || '0').replace(/\./g, '').replace(',', '.')) || 0,
          situacao: row.situacao || 'VIGENTE',
          secretaria: row.secretaria || 'OUTROS',
          centro_custo: row.centro_custo || '',
          unidade_executora: row.unidade_executora || '',
          segmento_contabil: row.segmento_contabil || '',
          objeto_custo: row.objeto_custo || ''
        }
        return {
          ...applyClassification(base, DEFAULT_RULES),
          historico: [{ at: new Date().toISOString(), event: `Contrato importado por ${currentUser?.nome || 'usuário'}.` }]
        }
      })
      setStore(prev => ({ ...prev, contracts: [...imported, ...prev.contracts] }))
      setNotice(`${imported.length} contratos importados com sucesso.`)
    }
    reader.readAsText(file, 'utf-8')
  }

  function addUser() {
    if (!newUser.nome || !newUser.email) return
    const user: UsuarioSistema = { id: crypto.randomUUID(), ...newUser }
    setStore(prev => ({ ...prev, users: [...prev.users, user] }))
    setNotice('Usuário adicionado com sucesso.')
    setNewUser({ nome: '', email: '', perfil: 'operacional', secretaria: 'OUTROS' })
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'custo-patrimonial-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src="/brasao.png" alt="Brasão de Alagoinhas" className="h-16 w-16 object-contain" />
            <div>
              <h1 className="text-2xl font-bold">Prefeitura de Alagoinhas</h1>
              <p className="text-sm text-slate-600">Sistema de Custo Patrimonial</p>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm">
            Usuário atual: <b>{currentUser?.nome}</b> ({currentUser?.perfil})
          </div>
        </div>

        {notice && <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{notice}</div>}

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-3xl bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-72 rounded-2xl border p-3">
                <p className="mb-2 text-sm font-medium">Valor por categoria patrimonial</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartCategory}><XAxis dataKey="name" hide /><YAxis /><Tooltip formatter={(v) => money(Number(v))} /><Bar dataKey="value" fill="#0f172a" radius={[10,10,0,0]} /></BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-72 rounded-2xl border p-3">
                <p className="mb-2 text-sm font-medium">Distribuição por NBC TSP</p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={chartNBC} dataKey="value" nameKey="name" outerRadius={90} label>{chartNBC.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Acesso e publicação</h2>
            <div className="space-y-2 text-sm">
              <label className="block">Trocar usuário</label>
              <select className="w-full rounded-2xl border p-3" value={store.currentUserId || ''} onChange={(e) => setStore(prev => ({ ...prev, currentUserId: e.target.value }))}>
                {store.users.map(u => <option key={u.id} value={u.id}>{u.nome} - {u.perfil}</option>)}
              </select>
            </div>
            <div className="space-y-2 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3">
                Importar CSV
                <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCSVFile(e.target.files[0])} />
              </label>
              <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white" onClick={exportBackup}>Exportar backup</button>
            </div>
            <div className="rounded-2xl border p-4 text-sm">
              <p><b>Cloudflare Pages:</b> compatível</p>
              <p><b>Banco:</b> Supabase/PostgreSQL</p>
              <p><b>Auth:</b> Supabase Auth</p>
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-3xl bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">Contratos</h2>
              <input className="rounded-2xl border px-4 py-2" placeholder="Buscar contrato, fornecedor, objeto..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="space-y-3 max-h-[620px] overflow-auto">
              {contracts.map(c => (
                <button key={c.id} className={`grid w-full gap-3 rounded-2xl border p-4 text-left md:grid-cols-12 ${selectedId === c.id ? 'border-slate-900 bg-slate-50' : 'bg-white'}`} onClick={() => setSelectedId(c.id)}>
                  <div className="md:col-span-2"><p className="font-semibold">{c.numero_contrato}</p><p className="text-xs text-slate-500">{c.ano_contrato} • {c.secretaria}</p></div>
                  <div className="md:col-span-4"><p className="font-medium truncate">{c.fornecedor}</p><p className="truncate text-xs text-slate-500">{c.objeto}</p></div>
                  <div className="md:col-span-2"><p className="text-sm font-medium">{money(c.valor_contrato)}</p><p className="text-xs text-slate-500">{c.vigencia_inicio} até {c.vigencia_fim}</p></div>
                  <div className="md:col-span-2"><p className="text-sm">{c.categoria_patrimonial}</p><p className="text-xs text-slate-500">{c.nbc_tsp_principal}</p></div>
                  <div className="md:col-span-2"><p className="text-sm">{c.status_aprovacao}</p><p className="text-xs text-slate-500">Risco: {c.risco_contabil}</p></div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Detalhes e workflow</h2>
            {!selected ? <p className="text-sm text-slate-500">Selecione um contrato.</p> : (
              <div className="space-y-4 text-sm">
                <div className="rounded-2xl border p-4">
                  <p><b>Contrato:</b> {selected.numero_contrato}</p>
                  <p><b>Fornecedor:</b> {selected.fornecedor}</p>
                  <p><b>Categoria:</b> {selected.categoria_patrimonial}</p>
                  <p><b>NBC TSP:</b> {selected.nbc_tsp_principal}</p>
                  <p><b>Reconhecimento:</b> {selected.tipo_reconhecimento}</p>
                  <p><b>Apropriação:</b> {selected.forma_apropriacao}</p>
                  <p><b>Centro de custo:</b> {selected.centro_custo || '-'}</p>
                </div>
                <textarea className="min-h-28 w-full rounded-2xl border p-3" value={selected.justificativa_tecnica || selected.observacao_tecnica || ''} onChange={(e) => canEdit(currentUser?.perfil) && updateContract(selected.id, { justificativa_tecnica: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <button disabled={!canApprove(currentUser?.perfil)} className="rounded-2xl bg-slate-900 px-4 py-3 text-white disabled:opacity-40" onClick={() => updateContract(selected.id, { status_aprovacao: 'Aprovado' }, `Contrato aprovado por ${currentUser?.nome}.`)}>Aprovar</button>
                  <button disabled={!canApprove(currentUser?.perfil)} className="rounded-2xl border px-4 py-3 disabled:opacity-40" onClick={() => updateContract(selected.id, { status_aprovacao: 'Rejeitado' }, `Contrato rejeitado por ${currentUser?.nome}.`)}>Rejeitar</button>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="mb-2 font-medium">Histórico</p>
                  <div className="max-h-40 space-y-2 overflow-auto">
                    {(selected.historico || []).map((h, i) => <div key={i} className="rounded-xl bg-slate-50 p-2"><p className="text-xs font-medium">{new Date(h.at).toLocaleString('pt-BR')}</p><p className="text-xs text-slate-600">{h.event}</p></div>)}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-3xl bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Regras de classificação</h2>
            <div className="max-h-80 space-y-2 overflow-auto">
              {DEFAULT_RULES.map(rule => (
                <div key={rule.id} className="grid gap-2 rounded-2xl border p-3 md:grid-cols-5">
                  <div><p className="text-xs text-slate-500">Palavra-chave</p><p className="font-medium">{rule.keyword}</p></div>
                  <div><p className="text-xs text-slate-500">Categoria</p><p>{rule.category}</p></div>
                  <div><p className="text-xs text-slate-500">NBC TSP</p><p>{rule.nbc}</p></div>
                  <div><p className="text-xs text-slate-500">Apropriação</p><p>{rule.appropriation}</p></div>
                  <div><p className="text-xs text-slate-500">Permissão</p><p>{canManageRules(currentUser?.perfil) ? 'Pode gerenciar' : 'Somente leitura'}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Usuários</h2>
            <div className="space-y-3">
              <input className="w-full rounded-2xl border p-3" placeholder="Nome" value={newUser.nome} onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })} />
              <input className="w-full rounded-2xl border p-3" placeholder="E-mail" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              <select className="w-full rounded-2xl border p-3" value={newUser.perfil} onChange={(e) => setNewUser({ ...newUser, perfil: e.target.value })}>
                {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select className="w-full rounded-2xl border p-3" value={newUser.secretaria} onChange={(e) => setNewUser({ ...newUser, secretaria: e.target.value })}>
                {SECRETARIAS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button disabled={!canManageRules(currentUser?.perfil)} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white disabled:opacity-40" onClick={addUser}>Adicionar usuário</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
