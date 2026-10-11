-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema strem
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema strem
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `strem` DEFAULT CHARACTER SET utf8 ;
USE `strem` ;

-- -----------------------------------------------------
-- Table `strem`.`LANGUAGUE`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `strem`.`LANGUAGUE` (
  `languague_id` INT NOT NULL AUTO_INCREMENT,
  `languague_name` VARCHAR(50) NULL,
  PRIMARY KEY (`languague_id`),
  UNIQUE INDEX `languague_name_UNIQUE` (`languague_name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `strem`.`GAME`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `strem`.`GAME` (
  `game_id` INT NOT NULL AUTO_INCREMENT,
  `game_name` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`game_id`),
  UNIQUE INDEX `game_name_UNIQUE` (`game_name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `strem`.`STREAMER`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `strem`.`STREAMER` (
  `streamer_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `avg_viewers_per_stream` INT NULL,
  `total_followers` BIGINT NULL,
  `total_views` BIGINT NULL,
  `total_games_streamed` INT NULL,
  `active_days_per_week` DECIMAL(3,1) NULL,
  `language_id` INT NOT NULL,
  PRIMARY KEY (`streamer_id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  INDEX `fk_STREAMER_LANGUAGUE_idx` (`language_id` ASC) VISIBLE,
  CONSTRAINT `fk_STREAMER_LANGUAGUE`
    FOREIGN KEY (`language_id`)
    REFERENCES `strem`.`LANGUAGUE` (`languague_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `strem`.`STREAMER_GAME`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `strem`.`STREAMER_GAME` (
  `streamer_id` INT NOT NULL,
  `game_id` INT NOT NULL,
  `game_role` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`streamer_id`, `game_id`, `game_role`),
  INDEX `fk_STREAMER_GAME_STREAMER1_idx` (`streamer_id` ASC) VISIBLE,
  INDEX `fk_STREAMER_GAME_GAME1_idx` (`game_id` ASC) VISIBLE,
  CONSTRAINT `fk_STREAMER_GAME_STREAMER1`
    FOREIGN KEY (`streamer_id`)
    REFERENCES `strem`.`STREAMER` (`streamer_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_STREAMER_GAME_GAME1`
    FOREIGN KEY (`game_id`)
    REFERENCES `strem`.`GAME` (`game_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
