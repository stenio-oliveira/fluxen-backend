import { Request, Response } from 'express';
import { UsuarioEquipamentoDashboardService } from '../services/usuarioEquipamentoDashboardService';
import { logError } from '../utils/logger';

export class UsuarioEquipamentoDashboardController {
  private service = new UsuarioEquipamentoDashboardService();

  /**
   * GET /usuario-equipamento-dashboard/:userId
   * Busca todos os equipamentos do dashboard do usuário
   */
  async getEquipamentosDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const equipamentos = await this.service.getEquipamentosDashboard(Number(userId));
      res.json(equipamentos);
    } catch (error) {
      logError('Failed to get dashboard equipment', error, { userId: req.params.userId });
      res.status(500).json({ message: 'Erro ao buscar equipamentos do dashboard' });
    }
  }

  /**
   * POST /usuario-equipamento-dashboard
   * Adiciona um equipamento ao dashboard do usuário
   */
  async addEquipamentoToDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { userId, equipamentoId } = req.body;

      if (!userId || !equipamentoId) {
        res.status(400).json({ message: 'userId e equipamentoId são obrigatórios' });
        return;
      }

      const result = await this.service.addEquipamentoToDashboard(
        Number(userId),
        Number(equipamentoId)
      );
      res.status(201).json(result);
    } catch (error: any) {
      logError('Failed to add equipment to dashboard', error);
      const statusCode = error.message.includes('não encontrado') || 
                        error.message.includes('já está') ? 400 : 500;
      res.status(statusCode).json({ message: error.message || 'Erro ao adicionar equipamento ao dashboard' });
    }
  }

  /**
   * DELETE /usuario-equipamento-dashboard/:userId/:equipamentoId
   * Remove um equipamento do dashboard do usuário
   */
  async removeEquipamentoFromDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { userId, equipamentoId } = req.params;

      await this.service.removeEquipamentoFromDashboard(
        Number(userId),
        Number(equipamentoId)
      );
      res.status(204).send();
    } catch (error: any) {
      logError('Failed to remove equipment from dashboard', error, {
        userId: req.params.userId,
        equipamentoId: req.params.equipamentoId
      });
      const statusCode = error.message.includes('não está') ? 404 : 500;
      res.status(statusCode).json({ message: error.message || 'Erro ao remover equipamento do dashboard' });
    }
  }

  /**
   * GET /usuario-equipamento-dashboard/:userId/:equipamentoId/check
   * Verifica se um equipamento está no dashboard do usuário
   */
  async checkEquipamentoInDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { userId, equipamentoId } = req.params;
      const exists = await this.service.isEquipamentoInDashboard(
        Number(userId),
        Number(equipamentoId)
      );
      res.json({ exists });
    } catch (error) {
      logError('Failed to check equipment in dashboard', error, {
        userId: req.params.userId,
        equipamentoId: req.params.equipamentoId
      });
      res.status(500).json({ message: 'Erro ao verificar equipamento no dashboard' });
    }
  }
}


