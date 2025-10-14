import { Request, Response } from 'express';
import { EquipamentoService } from '../services/equipamentoService';


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
    const filters : EquipmentFilters = req.query ? req.query as any: {};
    try {
      const equipamentos = await this.equipamentoService.getEquipamentos(filters);
      res.json(equipamentos);
    } catch (error) {
      console.error('Erro em getEquipamentos:', error);
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
      console.error('Erro em getEquipamentoById:', error);
      res.status(500).json({ message: 'Erro ao buscar equipamento' });
    }
  }

  async createEquipamento(req: Request, res: Response): Promise<void> {
    try {
      const equipamento = await this.equipamentoService.createEquipamento(req.body);
      res.status(201).json(equipamento);
    } catch (error) {
      console.error('Erro em createEquipamento:', error);
      res.status(500).json({ message: 'Erro ao criar equipamento' });
    }
  }

  async updateEquipamento(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const equipamento = await this.equipamentoService.updateEquipamento(Number(id), req.body);
      res.json(equipamento);
    } catch (error) {
      console.error('Erro em updateEquipamento:', error);
      res.status(500).json({ message: 'Erro ao atualizar equipamento' });
    }
  }

  async deleteEquipamento(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.equipamentoService.deleteEquipamento(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Erro em deleteEquipamento:', error);
      res.status(500).json({ message: 'Erro ao deletar equipamento' });
    }
  }

  async generateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const apiKey = await this.equipamentoService.generateApiKey(Number(id));
      res.json({ api_key: apiKey });
    } catch (error) {
      console.error('Erro em generateApiKey:', error);
      res.status(500).json({ message: 'Erro ao gerar API key' });
    }
  }

  async regenerateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const apiKey = await this.equipamentoService.regenerateApiKey(Number(id));
      res.json({ api_key: apiKey });
    } catch (error) {
      console.error('Erro em regenerateApiKey:', error);
      res.status(500).json({ message: 'Erro ao regenerar API key' });
    }
  }
}
