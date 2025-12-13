# Migração: Adicionar Campos de Alarme

Este arquivo contém a migração SQL para adicionar os campos `alarme_minimo` e `alarme_maximo` na tabela `equipamento_metricas`.

## Arquivo de Migração
- `add_alarme_fields_manual.sql`

## Como Executar

### Opção 1: Via MySQL Command Line
```bash
mysql -u seu_usuario -p nome_do_banco < migrations/add_alarme_fields_manual.sql
```

### Opção 2: Via MySQL Workbench ou phpMyAdmin
1. Abra o arquivo `add_alarme_fields_manual.sql`
2. Copie todo o conteúdo
3. Cole no editor SQL do seu cliente MySQL
4. Execute o script

### Opção 3: Via linha de comando do MySQL
```sql
-- Conecte-se ao banco de dados
USE nome_do_seu_banco;

-- Execute os comandos do arquivo SQL
ALTER TABLE `equipamento_metricas` 
ADD COLUMN `alarme_minimo` FLOAT NULL 
AFTER `valor_maximo`;

ALTER TABLE `equipamento_metricas` 
ADD COLUMN `alarme_maximo` FLOAT NULL 
AFTER `alarme_minimo`;
```

## Verificação

Após executar a migração, verifique se as colunas foram criadas:

```sql
DESCRIBE `equipamento_metricas`;
```

Você deve ver as colunas `alarme_minimo` e `alarme_maximo` na lista.

## Rollback (se necessário)

Se precisar reverter a migração:

```sql
ALTER TABLE `equipamento_metricas` DROP COLUMN `alarme_maximo`;
ALTER TABLE `equipamento_metricas` DROP COLUMN `alarme_minimo`;
```

## Notas

- Os campos são opcionais (NULL), então registros existentes não serão afetados
- Valores NULL indicam que não há alarme configurado para aquela métrica
- Após executar a migração, execute `npx prisma generate` para atualizar o cliente Prisma


