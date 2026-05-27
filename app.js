/*
    SETUP
*/

// Express
const express = require('express');  // We are using the express library for the web server
const app = express();               // We need to instantiate an express object to interact with the server in our code
const path = require('path')
const PORT = 5572;     // Set a port number
const db = require('./db-connector')


// app.use((req, res, next) => {
//     console.log("REQUEST:", req.method, req.url);
//     next();
// });

app.use(express.static(__dirname));

app.get('/', async function (req, res) {
    res.sendFile(path.join(__dirname, "./Main/homepage.html"));
});

app.post('/games/delete', async function (req, res) {
    try{
        const query1 = `CALL remove_csgo();`;
        await db.query(query1);
        console.log('Removed CS:GO')
        res.redirect('/Main/Pages/games.html')
    }catch(error){
        console.error('Failed to delete CSGO: ',error);
        res.status(500).send('An error occured');
    }
});

app.post('/Main/reset', async function (req, res) {
    try{
        const query1 = `CALL load_db();`
        await db.query(query1);
        console.log('Reset database')
        res.redirect('/Main/homepage.html')
    }catch(error){
        console.error('Failed to reset: ',error);
        res.status(500).send('An error occured');
    }
});

app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});