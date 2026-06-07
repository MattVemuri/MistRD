const express = require('express');
const app = express();
const path = require('path');
const PORT = 5572;

const db = require('./db-connector');
const handlebars = require('express-handlebars');
// const { format } = require('path');
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use(express.static(__dirname));

app.engine('.hbs', handlebars.engine({
    extname: '.hbs',
    partialsDir: './views/partials'
}));

app.set('view engine', '.hbs');
app.set('views', './views');

// HOME PAGE
app.get('/', async (req, res) => {
    // res.sendFile(path.join(__dirname, './Main/homepage.html'));
    try{
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
        res.render('homepage',{
            gameCount: gCount,
            publisherCount: pCount,
            userCount: uCount,
            lgCount: lgCount,
            lCount: lCount
        })
    }catch(error){
        console.error(error)
        console.log('an error occured when loading the homepage')
    }
    
});

app.post('/reset', async (req, res)=>{
    
    try {
        await db.query('CALL load_db();');
        console.log('reset db');
    
        // req.get('Referer) sourced from GeeksForGeeks.org
        // https://www.geeksforgeeks.org/web-tech/express-js-req-get-function/
        res.redirect(req.get('Referer'));
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
})

// GAMES PAGE
app.get('/games', async (req, res) => {
    try {
        // grab games
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
        const [publishers] = await db.query(`
            SELECT name from Publishers
            `)
        if (!gameInfo.length) {
            return res.redirect('/');
        }
        // format for site
        const formatted = gameInfo.map(games => {
            const date = new Date(games.releaseDate)
            var formattedPlaytime = games.estimatedPlaytime
            if(formattedPlaytime==null){
                formattedPlaytime='Unknown'
            }
            // console.log(formattedPlaytime)
            return{
                ...games,
                releaseDate: `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`,
                estimatedPlaytime: formattedPlaytime
            }
        })
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
        console.error(error);
        res.status(500).send('Failed to load games');
    }
});

app.post('/games/delete/:id', async (req, res) => {
    try {
        const gameID = req.params.id
        await db.query(`DELETE FROM Games WHERE gameID = ?;`,[gameID]);

        console.log(`Removed game with ID: ${gameID}`);

        res.redirect('/games');

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

app.post('/games/modify', async (req,res) => {
    try{
         // console.log(req.headers)
        console.log('body: ',req.body)
        // sanitize
        let formattedPlaytime = req.body.playtime
        if(formattedPlaytime =='Unknown'){
            formattedPlaytime = null
        }
        let [rows] = await db.query(`SELECT publisherID FROM Publishers WHERE name=?`,req.body.publisher)
        console.log[rows]
        let publisherID = rows[0].publisherID
        
        // query
        await db.query(`UPDATE Games
            SET name='${req.body.name}',publisherID = ${publisherID}, genre='${req.body.genre}', developer='${req.body.developer}', 
            releaseDate='${req.body.release}', price=${req.body.price}, estimatedPlaytime=${formattedPlaytime}
            WHERE gameID = ${req.body.id}`
        )
        
        // cosnole
        res.sendStatus(200)
    }catch(error){
        console.log('An error occured modifying a game')
        console.error(error)
        res.send(400)
    }
})

app.post('/games/add', async (req,res)=>{
    try{
        console.log('body: ',req.body)
        // sanitize
        let formattedPlaytime = req.body.playtime
        if(formattedPlaytime =='Unknown' || formattedPlaytime == ''){
            formattedPlaytime = null
        }

        let [rows] = await db.query(`SELECT publisherID FROM Publishers WHERE name=?`,req.body.publisher)
        // console.log[rows]
        let publisherID = rows[0].publisherID

        await db.query(`INSERT INTO Games
            (publisherID, name, genre, developer,releaseDate,price, estimatedPlaytime)
            VALUES (${publisherID},'${req.body.name}','${req.body.genre}','${req.body.developer}','${req.body.release}',${req.body.price},${formattedPlaytime})`)

        res.sendStatus(200)
    }catch(error){
        console.log('An error occured when adding a game')
        console.error(error)
        res.send(400)
    }
    
})

// PUBLISHERS PAGE
app.get('/publishers', async (req, res) => {
    try {
        // grab games
        const [rows] = await db.query(`
            SELECT * FROM Publishers
        `);
        if (!rows.length) {
           return res.redirect('/');
        }
        // render out
        res.render('publishers',
            {
                layout: 'notMain',
                description: 'This page lets users interact with the Publishers table',
                items: rows,
                title: 'Publishers',
                showAll: true
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to load publishers');
    }
});

app.post('/publishers/delete/:id', async (req, res) => {
    try {
        const publisherID = req.params.id
        await db.query(`DELETE FROM Publishers WHERE publisherID = ?;`,[publisherID]);

        console.log(`Removed publisher with ID: ${publisherID}`);

        res.redirect('/publishers');

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

app.get('/publishers/:id', async (req, res)=>{
    const publisherID = req.params.id
    try{
        const [publisher] = await db.query(`SELECT name FROM Publishers WHERE publisherID=?`, publisherID)
        // grab librarygames
        let [rows] = await db.query(`
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
        if (!rows.length) {
           rows=[null]
        }else{
            var formatted = rows.map(games => {
                const date = new Date(games.releaseDate)
                let formattedPlaytime = games.estimatedPlaytime
                if(formattedPlaytime==null){
                    formattedPlaytime='Unknown'
                }
                // console.log(formattedPlaytime)
                return{
                    ...games,
                    releaseDate: `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`,
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
        console.error(error)
        console.log(`Failed to load publisher with id: ${publisherID}`)
        res.send(400)
    }
})

app.post('/publishers/modify', async(req,res)=>{
    try{
        console.log('body: ', req.body)
        await db.query(`UPDATE Publishers
            SET name = '${req.body.name}',webPage='${req.body.webpage}', email='${req.body.email}'
            WHERE publisherID=?`,req.body.id)

        res.sendStatus(200)
    }catch(error){
        console.log('An error occured modifying a publisher')
        console.error(error)
        res.send(400)
    }
    
})

app.post('/publishers/add', async (req,res)=>{
    try{
        await db.query(`INSERT INTO Publishers
            (name, webPage, email)
            VALUES ('${req.body.name}', '${req.body.webpage}','${req.body.email}')`)
        res.sendStatus(200)
    }catch(error){
        console.log('An error occured when adding a publisher')
        console.error(error)
        res.sendStatus(400)
    }
})

// USERS PAGE
app.get('/users', async (req, res) => {
    try {
        // grab games
        let [rows] = await db.query(`
            SELECT * FROM Users
        `);
        if (!rows.length) {
            rows=[]
        }
        // render out
        res.render('users',
            {
                layout: 'notMain',
                items: rows,
                title: 'Users'
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to load publishers');
    }
});

app.post('/users/delete/:id', async (req, res) => {
    try {
        const userID = req.params.id
        await db.query(`DELETE FROM Users WHERE userID = ?;`,[userID]);

        console.log(`Removed user with ID: ${userID}`);

        res.redirect('/users');

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

app.post('/users/modify', async (req,res)=>{
    try{
        console.log('body: ',req.body)
        // query
        await db.query(`UPDATE Users
            SET username='${req.body.username}'
            WHERE userID = ${req.body.id}`
        )
        
        // cosnole
        res.sendStatus(200)
    }catch(error){
        console.log('An error occured modifying a user')
        console.error(error)
        res.send(400)
    }
})

app.post('/users/add', async (req,res)=>{
    try{
        console.log('body:', req.body)
        //query
        await db.query(`INSERT INTO Users
                (username)
                VALUES ('${req.body.username}')`)
        res.send(200)
    }catch(error){
        console.log('An error occured adding a user')
        console.error(error)
        res.send(400)
    }
})

// LIBRARY GAMES PAGE
app.get('/libraryGames', async (req,res) => {
    try {
        // grab librarygames
        let [rows] = await db.query(`
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
        `);

        let [users] = await db.query(`SELECT username FROM Users`)
        let [games] = await db.query(`SELECT name FROM Games`)

        if (!rows.length) {
            // return res.redirect('/');
            rows = []
        }

        if (!users.length) {
            // return res.redirect('/');
            users = []
        }

        if (!games.length) {
            // return res.redirect('/');
            games = []
        }
        // render out
        res.render('libraryGames',
            {
                layout: 'notMain',
                name: 'Library Games',
                description: 'This page lets users interact with the Library_Games table',
                items: rows,
                title: 'LibraryGames',
                showAll: true,
                userOptions: users,
                gameOptions: games
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send(`Failed to load library games`);
    }
})

app.post('/libraryGames/add', async (req, res)=>{
    try{
        console.log('body: ',req.body)
        const [game] = await db.query(`SELECT gameID FROM Games WHERE name =?`,req.body.game)
        const [user] = await db.query(`SELECT userID FROM Users WHERE username =?`,req.body.username)
        const [library] = await db.query(`SELECT libraryID FROM Library WHERE  userID=?`,user[0].userID)

        await db.query(`INSERT INTO Library_Games
        (gameID, libraryID, playtime, completion)
        VALUES (${game[0].gameID}, ${library[0].libraryID},
                 ${req.body.playtime}, ${req.body.completion})`)

        res.send(200)
    }catch(error){
        console.log('An error occured when adding a library game')
        console.error(error)
        res.send(400)
    }
})

app.post('/libraryGames/modify', async(req,res)=>{
    try{
        console.log('Body: ', req.body)

        await db.query(`UPDATE Library_Games
            SET playtime=${req.body.playtime}, completion=${req.body.completion}
            WHERE lgID=?`,req.body.id)
        
        res.sendStatus(200)
    }catch(error){
        console.log('An error occured when modifying a library game')
        console.error(error)
        res.send(400)
    }
})

app.get('/libraryGames/:id', async (req, res) => {
    const gameID = req.params.id
    try {
        // grab librarygames
        let [rows] = await db.query(`
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
        let [game] = await db.query(`SELECT name FROM Games WHERE gameID=?`,gameID)
        if (!rows.length) {
            // return res.redirect('/');
            rows = []
        }

        let [users] = await db.query(`SELECT username FROM Users`)
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
                items: rows,
                title: 'LibraryGames',
                showAll: false
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send(`Failed to load library games for game with id: ${gameID}`);
    }
});

app.post('/libraryGames/delete/:id', async (req, res) => {
    try {
        const lgID = req.params.id
        // console.log(lgID)
        
        let [rows] = await db.query(`SELECT gameID FROM Library_Games WHERE lgID = ?`,lgID);
        let gameID = rows[0].gameID

        const [remainingRows] = await db.query(`
            SELECT COUNT(*) AS count
            FROM Library_Games
            WHERE gameID = ?`,[gameID]);
        
        const [result] = await db.query(`DELETE FROM Library_Games WHERE lgID = ?;`,[lgID]);

        console.log(`Removed library_game with ID: ${lgID}`);
        
        res.redirect(req.get('Referer'));
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

// LIBRARY PAGE
app.get('/libraries', async (req,res)=>{
    try{
        let [rows] = await db.query(`
            SELECT libraryID,
                     u.username as username
            FROM Library
            JOIN Users u ON Library.userID = u.userID`)
        if (!rows.length) {
            rows=[]
        }
        res.render('library',{
            layout: 'notMain',
            name: 'Libraries',
            description: 'This page lets you view the Library table',
            items: rows,
            individual: false
        })
    }catch(error){
        console.error(error)
        res.status(500).send('An error occurred');
    }
})

app.get('/library/:id', async (req,res)=>{
    const userID = req.params.id
    try{
        let [rows] = await db.query(`
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
        if (!rows.length) {
            rows = null
        }
        let [games] = await db.query(`SELECT name FROM Games`)
        if (!games.length) {
            games = null
        }
        // console.log(rows)
        res.render('library', {
            layout: 'notMain',
            name: user[0].username,
            description: 'This page lets you view the Library table for a single user',
            items: rows,
            individual: true,
            userOptions: user,
            gameOptions: games
        });
    }catch(error){
        console.error(error)
        res.status(500).send('An error occurred');
    }
})

// APP GO
app.listen(PORT, () => {
    console.log(`Express started on server_name:${PORT}/`);
});