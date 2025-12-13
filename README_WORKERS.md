# Workers do Sistema

Este projeto possui um worker que processa mensagens do RabbitMQ:

## Logs Worker (`wokers/logsWorker.ts`)
Processa logs de equipamentos recebidos via API e cria notificações automaticamente quando detecta alarmes.

**Como iniciar:**
```bash
# Desenvolvimento
npm run dev:worker

# Produção
npm run start:worker
```

## Iniciar Todos os Serviços

### Desenvolvimento
```bash
npm run dev
# ou
npm run dev:all
```

Isso iniciará:
- API (porta 3000)
- Logs Worker (que também processa notificações)

### Produção
```bash
npm run start
# ou
npm run start:all
```

## PM2 (Produção)

Para usar PM2, execute:
```bash
npm run start:pm2
```

Isso iniciará todos os processos:
- `sirgs-api` - API principal
- `sirgs-worker` - Worker de logs e notificações

### Comandos PM2 úteis:
```bash
npm run pm2:status    # Ver status de todos os processos
npm run pm2:logs      # Ver logs de todos os processos
npm run pm2:monit     # Monitoramento em tempo real
npm run pm2:restart   # Reiniciar todos os processos
npm run pm2:stop      # Parar todos os processos
```

## Verificar se os Workers Estão Rodando

### Em Desenvolvimento
Os logs aparecerão no terminal com prefixos coloridos:
- `[API]` - API principal
- `[WORKER]` - Logs worker

### Em Produção (PM2)
```bash
pm2 status
```

Você deve ver 2 processos:
1. `sirgs-api`
2. `sirgs-worker`

## Logs de Notificações

As notificações são criadas automaticamente durante o processamento de logs. Os logs aparecerão como:
- `[Notifications] Created X notification(s) for MIN/MAX alarm - Equipment: ..., Metric: ..., Value: ...`

## Troubleshooting

Se o worker não estiver iniciando:

1. **Verificar se RabbitMQ está rodando:**
   ```bash
   docker compose ps
   ```

2. **Verificar logs do worker:**
   ```bash
   # Desenvolvimento - ver no terminal
   # Produção
   pm2 logs sirgs-notifications-worker
   ```

3. **Verificar se o arquivo foi compilado:**
   ```bash
   npm run build
   ls dist/wokers/logsWorker.js
   ```

4. **Testar conexão RabbitMQ manualmente:**
   O worker tentará conectar e exibirá erros se houver problemas.

