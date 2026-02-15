export interface SupportTicket {
  id: number;
  id_tenant?: number | null;
  id_usuario?: number | null;
  descricao: string;
  email?: string | null;
  numero_telefone?: string | null;
  anexo?: string | null;
  created_at?: Date | null;
}

export interface CreateSupportTicketDTO {
  descricao: string;
  email?: string;
  numero_telefone?: string;
  anexo?: string;
}

export interface UpdateSupportTicketDTO {
  descricao?: string;
  email?: string;
  numero_telefone?: string;
  anexo?: string;
}
