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
Execute os seguintes SQLs no Supabase SQL Editor:

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
- Configure a URL de redirecionamento: `http://localhost:5173/`

### 2. Banco de Dados
- Execute os SQLs fornecidos acima
- Verifique se as políticas RLS estão ativas

### 3. API Keys
- O sistema gera automaticamente uma API key única para cada usuário
- A API key é exibida na home do usuário
- Use a API key no header `x-api-key` para acessar a API REST

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

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Supabase
2. Consulte os issues do repositório
3. Abra uma nova issue com detalhes do problema

---

Desenvolvido com ❤️ usando React, TypeScript e Supabase.
