export interface CreateEquipamentoLogDTO {
  id_equipamento: number;
  id_metrica: number;
  valor: number;
  valor_convertido?: number;
  id_equipamento_metrica?: number;
}

export interface CreateEquipamentoLogsDTO {
  logs: CreateEquipamentoLogDTO[];
}
