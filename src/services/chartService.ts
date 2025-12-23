import { EquipamentoLogRepository } from "../repositories/equipamentoLogRepository";
import { EquipamentoMetricaRepository } from "../repositories/equipamentoMetricaRepository";
import { logError } from "../utils/logger";

export type TimeRange = '5min' | '15min' | '30min' | '1h' | '6h' | '24h' | '7d';

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  metadata: {
    metrica: {
      id: number;
      nome: string;
      unidade: string;
    };
    timeRange?: TimeRange;
    total?: number;
    currentValue?: number;
    maxValue?: number;
    minValue?: number;
  };
}

export class ChartService {
  private equipamentoLogRepository: EquipamentoLogRepository;
  private equipamentoMetricaRepository: EquipamentoMetricaRepository;

  constructor() {
    this.equipamentoLogRepository = new EquipamentoLogRepository();
    this.equipamentoMetricaRepository = new EquipamentoMetricaRepository();
  }

  private calculateTimeRange(timeRange: TimeRange): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '5min':
        startDate.setMinutes(startDate.getMinutes() - 5);
        break;
      case '15min':
        startDate.setMinutes(startDate.getMinutes() - 15);
        break;
      case '30min':
        startDate.setMinutes(startDate.getMinutes() - 30);
        break;
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '6h':
        startDate.setHours(startDate.getHours() - 6);
        break;
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      default:
        startDate.setMinutes(startDate.getMinutes() - 5);
    }

    return { startDate, endDate };
  }

  private formatTimestamp(date: Date | null): string {
    if (!date) return '';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private extractMetricValueFromGroup(group: any, id_metrica: number): number | null {
    if (!group.logs) return null;

    let parsedLogs: any[] = [];
    try {
      parsedLogs = typeof group.logs === 'string'
        ? JSON.parse(group.logs)
        : group.logs;
    } catch (error) {
      logError('Error parsing logs JSON in chart service', error);
      return null;
    }

    const log = parsedLogs.find((l: any) => l.id_metrica === id_metrica);
    if (!log || log.valor_convertido === null || log.valor_convertido === undefined) {
      return null;
    }

    return Math.round(Number(log.valor_convertido) * 100) / 100;
  }

  async getLineChartData(
    id_equipamento: number,
    id_metrica: number,
    timeRange: TimeRange = '5min'
  ): Promise<ChartData> {
    try {
      // Buscar informações da métrica
      const equipamentoMetrica = await this.equipamentoMetricaRepository.findByEquipamentoAndMetrica(
        id_equipamento,
        id_metrica
      );

      if (!equipamentoMetrica || !equipamentoMetrica.metrica) {
        throw new Error('Métrica não encontrada para este equipamento');
      }

      // Calcular intervalo de tempo
      const { startDate, endDate } = this.calculateTimeRange(timeRange);

      // Buscar grupos de logs no intervalo
      const { groups } = await this.equipamentoLogRepository.findGroupedByTimestampWithTimeRange(
        id_equipamento,
        startDate,
        endDate,
        { page: 1, pageSize: 1000 } // Limite alto para gráficos
      );

      // Extrair valores e timestamps
      const labels: string[] = [];
      const data: number[] = [];

      groups.forEach((group) => {
        const value = this.extractMetricValueFromGroup(group, id_metrica);
        if (value !== null) {
          labels.push(this.formatTimestamp(group.timestamp));
          data.push(value);
        }
      });

      return {
        labels,
        datasets: [{
          label: `${equipamentoMetrica.metrica.nome} (${equipamentoMetrica.metrica.unidade})`,
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
        }],
        metadata: {
          metrica: {
            id: equipamentoMetrica.metrica.id,
            nome: equipamentoMetrica.metrica.nome,
            unidade: equipamentoMetrica.metrica.unidade,
          },
          timeRange,
          maxValue: equipamentoMetrica.valor_maximo,
          minValue: equipamentoMetrica.valor_minimo,
        }
      };
    } catch (error) {
      logError('Error getting line chart data', error);
      throw error;
    }
  }

  async getDoughnutChartData(
    id_equipamento: number,
    id_metrica: number
  ): Promise<ChartData> {
    try {
      // Buscar informações da métrica
      const equipamentoMetrica = await this.equipamentoMetricaRepository.findByEquipamentoAndMetrica(
        id_equipamento,
        id_metrica
      );

      if (!equipamentoMetrica || !equipamentoMetrica.metrica) {
        throw new Error('Métrica não encontrada para este equipamento');
      }

      // Buscar o último grupo de logs
      const { groups } = await this.equipamentoLogRepository.findGroupedByTimestamp(
        id_equipamento,
        { page: 1, pageSize: 1 }
      );

      if (groups.length === 0) {
        throw new Error('Nenhum log encontrado para este equipamento');
      }

      const lastGroup = groups[0];
      const currentValue = this.extractMetricValueFromGroup(lastGroup, id_metrica);

      if (currentValue === null) {
        throw new Error('Valor da métrica não encontrado no último log');
      }

      const maxValue = equipamentoMetrica.valor_maximo;
      const minValue = equipamentoMetrica.valor_minimo;
      const range = maxValue - minValue;
      
      // Calcular percentual preenchido (valor atual em relação ao máximo)
      const percentage = Math.min(Math.max((currentValue - minValue) / range * 100, 0), 100);
      const remaining = 100 - percentage;

      return {
        labels: ['Preenchido', 'Restante'],
        datasets: [{
          label: `${equipamentoMetrica.metrica.nome} (${equipamentoMetrica.metrica.unidade})`,
          data: [percentage, remaining],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(201, 203, 207, 0.8)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(201, 203, 207, 1)'
          ],
          borderWidth: 2,
        }],
        metadata: {
          metrica: {
            id: equipamentoMetrica.metrica.id,
            nome: equipamentoMetrica.metrica.nome,
            unidade: equipamentoMetrica.metrica.unidade,
          },
          currentValue,
          maxValue,
          total: maxValue,
        }
      };
    } catch (error) {
      logError('Error getting doughnut chart data', error);
      throw error;
    }
  }

  async getBarChartData(
    id_equipamento: number,
    id_metrica: number,
    timeRange: TimeRange = '1h'
  ): Promise<ChartData> {
    try {
      // Buscar informações da métrica
      const equipamentoMetrica = await this.equipamentoMetricaRepository.findByEquipamentoAndMetrica(
        id_equipamento,
        id_metrica
      );

      if (!equipamentoMetrica || !equipamentoMetrica.metrica) {
        throw new Error('Métrica não encontrada para este equipamento');
      }

      // Calcular intervalo de tempo
      const { startDate, endDate } = this.calculateTimeRange(timeRange);

      // Buscar grupos de logs no intervalo
      const { groups } = await this.equipamentoLogRepository.findGroupedByTimestampWithTimeRange(
        id_equipamento,
        startDate,
        endDate,
        { page: 1, pageSize: 1000 }
      );

      // Extrair valores e timestamps
      const labels: string[] = [];
      const data: number[] = [];

      groups.forEach((group) => {
        const value = this.extractMetricValueFromGroup(group, id_metrica);
        if (value !== null) {
          labels.push(this.formatTimestamp(group.timestamp));
          data.push(value);
        }
      });

      return {
        labels,
        datasets: [{
          label: `${equipamentoMetrica.metrica.nome} (${equipamentoMetrica.metrica.unidade})`,
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
        metadata: {
          metrica: {
            id: equipamentoMetrica.metrica.id,
            nome: equipamentoMetrica.metrica.nome,
            unidade: equipamentoMetrica.metrica.unidade,
          },
          timeRange,
          maxValue: equipamentoMetrica.valor_maximo,
          minValue: equipamentoMetrica.valor_minimo,
        }
      };
    } catch (error) {
      logError('Error getting bar chart data', error);
      throw error;
    }
  }
}

