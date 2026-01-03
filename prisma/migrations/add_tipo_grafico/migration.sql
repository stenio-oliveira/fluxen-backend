-- CreateTable: tipo_grafico
CREATE TABLE `tipo_grafico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`),
    UNIQUE INDEX `tipo_grafico_nome_unique`(`nome`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert initial data: rosca, barras, linha
INSERT INTO `tipo_grafico` (`nome`) VALUES ('rosca');
INSERT INTO `tipo_grafico` (`nome`) VALUES ('barras');
INSERT INTO `tipo_grafico` (`nome`) VALUES ('linha');

-- AddColumn: id_tipo_grafico to usuario_equipamento_dashboard
ALTER TABLE `usuario_equipamento_dashboard` ADD COLUMN `id_tipo_grafico` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `usuario_equipamento_dashboard` ADD CONSTRAINT `usuario_equipamento_dashboard_id_tipo_grafico_fkey` FOREIGN KEY (`id_tipo_grafico`) REFERENCES `tipo_grafico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddIndex
CREATE INDEX `usuario_equipamento_dashboard_id_tipo_grafico_idx` ON `usuario_equipamento_dashboard`(`id_tipo_grafico`);

