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

const db = require('./database')
const { fetchUser, fetchUserByUsername, createUser, createUserUploadTable } = require('./database.js');

// settings
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout','layouts/layout');

// middleware
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// init passport - this enables authentication
const initializePassport = require('./passport-config');
initializePassport(passport);

// root for static files
app.use(express.static('public')); 

// routes
app.get('/', (req, res) => {
    const messages = req.flash();
    res.render('index.ejs', {
        bLoggedIn: req.user == null ? false :true,
        messages: messages,
        temploginusername: "",
        temploginpassword: "",
        tempregisterusername: "",
        tempregisterpassword1: "",
        tempregisterpassword2: ""
    });
});

app.get('/profile', ensureAuthenticated, async (req, res) => {
    const messages = req.flash();
    console.log(messages);
    console.log('User data:' );
    console.log(req.user);
    console.log(req.session.passport.user);
    res.render('profile.ejs', {
        bLoggedIn: req.user == null ? false :true,
        username: req.user == null ? 'no username' : req.user.username,
        messages: messages,
        temploginusername: "",
        temploginpassword: "",
        tempregisterusername: "",
        tempregisterpassword1: "",
        tempregisterpassword2: ""
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

app.get('/login', (req, res) => {
    res.redirect('back');
}); 

app.get('/register', (req, res) => {
    res.redirect('back');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: 'back',
    failureFlash: true
}), (req, res) => {
    const messages = req.flash();
    // At this point, authentication is successful.
    console.log('failed to login?'); 
    console.log('Authenticated user:', req.user); 
    res.redirect('/', { messages: messages, temploginusername: username, temploginpassword: password });
});

app.post('/logout', (req, res, next) => {
    req.logout((error) => {
    if (error) {
        return next(error);
    }
    res.redirect('/');
    });
});

app.post('/register', async (req, res) => {
    // !TODO set default values in form if registering failed (UX improvement)

    // input false - username already exists
    console.log('username entered: ');
    console.log(req.body.registerusername);
    console.log(await fetchUserByUsername(req.body.registerusername));
    if (await fetchUserByUsername(req.body.registerusername) != null) {
        console.log('username already exists');
        // !TODO add feedback messages
        res.status(500).redirect('back');
        return;
    }
    // input false - passwords don't match
    if (req.body.registerpassword != req.body.registerpasswordconfirm) {
        console.log('passwords don\'t match');
        // !TODO add feedback messages
        res.status(500).redirect('back');
        return;
    }
    // input correct - try to add user
    try {
        const hashedPassword = await bcrypt.hash(req.body.registerpassword, 2);
        const newUser = await createUser(req.body.registerusername, hashedPassword);
        console.log(newUser);
    } catch (e) {
        res.status(500);
        console.log('couldnt register user');
    }
    res.status(201).redirect('back'); 
});

// temp
function checkAuthnticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}


app.listen(process.env.PORT || port, () => {
    console.log('server is running on port ' + port);
});