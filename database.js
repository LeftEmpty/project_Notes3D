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

// CONTACTS
async function fetchContactlist(username) {
    try {
        if (await fetchUserByUsername(username) == null) {
            throw new Error('ERROR: fetchContactlist - no user with that username found');
        }
        const [rows] = await pool.query(`
        SELECT contacts
        FROM users
        WHERE username = ?
        `, [username]); // prepared statement
        let arr = []
        if (rows[0].contacts != null) {
            arr = rows[0].contacts.split(',').filter(Boolean);
        }
        return arr;
    } catch (e) {
        console.log(e);
    }
}

async function fetchContactUsers(username) {
    try {
        // get list of usernames in contact list
        const arr = await fetchContactlist(username);
        // return empty array if none found
        // get user data via usernames, add into array and return
        const contacts = [];
        for (let i = 0; i < arr.length; i++) {
            contacts.push(await fetchUserByUsername(arr[i]));
        }
        // console.log(contacts);
        return contacts;
    } catch (e) {
        console.log(e);
        
    }
}

async function addContact(username, contactUsername) {
    try {
        // check if other user is valid
        if (await fetchUserByUsername(contactUsername) == null){
            throw new Error('ERROR: addContact - no user with that username found');
        }
        // check if other user is already in contactlist
        const tmp = await fetchContactlist(username);
        for (let i = 0; i < tmp.length; i++) {
            if (tmp[i] == contactUsername) {
                throw new Error('ERROR: addContact - user already in contactlist');
            }
        }
        tmp.push(contactUsername)
        const list = tmp.join(',');
        await setContactlist(username, list);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

async function removeContact(username, contactUsername) {
    try {
        // check if other user is valid
        if (await fetchUserByUsername(contactUsername) == null){
            throw new Error('ERROR: removeContact - no user with that username found');
        }
        const tmp = await fetchContactlist(username);
        // check if other user is not in contactlist
        for (let i = 0; i < tmp.length; i++) {
            if (tmp[i] != contactUsername && i == tmp.length) {
                throw new Error('ERROR: removeContact - no user with that username in your contactlist');
            }
        }
        const list = tmp.filter((word) => word != contactUsername).join(',');;
        await setContactlist(username, list);
    } catch (e) {
        console.log(e);
    }
}

async function setContactlist(username, newList) {
    const result = await pool.query(`
    UPDATE users
    SET contacts = ?
    WHERE username = ?
    `, [newList, username]);
    return result.insertId;
}

// UPLOADS
async function fetchUpload(user, id = null) {
    try {
        // check user validity
        if (user == null) {
            throw new Error('ERROR: fetchUpload - invalid user');
        }
        // get single upload
        if (id != null) {
            const [rows] = await pool.query(`
            SELECT * FROM uploads
            WHERE user = ? AND id = ?
            `, [user, id]); // prepared statemen
            rows[0].created = formatDate(rows[0].created);
            return rows[0];
        }
        // get all uploads from user
        if (id == null) {
            const [rows] = await pool.query(`
            SELECT * FROM uploads
            WHERE user = ?
            `, [user]); // prepared statement
            for (let i = 0; i < rows.length; i++) {
                rows[i].created = formatDate(rows[i].created);
            }
            return rows;
        }
    } catch (e) {
        console.log('ERROR: fetchUpload - couldnt fetch file');
        console.log('user: ' + user + " | id: " + id);
        console.log(e);
    }
}

function formatDate(date) {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    return(date.toLocaleDateString('en-US', options).replace(/\//g, '.'));
}

async function storeUpload(username, note, fileName, originalFileName, filePath, fileSize) {
    try {
        const result = await pool.query(`
        INSERT INTO uploads (user, note, fileName, originalFileName, filePath, fileSize)
        VALUES (?, ?, ?, ?, ?, ?)
        `, [username, note, fileName, originalFileName, filePath, fileSize]);
        return result.insertId;
    } catch (e) {
        if (e.code == 'ER_DUP_ENTRY') {
            console.log('ERROR: duplicate entry - file name');
        }
        console.log(e)
    }
}


async function editUpload(user, id, newNote) {
    try {
        const tmp = await fetchUpload(user, id);
        if (tmp == null) {
            throw Error('ERROR: No file found, invalid input')
        }
        const result = await pool.query(`
        UPDATE uploads
        SET note = ?
        WHERE user = ? AND id = ?;
        `, [newNote, user, id]);
        // console.log(result);
        return result;
    } catch (e) {
        console.log(e);
    }
}

async function deleteUpload(user, id) {
    try { 
        // console.log('deleting upload: ' + user + ' [user]');
        // console.log('deleting upload: ' + id + ' [id]');
        // console.log('DELETING:');
        // console.log(await fetchUpload(user, id));
        await pool.query(`
        DELETE FROM uploads WHERE user = ? AND id = ?
        `, [user, id]);
    } catch (e) {
        console.log(e);
    }
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
        if (result.length != 2) {
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
        switch (tablename) {
            case 'uploads':
                await emptyTable(tablename);
                break;
            case 'users':
                await emptyTable(tablename);
                await repopulateUserTable();
                break;
            case 'counter':
                await pool.query(`
                UPDATE counter SET count = 0;
                `);
                break;
            default:
                console.log('WARNING: couldnt reset table - invalid tablename');
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

// resetTable('uploads');
// resetTable('counter')

// incrementModelAmountCounter();

module.exports = {
    fetchUser, fetchUserByUsername, createUser,
    fetchUpload, storeUpload, deleteUpload, editUpload,
    fetchContactlist, fetchContactUsers, addContact, removeContact,
    fetchModelAmountCounter, incrementModelAmountCounter
}