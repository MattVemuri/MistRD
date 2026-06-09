// All code hand authored except where labeled otherwise

// set up express and port
const express = require('express');
const app = express();
const path = require('path');
const PORT = 5572;
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(__dirname));

// set up database connector
const db = require('./db-connector');

// set up handlebars
const handlebars = require('express-handlebars');

// link handlebars to partials
app.engine('.hbs', handlebars.engine({
    extname: '.hbs',
    partialsDir: './views/partials'
}));
// set handlebars view engine
app.set('view engine', '.hbs');
// link handlebars to views
app.set('views', './views');

// HOME PAGE
app.get('/', async (req, res) => {
    // res.sendFile(path.join(__dirname, './Main/homepage.html'));
    try{
        // grab counts for displaying on homepage
        var [rows] = await db.query('SELECT COUNT(*) AS count FROM Games');
        const gCount = rows[0].count
        var [rows] = await db.query('SELECT COUNT(*) AS count FROM Publishers');
        const pCount = rows[0].count
        var [rows] = await db.query('SELECT COUNT(*) AS count FROM Users');
        const uCount = rows[0].count
        var [rows] = await db.query('SELECT COUNT(*) AS count FROM Library_Games');
        const lgCount = rows[0].count
        var [rows] = await db.query('SELECT COUNT(*) AS count FROM Library');
        const lCount = rows[0].count
        // render homepage with passed counts
        res.render('homepage',{
            gameCount: gCount,
            publisherCount: pCount,
            userCount: uCount,
            lgCount: lgCount,
            lCount: lCount
        })
    }catch(error){
        // on error, log and throw 500
        console.error(error)
        console.log('an error occured when loading the homepage')
        res.status(500).send('An error occured loading the homepage')
    }
});
// reset DB
app.post('/reset', async (req, res)=>{
    // reset database call
    try {
        await db.query('CALL load_db();');
        console.log('reset db');

        // req.get('Referer) sourced from GeeksForGeeks.org
        // https://www.geeksforgeeks.org/web-tech/express-js-req-get-function/
        res.redirect(req.get('Referer'));
    } catch (error) {
        // on error, log and throw 500
        console.error(error);
        res.status(500).send('An error occurred resetting the database');
    }
})

