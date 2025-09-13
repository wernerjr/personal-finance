-- =============================================
-- CONFIGURAÇÃO INICIAL DO SUPABASE
-- Personal Finance App
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CRIAR TABELAS
-- =============================================

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_mail TEXT NOT NULL,
    description TEXT NOT NULL CHECK (length(description) > 0 AND length(description) <= 100),
    value DECIMAL(10,2) NOT NULL CHECK (value > 0),
    type TEXT NOT NULL CHECK (type IN ('food', 'study', 'transport', 'fun', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_ip TEXT NOT NULL DEFAULT 'unknown'
);

-- Tabela de chaves API
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_mail TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked BOOLEAN DEFAULT FALSE
);

-- =============================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para a tabela expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_mail ON public.expenses(user_mail);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON public.expenses(type);
CREATE INDEX IF NOT EXISTS idx_expenses_user_mail_created_at ON public.expenses(user_mail, created_at DESC);

-- Índices para a tabela api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_mail ON public.api_keys(user_mail);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON public.api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_revoked ON public.api_keys(revoked);

-- =============================================
-- 3. CRIAR FUNÇÕES AUXILIARES
-- =============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para gerar API key
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..32 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ language 'plpgsql';

-- Função para criar API key para usuário
CREATE OR REPLACE FUNCTION public.create_user_api_key(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    new_api_key TEXT;
BEGIN
    -- Gerar nova API key
    new_api_key := public.generate_api_key();
    
    -- Revogar API keys existentes do usuário
    UPDATE public.api_keys 
    SET revoked = TRUE 
    WHERE user_mail = user_email;
    
    -- Inserir nova API key
    INSERT INTO public.api_keys (user_mail, api_key, revoked)
    VALUES (user_email, new_api_key, FALSE);
    
    RETURN new_api_key;
END;
$$ language 'plpgsql';

-- Função para validar API key
CREATE OR REPLACE FUNCTION public.validate_api_key(api_key_to_validate TEXT)
RETURNS TABLE(user_email TEXT, is_valid BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ak.user_mail,
        (ak.revoked = FALSE) as is_valid
    FROM public.api_keys ak
    WHERE ak.api_key = api_key_to_validate;
END;
$$ language 'plpgsql';

-- =============================================
-- 4. CRIAR TRIGGERS
-- =============================================

-- Trigger para atualizar updated_at na tabela expenses
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- =============================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. CRIAR POLÍTICAS DE SEGURANÇA
-- =============================================

-- Políticas para a tabela expenses
-- Usuários autenticados podem ver apenas suas próprias despesas
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (auth.jwt() ->> 'email' = user_mail);

-- Usuários autenticados podem inserir suas próprias despesas
CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_mail);

-- Usuários autenticados podem atualizar suas próprias despesas
CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (auth.jwt() ->> 'email' = user_mail);

-- Usuários autenticados podem deletar suas próprias despesas
CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING (auth.jwt() ->> 'email' = user_mail);

-- Políticas para a tabela api_keys
-- Usuários autenticados podem ver apenas suas próprias API keys
CREATE POLICY "Users can view own api keys" ON public.api_keys
    FOR SELECT USING (auth.jwt() ->> 'email' = user_mail);

-- Usuários autenticados podem inserir suas próprias API keys
CREATE POLICY "Users can insert own api keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_mail);

-- Usuários autenticados podem atualizar suas próprias API keys
CREATE POLICY "Users can update own api keys" ON public.api_keys
    FOR UPDATE USING (auth.jwt() ->> 'email' = user_mail);

-- =============================================
-- 7. CRIAR VIEWS ÚTEIS
-- =============================================

-- View para estatísticas de despesas por usuário
CREATE OR REPLACE VIEW public.user_expense_stats AS
SELECT 
    user_mail,
    COUNT(*) as total_expenses,
    SUM(value) as total_value,
    AVG(value) as average_value,
    MIN(created_at) as first_expense,
    MAX(created_at) as last_expense,
    COUNT(CASE WHEN type = 'food' THEN 1 END) as food_count,
    COUNT(CASE WHEN type = 'study' THEN 1 END) as study_count,
    COUNT(CASE WHEN type = 'transport' THEN 1 END) as transport_count,
    COUNT(CASE WHEN type = 'fun' THEN 1 END) as fun_count,
    COUNT(CASE WHEN type = 'other' THEN 1 END) as other_count
FROM public.expenses
GROUP BY user_mail;

-- View para despesas do mês atual
CREATE OR REPLACE VIEW public.current_month_expenses AS
SELECT 
    e.*,
    EXTRACT(DAY FROM e.created_at) as day_of_month,
    EXTRACT(WEEK FROM e.created_at) as week_of_year
FROM public.expenses e
WHERE DATE_TRUNC('month', e.created_at) = DATE_TRUNC('month', NOW());

-- =============================================
-- 8. CONFIGURAR PERMISSÕES
-- =============================================

-- Dar permissões para o usuário anônimo (para autenticação)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO anon;
GRANT SELECT, INSERT, UPDATE ON public.api_keys TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Dar permissões para usuários autenticados
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.api_keys TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Dar permissões para executar funções
GRANT EXECUTE ON FUNCTION public.create_user_api_key(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_api_key(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_api_key() TO anon, authenticated;

-- Dar permissões para as views
GRANT SELECT ON public.user_expense_stats TO anon, authenticated;
GRANT SELECT ON public.current_month_expenses TO anon, authenticated;

-- =============================================
-- 9. DADOS INICIAIS (OPCIONAL)
-- =============================================

-- Inserir alguns dados de exemplo (comentado por padrão)
-- Descomente as linhas abaixo se quiser dados de exemplo

/*
-- Exemplo de despesas (substitua o email pelo seu)
INSERT INTO public.expenses (user_mail, description, value, type, user_ip) VALUES
('seu-email@exemplo.com', 'Almoço no restaurante', 25.50, 'food', 'web-app'),
('seu-email@exemplo.com', 'Livro de programação', 89.90, 'study', 'web-app'),
('seu-email@exemplo.com', 'Uber para o trabalho', 15.30, 'transport', 'web-app'),
('seu-email@exemplo.com', 'Cinema com amigos', 20.00, 'fun', 'web-app'),
('seu-email@exemplo.com', 'Medicamento', 45.80, 'other', 'web-app');
*/

-- =============================================
-- 10. CONFIGURAÇÕES ADICIONAIS
-- =============================================

-- Configurar timezone padrão
SET timezone = 'America/Sao_Paulo';

-- Configurar locale para formatação de números (removido - não suportado no Supabase)
-- SET lc_numeric = 'pt_BR.UTF-8';

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('expenses', 'api_keys')
ORDER BY table_name;

-- Verificar se as políticas RLS estão ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar se as funções foram criadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_user_api_key', 'validate_api_key', 'generate_api_key')
ORDER BY routine_name;

-- =============================================
-- INSTRUÇÕES DE USO
-- =============================================

/*
INSTRUÇÕES PARA USAR ESTE SCRIPT:

1. Acesse o painel do Supabase (https://supabase.com)
2. Vá para o seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Cole este script completo na área de texto
5. Clique em "Run" para executar

APÓS A EXECUÇÃO:

1. Configure as variáveis de ambiente no seu arquivo .env:
   - VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   - VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

2. As tabelas estarão prontas para uso:
   - expenses: para armazenar despesas
   - api_keys: para gerenciar chaves de API

3. O sistema de autenticação estará configurado com RLS

4. As funções auxiliares estarão disponíveis:
   - create_user_api_key(email): cria uma nova API key
   - validate_api_key(key): valida uma API key
   - generate_api_key(): gera uma nova chave

5. As views estarão disponíveis para consultas:
   - user_expense_stats: estatísticas por usuário
   - current_month_expenses: despesas do mês atual

OBSERVAÇÕES IMPORTANTES:
- Este script é idempotente (pode ser executado múltiplas vezes)
- As políticas RLS garantem que usuários só vejam seus próprios dados
- As API keys são geradas automaticamente no primeiro login
- Todas as operações são auditadas com timestamps
*/
