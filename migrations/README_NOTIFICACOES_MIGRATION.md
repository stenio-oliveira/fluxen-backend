# Migração: Criar Tabela de Notificações

Este arquivo contém a migração SQL para criar a tabela `notificacao` no banco de dados.

## Arquivo de Migração
- `add_notificacoes_table_manual.sql`

## Como Executar

### Opção 1: Via MySQL Command Line
```bash
mysql -u seu_usuario -p nome_do_banco < migrations/add_notificacoes_table_manual.sql
```

### Opção 2: Via MySQL Workbench ou phpMyAdmin
1. Abra o arquivo `add_notificacoes_table_manual.sql`
2. Copie todo o conteúdo
3. Cole no editor SQL do seu cliente MySQL
4. Execute o script

### Opção 3: Via linha de comando do MySQL
```sql
-- Conecte-se ao banco de dados
USE nome_do_seu_banco;

-- Execute os comandos do arquivo SQL
CREATE TABLE IF NOT EXISTS `notificacao` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `descricao` TEXT NOT NULL,
  `visualizado` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `notificacao_id_usuario_idx` (`id_usuario`),
  INDEX `notificacao_visualizado_idx` (`visualizado`),
  INDEX `notificacao_created_at_idx` (`created_at`),
  CONSTRAINT `notificacao_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Verificação

Após executar a migração, verifique se a tabela foi criada:

```sql
DESCRIBE `notificacao`;
```

Você deve ver as seguintes colunas:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `id_usuario` (INT, NOT NULL, FOREIGN KEY)
- `descricao` (TEXT, NOT NULL)
- `visualizado` (BOOLEAN, DEFAULT FALSE)
- `created_at` (DATETIME, NULL)

## Verificar Índices

```sql
SHOW INDEX FROM `notificacao`;
```

Você deve ver os seguintes índices:
- PRIMARY (id)
- notificacao_id_usuario_idx (id_usuario)
- notificacao_visualizado_idx (visualizado)
- notificacao_created_at_idx (created_at)

## Verificar Foreign Key

```sql
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM
  INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
  TABLE_NAME = 'notificacao'
  AND TABLE_SCHEMA = 'nome_do_seu_banco';
```

## Rollback (se necessário)

Se precisar reverter a migração:

```sql
-- Remover foreign key primeiro
ALTER TABLE `notificacao` DROP FOREIGN KEY `notificacao_id_usuario_fkey`;

-- Remover índices
ALTER TABLE `notificacao` DROP INDEX `notificacao_id_usuario_idx`;
ALTER TABLE `notificacao` DROP INDEX `notificacao_visualizado_idx`;
ALTER TABLE `notificacao` DROP INDEX `notificacao_created_at_idx`;

-- Remover tabela
DROP TABLE IF EXISTS `notificacao`;
```

## Notas

- A tabela usa `ON DELETE CASCADE` na foreign key, então quando um usuário for deletado, suas notificações também serão removidas
- O campo `visualizado` tem valor padrão `FALSE`
- O campo `created_at` é preenchido automaticamente com a data/hora atual quando uma notificação é criada
- Após executar a migração, execute `npx prisma generate` no backend para atualizar o cliente Prisma

## Estrutura da Tabela

```
notificacao
├── id (INT, PK, AUTO_INCREMENT)
├── id_usuario (INT, FK -> usuario.id, ON DELETE CASCADE)
├── descricao (TEXT, NOT NULL)
├── visualizado (BOOLEAN, DEFAULT FALSE)
└── created_at (DATETIME, DEFAULT CURRENT_TIMESTAMP)
```

## Índices Criados

1. **PRIMARY KEY**: `id` - Para busca rápida por ID
2. **INDEX**: `id_usuario` - Para buscar notificações de um usuário específico
3. **INDEX**: `visualizado` - Para filtrar notificações visualizadas/não visualizadas
4. **INDEX**: `created_at` - Para ordenar notificações por data


