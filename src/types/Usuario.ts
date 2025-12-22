export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  username: string;
  perfil_nome?: string;
  is_gestor?: boolean; // Indica se o usuário é gestor de algum cliente
  // Campos de auditoria
  created_at?: Date | null;
  created_by?: number | null;
  // Campos Stripe para gerenciamento de assinaturas
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null; // active, canceled, past_due, trialing, etc.
  subscription_current_period_start?: Date | null;
  subscription_current_period_end?: Date | null;
  subscription_cancel_at_period_end?: boolean | null;
  plan_name?: string | null; // Nome do plano (ex: "basic", "premium")
  stripe_price_id?: string | null; // ID do preço no Stripe

}

export interface CreateUserDTO {
  nome: string;
  email: string;
  senha: string;
  username: string;
  id_perfil: number;
  relacionamentos?: {
    id_cliente: number;
    id_perfil: number; // 2 = responsável, 3 = gestor
  }[];
}