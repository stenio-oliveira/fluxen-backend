export interface Cliente {
  id: number;
  nome: string | null;
  cnpj: string | null;
  id_responsavel: number | null;
  responsavel_nome?: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    username: string;
  } | null;
}
