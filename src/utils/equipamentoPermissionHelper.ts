import { UsuarioRepository } from '../repositories/usuarioRepository';
import { prisma } from '../database';

/**
 * Verifica se um usuário tem permissão para acessar um equipamento específico
 * @param userId ID do usuário
 * @param equipamentoId ID do equipamento
 * @returns true se o usuário tem permissão (é admin, gestor ou responsável do cliente do equipamento)
 */
export async function hasEquipamentoPermission(
  userId: number,
  equipamentoId: number
): Promise<boolean> {
  const usuarioRepository = new UsuarioRepository();
  
  // Admin tem acesso a todos os equipamentos
  const isAdmin = await usuarioRepository.isAdmin(userId);
  if (isAdmin) {
    return true;
  }

  // Buscar o equipamento para obter o id_cliente
  const equipamento = await prisma.equipamento.findUnique({
    where: { id: equipamentoId },
    select: { id_cliente: true }
  });

  if (!equipamento || !equipamento.id_cliente) {
    return false;
  }

  // Verificar se o usuário é gestor do cliente
  const isManager = await usuarioRepository.isManager(userId);
  if (isManager) {
    const managerClient = await prisma.usuario_perfil_cliente.findFirst({
      where: {
        id_usuario: userId,
        id_cliente: equipamento.id_cliente,
        id_perfil: 3 // gestor
      }
    });
    if (managerClient) {
      return true;
    }
  }

  // Verificar se o usuário é responsável do cliente
  const isResponsable = await usuarioRepository.isResponsable(userId);
  if (isResponsable) {
    const responsableClient = await prisma.usuario_perfil_cliente.findFirst({
      where: {
        id_usuario: userId,
        id_cliente: equipamento.id_cliente,
        id_perfil: 2 // responsável
      }
    });
    if (responsableClient) {
      return true;
    }
  }

  return false;
}

