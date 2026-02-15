import { SupportTicketRepository } from '../repositories/supportTicketRepository';
import { SupportTicket, CreateSupportTicketDTO, UpdateSupportTicketDTO } from '../types/SupportTicket';
import { logger } from '../utils/logger';
import { emailService } from './emailService';
import { UsuarioRepository } from '../repositories/usuarioRepository';

export class SupportTicketService {
  private supportTicketRepository = new SupportTicketRepository();
  private emailService = emailService;
  private usuarioRepository = new UsuarioRepository();

  async getTicketsByUser(userId: number, tenantId: number): Promise<SupportTicket[]> {
    return this.supportTicketRepository.findByUserId(userId, tenantId);
  }

  async getTicketById(id: number, tenantId: number): Promise<SupportTicket | null> {
    return this.supportTicketRepository.findById(id, tenantId);
  }

  private generateSupportTicketEmailHTML(
    userName: string,
    descricao: string,
    email: string | null,
    telefone: string | null,
    anexo: string | null,
    ticketId: number
  ): string {
    const anexoLink = anexo 
      ? `<a href="${anexo}" target="_blank" style="color: #1FB6D5; text-decoration: none; word-break: break-all;">${anexo}</a>`
      : '<span style="color: #999;">Nenhum anexo enviado</span>';

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Ticket de Suporte</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00204a 0%, #1FB6D5 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Novo Ticket de Suporte</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.6;">
                Um novo ticket de suporte foi criado no sistema.
              </p>
              
              <!-- Ticket Info Card -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #1FB6D5; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #00204a; font-size: 14px; display: inline-block; min-width: 140px;">ID do Ticket:</strong>
                      <span style="color: #333; font-size: 14px;">#${ticketId}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #00204a; font-size: 14px; display: inline-block; min-width: 140px;">Criado por:</strong>
                      <span style="color: #333; font-size: 14px;">${userName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #00204a; font-size: 14px; display: inline-block; min-width: 140px;">Email:</strong>
                      <span style="color: #333; font-size: 14px;">${email || 'Não informado'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #00204a; font-size: 14px; display: inline-block; min-width: 140px;">Telefone:</strong>
                      <span style="color: #333; font-size: 14px;">${telefone || 'Não informado'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #00204a; font-size: 14px; display: inline-block; min-width: 140px;">Anexo:</strong>
                      <span style="color: #333; font-size: 14px;">${anexoLink}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Description Section -->
              <div style="margin: 25px 0;">
                <h2 style="margin: 0 0 15px 0; color: #00204a; font-size: 18px; font-weight: 600;">Descrição do Problema</h2>
                <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px; color: #333; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">
                  <p style="margin: 0;">${descricao}</p>  
                </div>
              </div>
              
              <!-- Footer -->
              <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
                <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6;">
                  Este é um email automático gerado pelo sistema de gerenciamento de equipamentos SIRGS.<br>
                  Por favor, não responda diretamente a este email.
                </p>
              </div>
            </td>
          </tr>
        </table>
        
        <!-- Footer Outside -->
        <table role="presentation" style="max-width: 600px; margin: 20px auto 0; border-collapse: collapse;">
          <tr>
            <td style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} SIRGS - Sistema de Gerenciamento de Equipamentos</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  async createTicket(
    data: CreateSupportTicketDTO,
    tenantId: number,
    userId: number
  ): Promise<SupportTicket | null> {
    const newTicket = await this.supportTicketRepository.create(data, tenantId, userId);
    logger.info('email de suporte enviado para: ', process.env.SUPPORT_EMAIL);

    const user = await this.usuarioRepository.findById(userId);
    if(newTicket && user) {
      const emailHTML = this.generateSupportTicketEmailHTML(
        user.nome,
        newTicket.descricao,
        newTicket.email || null,
        newTicket.numero_telefone || null,
        newTicket.anexo || null,
        newTicket.id
      );

      const emailText = `Ticket de suporte criado por: ${user.nome}
        ID do Ticket: #${newTicket.id}
        Descrição: ${newTicket.descricao}
        Email do usuário: ${newTicket.email || 'Não informado'}
        Telefone do usuário: ${newTicket.numero_telefone || 'Não informado'}
        Anexo: ${newTicket.anexo || 'Nenhum anexo enviado'}`;

      await this.emailService.sendEmail({
        to: process.env.SUPPORT_EMAIL || '',
        subject: `Novo Ticket de Suporte #${newTicket.id} - ${user.nome}`,
        text: emailText,
        html: emailHTML,
      });
    }
    return newTicket;
  }

  async updateTicket(
    id: number,
    data: UpdateSupportTicketDTO,
    tenantId: number
  ): Promise<SupportTicket> {
    return this.supportTicketRepository.update(id, data, tenantId);
  }
}
