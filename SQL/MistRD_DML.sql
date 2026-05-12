----------------------------
-- Games

SELECT * FROM Games;

INSERT INTO Game (name, copiesSold, genre, developer, releaseDate, price, estimatedPlaytime)
VALUES (@nameInput, @copiesSoldInput, @genreInput, @developerInput, @releaseDateInput, @priceInput, @estimatedPlaytimeInput)

UPDATE Games
SET name = @nameInput,
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

SELECT * FROM Publishers;

INSERT INTO Publisher (name, webPage, email)
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

SELECT * FROM Users;

INSERT INTO User (username, ownedGames, totalPlaytime)
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

SELECT * FROM Library_Games;

INSERT INTO Library_Game (playtime, completion)
VALUES (@playtimeInput, @completionInput);

UPDATE Library_Games
SET playtime = @playtimeInput,
    completion = @completionInput
WHERE lgID = @lgIDInput;

DELETE FROM Library_Games
WHERE lgID = @lgIDInput;