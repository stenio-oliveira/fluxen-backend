
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