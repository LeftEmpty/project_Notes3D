if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

// imports
const express = require('express');
const app = express();
const port = 3333;
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');


// init passport - this enables authentication
const initializePassport = require('./passport-config');
initializePassport(
    passport,
    // !TODO probably needs to be replaced by a db request
    username => users.find(user => user.username == username),
    id => users.find(user => user.id == id) 
);

// !TODO temp - save in a db instead
const users = [];

// settings
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout','layouts/layout');

// middleware
app.use(expressLayouts);
app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// root for static files
app.use(express.static('public')); 


// routes
app.get('/', (req, res) => {
    res.render('index.ejs', {
        bLoggedIn: req.user == null ? 'Login' : 'Logout',
        username: req.user == null ? 'no username' : req.user.username
    });
});

app.get('/profile', (req, res) => {
    res.render('profile.ejs', {
        bLoggedIn: req.user == null ? 'Login' : 'Logout',
        username: req.user == null ? 'no username' : req.user.username
    });
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true
}), (req, res) => {
    // If you want to pass the flash messages to the index view, you can access them here
    const messages = req.flash();
    res.render('index.ejs', { messages });
});

app.post('/register', async (req, res) => {
    // password confirmation
    if (req.body.registerpassword != req.body.registerpasswordconfirm) {
        console.log('passwords don\'t match');
        res.redirect('/')
        return;
    }
    // try add user
    try {
        const hashedPassword = await bcrypt.hash(req.body.registerpassword, 2);
        users.push({
            id: Date.now().toString(),
            username: req.body.registerusername,
            password: hashedPassword
        })
        res.redirect('/')
    } catch {
        console.log('couldnt register user');
        res.redirect('/');
    }
    // debug
    console.log(users);
});

app.listen(process.env.PORT || port);