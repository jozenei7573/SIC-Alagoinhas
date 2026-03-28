import type { Contrato, Regra } from './types'

export const DEFAULT_RULES: Regra[] = [
  { id: 'r1', priority: 10, keyword: 'generos alimenticios', category: 'Estoques', subcategory: 'Material de consumo', nbc: 'NBC TSP 04', recognition: 'Ativo circulante', appropriation: 'Consumo', risk: 'Alto', manualReview: false, flags: { ativo: false, estoque: true, passivo: false, depreciavel: false, amortizavel: false, consumo: true } },
  { id: 'r2', priority: 10, keyword: 'alimentacao escolar', category: 'Estoques', subcategory: 'Gêneros alimentícios', nbc: 'NBC TSP 04', recognition: 'Ativo circulante', appropriation: 'Consumo', risk: 'Alto', manualReview: false, flags: { ativo: false, estoque: true, passivo: false, depreciavel: false, amortizavel: false, consumo: true } },
  { id: 'r3', priority: 20, keyword: 'computador', category: 'Imobilizado', subcategory: 'Equipamentos de TI', nbc: 'NBC TSP 07', recognition: 'Ativo não circulante', appropriation: 'Depreciação', risk: 'Baixo', manualReview: false, usefulLife: 60, flags: { ativo: true, estoque: false, passivo: false, depreciavel: true, amortizavel: false, consumo: false } },
  { id: 'r4', priority: 20, keyword: 'desktop', category: 'Imobilizado', subcategory: 'Equipamentos de TI', nbc: 'NBC TSP 07', recognition: 'Ativo não circulante', appropriation: 'Depreciação', risk: 'Baixo', manualReview: false, usefulLife: 60, flags: { ativo: true, estoque: false, passivo: false, depreciavel: true, amortizavel: false, consumo: false } },
  { id: 'r5', priority: 20, keyword: 'veiculo', category: 'Imobilizado', subcategory: 'Veículos', nbc: 'NBC TSP 07', recognition: 'Ativo não circulante', appropriation: 'Depreciação', risk: 'Médio', manualReview: true, usefulLife: 60, flags: { ativo: true, estoque: false, passivo: false, depreciavel: true, amortizavel: false, consumo: false } },
  { id: 'r6', priority: 20, keyword: 'obra', category: 'Imobilizado', subcategory: 'Obras', nbc: 'NBC TSP 07', recognition: 'Ativo não circulante', appropriation: 'Depreciação', risk: 'Alto', manualReview: true, usefulLife: 240, flags: { ativo: true, estoque: false, passivo: false, depreciavel: true, amortizavel: false, consumo: false } },
  { id: 'r7', priority: 20, keyword: 'reforma', category: 'Imobilizado', subcategory: 'Obras e melhorias', nbc: 'NBC TSP 07', recognition: 'Ativo não circulante', appropriation: 'Depreciação', risk: 'Alto', manualReview: true, usefulLife: 180, flags: { ativo: true, estoque: false, passivo: false, depreciavel: true, amortizavel: false, consumo: false } },
  { id: 'r8', priority: 30, keyword: 'software', category: 'Tecnologia', subcategory: 'Software/licenciamento', nbc: 'NBC TSP 08', recognition: 'A avaliar', appropriation: 'Mensal', risk: 'Alto', manualReview: true, flags: { ativo: false, estoque: false, passivo: false, depreciavel: false, amortizavel: true, consumo: false } },
  { id: 'r9', priority: 30, keyword: 'licenca', category: 'Tecnologia', subcategory: 'Software/licenciamento', nbc: 'NBC TSP 08', recognition: 'A avaliar', appropriation: 'Mensal', risk: 'Alto', manualReview: true, flags: { ativo: false, estoque: false, passivo: false, depreciavel: false, amortizavel: true, consumo: false } },
  { id: 'r10', priority: 40, keyword: 'locacao', category: 'Uso de bens de terceiros', subcategory: 'Locação', nbc: 'Estrutura Conceitual NBC TSP', recognition: 'VPD', appropriation: 'Mensal', risk: 'Médio', manualReview: false, flags: { ativo: false, estoque: false, passivo: true, depreciavel: false, amortizavel: false, consumo: false } },
  { id: 'r11', priority: 50, keyword: 'prestacao de servicos', category: 'Serviços', subcategory: 'Serviço continuado', nbc: 'NBC TSP 34', recognition: 'VPD', appropriation: 'Mensal', risk: 'Médio', manualReview: false, flags: { ativo: false, estoque: false, passivo: true, depreciavel: false, amortizavel: false, consumo: false } },
  { id: 'r12', priority: 50, keyword: 'credenciamento', category: 'Serviços', subcategory: 'Credenciamento', nbc: 'NBC TSP 34', recognition: 'VPD', appropriation: 'Conforme execução', risk: 'Alto', manualReview: true, flags: { ativo: false, estoque: false, passivo: true, depreciavel: false, amortizavel: false, consumo: false } },
  { id: 'r13', priority: 50, keyword: 'consultoria', category: 'Serviços', subcategory: 'Consultoria', nbc: 'NBC TSP 34', recognition: 'VPD', appropriation: 'Mensal', risk: 'Médio', manualReview: false, flags: { ativo: false, estoque: false, passivo: true, depreciavel: false, amortizavel: false, consumo: false } },
  { id: 'r14', priority: 60, keyword: 'recebimento dos tributos', category: 'Serviços financeiros', subcategory: 'Arrecadação bancária', nbc: 'NBC TSP 30 a 33', recognition: 'VPD', appropriation: 'Mensal', risk: 'Médio', manualReview: false, flags: { ativo: false, estoque: false, passivo: true, depreciavel: false, amortizavel: false, consumo: false } }
]

