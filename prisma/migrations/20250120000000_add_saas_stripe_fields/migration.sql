-- AlterTable: usuario - Adicionar campos created_at, created_by e campos Stripe
ALTER TABLE `usuario` 
ADD COLUMN `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `created_by` INTEGER NULL,
ADD COLUMN `stripe_customer_id` VARCHAR(255) NULL,
ADD COLUMN `stripe_subscription_id` VARCHAR(255) NULL,
ADD COLUMN `subscription_status` VARCHAR(50) NULL,
ADD COLUMN `subscription_current_period_start` DATETIME(0) NULL,
ADD COLUMN `subscription_current_period_end` DATETIME(0) NULL,
ADD COLUMN `subscription_cancel_at_period_end` BOOLEAN NULL DEFAULT false,
ADD COLUMN `plan_name` VARCHAR(100) NULL,
ADD COLUMN `stripe_price_id` VARCHAR(255) NULL;

-- Criar índices únicos para campos Stripe
CREATE UNIQUE INDEX `usuario_stripe_customer_id_key` ON `usuario`(`stripe_customer_id`);
CREATE UNIQUE INDEX `usuario_stripe_subscription_id_key` ON `usuario`(`stripe_subscription_id`);

-- Criar índices para campos Stripe e created_by
CREATE INDEX `usuario_stripe_customer_id_idx` ON `usuario`(`stripe_customer_id`);
CREATE INDEX `usuario_stripe_subscription_id_idx` ON `usuario`(`stripe_subscription_id`);
CREATE INDEX `usuario_subscription_status_idx` ON `usuario`(`subscription_status`);
CREATE INDEX `usuario_created_by_idx` ON `usuario`(`created_by`);

-- Adicionar foreign key para created_by (self-reference)
ALTER TABLE `usuario` 
ADD CONSTRAINT `usuario_created_by_fkey` 
FOREIGN KEY (`created_by`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: cliente - Adicionar campos created_at e created_by
ALTER TABLE `cliente` 
ADD COLUMN `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `created_by` INTEGER NULL;

-- Criar índice para created_by em cliente
CREATE INDEX `cliente_created_by_idx` ON `cliente`(`created_by`);

-- Adicionar foreign key para created_by em cliente
ALTER TABLE `cliente` 
ADD CONSTRAINT `cliente_created_by_fkey` 
FOREIGN KEY (`created_by`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: equipamento - Adicionar campos created_at e created_by
ALTER TABLE `equipamento` 
ADD COLUMN `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `created_by` INTEGER NULL;

-- Criar índice para created_by em equipamento
CREATE INDEX `equipamento_created_by_idx` ON `equipamento`(`created_by`);

-- Adicionar foreign key para created_by em equipamento
ALTER TABLE `equipamento` 
ADD CONSTRAINT `equipamento_created_by_fkey` 
FOREIGN KEY (`created_by`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: metrica - Adicionar campos created_at e created_by
ALTER TABLE `metrica` 
ADD COLUMN `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `created_by` INTEGER NULL;

-- Criar índice para created_by em metrica
CREATE INDEX `metrica_created_by_idx` ON `metrica`(`created_by`);

-- Adicionar foreign key para created_by em metrica
ALTER TABLE `metrica` 
ADD CONSTRAINT `metrica_created_by_fkey` 
FOREIGN KEY (`created_by`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

