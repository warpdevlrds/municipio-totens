export interface Unidade {
  id: string;
  nome: string;
  cnpj?: string;
  municipio: string;
  estado: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Questionario {
  id: string;
  unidade_id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  versao: number;
  data_inicio?: string;
  data_fim?: string;
  created_at: string;
  updated_at: string;
}

export interface Questao {
  id: string;
  questionario_id: string;
  texto: string;
  tipo: 'nota' | 'escolha_unica' | 'escolha_multipla' | 'texto_livre';
  obrigatoria: boolean;
  ordem: number;
  opcoes?: string[];
  created_at: string;
}

export type TotemStatus = 'offline' | 'online' | 'manutencao' | 'inativo';

export interface Totem {
  id: string;
  unidade_id?: string;
  codigo: string;
  nome?: string;
  localizacao?: string;
  status: TotemStatus;
  versao_app?: string;
  ultimo_ping?: string;
  created_at: string;
  updated_at: string;
}

export interface TotemAtivacao {
  id: string;
  totem_id: string;
  chave_ativacao: string;
  ativado_em?: string;
  expira_em?: string;
  ativo: boolean;
  created_at: string;
}

export type AvaliacaoStatus = 'pendente' | 'processada' | 'erro';

export interface Avaliacao {
  id: string;
  totem_id: string;
  questionario_id: string;
  session_id: string;
  client_id?: string;
  status: AvaliacaoStatus;
  ip_address?: string;
  created_at: string;
  synced_at?: string;
}

export interface Resposta {
  id: string;
  avaliacao_id: string;
  questao_id: string;
  valor_texto?: string;
  valor_nota?: number;
  created_at: string;
}

export interface TotemSessao {
  id: string;
  totem_id: string;
  ultimo_ping: string;
  ip_address?: string;
  created_at: string;
}
