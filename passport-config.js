const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { fetchUser, fetchUserByUsername } = require('./database.js');

async function initialize(passport) {
    // Use the LocalStrategy with Passport.js
    const authenticateUser = async (username, password, done) => {
        const user = await fetchUserByUsername(username);
        if (!user) {
            console.log('ERROR: no user with that username found during authentication');
            return done(null, false, { message: 'ERROR: Username not found' });
        }
        try {
            // Compare the provided password with the hashed password stored in the user object
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                console.log('USER - successfully logged in as: ' + user.username);
                console.log('USER - User data:');
                console.log(user);
                return done(null, user);
            } else {
                console.log('WARNING: password incorrect');
                return done(null, false, { message: 'WARNING: Password incorrect' });
            }
        } catch (e) {
            return done(e);
        }
    }

    await passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));

    passport.serializeUser((user, done) => {
        process.nextTick(() => {
            return done(null, {
                id: user.id,
                username: user.username
            });
        });
    });

    passport.deserializeUser((user, done) => {
        process.nextTick(() => {
            return done(null, user);
        });
    });
}



module.exports = initialize;