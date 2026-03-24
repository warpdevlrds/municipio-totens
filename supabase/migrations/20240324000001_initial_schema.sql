-- Sistema de Totens de Avaliação Municipal
-- Schema inicial do banco de dados

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum para status do totem
CREATE TYPE totem_status AS ENUM ('offline', 'online', 'manutencao', 'inativo');

-- Enum para status da avaliação
CREATE TYPE avaliacao_status AS ENUM ('pendente', 'processada', 'erro');

-- Enum para tipo de questão
CREATE TYPE questao_tipo AS ENUM ('nota', 'escolha_unica', 'escolha_multipla', 'texto_livre');

-- Tabela de unidades/municípios
CREATE TABLE unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    municipio VARCHAR(255) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de questionários
CREATE TABLE questionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID REFERENCES unidades(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    versao INTEGER DEFAULT 1,
    data_inicio TIMESTAMPTZ,
    data_fim TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de questões
CREATE TABLE questoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questionario_id UUID REFERENCES questionarios(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    tipo questao_tipo NOT NULL,
    obrigatoria BOOLEAN DEFAULT false,
    ordem INTEGER NOT NULL,
    opcoes JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de totens
CREATE TABLE totens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(255),
    localizacao VARCHAR(255),
    status totem_status DEFAULT 'offline',
    versao_app VARCHAR(50),
    ultimo_ping TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de ativações de totem (license keys)
CREATE TABLE totem_ativacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    totem_id UUID REFERENCES totens(id) ON DELETE CASCADE,
    chave_ativacao VARCHAR(100) UNIQUE NOT NULL,
    ativado_em TIMESTAMPTZ,
    expira_em TIMESTAMPTZ,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de avaliações
CREATE TABLE avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    totem_id UUID REFERENCES totens(id) ON DELETE SET NULL,
    questionario_id UUID REFERENCES questionarios(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    status avaliacao_status DEFAULT 'pendente',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

-- Tabela de respostas
CREATE TABLE respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avaliacao_id UUID REFERENCES avaliacoes(id) ON DELETE CASCADE,
    questao_id UUID REFERENCES questoes(id) ON DELETE SET NULL,
    valor_texto TEXT,
    valor_nota DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sincronização
CREATE TABLE sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    totem_id UUID REFERENCES totens(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    registros JSONB DEFAULT '[]',
    sucesso BOOLEAN DEFAULT false,
    erro_mensagem TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sessões ativas (para heartbeat)
CREATE TABLE totem_sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    totem_id UUID REFERENCES totens(id) ON DELETE CASCADE,
    ultimo_ping TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_unidades_updated_at
    BEFORE UPDATE ON unidades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionarios_updated_at
    BEFORE UPDATE ON questionarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_totens_updated_at
    BEFORE UPDATE ON totens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX idx_totens_unidade ON totens(unidade_id);
CREATE INDEX idx_totens_status ON totens(status);
CREATE INDEX idx_totens_codigo ON totens(codigo);
CREATE INDEX idx_questoes_questionario ON questoes(questionario_id);
CREATE INDEX idx_avaliacoes_totem ON avaliacoes(totem_id);
CREATE INDEX idx_avaliacoes_status ON avaliacoes(status);
CREATE INDEX idx_avaliacoes_created ON avaliacoes(created_at);
CREATE INDEX idx_respostas_avaliacao ON respostas(avaliacao_id);
CREATE INDEX idx_sync_log_totem ON sync_log(totem_id);
CREATE INDEX idx_totem_ativacoes_chave ON totem_ativacoes(chave_ativacao);
CREATE INDEX idx_totem_sessoes_totem ON totem_sessoes(totem_id);

-- Row Level Security (RLS)
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE totens ENABLE ROW LEVEL SECURITY;
ALTER TABLE totem_ativacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE totem_sessoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para totens (leituras públicas para ativação)
CREATE POLICY totem_public_read ON totens FOR SELECT USING (true);
CREATE POLICY totem_public_update ON totens FOR UPDATE USING (true);

-- Políticas para unidades
CREATE POLICY unidades_admin_all ON unidades FOR ALL USING (true);

-- Políticas para questionários
CREATE POLICY questionarios_admin_all ON questionarios FOR ALL USING (true);

-- Políticas para questões
CREATE POLICY questoes_admin_all ON questoes FOR ALL USING (true);

-- Políticas para totem_ativacoes
CREATE POLICY ativacoes_totem_read ON totem_ativacoes FOR SELECT USING (true);
CREATE POLICY ativacoes_totem_update ON totem_ativacoes FOR UPDATE USING (true);

-- Políticas para avaliações
CREATE POLICY avaliacoes_insert ON avaliacoes FOR INSERT WITH CHECK (true);
CREATE POLICY avaliacoes_admin_all ON avaliacoes FOR ALL USING (true);

-- Políticas para respostas
CREATE POLICY respostas_insert ON respostas FOR INSERT WITH CHECK (true);
CREATE POLICY respostas_admin_all ON respostas FOR ALL USING (true);

-- Políticas para sync_log
CREATE POLICY sync_log_insert ON sync_log FOR INSERT WITH CHECK (true);
CREATE POLICY sync_log_admin_all ON sync_log FOR ALL USING (true);

-- Políticas para totem_sessoes
CREATE POLICY sessoes_insert ON totem_sessoes FOR INSERT WITH CHECK (true);
CREATE POLICY sessoes_update ON totem_sessoes FOR UPDATE USING (true);
