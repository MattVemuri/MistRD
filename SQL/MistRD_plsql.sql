-- All code hand authored except for those labeled otherwise

-- demo delete function (obsolete)

DROP PROCEDURE IF EXISTS remove_csgo;
DELIMITER //
CREATE PROCEDURE remove_csgo()
BEGIN
    DELETE FROM Games WHERE Games.gameID = 1;
END //

-- NEW and OLD Keywords based on GeeksForGeeks.org
-- https://www.geeksforgeeks.org/dbms/sql-triggers/
-- 6/5/26
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


-- game CUD procedures
DROP PROCEDURE IF EXISTS add_game //
CREATE PROCEDURE add_game(
        IN new_publisherID INT,
        IN new_name varchar(255),
        IN new_genre varchar(255),
        IN new_developer varchar(255),
        IN new_releaseDate DATE,
        IN new_price DECIMAL(4,2),
        IN new_estimatedPlaytime INT)
BEGIN
    INSERT INTO Games
        (publisherID, name, genre, developer,releaseDate,price, estimatedPlaytime)
        VALUES (new_publisherID, new_name, new_genre, new_developer, new_releaseDate, new_price, new_estimatedPlaytime);
END //

DROP PROCEDURE IF EXISTS delete_game //
CREATE PROCEDURE delete_game(IN target_gameID INT)
BEGIN
    DELETE FROM Games where gameID=target_gameID;
END //

DROP PROCEDURE IF EXISTS update_game //
CREATE PROCEDURE update_game(
        IN curr_gameID INT, 
        IN new_publisherID INT,
        IN new_name varchar(255),
        IN new_genre varchar(255),
        IN new_developer varchar(255),
        IN new_releaseDate DATE,
        IN new_price DECIMAL(4,2),
        IN new_estimatedPlaytime INT)
BEGIN
     UPDATE Games
     SET name = new_name,
        publisherID = new_publisherID,
        genre = new_genre,
        developer = new_developer,
        releaseDate = new_releaseDate,
        price = new_price,
        estimatedPlaytime = new_estimatedPlaytime
     WHERE gameID = curr_gameID;   
END //

-- publishers CUD procedures
DROP PROCEDURE IF EXISTS add_publisher //
CREATE PROCEDURE add_publisher(
        IN new_name varchar(255),
        IN new_webpage varchar(255),
        IN new_email varchar(255)
    )
BEGIN
    INSERT INTO Publishers
    (name, webPage, email)
    VALUES (new_name,new_webpage,new_email);
END //

DROP PROCEDURE IF EXISTS delete_publisher //
CREATE PROCEDURE delete_publisher(IN target_publisherID INT)
BEGIN
    DELETE FROM Publishers where publisherID=target_publisherID;
END //

DROP PROCEDURE IF EXISTS update_publisher //
CREATE PROCEDURE update_publisher(
        IN curr_publisherID INT,
        IN new_name varchar(255),
        IN new_webpage varchar(255),
        IN new_email varchar(255)
    )
BEGIN
    UPDATE Publishers
    SET name = new_name,
        webPage = new_webpage,
        email  =new_email
    WHERE publisherID = curr_publisherID;   
END //

-- user CUD procedures
DROP PROCEDURE IF EXISTS add_user //
CREATE PROCEDURE add_user(
        IN new_name varchar(255)
    )
BEGIN
    INSERT INTO Users
    (username, ownedGames, totalPlaytime)
    VALUES (new_name,0,0);
END //

DROP PROCEDURE IF EXISTS delete_user //
CREATE PROCEDURE delete_user(IN target_userID INT)
BEGIN
    DELETE FROM Users where userID=target_userID;
END //

DROP PROCEDURE IF EXISTS update_user //
CREATE PROCEDURE update_user(
        IN curr_userID INT,
        IN new_name varchar(255)
    )
BEGIN
    UPDATE Users
    SET username = new_name
    WHERE userID=curr_userID;
END //

-- library_games CUD procedures
DROP PROCEDURE IF EXISTS add_library_game //
CREATE PROCEDURE add_library_game(
        IN new_gameID INT,
        IN new_userID INT,
        IN new_playtime INT,
        IN new_completion INT
    )
BEGIN
    INSERT INTO Library_Games
    (gameID, libraryID, playtime, completion)
    VALUES (new_gameID, new_userID, new_playtime, new_completion);
END //

DROP PROCEDURE IF EXISTS delete_library_game //
CREATE PROCEDURE delete_library_game(IN target_lgID INT)
BEGIN
    DELETE FROM Library_Games where lgID=target_lgID;
END //

DROP PROCEDURE IF EXISTS update_library_game //
CREATE PROCEDURE update_library_game(
        IN curr_lgID INT,
        IN new_playtime INT,
        IN new_completion INT
    )
BEGIN
    UPDATE Library_Games
    SET playtime=new_playtime, completion=new_completion
    WHERE lgID = curr_lgID;   
END //

DELIMITER ;