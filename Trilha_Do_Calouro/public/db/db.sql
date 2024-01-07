-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`Calouro`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Calouro` (
  `matricula` INT,
  `nome` VARCHAR(45),
  `email` VARCHAR(45) UNIQUE,
  `senha` VARCHAR (10),
  `curso` VARCHAR(45),
  `turno` VARCHAR(45),
  PRIMARY KEY (`matricula`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Eventos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Eventos` (
  `idEventos` INT NOT NULL,
  `localEvento` VARCHAR(45),
  `dataEvento` VARCHAR(45),
  `descricaoEvento` VARCHAR(45),
  PRIMARY KEY (`idEventos`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Inscricao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Inscricao` (
  `Aluno_matricula` INT,
  `Eventos_idEventos` INT,
  `id_inscricao` INT,
  PRIMARY KEY (`Aluno_matricula`, `Eventos_idEventos`, `id_inscricao`),
    CONSTRAINT `fk_Aluno_has_Eventos_Aluno`
    FOREIGN KEY (`Aluno_matricula`)
    REFERENCES `mydb`.`Calouro` (`matricula`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Aluno_has_Eventos_Eventos1`
    FOREIGN KEY (`Eventos_idEventos`)
    REFERENCES `mydb`.`Eventos` (`idEventos`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`ForumPosts`
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `mydb`.`ForumPosts` (
  `postId` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT,
  `userName` VARCHAR(45),
  `question` TEXT,
  `answer` TEXT,
  FOREIGN KEY (`userId`) REFERENCES `mydb`.`Calouro` (`matricula`) ON DELETE SET NULL
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`ForumReplies`
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `mydb`.`ForumReplies` (
  `replyId` INT AUTO_INCREMENT PRIMARY KEY,
  `postId` INT,
  `userId` INT,
  `answer` TEXT,
  `questionUserId` INT,
  FOREIGN KEY (`postId`) REFERENCES `mydb`.`ForumPosts` (`postId`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `mydb`.`Calouro` (`matricula`) ON DELETE SET NULL
) ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;