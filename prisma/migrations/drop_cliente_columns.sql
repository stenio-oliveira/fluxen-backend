-- Migration: Remover colunas id_administrador e id_responsavel da tabela cliente
-- Data: 2024
-- Descrição: Remove as colunas id_administrador e id_responsavel da tabela cliente
--            após a migração dos dados para a tabela usuario_perfil_cliente

-- ============================================
-- PASSO 1: Remover foreign keys relacionadas
-- ============================================
-- Remover foreign key do administrador
ALTER TABLE `cliente` DROP FOREIGN KEY IF EXISTS `administrador`;

-- Remover foreign key do responsável
ALTER TABLE `cliente` DROP FOREIGN KEY IF EXISTS `repsponsavel`;

-- ============================================
-- PASSO 2: Remover índices relacionados
-- ============================================
ALTER TABLE `cliente` DROP INDEX IF EXISTS `administrador_idx`;
ALTER TABLE `cliente` DROP INDEX IF EXISTS `repsponsavel_idx`;

-- ============================================
-- PASSO 3: Remover colunas da tabela cliente
-- ============================================
ALTER TABLE `cliente` DROP COLUMN IF EXISTS `id_administrador`;
ALTER TABLE `cliente` DROP COLUMN IF EXISTS `id_responsavel`;

-- ============================================
-- PASSO 4: Verificação
-- ============================================
-- Verificar se as colunas foram removidas
SELECT 
    'Columns dropped successfully' as status,
    COLUMN_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'cliente'
  AND COLUMN_NAME IN ('id_administrador', 'id_responsavel');

-- Se a query acima retornar 0 linhas, as colunas foram removidas com sucesso





