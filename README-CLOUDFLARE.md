# Publicação no Cloudflare sem instalar nada no computador local

Este projeto é um app Next.js full-stack. Não publique no Cloudflare Pages por upload direto da raiz do projeto, porque isso envia apenas o código-fonte e gera erro 404.

## Caminho recomendado

Use **Cloudflare Workers + GitHub** com build remoto.

## Passo a passo

1. Crie um repositório no GitHub.
2. Envie o conteúdo desta pasta para o repositório usando a interface web do GitHub (Add file > Upload files).
3. No Cloudflare Dashboard, vá em **Workers & Pages**.
4. Clique em **Create application**.
5. Escolha **Import a repository**.
6. Conecte sua conta do GitHub e selecione o repositório.
7. Em build/deploy, use o comando de deploy:
   - `npm run deploy`
8. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
9. Clique em **Save and Deploy**.

## Arquivos Cloudflare já incluídos

- `open-next.config.ts`
- `wrangler.jsonc`
- `package.json` com scripts de preview/deploy

## Observação

Se o projeto for publicado por Pages com upload manual, somente arquivos já compilados funcionam. Este projeto precisa de build remoto no Cloudflare Workers.
