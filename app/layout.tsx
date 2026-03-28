import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sistema de Custo Patrimonial - Alagoinhas',
  description: 'Sistema de classificação patrimonial de contratos com base nas NBC TSP.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
