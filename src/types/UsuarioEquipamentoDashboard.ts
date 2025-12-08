import { Equipamento } from "./Equipamento";
import { Usuario } from "./Usuario";

export interface UsuarioEquipamentoDashboard {
  id: number;
  id_usuario: number;
  id_equipamento: number;
  created_at?: Date | null;
  usuario?: Usuario;
  equipamento?: Equipamento;
}


