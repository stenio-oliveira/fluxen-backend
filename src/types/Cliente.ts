export interface Cliente {
  id: number;
  nome: string | null;
  cnpj: string | null;

  // Campos deauditoria
  created_at?: Date | null;
  created_by?: number | null;

  //campos necessários para criação
}

export interface CreateClientDTO {
  nome: string;
  cnpj: string;
  relacionamentos?: {
    id_usuario: number;
    id_perfil: number; // 2 = responsável, 3 = gestor
  }[];
}