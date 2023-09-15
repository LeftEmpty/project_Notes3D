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
        console.log(e);
        console.log('ERROR: fetchUser: id most likely invalid');
    }
}

// Function to fetch a user by username
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
        console.log(e);
        console.log('ERROR: fetchUserByUsername: username most likely invalid');
    }
  }
  
  // Function to fetch a user by ID
  async function fetchUser(userId) {
    // Implement this function in database.js
    // Example: const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    // Make sure to handle errors and return the user object
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

// DEBUG
async function resetDb() {
    try {
        await dropTable();
        await recreateTable();
        await repopulateTable();
    } catch (e) {
        console.log(e);
    }
}
async function dropTable() {
    try {
        const result = await pool.query(`
        DROP TABLE users;
        `);
    } catch (e) {
        console.log(e);
    }
}
async function recreateTable() {
    try {
        const result = await pool.query(`
        CREATE TABLE users (
        id integer PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created TIMESTAMP NOT NULL DEFAULT NOW());
        `);
    } catch (e) {
        console.log(e);
    }
}
async function repopulateTable() {
    try {
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

// resetDb();

// logUser();

module.exports = {
    fetchUser, fetchUserByUsername, createUser
}