// GAMES PAGE
app.get('/games', async (req, res) => {
    try {
        // grab games from db
        const [gameInfo] = await db.query(`
            SELECT g.name as name,
                gameID,
                p.name as publisherName,
                copiesSold,
                genre,
                developer,
                releaseDate,
                price,
                estimatedPlaytime
            FROM Games g
            INNER JOIN Publishers p ON p.publisherid = g.publisherID
        `);
        // grab publishers from db
        let [publishers] = await db.query(`
            SELECT name from Publishers
            `)
        let formatted = []
        // if there are entries for games
        if (gameInfo.length) {
            // format for site
            formatted = gameInfo.map(games => {
                const date = new Date(games.releaseDate)
                var formattedPlaytime = games.estimatedPlaytime
                if(formattedPlaytime==null){
                    formattedPlaytime='Unknown'
                }
                
                return{
                    ...games,
                    releaseDate: `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`,
                    estimatedPlaytime: formattedPlaytime
                }
            })    
        }
        // if no publishers, substitute with empty list
        if(!publishers.length){
            publishers=[]
        }

        // render out
        res.render('games',
            {
                layout: 'notMain',
                publisherOptions: publishers,
                items: formatted,
                title: 'Games'
            }
        );
    } catch (error) {
        // on error, throw 500 and log
        console.error(error);
        res.status(500).send('Failed to load games');
    }
});
// delete a game
app.post('/games/delete/:id', async (req, res) => {
    try {
        // grab id to delete
        const gameID = req.params.id
        // delete from db
        await db.query(`DELETE FROM Games WHERE gameID = ?;`,[gameID]);
        // notify on server end
        console.log(`Removed game with ID: ${gameID}`);
        // send back
        res.redirect(req.get('Referer'));
    } catch (error) {
        // on error, log and throw 500
        console.error(error);
        res.status(500).send('An error occurred');
    }
});
// modify a game
app.post('/games/modify', async (req,res) => {
    // log new data to server
    console.log('body: ',req.body)
    try{
        // sanitize and format inputs
        let formattedPlaytime = req.body.playtime
        if(formattedPlaytime.toLowerCase() == 'unknown' || formattedPlaytime==''){
            formattedPlaytime = null
        }
        // grab publisherID that matches publisher name
        let [rows] = await db.query(`SELECT publisherID FROM Publishers WHERE name=?`,req.body.publisher)
        let publisherID = rows[0].publisherID
        
        // update game in db
        await db.query(`UPDATE Games
            SET name='${req.body.name}',publisherID = ${publisherID}, genre='${req.body.genre}', developer='${req.body.developer}', 
            releaseDate='${req.body.release}', price=${req.body.price}, estimatedPlaytime=${formattedPlaytime}
            WHERE gameID = ${req.body.id}`
        )
        // refresh page
        res.sendStatus(200)
    }catch(error){
        // log and throw 500
        console.log(`An error occured modifying a game with id: ${req.body.id}`)
        console.error(error)
        res.send(500)
    }
})
// add a game
app.post('/games/add', async (req,res)=>{
    // log input to server
    console.log('body: ',req.body)
    try{
        // sanitize and format input
        let formattedPlaytime = req.body.playtime
        if(formattedPlaytime =='Unknown' || formattedPlaytime == ''){
            formattedPlaytime = null
        }
        // grab publisherID that matches name
        let [rows] = await db.query(`SELECT publisherID FROM Publishers WHERE name=?`,req.body.publisher)
        let publisherID = rows[0].publisherID
        // add new game to db
        await db.query(`INSERT INTO Games
            (publisherID, name, genre, developer,releaseDate,price, estimatedPlaytime)
            VALUES (${publisherID},'${req.body.name}','${req.body.genre}','${req.body.developer}','${req.body.release}',${req.body.price},${formattedPlaytime})`)
        // refresh
        res.sendStatus(200)
    }catch(error){
        // log and throw 500
        console.log('An error occured when adding a game')
        console.error(error)
        res.send(500)
    }
    
})

