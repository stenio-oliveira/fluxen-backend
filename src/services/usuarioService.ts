import { prisma } from '..';
import { ClientesFilters, UserFilters } from '../controllers/usuarioController';
import { UsuarioRepository } from '../repositories/usuarioRepository';
import { CreateUserDTO, Usuario } from '../types/Usuario';
import bcrypt from 'bcrypt';

export class UsuarioService {
  private usuarioRepository = new UsuarioRepository();

  async getUsuarios(userId: number, filters: UserFilters): Promise<Usuario[]> {
    return await this.usuarioRepository.findAll(filters);
  }

  async getClienteByEquipamentoId(id_equipamento: number): Promise<Usuario | null> {
    return this.usuarioRepository.findByEquipamentoId(id_equipamento);
  }

  async getUsuarioById(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findById(id);
  }

  async createUsuario(data: CreateUserDTO): Promise<Usuario> {
    const { nome, email, senha, username, id_perfil, relacionamentos = [] } = data;

    return prisma.$transaction(async (tx) => {
      // Hash da senha antes de criar o usuário
      const encryptedSenha = await bcrypt.hash(senha, 10);
      const newUser = await this.usuarioRepository.create({ nome, email, senha: encryptedSenha, username }, tx);

      // Criando usuário administrador
      if (id_perfil === 1) {
        const newUserProfileAssociation = await tx.usuario_perfil.create({
          data: {
            id_usuario: newUser.id,
            id_perfil: id_perfil,
          },
        });
        if (!newUserProfileAssociation) {
          throw new Error('Erro ao criar perfil do usuário');
        }
        return newUser;
      }

      // Criar relacionamentos usuario_perfil_cliente
      for (const relacionamento of relacionamentos) {
        const { id_cliente, id_perfil: perfilId } = relacionamento;
        await tx.usuario_perfil_cliente.create({
          data: {
            id_usuario: newUser.id,
            id_cliente,
            id_perfil: perfilId,
          },
        });
      }

      return newUser;
    });
  }

  async updateUsuario(id: number, data: Partial<Usuario>): Promise<Usuario> {
    return this.usuarioRepository.update(id, data);
  }

  async deleteUsuario(id: number): Promise<void> {
    await this.usuarioRepository.delete(id);
  }
}
