import { Equipamento } from "./Equipamento";
import { Usuario } from "./Usuario";
import { Metrica } from "./Metrica";

export interface UsuarioEquipamentoDashboard {
  id: number;
  id_usuario: number;
  id_equipamento: number;
  id_metrica?: number | null;
  created_at?: Date | null;
  usuario?: Usuario;
  equipamento?: Equipamento;
  metrica?: Metrica;
}


