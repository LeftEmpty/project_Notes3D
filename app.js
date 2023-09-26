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
const fs = require('fs');

// const db = require('./database') // dont think i need this actually
const {
    fetchUser, fetchUserByUsername, createUser,
    fetchUpload, storeUpload, deleteUpload, editUpload,
    fetchContactlist, fetchContactUsers, addContact, removeContact,
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
            callback(null, req.body.fileUsername + '-' + filenr + '-' + Date.now() + '-' + file.originalname);
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
        messages: messages,
        bLoggedIn: req.user == null ? false :true,
        temploginusername: "",
        temploginpassword: "",
        tempregisterusername: "",
        tempregisterpassword1: "",
        tempregisterpassword2: ""
    });
});

app.get('/profile', ensureAuthenticated, async (req, res) => {
    res.redirect('/profile/' + req.user.username);
});

app.put('/profile/:username', ensureAuthenticated, async (req, res) => {
    try {
        console.log('add friend: ' + req.params.username);
        await addContact(req.user.username, req.params.username);
        res.json({ message: 'Contact added successfully!' });
    } catch (e) {
        console.log(e);
    }
});

app.delete('/profile', ensureAuthenticated, async (req, res) => {

});

app.get('/profile/:username', ensureAuthenticated, async (req, res) => {
    const messages = req.flash();

    const contacts = await fetchContactUsers(req.user.username);

    res.render('profile.ejs', {
        // current user
        username: req.user == null ? 'no username' : req.user.username,
        id: req.user == null ? 'noid' : req.user.id,
        company: req.user.company == null ? '-' : req.user.company,
        // contacts
        contactlist: contacts,
        // login / register popup forms
        messages: messages,
        bLoggedIn: req.user == null ? false :true,
        temploginusername: "",
        temploginpassword: "",
        tempregisterusername: "",
        tempregisterpassword1: "",
        tempregisterpassword2: "",
        // uploads
        uploadlist: await fetchUpload(req.user.username),
        selectedUpload: ""
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
    res.status(201).json({ message: 'Data fetched successfully!' });
});

// uplaods
app.get('/uploads', ensureAuthenticated, async (req, res) => {
    try {
        res.redirect('/uploads/' + req.user.username);
    } catch (e) {
        res.status(500).redirect('/profile');
    }
})

app.get('/uploads/:username', ensureAuthenticated, async (req, res) => {
    const messages = req.flash();
    const user = req.params.user;
    try {
        // page with current mesh
        res.render('upload.ejs', {
            // current user
            username: req.user == null ? 'no username' : req.user.username,
            id: req.user == null ? 'noid' : req.user.id,
            // login / register popup forms
            messages: messages,
            bLoggedIn: req.user == null ? false : true,
            temploginusername: "",
            temploginpassword: "",
            tempregisterusername: "",
            tempregisterpassword1: "",
            tempregisterpassword2: "",
            // uploads
            uploadlist: await fetchUpload(req.user.username)
        });
    } catch (e) {
        console.log(e);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/uploads/:username/:id', ensureAuthenticated, async (req, res) => {
    const messages = req.flash();
    const user = req.params.username;
    const id = req.params.id;
    try {
        // fetch upload via id
        const selectedUpload = await fetchUpload(user, id);
        if (selectedUpload) {
            // page with current mesh
            res.render('upload.ejs', {
                // current user
                username: req.user == null ? 'no username' : req.user.username,
                id: req.user == null ? 'noid' : req.user.id,
                // login / register popup forms
                messages: messages,
                bLoggedIn: req.user == null ? false :true,
                temploginusername: "",
                temploginpassword: "",
                tempregisterusername: "",
                tempregisterpassword1: "",
                tempregisterpassword2: "",
                // uploads
                uploadlist: await fetchUpload(req.user.username),
                selectedUpload: selectedUpload,
                uploadid: id,
                uploaduser: user
            });
        } else {
            // redirect to profile / uploads page when no mesh found or current mesh deleted
            res.status(404).redirect('/profile/' + req.user.username);
        }
    } catch (e) {
        console.log(e);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/uploads', upload.array('files'), async (req, res) => {
    // intercept files by using the ref name "files" from the formdata passed
    
    // save uploads to db
    try {
        for (const file of req.files) {
            // store file in db
            await storeUpload(req.body.fileUsername, req.body.note, file.filename,
                file.originalname, file.path, file.size);
            // delete upload if input was invalid
            if (req.body.fileUsername != req.user.username) {
                // !TODO await deleteUpload();
                throw new Error('ERROR: submitted invalid input in upload html form');
            }
        }
        // success !TODO implement user feedback
        res.json({ message: 'Data fetched successfully!' });
    } catch (e) {
        console.log('ERROR: coulndt upload file in post method');
        console.log(e);
    }

})

app.put('/uploads/:id', ensureAuthenticated, async (req, res) => {
    try {
        console.log('EDIT: user: ' + req.user.username + 
            ' | id: ' + req.params.id +
            ' | new note: ' + req.body.note);
        
        await editUpload(req.user.username, req.params.id, req.body.note);
        res.json({ message: 'Note updated successfully!' });
    } catch (e) {
        console.log(e);
    }
})

app.delete('/uploads/:id', ensureAuthenticated, async (req, res) => {
    try {
        // delete file from server (or folder)
        const tmp = await fetchUpload(req.user.username, req.params.id);
        fs.unlink(tmp.filePath, (error) => {
            if (error) {
                console.error('ERROR: couldnt delete file:', error);
            } else {
                console.log('file was successfully deleted');
                return;
            }
        });

        // remove upload from database
        await deleteUpload(req.user.username, req.params.id);
        res.json({ message: 'Deleting upload successfull!' });
    } catch (e) {
        console.log('ERROR: couldnt delete upload');
        console.log(e);
    }
})


// Authentication helper functions
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
    if (process.env.PORT) {
        console.log('server is running on port ' + process.env.PORT);
    }
    else {
        console.log('server is running on port ' + port);
    }
});