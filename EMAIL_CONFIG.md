# Configuração do Email Service

O sistema utiliza o Nodemailer para envio de emails. As seguintes variáveis de ambiente são necessárias:

## Variáveis Obrigatórias para SIRGS

```env
# Host do servidor SMTP
EMAIL_HOST=mail.sirgs.com.br

# Porta do servidor SMTP (465 para SSL)
EMAIL_PORT=465

# Usuário/email para autenticação SMTP
EMAIL_USER=no-reply@sirgs.com.br

# Senha do email
EMAIL_PASSWORD=Noreply987rs*

# Email remetente (opcional, padrão: no-reply@sirgs.com.br)
EMAIL_FROM=no-reply@sirgs.com.br

# SSL habilitado (true para porta 465)
EMAIL_SECURE=true
```

## Configuração Completa para SIRGS

```env
EMAIL_HOST=mail.sirgs.com.br
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=no-reply@sirgs.com.br
EMAIL_PASSWORD=Noreply987rs*
EMAIL_FROM=no-reply@sirgs.com.br
```

## Informações do Servidor SIRGS

- **Servidor de Saída (SMTP):** mail.sirgs.com.br
- **Porta SMTP:** 465 (SSL)
- **Email:** no-reply@sirgs.com.br
- **Protocolo:** SSL/TLS

## Configurações Comuns (Outros Servidores)

### Gmail
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app
```

### Outlook/Office 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu-email@outlook.com
EMAIL_PASSWORD=sua-senha
```

## Notas

- Se `EMAIL_SECURE=true`, use porta 465 (SSL)
- Se `EMAIL_SECURE=false`, use porta 587 (TLS)
- O sistema verifica automaticamente a conexão ao inicializar
- Se o email service não estiver configurado, os relatórios não serão enviados (mas o worker continuará funcionando)