// PUBLISHERS PAGE
app.get('/publishers', async (req, res) => {
    try {
        // grab games from db
        let [publishers] = await db.query(`
            SELECT * FROM Publishers
        `);
        // if empty, substitute with empty list
        if (!publishers.length) {
           publishers=[]
        }
        // render out
        res.render('publishers',
            {
                layout: 'notMain',
                description: 'This page lets users interact with the Publishers table',
                items: publishers,
                title: 'Publishers',
                showAll: true
            }
        );
    } catch (error) {
        // on error, log and send 500
        console.error(error);
        res.status(500).send('Failed to load publishers');
    }
});
// delete a publisher
app.post('/publishers/delete/:id', async (req, res) => {
    try {
        // grab id
        const publisherID = req.params.id
        // delete publisher with id from db
        await db.query(`DELETE FROM Publishers WHERE publisherID = ?;`,[publisherID]);
        // log to server
        console.log(`Removed publisher with ID: ${publisherID}`);
        // send back to publisher's page
        res.redirect('/publishers');
    } catch (error) {
        // on error, log and throw 500
        console.error(error);
        res.status(500).send('An error occurred');
    }
});
// view a single publisher's page and published games
app.get('/publishers/:id', async (req, res)=>{
    // grab id
    const publisherID = req.params.id
    try{
        // grab publisher name
        const [publisher] = await db.query(`SELECT name FROM Publishers WHERE publisherID=?`, publisherID)
        // grab librarygames
        let [libraryGames] = await db.query(`
            SELECT g.name as name,
                p.name as publisherName,
                gameID,
                p.publisherID,
                copiesSold,
                genre,
                developer,
                price, 
                releaseDate,
                estimatedPlaytime         
            FROM Publishers p
            JOIN Games g on p.publisherID = g.publisherID
            WHERE p.publisherID = ?
        `, [publisherID]);
        // if no games, substitute with empty list
        if (!libraryGames.length) {
           libraryGames=[null]
        }else{
            // Map function sourced from MDN docs
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map 
            // if there are games, format for display
            var formatted = libraryGames.map(games => {
                // convert date to Date object
                const date = new Date(games.releaseDate)
                // grab playtime
                let formattedPlaytime = games.estimatedPlaytime
                // display as unknwon if no values passed
                if(formattedPlaytime==null){
                    formattedPlaytime='Unknown'
                }
                // return formatted versions
                return{
                    // return games as a list
                    ...games,
                    // format releaseDate to be MM-DD-YYYY
                    releaseDate: `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`,
                    // return playtime as 'Unknown' or numeric value
                    estimatedPlaytime: formattedPlaytime
                }
            })
        }
        // render out
        res.render('publishers',
            {
                layout: 'notMain',
                title: publisher[0].name,
                description: 'This page lets users interact with the Publishers table for a single publisher',
                items: formatted,
                showAll: false,
                publisherOptions:publisher
            }
        );
    }catch(error){
        // on error, log and send 500
        console.error(error)
        console.log(`Failed to load publisher with id: ${publisherID}`)
        res.send(500)
    }
})
// modify a publisher
app.post('/publishers/modify', async(req,res)=>{
    // log new data to server
    console.log('body: ', req.body)
    try{
        // update publisher in db
        await db.query(`UPDATE Publishers
            SET name = '${req.body.name}',webPage='${req.body.webpage}', email='${req.body.email}'
            WHERE publisherID=?`,req.body.id)
        // refresh page
        res.sendStatus(200)
    }catch(error){
        // on error, log and send 500
        console.log('An error occured modifying a publisher')
        console.error(error)
        res.send(500)
    }
    
})
// add a publisher
app.post('/publishers/add', async (req,res)=>{
    // log new data to server
    console.log('body: ', req.body)
    try{
        // insert new publisher into db
        await db.query(`INSERT INTO Publishers
            (name, webPage, email)
            VALUES ('${req.body.name}', '${req.body.webpage}','${req.body.email}')`)
        // refresh page
        res.sendStatus(200)
    }catch(error){
        // on error, log and send 500
        console.log('An error occured when adding a publisher')
        console.error(error)
        res.sendStatus(500)
    }
})

// USERS PAGE
app.get('/users', async (req, res) => {
    try {
        // grab users from db
        let [users] = await db.query(`
            SELECT * FROM Users
        `);
        // if no users, substitute with empty list
        if (!users.length) {
            users=[]
        }
        // render out
        res.render('users',
            {
                layout: 'notMain',
                items: users,
                title: 'Users'
            }
        );
    } catch (error) {
        // on error, log and send 500
        console.error(error);
        res.status(500).send('Failed to load publishers');
    }
});
// delete user
app.post('/users/delete/:id', async (req, res) => {
    // get id
    const userID = req.params.id
    try {
        // delete from db
        await db.query(`DELETE FROM Users WHERE userID = ?;`,[userID]);
        // log to server
        console.log(`Removed user with ID: ${userID}`);
        // refresh page
        res.redirect(req.get('Referer'));
    } catch (error) {
        // on error, log and send 500
        console.error(error);
        res.status(500).send(`An error occurred deleting user with id: ${userID}`);
    }
});
// modify user
app.post('/users/modify', async (req,res)=>{
    // log new data to server
    console.log('body: ',req.body)
    try{
        // update user in db
        await db.query(`UPDATE Users
            SET username='${req.body.username}'
            WHERE userID = ${req.body.id}`
        )
        // refresh page
        res.sendStatus(200)
    }catch(error){
        // on error, log and send 500
        console.log('An error occured modifying a user')
        console.error(error)
        res.send(500)
    }
})
// add user
app.post('/users/add', async (req,res)=>{
    // log new data to server
    console.log('body:', req.body)
    try{
        // insert new user into db
        await db.query(`INSERT INTO Users
                (username)
                VALUES ('${req.body.username}')`)
        // refresh page
        res.send(200)
    }catch(error){
        // on error, log and send 500
        console.log('An error occured adding a user')
        console.error(error)
        res.send(500)
    }
})

