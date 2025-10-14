import { EquipamentoMetrica } from "./EquipamentoMetrica";

export interface Metrica {
  id: number;
  nome: string;
  unidade: string;


  equipamento_metrica? : EquipamentoMetrica;
  valor_minimo?: number;
  valor_maximo?: number;
}
