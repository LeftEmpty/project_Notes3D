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
const multer = require('multer');

// const db = require('./database') // dont think i need this actually
const {
    fetchUser, fetchUserByUsername, createUser,
    fetchUpload, storeUpload,
    fetchModelAmountCounter, incrementModelAmountCounter
} = require('./database.js');

// root for static files
app.use(express.static('public')); 

// set the storage options - multer setup
const upload = multer({
    storage: multer.diskStorage({
        // set file destination (folder, should be cloud storage in actual production environment)
        destination: (req, file, callback) => {
            callback(null, __dirname + '/public/uploads');
        },
        // generate unique file name (ensure no files are overwritten)
        filename: async (req, file, callback) => {
            /*  incrementing file amount which is part of the file name
            /   should ensure unique filenames (in combination with Date.now()) */
            await incrementModelAmountCounter();
            const filenr = await fetchModelAmountCounter();
            callback(null, req.body.userkey + '-' + filenr + '-' + Date.now() + '-' + file.originalname);
        }
    })
});

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
    const userKey = req.user.username + "_" + req.user.id;
    res.render('profile.ejs', {
        bLoggedIn: req.user == null ? false :true,
        username: req.user == null ? 'no username' : req.user.username,
        id: req.user == null ? 'noid' : req.user.id,
        // login / register popup forms
        messages: messages,
        temploginusername: "",
        temploginpassword: "",
        tempregisterusername: "",
        tempregisterpassword1: "",
        tempregisterpassword2: "",
        // uploads
        uploadlist: await fetchUpload(false, userKey)
    });
});


// login
app.get('/login', (req, res) => {
    res.redirect('back');
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: 'back',
    failureFlash: true
}), (req, res) => {
    const messages = req.flash();
    // at this point, authentication is successful
    res.redirect('/', { messages: messages, temploginusername: username, temploginpassword: password });
});

// logout
app.post('/logout', (req, res, next) => {
    req.logout((error) => {
    if (error) {
        return next(error);
    }
    res.redirect('/');
    });
});

// register
app.get('/register', (req, res) => {
    res.redirect('back');
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
    res.statsu(201).json({ message: 'Data fetched successfully!' });
});

// uplaods
app.post('/uploads', upload.array('files'), async (req, res) => {
    // intercept files by using the ref name "files" from the formdata passed
    
    // save uploads to db
    console.log('files:');
    console.log(req.files);
    for (const file of req.files) {
        await storeUpload(req.body.userkey, req.body.note, file.filename,
            file.originalname, file.path, file.size);
    }

    // success !TODO implement user feedback
    res.json({ message: 'Data fetched successfully!' });
})

// temp
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

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