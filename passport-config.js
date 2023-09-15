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
            console.log('trying to log in as: ' + user.username);
            // Compare the provided password with the hashed password stored in the user object
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                console.log('successfully logged in as: ' + user.username);
                return done(null, user);
            } else {
                console.log('password incorrect');
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
                // !TODO add uploaded meshes, etc
            });
        });
    });

    passport.deserializeUser((user, done) => {
        process.nextTick(() => {
            return done(null, user);
        });
    });
    
    /*
    await passport.serializeUser((user, done) => { return done(null, user.id); });
    await passport.deserializeUser(async (id, done) => {
        try {
            const user = await fetchUser(id);
            return done(null, user); 
        } catch (e) {
            done (e, null);
        }
    });
    */
}



module.exports = initialize;