import { Metrica } from "./Metrica";
import { Usuario } from "./Usuario";
import { Prisma } from "@prisma/client";
export interface Equipamento {
  id: number;
  nome: string;
  id_usuario: number;

  //usuario
  usuario?: Usuario;
  //campos relacionados formatados
  cliente?: Usuario;
  cliente_nome?: string;
  metricas? : Metrica[]
  
}
