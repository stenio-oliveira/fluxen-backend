import { Decimal } from "@prisma/client/runtime/library";

export interface EquipamentoLog {
  id: number;
  id_equipamento_metrica: number ;
  id_equipamento : number ;
  valor: number;
  valor_convertido: number | Decimal;
  id_metrica: number;
}

