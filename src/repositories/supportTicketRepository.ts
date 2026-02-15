import { Prisma } from '@prisma/client';
import { prisma } from '../database';
import { SupportTicket } from '../types/SupportTicket';

export class SupportTicketRepository {
  include = (): Prisma.support_ticketsInclude => {
    return {
      usuario: true,
    };
  };

  findByUserId = async (
    userId: number,
    tenantId: number,
    tx?: Prisma.TransactionClient
  ): Promise<SupportTicket[]> => {
    const executor = tx || prisma;
    return executor.support_tickets
      .findMany({
        where: {
          id_usuario: userId,
          id_tenant: tenantId,
        },
        include: this.include(),
        orderBy: {
          created_at: 'desc',
        },
      })
      .then(this.formatArray);
  };

  findById = async (
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient
  ): Promise<SupportTicket | null> => {
    const executor = tx || prisma;
    return executor.support_tickets
      .findFirst({
        where: {
          id,
          id_tenant: tenantId,
        },
        include: this.include(),
      })
      .then((ticket) => this.format(ticket));
  };

  create = async (
    data: Partial<SupportTicket>,
    tenantId: number,
    userId?: number,
    tx?: Prisma.TransactionClient
  ): Promise<SupportTicket | null> => {
    const { descricao, email, numero_telefone, anexo } = data;
    if (!descricao || descricao === '') {
      throw new Error('Erro ao criar ticket: descrição é obrigatória');
    }

    const executor = tx || prisma;
    return executor.support_tickets
      .create({
        data: {
          descricao,
          email: email || null,
          numero_telefone: numero_telefone || null,
          anexo: anexo || null,
          id_tenant: tenantId,
          id_usuario: userId || null,
        },
        include: this.include(),
      })
      .then((ticket) => this.format(ticket));
  };

  update = async (
    id: number,
    data: Partial<SupportTicket>,
    tenantId: number,
    tx?: Prisma.TransactionClient
  ): Promise<SupportTicket> => {
    const executor = tx || prisma;
    return executor.support_tickets
      .update({
        where: { id },
        data: {
          descricao: data.descricao,
          email: data.email,
          numero_telefone: data.numero_telefone,
          anexo: data.anexo,
        },
        include: this.include(),
      })
      .then(this.format);
  };

  format = (ticket: SupportTicket | any): SupportTicket => {
    return {
      id: ticket.id,
      id_tenant: ticket.id_tenant,
      id_usuario: ticket.id_usuario,
      descricao: ticket.descricao,
      email: ticket.email,
      numero_telefone: ticket.numero_telefone,
      anexo: ticket.anexo,
      created_at: ticket.created_at,
    };
  };

  formatArray = (tickets: any[]): SupportTicket[] =>
    tickets.map((ticket) => this.format(ticket));
}