// LIBRARY GAMES PAGE
app.get('/libraryGames', async (req,res) => {
    try {
        // grab librarygames from db
        let [libraryGames] = await db.query(`
            SELECT g.name as gameName,
                    u.username as username,
                    u.userID as userID,
                    playtime,
                    completion,
                    lg.lgID
            FROM Library_Games lg
            JOIN Games g ON lg.gameID = g.gameID
            JOIN Library l ON lg.libraryID = l.libraryID
            JOIN Users u ON l.userID = u.userID
            ORDER BY lg.lgID
        `);
        // grab users for dropdown menu
        let [users] = await db.query(`SELECT username FROM Users`)
        // grab games for dropdown menu
        let [games] = await db.query(`SELECT name FROM Games`)
        
        // if no library games, substitute with empty list
        if (!libraryGames.length) {
            libraryGames = []
        }
        // if no users, substitute with empty list
        if (!users.length) {
            users = []
        }
        // if no games, substitute with empty list
        if (!games.length) {
            games = []
        }
        // render out
        res.render('libraryGames',
            {
                layout: 'notMain',
                name: 'Library Games',
                description: 'This page lets users interact with the Library_Games table',
                items: libraryGames,
                title: 'LibraryGames',
                showAll: true,
                userOptions: users,
                gameOptions: games
            }
        );
    } catch (error) {
        // on error, log and send 500
        console.error(error);
        res.status(500).send(`Failed to load library games`);
    }
})
// add new library games
app.post('/libraryGames/add', async (req, res)=>{
    // log new data to server
    console.log('body: ',req.body)
    try{
        // get gameID that matches passed game name
        const [game] = await db.query(`SELECT gameID FROM Games WHERE name =?`,req.body.game)
        // get userID that matches passed user name
        const [user] = await db.query(`SELECT userID FROM Users WHERE username =?`,req.body.username)
        // get user's library
        const [library] = await db.query(`SELECT libraryID FROM Library WHERE  userID=?`,user[0].userID)
        // insert new library game into db
        await db.query(`INSERT INTO Library_Games
        (gameID, libraryID, playtime, completion)
        VALUES (${game[0].gameID}, ${library[0].libraryID},
                 ${req.body.playtime}, ${req.body.completion})`)
        // refresh page
        res.send(200)
    }catch(error){
        // on error, log and send 500
        console.log('An error occured when adding a library game')
        console.error(error)
        res.send(500)
    }
})
// modify library game
app.post('/libraryGames/modify', async(req,res)=>{
    // log new data to server
    console.log('Body: ', req.body)
    try{
        // update library game in db
        await db.query(`UPDATE Library_Games
            SET playtime=${req.body.playtime}, completion=${req.body.completion}
            WHERE lgID=?`,req.body.id)
        // refresh page
        res.sendStatus(200)
    }catch(error){
        // on error, log and send 500
        console.log('An error occured when modifying a library game')
        console.error(error)
        res.send(500)
    }
})
// get single game's library games
app.get('/libraryGames/:id', async (req, res) => {
    // grab game id
    const gameID = req.params.id
    try {
        // grab librarygames associated with that game
        let [libraryGames] = await db.query(`
            SELECT g.name as name,
                    u.username as username,
                    u.userID as userID,
                    playtime,
                    completion,
                    lg.lgID as lgID
            FROM Library_Games lg
            JOIN Games g ON lg.gameID = g.gameID
            LEFT JOIN Library l ON lg.libraryID = l.libraryID
            LEFT JOIN Users u ON l.userID = u.userID
            WHERE g.gameID = ?
        `, [gameID]);
        // grab game name from id
        let [game] = await db.query(`SELECT name FROM Games WHERE gameID=?`,gameID)
        // if no library games, substitute with empty list
        if (!libraryGames.length) {
            libraryGames = []
        }
        // grab usernames for dropdown menu
        let [users] = await db.query(`SELECT username FROM Users`)
        // if empty, substitue with empty list
        if(!users.length){
            users=[]
        }

        // render out
        res.render('libraryGames',
            {
                layout: 'notMain',
                name: game[0].name,
                gameOptions: game,
                userOptions:users,
                description: 'This page lets users interact with the Library_Games table for a single game',
                items: libraryGames,
                title: 'LibraryGames',
                showAll: false
            }
        );
    } catch (error) {
        // on error, log and send 500
        console.error(error);
        res.status(500).send(`Failed to load library games for game with id: ${gameID}`);
    }
});
// delete library games
app.post('/libraryGames/delete/:id', async (req, res) => {
    // get library game id
    const lgID = req.params.id
    try {
        // delete library game with matching id fromdb
        await db.query(`DELETE FROM Library_Games WHERE lgID = ?;`,[lgID]);
        // log to server
        console.log(`Removed library_game with ID: ${lgID}`);
        // refresh sending page
        res.redirect(req.get('Referer'));
    } catch (error) {
        // on error, log and send 500
        console.error(error);
        res.status(500).send(`An error occurred deleting library game with id: ${lgID}`);
    }
});