export function normalizeText(text: string) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function applyClassification(contract: Contrato, rules: Regra[] = DEFAULT_RULES): Contrato {
  const text = normalizeText(contract.objeto)
  const sorted = [...rules].sort((a, b) => a.priority - b.priority)
  const match = sorted.find(rule => text.includes(normalizeText(rule.keyword)))

  let result: Contrato = {
    ...contract,
    texto_normalizado: text,
    categoria_patrimonial: 'Não classificado',
    subcategoria_patrimonial: 'Revisão manual obrigatória',
    nbc_tsp_principal: 'A definir',
    tipo_reconhecimento: 'A definir',
    forma_apropriacao: 'A definir',
    risco_contabil: 'Alto',
    gera_ativo: false,
    gera_estoque: false,
    gera_passivo_contratual: false,
    indicador_depreciavel: false,
    vida_util_meses: '',
    indicador_amortizavel: false,
    indicador_consumo_estoque: false,
    exige_revisao_manual: true,
    classificado_por_regra: false,
    status_aprovacao: 'Pendente revisão contábil'
  }

  if (match) {
    result = {
      ...result,
      categoria_patrimonial: match.category,
      subcategoria_patrimonial: match.subcategory,
      nbc_tsp_principal: match.nbc,
      tipo_reconhecimento: match.recognition,
      forma_apropriacao: match.appropriation,
      risco_contabil: match.risk,
      gera_ativo: match.flags.ativo,
      gera_estoque: match.flags.estoque,
      gera_passivo_contratual: match.flags.passivo,
      indicador_depreciavel: match.flags.depreciavel,
      vida_util_meses: match.usefulLife || '',
      indicador_amortizavel: match.flags.amortizavel,
      indicador_consumo_estoque: match.flags.consumo,
      exige_revisao_manual: match.manualReview,
      classificado_por_regra: true,
      status_aprovacao: match.manualReview ? 'Pendente revisão contábil' : 'Classificado automaticamente'
    }
  }

  const alerts: string[] = []
  if (text.includes('reforma') && text.includes('manutencao')) alerts.push('Objeto misto entre reforma e manutenção.')
  if (text.includes('software') || text.includes('licenca') || text.includes('sistema')) alerts.push('Validar se o objeto é intangível ou mera prestação de serviço de TI.')
  if (text.includes('credenciamento')) alerts.push('Revisar apropriação por competência e eventual passivo de saúde.')
  if (text.includes('terceirizacao')) alerts.push('Revisar risco trabalhista e passivos contratuais.')

  result.observacao_tecnica = [contract.observacao_tecnica, ...alerts].filter(Boolean).join(' ')
  return result
}
