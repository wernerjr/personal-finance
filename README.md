# Personal Finance

Um aplicativo completo de controle financeiro pessoal construído com React, TypeScript, Vite e Supabase.

## 🚀 Funcionalidades

### Autenticação
- Login via magic link (Supabase Auth)
- Geração automática de API key única para cada usuário
- Exibição da API key na home com instruções de uso

### Gestão de Despesas
- **Cadastro de Despesas**: Formulário completo com validação
  - Descrição (até 100 caracteres)
  - Valor em reais (formatação automática)
  - Tipo: Alimentação, Estudo, Transporte, Diversão, Outros
- **Histórico de Despesas**: Tabela editável com funcionalidades avançadas
  - Ordenação por valor, data e tipo
  - Filtros por data e tipo
  - Edição inline de valores
  - Modal para textos longos
  - Exclusão de despesas
- **Gráficos**: Visualização de despesas acumuladas ao longo do tempo usando Recharts

### API REST
- Endpoint público `POST /api/expenses`
- Autenticação via header `x-api-key`
- Integração completa com o banco de dados

### UI/UX
- Interface moderna com shadcn/ui
- Breadcrumbs em todas as páginas
- Componentes responsivos
- Feedback visual com toasts
- Loading states

## 🛠️ Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Gráficos**: Recharts
- **Backend**: Supabase (Auth + Database + API)
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router DOM
- **Estado**: TanStack Query

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd personal-finance
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
   - Crie um projeto no [Supabase](https://supabase.com)
   - Copie o arquivo `env.example` para `.env`
   - Preencha as variáveis de ambiente:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. **Configure o banco de dados**
   
   **Opção 1: Script SQL Completo (Recomendado)**
   
   Use o arquivo `supabase-setup.sql` incluído no projeto. Este script completo configura:
   - ✅ Todas as tabelas necessárias
   - ✅ Índices otimizados para performance
   - ✅ Políticas de segurança (RLS)
   - ✅ Funções auxiliares para API keys
   - ✅ Triggers para atualização automática
   - ✅ Views úteis para estatísticas
   - ✅ Permissões configuradas
   - ✅ Validações de dados
   
   **Como usar:**
   1. Acesse o [Supabase Dashboard](https://supabase.com)
   2. Vá para o seu projeto
   3. Clique em "SQL Editor" no menu lateral
   4. Copie e cole todo o conteúdo do arquivo `supabase-setup.sql`
   5. Clique em "Run" para executar
   
   **Opção 2: Configuração Manual**
   
   Se preferir configurar manualmente, execute os seguintes SQLs básicos:
   
   ```sql
   -- Tabela de despesas
   CREATE TABLE expenses (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_mail TEXT NOT NULL,
     description VARCHAR(100) NOT NULL,
     value DECIMAL(10,2) NOT NULL,
     type TEXT NOT NULL CHECK (type IN ('food', 'study', 'transport', 'fun', 'other')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     user_ip TEXT NOT NULL
   );
   
   -- Tabela de API keys
   CREATE TABLE api_keys (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_mail TEXT NOT NULL,
     api_key TEXT UNIQUE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     revoked BOOLEAN DEFAULT FALSE
   );
   
   -- Índices para performance
   CREATE INDEX idx_expenses_user_mail ON expenses(user_mail);
   CREATE INDEX idx_expenses_created_at ON expenses(created_at);
   CREATE INDEX idx_api_keys_api_key ON api_keys(api_key);
   CREATE INDEX idx_api_keys_user_mail ON api_keys(user_mail);
   
   -- RLS (Row Level Security)
   ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
   
   -- Políticas de segurança
   CREATE POLICY "Users can view their own expenses" ON expenses
     FOR SELECT USING (auth.jwt() ->> 'email' = user_mail);
   
   CREATE POLICY "Users can insert their own expenses" ON expenses
     FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_mail);
   
   CREATE POLICY "Users can update their own expenses" ON expenses
     FOR UPDATE USING (auth.jwt() ->> 'email' = user_mail);
   
   CREATE POLICY "Users can delete their own expenses" ON expenses
     FOR DELETE USING (auth.jwt() ->> 'email' = user_mail);
   
   CREATE POLICY "Users can view their own api keys" ON api_keys
     FOR SELECT USING (auth.jwt() ->> 'email' = user_mail);
   
   CREATE POLICY "Users can insert their own api keys" ON api_keys
     FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_mail);
   ```

5. **Execute o projeto**
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 🔧 Configuração do Supabase

### 1. Autenticação
- Configure a autenticação por email no painel do Supabase
- Ative o magic link nas configurações de autenticação
- Configure as URLs de redirecionamento:
  - **Desenvolvimento**: `http://localhost:5173/home`
  - **Produção**: `https://personal-finance-eta-five.vercel.app/home`

### 2. Banco de Dados
- **Recomendado**: Use o script `supabase-setup.sql` (configuração completa)
- **Alternativo**: Execute os SQLs básicos fornecidos acima
- Verifique se as políticas RLS estão ativas

### 3. Script SQL Completo (`supabase-setup.sql`)

O arquivo `supabase-setup.sql` inclui:

#### 🗄️ **Estrutura de Dados**
- Tabelas `expenses` e `api_keys` com validações
- Índices otimizados para performance
- Constraints e validações de dados

#### 🔒 **Segurança**
- Row Level Security (RLS) ativado
- Políticas de segurança para cada operação
- Usuários só acessam seus próprios dados

#### ⚙️ **Funções Auxiliares**
- `create_user_api_key()` - Cria API keys automaticamente
- `validate_api_key()` - Valida chaves de API
- `generate_api_key()` - Gera chaves seguras
- `update_updated_at_column()` - Atualiza timestamps automaticamente

#### 📊 **Views Úteis**
- `user_expense_stats` - Estatísticas por usuário
- `current_month_expenses` - Despesas do mês atual

#### 🔄 **Triggers**
- Atualização automática de `updated_at` nas despesas

#### ✅ **Verificações**
- Script idempotente (pode ser executado múltiplas vezes)
- Verificações de integridade ao final da execução

### 4. API Keys
- O sistema gera automaticamente uma API key única para cada usuário
- A API key é exibida na home do usuário
- Use a API key no header `x-api-key` para acessar a API REST

### 5. Configuração de Produção

Para configurar o projeto em produção (Vercel):

1. **Configure as variáveis de ambiente no Vercel:**
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   VITE_APP_URL=https://personal-finance-eta-five.vercel.app
   ```

2. **Configure o Supabase:**
   - Acesse o painel do Supabase
   - Vá para **Authentication > URL Configuration**
   - Em **Site URL**, configure:
     - **Desenvolvimento**: `http://localhost:5173`
     - **Produção**: `https://personal-finance-eta-five.vercel.app`
   - Em **Redirect URLs**, adicione:
     - `https://personal-finance-eta-five.vercel.app/home`
     - `http://localhost:5173/home`
     - `https://personal-finance-eta-five.vercel.app/**`
     - `http://localhost:5173/**`

## 📱 Uso da API REST

### Endpoint: POST /api/expenses

**Headers:**
```
Content-Type: application/json
x-api-key: sua_api_key_aqui
```

**Body:**
```json
{
  "description": "Almoço no restaurante",
  "value": 25.50,
  "type": "food"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_mail": "user@example.com",
    "description": "Almoço no restaurante",
    "value": 25.50,
    "type": "food",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "user_ip": "api-request"
  }
}
```

**Resposta de Erro (401/400/500):**
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "status": 401
}
```

## 🎨 Componentes UI

O projeto utiliza exclusivamente componentes do shadcn/ui:
- Botões, inputs, selects
- Tabelas editáveis
- Modais e dialogs
- Breadcrumbs
- Cards e layouts
- Toasts para feedback

## 📊 Gráficos

Todos os gráficos são implementados com Recharts:
- Gráfico de linha para evolução temporal
- Gráfico de barras para comparações
- Tooltips customizados
- Responsividade completa

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco
- Validação de dados com Zod
- Sanitização de inputs
- API keys únicas e revogáveis

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Netlify
1. Build: `npm run build`
2. Publish directory: `dist`
3. Configure as variáveis de ambiente

### Outros
- Build: `npm run build`
- Servir a pasta `dist` com qualquer servidor estático

## 📝 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run lint` - Linting do código

## 📄 Licença

Este projeto está sob a licença MIT


## 🔧 Troubleshooting

### Problemas Comuns

#### ❌ **Loading eterno após F5**
- **Causa**: Problemas na autenticação ou busca de API keys
- **Solução**: Verifique se o script `supabase-setup.sql` foi executado completamente
- **Verificação**: Abra o console do navegador para ver logs de erro

#### ❌ **Erro de permissão no Supabase**
- **Causa**: RLS não configurado ou políticas incorretas
- **Solução**: Execute o script `supabase-setup.sql` novamente
- **Verificação**: No Supabase Dashboard > Authentication > Policies

#### ❌ **API key não é gerada**
- **Causa**: Função `create_user_api_key` não existe
- **Solução**: Execute o script `supabase-setup.sql` completo
- **Verificação**: No Supabase Dashboard > SQL Editor, execute:
  ```sql
  SELECT routine_name FROM information_schema.routines 
  WHERE routine_name = 'create_user_api_key';
  ```

#### ❌ **Erro de locale no SQL**
- **Causa**: Configuração de locale não suportada
- **Solução**: Use a versão atualizada do `supabase-setup.sql`
- **Nota**: O script foi corrigido para remover configurações incompatíveis

#### ❌ **Magic link redirecionando para localhost em produção**
- **Causa**: URL de redirecionamento configurada incorretamente no Supabase
- **Solução**: 
  1. Configure a variável `VITE_APP_URL` no Vercel
  2. No Supabase, vá para **Authentication > URL Configuration**
  3. Configure **Site URL** para a URL de produção
  4. Adicione todas as URLs de redirecionamento necessárias
- **Verificação**: O magic link deve redirecionar para a URL de produção

### Verificações de Integridade

Após executar o script SQL, verifique se:

1. **Tabelas criadas**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('expenses', 'api_keys');
   ```

2. **Políticas RLS ativas**:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

3. **Funções criadas**:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('create_user_api_key', 'validate_api_key');
   ```

---

Desenvolvido com ❤️ usando React, TypeScript e Supabase.
