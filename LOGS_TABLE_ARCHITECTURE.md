
3. **Controller Layer** (`equipamentoLogController.ts`)
   - `getLogsTableData()`: Endpoint GET `/equipamento-logs/table/:id`

4. **Router** (`equipamentoLogRouter.ts`)
   - Rota: `GET /equipamento-logs/table/:id` (autenticada com JWT)

### Frontend
1. **Service** (`equipamentoLogService.ts`)
   - `getLogsTableData()`: Consome API do backend

2. **Component** (`EquipamentoLogGrupoTable.tsx`)
   - Tabela DataGrid com colunas dinâmicas
   - Segue padrão das outras tabelas do sistema

3. **Page** (`EquipamentoLogsPage.tsx`)
   - Página dedicada para exibir logs
   - Rota: `/equipamentos/:id/logs`

## Fluxo de Dados

```
1. Frontend chama API: GET /equipamento-logs/table/:id
2. Backend busca logs do equipamento
3. Backend agrupa logs por timestamp
4. Backend extrai métricas únicas
5. Backend cria colunas dinâmicas
6. Backend organiza dados em linhas
7. Frontend recebe estrutura da tabela
8. Frontend renderiza DataGrid com colunas dinâmicas
```

## Estrutura da Resposta da API

```json
{
  "columns": [
    {
      "field": "timestamp",
      "headerName": "Timestamp",
      "flex": 1,
      "type": "string"
    },
    {
      "field": "metrica_1",
      "headerName": "Temperatura (°C)",
      "flex": 1,
      "type": "number"
    },
    {
      "field": "metrica_2",
      "headerName": "Umidade (%)",
      "flex": 1,
      "type": "number"
    }
  ],
  "rows": [
    {
      "id": 0,
      "timestamp": "Log 4",
      "metrica_1": 46.4,
      "metrica_2": 43.9
    }
  ]
}
```

## Agrupamento de Logs

### Estratégia Atual (Com Timestamp Real)
- Logs são agrupados por timestamp real (campo `timestamp`)
- Cada grupo representa uma medição no mesmo momento
- Logs dentro do grupo são ordenados por `id_metrica`
- Timestamps são formatados para exibição em português brasileiro

### Exemplo de Agrupamento
```
Logs originais com timestamps:
- Log 1: Temperatura, 2024-01-15 10:00:00
- Log 2: Umidade, 2024-01-15 10:00:00  
- Log 3: Pressão, 2024-01-15 10:00:00
- Log 4: Temperatura, 2024-01-15 10:05:00
- Log 5: Umidade, 2024-01-15 10:05:00
- Log 6: Pressão, 2024-01-15 10:05:00

Agrupamento resultante:
Batch 1: 2024-01-15 10:00:00 → [Temperatura, Umidade, Pressão]
Batch 2: 2024-01-15 10:05:00 → [Temperatura, Umidade, Pressão]
```

## Melhorias Futuras

1. **Campo Timestamp Real** ✅ **IMPLEMENTADO**
   - Campo `timestamp` adicionado na tabela `equipamento_log`
   - Agrupamento por timestamp real implementado

2. **Filtros e Paginação**
   - Adicionar filtros por data
   - Implementar paginação para grandes volumes

3. **Exportação**
   - Permitir exportar dados para CSV/Excel
   - Adicionar gráficos de tendência

4. **Performance**
   - Implementar cache para dados frequentes
   - Otimizar queries para grandes volumes

## Teste da Solução

1. Execute o script `test_logs_data.sql` para inserir dados de teste
2. Acesse `/equipamentos/1/logs` no frontend
3. Verifique se a tabela exibe colunas dinâmicas corretamente
