import { Request, Response } from 'express';
import { EquipamentoService } from '../services/equipamentoService';
import { logError } from '../utils/logger';

export interface EquipmentFilters {
  columnFilters?: {
    id: string;
    nome: string;
    cliente_nome: string;
  };
  generalFilter: string;
}

export class EquipamentoController {
  private equipamentoService = new EquipamentoService();

  async getEquipamentos(req: Request, res: Response): Promise<void> {
    const filters: EquipmentFilters = req.query ? req.query as any : {};
    const userId = req.query.userId as string;

    try {
      const equipamentos = await this.equipamentoService.getEquipamentos(Number(userId), filters);
      res.json(equipamentos);
    } catch (error) {
      logError('Failed to get equipment', error, { userId });
      res.status(500).json({ message: 'Erro ao buscar equipamentos' });
    }
  }

  async getEquipamentoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const equipamento = await this.equipamentoService.getEquipamentoById(Number(id));
      if (!equipamento) {
        res.status(404).json({ message: 'Equipamento não encontrado' });
        return;
      }
      res.json(equipamento);
    } catch (error) {
      logError('Failed to get equipment by ID', error, { equipamentoId: req.params.id });
      res.status(500).json({ message: 'Erro ao buscar equipamento' });
    }
  }

  async createEquipamento(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id ? Number(req.user.id) : undefined;
      const equipamento = await this.equipamentoService.createEquipamento(req.body, userId);
      res.status(201).json(equipamento);
    } catch (error: any) {
      if (error.message?.includes('permissão') || error.message?.includes('obrigatório')) {
        res.status(403).json({ message: error.message });
        return;
      }
      logError('Failed to create equipment', error);
      res.status(500).json({ message: 'Erro ao criar equipamento' });
    }
  }

  async updateEquipamento(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const equipamento = await this.equipamentoService.updateEquipamento(Number(id), req.body);
      res.json(equipamento);
    } catch (error) {
      logError('Failed to update equipment', error, { equipamentoId: id });
      res.status(500).json({ message: 'Erro ao atualizar equipamento' });
    }
  }

  async deleteEquipamento(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await this.equipamentoService.deleteEquipamento(Number(id));
      res.status(204).send();
    } catch (error) {
      logError('Failed to delete equipment', error, { equipamentoId: id });
      res.status(500).json({ message: 'Erro ao deletar equipamento' });
    }
  }

  async generateApiKey(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const apiKey = await this.equipamentoService.generateApiKey(Number(id));
      res.json({ api_key: apiKey });
    } catch (error) {
      logError('Failed to generate API key', error, { equipamentoId: id });
      res.status(500).json({ message: 'Erro ao gerar API key' });
    }
  }

  async regenerateApiKey(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const apiKey = await this.equipamentoService.regenerateApiKey(Number(id));
      res.json({ api_key: apiKey });
    } catch (error) {
      logError('Failed to regenerate API key', error, { equipamentoId: id });
      res.status(500).json({ message: 'Erro ao regenerar API key' });
    }
  }
}
