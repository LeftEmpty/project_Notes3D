// javascript not supporting overloaded functions is just really sad


const mysql = require('mysql2');

// debug purposes
const bcrypt = require('bcrypt');

if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

// pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_ROOT,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise()

// USERS
async function fetchUser(id = null) {
    try {
        // returns all users (debug)
        if (id == null) {
            const [rows] = await pool.query("SELECT * FROM users");
            return rows;
        }  
        else {
            const [rows] = await pool.query(`
            SELECT *
            FROM users
            WHERE id = ?
            `, [id]); // prepared statement
            return rows[0];
        }
    } catch (e) {
        console.log('ERROR: fetchUser: id most likely invalid');
        console.log(e);
    }
}

// function to fetch a user by username
async function fetchUserByUsername(username) {
    try {
        if (username != null) {
            const [rows] = await pool.query(`
            SELECT *
            FROM users
            WHERE username = ?
            `, [username]); // prepared statement
            return rows[0];
        }
    } catch (e) {
        console.log('ERROR: fetchUserByUsername - username most likely invalid');
        console.log(e);
    }
}

async function createUser(username, password) {
    try {
        const result = await pool.query(`
        INSERT INTO users (username, password)
        VALUES (?, ?)
        `, [username, password]);
        return result.insertId;
    } catch (e) {
        console.log(e);
    }
}

// UPLOADS
async function fetchUpload(bSingle = true, userKey, fileName = null) {
    try {
        // get single upload
        if (bSingle) {
            if (fileName == null) {
                throw new Error('couldnt fetch upload - fileName invalid');
            }
            const [rows] = await pool.query(`
            SELECT *, DATE_FORMAT(created, '%d.%m.%Y') AS uploadDate
            FROM uploads
            WHERE userKey = ? AND fileName = ?
            `, [userKey], [fileName]); // prepared statement
            console.log(rows[0]);
            return rows[0];
        }
        // get all uploads from user
        if (!bSingle) {
            if (fileName != null) {
                console.log('WARNING: fileName is ignored if all uploads are requested');
            }
            const [rows] = await pool.query(`
            SELECT *, DATE_FORMAT(created, '%d.%m.%Y') AS uploadDate
            FROM uploads
            WHERE userKey = ?
            `, [userKey]); // prepared statement
            return rows;
        }
    } catch (e) {
        console.log('ERROR: fetchUpload - couldnt upload file');
        console.log(e);
    }
}

async function storeUpload(userKey, note, fileName, originalFileName, filePath, fileSize) {
    try {
        const result = await pool.query(`
        INSERT INTO uploads (userKey, note, fileName, originalFileName, filePath, fileSize)
        VALUES (?, ?, ?, ?, ?, ?)
        `, [userKey, note, fileName, originalFileName, filePath, fileSize]);
        return result.insertId;
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            console.log('ERROR: duplicate entry - file name');
        }
        console.log(e)
    }
}

function getCurDate() {
    const curDate = new Date();
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    return(curDate.toLocaleDateString('en-US', options).replace(/\//g, '.'));
}

// COUNTER
async function incrementModelAmountCounter() {
    try {
        await pool.query(`
        UPDATE counter SET count = count + 1;
        `);
    } catch (e) {
        console.log(e);
    }
}

async function fetchModelAmountCounter() {
    try {
        const result = await pool.query(`
        SELECT count FROM counter;
        `);
        // there shouldnt be any other rows in counter table
        if (result.length !== 2) {
            throw new Error('Wrong number of rows in counter table');
        }
        return result[0][0].count;
    } catch (e) {
        console.log('ERROR: fetchModelAmountCounter - couldnt fetch amount counter');
        console.log(e);
        return null;
    }
}

// DEBUG
async function resetTable(tablename) {
    try {
        // await dropTable();
        // await recreateTable();
        // await repopulateTable();
        await emptyTable(tablename);
        if (tablename == 'users') {
            await repopulateUserTable();
        }
    } catch (e) {
        console.log(e);
    }
}
async function emptyTable(tablename) {
    try {
        const result = await pool.query(`
        DELETE FROM ${tablename};
        `);
    } catch (e) {
        console.log(e);
    }
}
async function repopulateUserTable() {
    try {
        // example users
        const names = ["Anna", "Berta", "Charlie", "Donald"];
        const passwords = ["pw1", "pw2", "pw3", "pw4"];

        for (let i = 0; i < 4; i++) {
            let pw = await bcrypt.hash(passwords[i], 2); 
            await createUser(names[i], pw);
        }
    } catch (e) {
        console.log(e);
    }
}

async function logUser(id = null) {
    try {
        if (id == null) {
            const users = await fetchUser();
            console.log('\n\nALL USERS:');
            console.log(users);
        }
        else {
            const user = await fetchUser(id);
            console.log('\n\nUSER FOUND:')
            console.log(user);
        }
    } catch (e) {
        console.log(e);
    } 
}
// templog('another one', 'haha lmao');

// logUser();

// resetDb();

// resetTable('uploads');

// incrementModelAmountCounter();

module.exports = {
    fetchUser, fetchUserByUsername, createUser,
    fetchUpload, storeUpload,
    fetchModelAmountCounter, incrementModelAmountCounter
}