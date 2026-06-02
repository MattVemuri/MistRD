----------------------------
-- Games

SELECT  g.name,
        g.copiesSold,
        p.name AS publisherName,
        g.genre,
        g.developer,
        g.releaseDate,
        g.price,
        g.estimatedPlaytime
FROM Games g
JOIN Publishers p ON p.publisherID = g.publisherID;

INSERT INTO Games (name, publisherID, copiesSold, genre, developer, releaseDate, price, estimatedPlaytime)
VALUES (@nameInput, @publisherIDInput, @copiesSoldInput, @genreInput, @developerInput, @releaseDateInput, @priceInput, @estimatedPlaytimeInput);

UPDATE Games
SET name = @nameInput,
    publisherID = @publisherIDInput,
    copiesSold = @copiesSoldInput,
    genre = @genreInput,
    developer = @developerInput,
    releaseDate = @releaseDateInput,
    price = @priceInput,
    estimatedPlaytime = @estimatedPlaytimeInput
WHERE gameID = @gameIDInput;

DELETE FROM Games
WHERE gameID = @gameIDInput;
----------------------------
-- Publishers

SELECT  p.publisherID,
        p.webPage,
        p.email
FROM Publishers p;

INSERT INTO Publishers (name, webPage, email)
VALUES (@nameInput, @webPageInput, @emailInput);

UPDATE Publishers
SET name = @nameInput,
    webPage = @webPageInput,
    email = @emailInput
WHERE publisherID = @publisherIDInput;

DELETE FROM Publishers
WHERE publisherID = @publisherIDInput;
----------------------------
-- Users

SELECT  u.username,
        u.ownedGames,
        u.totalPlaytime
FROM Users u;

INSERT INTO Users (username, ownedGames, totalPlaytime)
VALUES (@usernameInput, @ownedGamesInput, @totalPlaytimeInput);

UPDATE Users
SET username = @usernameInput,
    ownedGames = @ownedGamesInput,
    totalPlaytime = @totalPlaytimeInput
WHERE userID = @userIDInput;

DELETE FROM Users
WHERE userID = @userIDInput;
----------------------------
-- Library_Games

SELECT  lg.lgID,
        u.username,
        g.name AS gameName,
        lg.playtime,
        lg.completion
FROM Library_Games lg
JOIN Library l ON lg.libraryID = l.libraryID
JOIN Users u ON l.userID = u.userID
JOIN Games g ON lg.gameID = g.gameID;

INSERT INTO Library_Games (libraryID, gameID, playtime, completion)
VALUES (@libraryIDInput, @gameIDInput, @playtimeInput, @completionInput);

UPDATE Library_Games
SET playtime = @playtimeInput,
    completion = @completionInput
WHERE lgID = @lgIDInput;

DELETE FROM Library_Games
WHERE lgID = @lgIDInput;