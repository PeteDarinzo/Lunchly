/** Database for lunchly */

/** Database setup for BizTime. */

const {Client} = require('pg');

let DB_URI;


/*** SPRINGBOARD METHOD ***/



  DB_URI = "postgresql:///lunchly";


let db = new Client({
    connectionString: DB_URI
});


/*** END SPRINGBOARD METHOD ***/



/*** MY METHOD ***/


// DB_URI = {
//     host: "localhost",
//     user: "", // your username 
//     password: "", // your password
//     database: "" // LEAVE BLANK
// }

// DB_URI.database = (process.env.NODE_ENV === 'test') ? "test_lunchly" : "lunchly";

// let db = new Client(DB_URI);


/*** END MY METHOD ***/


db.connect()

module.exports = db;