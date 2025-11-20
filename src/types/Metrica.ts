import { EquipamentoMetrica } from "./EquipamentoMetrica";

export interface Metrica {
  id: number;
  nome: string;
  unidade: string;
  // Campos de auditoria
  created_at?: Date | null;
  created_by?: number | null;
  equipamento_metrica? : EquipamentoMetrica;
  valor_minimo?: number;
  valor_maximo?: number;
}
