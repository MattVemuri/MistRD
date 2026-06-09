# MistRD
Steam hosts more than 250,000 games on its store page published by 100,000 . companies. With such a large pool to choose from, 37.5 million daily users have difficulty searching for games they would like to buy and manage in their library. Mist RD will be a robust database system for users to search and filter through games that they would like to purchase and track in their own libraries. It will record Games published by Publishers that the User can add to their own Library. The Games can be filtered by their flat price, their released date and genre.


All work is original, unless specfied via comment
Sourced work is shown via inline comments like so:
    [Code] sourced from [Source]
    [URL]

Sourced Material:
    app.js
    req.get('Referer) copied from GeeksForGeeks.org
    https://www.geeksforgeeks.org/web-tech/express-js-req-get-function/
    6/5/26
    res.redirect(req.get('Referer'));

    Map function adapted from MDN docs
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map 
    6/5/26
    var formatted = libraryGames.map(games=>{...})

    games.js
    padStart copied from stack overflow
    https://stackoverflow.com/questions/61830788/setting-date-in-html-date-input-using-javascript
    6/5/26
    input.value = `${date[2]}-${date[0].padStart(2,'0')}-${date[1].padStart(2,'0')}`

    MistRD_DDL.sql
    TRUNCATE usage based on learn.Microsoft.com
    https://learn.microsoft.com/en-us/sql/t-sql/statements/drop-table-transact-sql?view=sql-server-ver17
    6/4/26
    TRUNCATE used in place of DROP to preserve triggers

    MistRD_plsql.sql
    NEW and OLD Keywords based on GeeksForGeeks.org
    6/4/26
    https://www.geeksforgeeks.org/dbms/sql-triggers/
    used to reference versions of libraryGames in triggers

