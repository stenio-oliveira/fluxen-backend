import { Perfil } from "./Perfil";

export interface UsuarioPerfil {
  id: number;
  id_usuario: number;
  id_perfil: number;

  perfil?: Perfil;
}
