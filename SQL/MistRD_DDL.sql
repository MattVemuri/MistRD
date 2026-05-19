DROP PROCEDURE IF EXISTS load_db;
DELIMITER //
CREATE PROCEDURE load_db()
BEGIN
    SET FOREIGN_KEY_CHECKS = 0;
    SET AUTOCOMMIT =0;

    DROP TABLE IF EXISTS Library_Games;
    DROP TABLE IF EXISTS Library;
    DROP TABLE IF EXISTS Games;
    DROP TABLE IF EXISTS Publishers;
    DROP TABLE IF EXISTS Users;


    -- Creating the Tables

    CREATE TABLE Publishers (
        publisherID int AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        webPage VARCHAR(255) NULL,
        email VARCHAR(255) NOT NULL
    );

    CREATE TABLE Games (
        gameID int AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        publisherID int NOT NULL,
        copiesSold int NOT NULL, -- Added copiesSold from Review
        genre VARCHAR(255) NOT NULL,
        developer VARCHAR(255) NOT NULL,
        releaseDate DATE NOT NULL,
        price DECIMAL(4,2) NOT NULL,
        estimatedPlaytime int,
        FOREIGN KEY (publisherID) REFERENCES Publishers(publisherID) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE Users (
        userID int AUTO_INCREMENT NOT NULL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        ownedGames int NOT NULL DEFAULT 0,
        totalPlaytime int NOT NULL DEFAULT 0
    );

    CREATE TABLE Library (
        libraryID int AUTO_INCREMENT PRIMARY KEY,
        userID int UNIQUE NOT NULL,
        FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE Library_Games (
        lgID int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        gameID int NOT NULL,                            
        libraryID int NOT NULL,                         
        playtime int NOT NULL,
        completion int NOT NULL, -- Changed completion to int              
        FOREIGN KEY (gameID) REFERENCES Games(gameID) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (libraryID) REFERENCES Library(libraryID) ON DELETE CASCADE ON UPDATE CASCADE
    );




    -- Inserting the Example Data Values

    INSERT INTO Publishers (publisherID, name, webPage, email) VALUES
    (1, "Valve", "https://www.valvesoftware.com/en/", "valve@software.com"),
    (2, "KONAMI", "https://www.konami.com/en/", "konami@support.com"),
    (3, "Capcom", "https://www.capcomusa.com/", "info-capcom@gmail.com"),
    (4, "Team Cherry", "https://www.teamcherry.com.au/", "team@cherry.com");

    INSERT INTO Games (gameID, name, PublisherID, copiesSold, genre, developer, releaseDate, price, estimatedPlaytime) VALUES
    (1, "Counter-Strike 2",                 (SELECT publisherID from Publishers WHERE name = "Valve"), 0, "FPS",               "Valve", '2012-04-30', 0.00, NULL),
    (2, "METAL GEAR SOLID Δ: SNAKE EATER",  (SELECT publisherID from Publishers WHERE name = "KONAMI"), 0, "Stealth",           "KONAMI", '2025-08-27', 69.99, 12),
    (3, "Half-Life 2",                      (SELECT publisherID from Publishers WHERE name = "Valve"), 0, "FPS",               "Valve", '2007-10-09', 9.99, 12),
    (4, "PRAGMATA",                         (SELECT publisherID from Publishers WHERE name = "Capcom"), 0, "Action-Adventure",  "CAPCOM Co., Ltd.", '2026-04-16', 59.99, 10),
    (5, "Hollow Knight: Silksong",          (SELECT publisherID from Publishers WHERE name = "Team Cherry"), 0, "Metroidvania",      "Team Cherry", '2025-09-03', 19.99, 41);

    -- Moved Users before Library from Review
    INSERT INTO Users (userID, username, ownedGames, totalPlaytime) VALUES
    (1,'Matthew',0,0),
    (2, "Sophia",0,0),
    (3, "xXX_Gamer_XXx",0,0);

    INSERT INTO Library (libraryID, userID) VALUES
    (1, (SELECT userID from Users WHERE username = "Matthew")),
    (2, (SELECT userID from Users WHERE username = "Sophia")),
    (3, (SELECT userID from Users WHERE username = "xXX_Gamer_XXx"));

    INSERT INTO Library_Games (gameID, libraryID, playtime, completion) VALUES
    ((SELECT gameID from Games WHERE name = "Counter-Strike 2"), 
    1, 80, 100),
    ((SELECT gameID from Games WHERE name = "Counter-Strike 2"), 
    3, 680, 100),
    ((SELECT gameID from Games WHERE name = "METAL GEAR SOLID Δ: SNAKE EATER"), 
    2, 18, 39),
    ((SELECT gameID from Games WHERE name = "METAL GEAR SOLID Δ: SNAKE EATER"), 
    3, 50, 100),
    ((SELECT gameID from Games WHERE name = "Half-Life 2"), 
    1, 8, 15),
    ((SELECT gameID from Games WHERE name = "Half-Life 2"), 
    2, 20, 27),
    ((SELECT gameID from Games WHERE name = "Half-Life 2"), 
    3, 24, 89),
    ((SELECT gameID from Games WHERE name = "PRAGMATA"), 
    2, 73, 73),
    ((SELECT gameID from Games WHERE name = "Hollow Knight: Silksong"), 
    3, 15, 67);

    -- Updating copiesSold with matching library and games id
    UPDATE Games
    SET copiesSold = (
        SELECT COUNT(*)
        FROM Library_Games
        WHERE Library_Games.gameID = Games.gameID
    );

    -- Playtime, GameID and LibraryID counting in Subquery
    SET FOREIGN_KEY_CHECKS = 1;
    COMMIT;

    UPDATE Users
    SET ownedGames = (SELECT COUNT(DISTINCT Library_Games.GameID)
    FROM Library
    INNER JOIN Library_Games
    ON Library.LibraryID = Library_Games.LibraryID
    WHERE Library.userID = Users.userID
    );

    UPDATE Users
    SET totalPlaytime = (SELECT COALESCE(SUM(Library_Games.playtime))
    FROM Library
    INNER JOIN Library_Games
    ON Library.LibraryID = Library_Games.LibraryID
    WHERE Library.userID = Users.userID
    );
END //



-- SELECT * from Users;
-- SELECT * from Games;
-- SELECT * from Publishers;

DELIMITER;