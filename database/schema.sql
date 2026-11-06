-- Banco de dados inicial do TetrisPHP.
-- Execute este arquivo no MySQL para criar o banco e a tabela de ranking.

CREATE DATABASE IF NOT EXISTS tetrisphp
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE tetrisphp;

CREATE TABLE IF NOT EXISTS ranking (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    player_name VARCHAR(3) NOT NULL,
    game_mode ENUM('time_attack', 'infinite') NOT NULL DEFAULT 'infinite',
    score INT UNSIGNED NOT NULL DEFAULT 0,
    duration_seconds INT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_ranking_mode_score (game_mode, score, created_at),
    CONSTRAINT chk_ranking_player_name_length
        CHECK (CHAR_LENGTH(player_name) BETWEEN 1 AND 3)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
