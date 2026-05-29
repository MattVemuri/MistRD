const express = require('express');
const app = express();
const path = require('path');
const PORT = 5572;

const db = require('./db-connector');
const handlebars = require('express-handlebars');
// const { format } = require('path');
app.use(express.urlencoded({ extended: true }));

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
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
})

// GAMES PAGE
app.get('/games', async (req, res) => {
    try {
        // grab games
        const [rows] = await db.query(`
            SELECT * FROM Games
        `);
        if (!rows.length) {
            return res.redirect('/');
        }
        // format for site
        const formatted = rows.map(games => {
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
        // grab librarygames
        const [rows] = await db.query(`
            SELECT p.name as title,
                g.name as name,
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
           return res.redirect('/');
        }
        if (!rows.length) {
            return res.redirect('/');
        }
        const formatted = rows.map(games => {
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
        res.render('publishers',
            {
                layout: 'notMain',
                title: formatted[0].title,
                description: 'This page lets users interact with the Publishers table for a single publisher',
                items: formatted,
                showAll: false
            }
        );
    }catch(error){
        console.error(error)
        console.log(`Failed to load publisher with id: ${publisherID}`)
    }
})

// USERS PAGE
app.get('/users', async (req, res) => {
    try {
        // grab games
        const [rows] = await db.query(`
            SELECT * FROM Users
        `);
        if (!rows.length) {
            return res.redirect('/');
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

// LIBRARY GAMES PAGE
app.get('/libraryGames', async (req,res) => {
    try {
        // grab librarygames
        const [rows] = await db.query(`
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
        if (!rows.length) {
            return res.redirect('/');
        }
        // render out
        res.render('libraryGames',
            {
                layout: 'notMain',
                name: 'Library Games',
                description: 'This page lets users interact with the Library_Games table',
                items: rows,
                title: 'LibraryGames',
                showAll: true

            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send(`Failed to load library games`);
    }
})

app.post('/libraryGames/origin/delete/:id', async (req, res) => {
    try {
        const lgID = req.params.id        
        await db.query(`DELETE FROM Library_Games WHERE lgID = ?;`,[lgID]);
        console.log(`Removed library_game with ID: ${lgID}`);
        res.redirect('/libraryGames/')

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

app.get('/libraryGames/:id', async (req, res) => {
    const gameID = req.params.id
    try {
        // grab librarygames
        const [rows] = await db.query(`
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
            WHERE g.gameID = ?
        `, [gameID]);
        if (!rows.length) {
            return res.redirect('/');
        }
        if(rows.length == 0){
            res.redirect('/libraryGames')
        }

        // render out
        res.render('libraryGames',
            {
                layout: 'notMain',
                name: rows[0].gameName,
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
        const [rows] = await db.query(`SELECT gameID FROM Library_Games WHERE lgID = ?`,[lgID]);
        if (!rows.length) {
            return res.redirect('/');
        }
        const gameID = rows[0].gameID
        const [remainingRows] = await db.query(`
            SELECT COUNT(*) AS count
            FROM Library_Games
            WHERE gameID = ?`,[gameID]);
        
        await db.query(`DELETE FROM Library_Games WHERE lgID = ?;`,[lgID]);

        console.log(`Removed library_game with ID: ${lgID}`);
        
        
        if(remainingRows[0].count-1 < 1){
            res.redirect('/libraryGames/')
        }else{
            res.redirect(`/libraryGames/${gameID}`);
        }
        

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

// LIBRARY PAGE
app.get('/libraries', async (req,res)=>{
    try{
        const [rows] = await db.query(`
            SELECT libraryID,
                     u.username as username
            FROM Library
            JOIN Users u ON Library.userID = u.userID`)
        if (!rows.length) {
            return res.redirect('/');
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
        const [rows] = await db.query(`
            SELECT l.libraryID,
                    u.username as username,
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
        if (!rows.length) {
            return res.redirect('/');
        }
        res.render('library', {
            layout: 'notMain',
            name: rows[0].username,
            description: 'This page lets you view the Library table for a single user',
            items: rows,
            individual: true
        });
    }catch(error){
        console.error(error)
        res.status(500).send('An error occurred');
    }
})

app.listen(PORT, () => {
    console.log(`Express started on http://localhost:${PORT}`);
});