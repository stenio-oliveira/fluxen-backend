export interface Cliente {
  id: number;
  nome: string | null;
  cnpj: string | null;
  id_responsavel: number | null;
  id_administrador?: number | null;
  responsavel_nome?: string;
  // Campos de auditoria
  created_at?: Date | null;
  created_by?: number | null;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    username: string;
  } | null;
}
