-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `usuario_email_key`(`email`),
    UNIQUE INDEX `usuario_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfil` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_perfil` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_perfil` INTEGER NOT NULL,

    INDEX `usuario_perfil_id_perfil_fkey`(`id_perfil`),
    INDEX `usuario_perfil_id_usuario_fkey`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `id_usuario` INTEGER NULL,

    INDEX `equipamento_id_usuario_fkey`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metrica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `unidade` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipamento_metrica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_equipamento` INTEGER NOT NULL,
    `id_metrica` INTEGER NOT NULL,
    `valor_minimo` DOUBLE NOT NULL,
    `valor_maximo` DOUBLE NOT NULL,

    INDEX `equipamento_metrica_id_equipamento_fkey`(`id_equipamento`),
    INDEX `equipamento_metrica_id_metrica_fkey`(`id_metrica`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipamento_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_equipamento_metrica` INTEGER NOT NULL,
    `valor` DOUBLE NOT NULL,

    INDEX `equipamento_log_id_equipamento_metrica_fkey`(`id_equipamento_metrica`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario_perfil` ADD CONSTRAINT `usuario_perfil_id_perfil_fkey` FOREIGN KEY (`id_perfil`) REFERENCES `perfil`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_perfil` ADD CONSTRAINT `usuario_perfil_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamento` ADD CONSTRAINT `equipamento_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamento_metrica` ADD CONSTRAINT `equipamento_metrica_id_equipamento_fkey` FOREIGN KEY (`id_equipamento`) REFERENCES `equipamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamento_metrica` ADD CONSTRAINT `equipamento_metrica_id_metrica_fkey` FOREIGN KEY (`id_metrica`) REFERENCES `metrica`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamento_log` ADD CONSTRAINT `equipamento_log_id_equipamento_metrica_fkey` FOREIGN KEY (`id_equipamento_metrica`) REFERENCES `equipamento_metrica`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
