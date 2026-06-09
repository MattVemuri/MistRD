-- All code hand authored except for those labeled otherwise

-- demo delete function (obsolete)

DROP PROCEDURE IF EXISTS remove_csgo;
DELIMITER //
CREATE PROCEDURE remove_csgo()
BEGIN
    DELETE FROM Games WHERE Games.gameID = 1;
END //

-- NEW and OLD Keywords sourced from GeeksForGeeks.org
-- https://www.geeksforgeeks.org/dbms/sql-triggers/
-- used to reference versions of libraryGames in triggers

-- These 3 functions update the counts for user playtime and owned games

DROP TRIGGER IF EXISTS trigger_after_library_game_delete //

CREATE TRIGGER trigger_after_library_game_delete
AFTER DELETE ON Library_Games
FOR EACH ROW
BEGIN
    UPDATE Games
    SET copiesSold = copiesSold - 1
    WHERE Games.gameID = OLD.gameID;

    UPDATE Users
    SET ownedGames = ownedGames - 1, totalPlaytime= totalPlaytime - OLD.playtime
    WHERE Users.userID = OLD.libraryID;
END //

DROP TRIGGER IF EXISTS trigger_after_library_game_insert //

CREATE TRIGGER trigger_after_library_game_insert
AFTER INSERT ON Library_Games
FOR EACH ROW
BEGIN
    UPDATE Games
    SET copiesSold = copiesSold + 1
    WHERE Games.gameID = NEW.gameID;

    UPDATE Users
    SET ownedGames = ownedGames + 1, totalPlaytime= totalPlaytime + NEW.playtime
    WHERE Users.userID = NEW.libraryID;
END //

DROP TRIGGER IF EXISTS trigger_after_library_game_update //

CREATE TRIGGER trigger_after_library_game_update
AFTER UPDATE ON Library_Games
FOR EACH ROW
BEGIN
    UPDATE Users
    SET totalPlaytime= totalPlaytime - OLD.playtime + NEW.playtime
    WHERE Users.userID = OLD.libraryID;
END //

-- auto instances a library linked with a user

DROP TRIGGER IF EXISTS trigger_after_user_created //

CREATE TRIGGER trigger_after_user_created
AFTER INSERT ON Users
FOR EACH ROW
BEGIN
    INSERT INTO Library (userID) VALUES (NEW.userID);
END //

DELIMITER ;