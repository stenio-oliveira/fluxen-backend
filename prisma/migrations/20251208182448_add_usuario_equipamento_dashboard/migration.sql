-- CreateTable
CREATE TABLE `usuario_equipamento_dashboard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_equipamento` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `usuario_equipamento_dashboard_unique`(`id_usuario`, `id_equipamento`),
    INDEX `usuario_equipamento_dashboard_id_usuario_idx`(`id_usuario`),
    INDEX `usuario_equipamento_dashboard_id_equipamento_idx`(`id_equipamento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario_equipamento_dashboard` ADD CONSTRAINT `usuario_equipamento_dashboard_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_equipamento_dashboard` ADD CONSTRAINT `usuario_equipamento_dashboard_id_equipamento_fkey` FOREIGN KEY (`id_equipamento`) REFERENCES `equipamento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

