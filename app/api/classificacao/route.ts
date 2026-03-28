import { NextRequest, NextResponse } from 'next/server'
import { applyClassification } from '@/lib/classifier'

export async function POST(req: NextRequest) {
  const { objeto } = await req.json()
  const result = applyClassification({
    id: 'preview',
    numero_contrato: '',
    ano_contrato: new Date().getFullYear(),
    fornecedor: '',
    objeto,
    valor_contrato: 0
  })
  return NextResponse.json(result)
}