// LIBRARY PAGE
app.get('/libraries', async (req,res)=>{
    try{
        // get libraries
        let [libraries] = await db.query(`
            SELECT libraryID,
                     u.username as username
            FROM Library
            JOIN Users u ON Library.userID = u.userID`)
        // if no libraries, substitute with empty list
        if (!libraries.length) {
            libraries=[]
        }
        // render out
        res.render('library',{
            layout: 'notMain',
            name: 'Libraries',
            description: 'This page lets you view the Library table',
            items: libraries,
            individual: false
        })
    }catch(error){
        // on error, log and send 500
        console.error(error)
        res.status(500).send('An error occurred');
    }
})
// view single user's library
app.get('/library/:id', async (req,res)=>{
    // grab userID
    const userID = req.params.id
    try{
        // grab games
        let [ownedGames] = await db.query(`
            SELECT l.libraryID,
                    g.name as gameName,
                    g.gameID as gameID,
                    lg.lgID as lgID,
                    lg.playtime as playtime,
                    lg.completion as completion
            FROM Library AS l
            JOIN Users u ON l.userID = u.userID
            JOIN Library_Games lg ON l.libraryID = lg.libraryID
            JOIN Games g ON g.gameID = lg.gameID
            WHERE u.userID = ?;
        `, [userID]);
        const [user] = await db.query(`SELECT username FROM Users WHERE userID=?`,[userID])
        // if no owned games, substitute with empty list
        if (!ownedGames.length) {
            ownedGames = []
        }
        // get games for dropdown menu
        let [games] = await db.query(`SELECT name FROM Games`)
        // if no games, substitute with empty list
        if (!games.length) {
            games = []
        }
        // render out
        res.render('library', {
            layout: 'notMain',
            name: user[0].username,
            description: 'This page lets you view the Library table for a single user',
            items: ownedGames,
            individual: true,
            userOptions: user,
            gameOptions: games
        });
    }catch(error){
        // on error, log and send 500
        console.error(error)
        res.status(500).send('An error occurred');
    }
})

// APP GO
app.listen(PORT, () => {
    // run app on specified port
    // log address of app
    console.log(`Express started on server_name:${PORT}/`);
});