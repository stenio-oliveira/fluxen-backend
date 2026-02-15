import { SystemAnnouncementRepository } from '../repositories/systemAnnouncementRepository';
import { SystemAnnouncement, CreateSystemAnnouncementDTO, UpdateSystemAnnouncementDTO } from '../types/SystemAnnouncement';
import { prisma } from '../database';

export class SystemAnnouncementService {
  private systemAnnouncementRepository = new SystemAnnouncementRepository();

  async getAnnouncements(tenantId: number, filters: any): Promise<SystemAnnouncement[]> {
    return this.systemAnnouncementRepository.findAll(filters, tenantId);
  }

  async getAnnouncementById(id: number, tenantId: number): Promise<SystemAnnouncement | null> {
    return this.systemAnnouncementRepository.findById(id, tenantId);
  }

  async getActiveAnnouncement(tenantId: number): Promise<SystemAnnouncement | null> {
    return this.systemAnnouncementRepository.findActiveByTenant(tenantId);
  }

  async createAnnouncement(
    data: CreateSystemAnnouncementDTO,
    tenantId: number,
    userId: number
  ): Promise<SystemAnnouncement | null> {
    return prisma.$transaction(async (tx) => {
      // Se o anúncio está sendo criado como ativo, desativar todos os outros
      if (data.is_active !== false) {
        await tx.system_announcement.updateMany({
          where: {
            id_tenant: tenantId,
            is_active: true,
          },
          data: {
            is_active: false,
            ends_at: new Date(),
          },
        });
      }

      return this.systemAnnouncementRepository.create(
        {
          ...data,
          is_active: data.is_active ?? true,
        },
        tenantId,
        userId,
        tx
      );
    });
  }

  async updateAnnouncement(
    id: number,
    data: UpdateSystemAnnouncementDTO,
    tenantId: number
  ): Promise<SystemAnnouncement> {
    return prisma.$transaction(async (tx) => {
      const currentAnnouncement = await tx.system_announcement.findFirst({
        where: { id, id_tenant: tenantId },
      });

      if (!currentAnnouncement) {
        throw new Error('Anúncio não encontrado');
      }

      // Se está ativando um anúncio
      if (data.is_active === true && !currentAnnouncement.is_active) {
        // Desativar todos os outros anúncios ativos
        await tx.system_announcement.updateMany({
          where: {
            id_tenant: tenantId,
            is_active: true,
            id: { not: id },
          },
          data: {
            is_active: false,
            ends_at: new Date(),
          },
        });

        // Atualizar o anúncio atual: ends_at = null, starts_at = agora
        return this.systemAnnouncementRepository.update(
          id,
          {
            ...data,
            starts_at: new Date(),
            ends_at: null,
          },
          tenantId,
          tx
        );
      }

      // Se está desativando um anúncio
      if (data.is_active === false && currentAnnouncement.is_active) {
        return this.systemAnnouncementRepository.update(
          id,
          {
            ...data,
            ends_at: new Date(),
          },
          tenantId,
          tx
        );
      }

      // Atualização normal
      return this.systemAnnouncementRepository.update(id, data, tenantId, tx);
    });
  }

  async deleteAnnouncement(id: number, tenantId: number): Promise<void> {
    await this.systemAnnouncementRepository.delete(id, tenantId);
  }
}
