# Exemplo da Nova Estrutura com Timestamp Real

## 🎯 **Estrutura Simplificada**

Com a adição do campo `timestamp` real, a estrutura ficou muito mais simples e eficiente.

## 📊 **Exemplo de Dados de Entrada**

```json
// Logs recebidos do equipamento
[
  {
    "id_equipamento": 1,
    "id_metrica": 1,
    "valor": 2048,
    "timestamp": "2024-01-15T10:00:00Z"
  },
  {
    "id_equipamento": 1,
    "id_metrica": 2,
    "valor": 1500,
    "timestamp": "2024-01-15T10:00:00Z"
  },
  {
    "id_equipamento": 1,
    "id_metrica": 3,
    "valor": 3000,
    "timestamp": "2024-01-15T10:00:00Z"
  }
]
```

## 🔄 **Processamento no Backend**

### 1. **Agrupamento por Timestamp**
```javascript
// Logs agrupados por timestamp
[
  {
    timestamp: "2024-01-15T10:00:00Z",
    logs: [
      { id_metrica: 1, valor_convertido: 50.0, metrica: { nome: "Temperatura", unidade: "°C" } },
      { id_metrica: 2, valor_convertido: 36.6, metrica: { nome: "Umidade", unidade: "%" } },
      { id_metrica: 3, valor_convertido: 732.4, metrica: { nome: "Pressão", unidade: "Pa" } }
    ]
  }
]
```

### 2. **Estrutura da Tabela Gerada**
```json
{
  "columns": [
    {
      "field": "timestamp",
      "headerName": "Data/Hora",
      "flex": 1.2,
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
    },
    {
      "field": "metrica_3",
      "headerName": "Pressão (Pa)",
      "flex": 1,
      "type": "number"
    }
  ],
  "rows": [
    {
      "id": 0,
      "timestamp": "2024-01-15T10:00:00Z",
      "metrica_1": 50.0,
      "metrica_2": 36.6,
      "metrica_3": 732.4
    }
  ]
}
```

## 🎨 **Renderização no Frontend**

### **Tabela Resultante:**
```
| Data/Hora              | Temperatura (°C) | Umidade (%) | Pressão (Pa) |
|------------------------|------------------|-------------|--------------|
| 15/01/2024 10:00:00   | 50.00           | 36.60       | 732.40       |
| 15/01/2024 10:05:00   | 43.90           | 48.80       | 610.40       |
| 15/01/2024 10:10:00   | 53.70           | 29.30       | 854.50       |
```

## ✅ **Benefícios da Nova Estrutura**

1. **Timestamp Real**: Agrupamento por data/hora real, não por ID
2. **Formatação Brasileira**: Datas exibidas no formato DD/MM/YYYY HH:MM:SS
3. **Valores Formatados**: Números com 2 casas decimais
4. **Fallback Inteligente**: Se timestamp não existir, usa ID como fallback
5. **Performance**: Menos JOINs, consultas mais rápidas
6. **Flexibilidade**: Suporta logs com ou sem timestamp

## 🧪 **Como Testar**

1. **Execute o script de teste:**
   ```sql
   -- Execute test_logs_data.sql no MySQL
   ```

2. **Acesse a aplicação:**
   - Vá para `/equipamentos/1/logs`
   - Verifique se a tabela exibe timestamps reais

3. **Verifique a formatação:**
   - Datas em formato brasileiro
   - Valores com 2 casas decimais
   - Colunas dinâmicas baseadas nas métricas

## 🔧 **Compatibilidade**

- ✅ **Com timestamp**: Usa timestamp real para agrupamento
- ✅ **Sem timestamp**: Usa ID como fallback (compatibilidade com dados antigos)
- ✅ **Múltiplas métricas**: Suporta qualquer quantidade de métricas
- ✅ **Formatação**: Valores e datas formatados corretamente

