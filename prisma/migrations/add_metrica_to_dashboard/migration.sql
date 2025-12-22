-- Adicionar campo id_metrica na tabela usuario_equipamento_dashboard
ALTER TABLE `usuario_equipamento_dashboard` 
ADD COLUMN `id_metrica` INT NULL AFTER `id_equipamento`;

-- Adicionar foreign key para metrica
ALTER TABLE `usuario_equipamento_dashboard` 
ADD CONSTRAINT `usuario_equipamento_dashboard_id_metrica_fkey` 
FOREIGN KEY (`id_metrica`) REFERENCES `metrica`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Remover constraint UNIQUE antiga
ALTER TABLE `usuario_equipamento_dashboard` 
DROP INDEX `usuario_equipamento_dashboard_unique`;

-- Criar nova constraint UNIQUE incluindo id_metrica
ALTER TABLE `usuario_equipamento_dashboard` 
ADD UNIQUE INDEX `usuario_equipamento_dashboard_unique`(`id_usuario`, `id_equipamento`, `id_metrica`);

-- Adicionar índice para id_metrica
ALTER TABLE `usuario_equipamento_dashboard` 
ADD INDEX `usuario_equipamento_dashboard_id_metrica_idx`(`id_metrica`);

