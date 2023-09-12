const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByUsername, getUserById) {
    // Use the LocalStrategy with Passport.js
    const authenticateUser = async (username, password, done) => {
        const user = getUserByUsername(username);
        if (!user) {
            return done(null, false, { message: 'Username not found' });
        }
        try {
            // Compare the provided password with the hashed password stored in the user object
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (e) {
            return done(e);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
    passport.serializeUser((user, done) => { return done(null, user.id); });
    passport.deserializeUser((id, done) => { return done(null, getUserById(id)); });
}

module.exports = initialize;