-- Migration: Adicionar campos de alarme (alarme_minimo e alarme_maximo) na tabela equipamento_metricas
-- Data: 2024
-- Descrição: Adiciona campos opcionais para configuração de limites de alarme personalizados por métrica

-- Adicionar coluna alarme_minimo (opcional, permite NULL)
ALTER TABLE `equipamento_metricas` 
ADD COLUMN `alarme_minimo` FLOAT NULL 
AFTER `valor_maximo`;

-- Adicionar coluna alarme_maximo (opcional, permite NULL)
ALTER TABLE `equipamento_metricas` 
ADD COLUMN `alarme_maximo` FLOAT NULL 
AFTER `alarme_minimo`;

-- Verificar se as colunas foram criadas corretamente
-- Descomente a linha abaixo para verificar:
-- DESCRIBE `equipamento_metricas`;

-- Nota: Os campos são opcionais (NULL), então não é necessário atualizar registros existentes
-- Os valores NULL indicam que não há alarme configurado para aquela métrica

