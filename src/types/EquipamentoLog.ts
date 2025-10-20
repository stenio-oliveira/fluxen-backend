import { Decimal } from "@prisma/client/runtime/library";
import { Metrica } from "./Metrica";
import { EquipamentoMetrica } from "./EquipamentoMetrica";

export interface EquipamentoLog {
  id: number;
  id_equipamento_metrica: number;
  id_equipamento: number;
  valor: number;
  valor_convertido: number | Decimal;
  id_metrica: number;
  metrica?: Metrica;
  equipamento_metricas?: EquipamentoMetrica;
  timestamp?: Date;
}

