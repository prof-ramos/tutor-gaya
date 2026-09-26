ALTER TABLE `discursive_attempts` ADD `idempotency_key` text;
CREATE UNIQUE INDEX `discursive_attempts_idempotency_key_unique` ON `discursive_attempts` (`idempotency_key`);
