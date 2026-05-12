/*
    SETUP
*/

// Express
const express = require('express');  // We are using the express library for the web server
const app = express();               // We need to instantiate an express object to interact with the server in our code
const path = require('path')
const PORT = 5572;     // Set a port number

app.use(express.static(__dirname));

app.get('/', async function (req, res) {
    res.sendFile(path.join(__dirname, "./Main/homepage.html"));
});

/*
    LISTENER
*/

app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});