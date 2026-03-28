export type PerfilUsuario = 'operacional' | 'contador' | 'controladoria' | 'administrador'

export type UsuarioSistema = {
  id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  secretaria: string
}

export type Contrato = {
  id: string
  numero_contrato: string
  ano_contrato: number
  fornecedor: string
  cnpj_cpf?: string
  objeto: string
  modalidade?: string
  processo?: string
  data_assinatura?: string
  data_publicacao?: string
  vigencia_inicio?: string
  vigencia_fim?: string
  valor_contrato: number
  situacao?: string
  secretaria?: string
  centro_custo?: string
  unidade_executora?: string
  segmento_contabil?: string
  objeto_custo?: string
  texto_normalizado?: string
  categoria_patrimonial?: string
  subcategoria_patrimonial?: string
  nbc_tsp_principal?: string
  tipo_reconhecimento?: string
  forma_apropriacao?: string
  risco_contabil?: string
  gera_ativo?: boolean
  gera_estoque?: boolean
  gera_passivo_contratual?: boolean
  indicador_depreciavel?: boolean
  vida_util_meses?: number | string
  indicador_amortizavel?: boolean
  indicador_consumo_estoque?: boolean
  exige_revisao_manual?: boolean
  classificado_por_regra?: boolean
  status_aprovacao?: string
  justificativa_tecnica?: string
  observacao_tecnica?: string
  historico?: { at: string; event: string }[]
}

export type Regra = {
  id: string
  priority: number
  keyword: string
  category: string
  subcategory: string
  nbc: string
  recognition: string
  appropriation: string
  risk: string
  manualReview: boolean
  usefulLife?: number
  flags: {
    ativo: boolean
    estoque: boolean
    passivo: boolean
    depreciavel: boolean
    amortizavel: boolean
    consumo: boolean
  }
}
