require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");
const cookie = require("cookie-parser");
const bodyParser = require('body-parser');
const mongooseDB = require('./database/mongoose');
const mongoose = require('mongoose')


// .env
const PORT = process.env.PORT || 8000;


// create app
const app = express();


// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// app use
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static/resources', express.static(path.join(__dirname, '/public/images'))); // URL to access: /static/resources/file-name 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookie('SUD'));
app.use(session({
    cookie: { maxAge: 30000000 },
    saveUninitialized: true
}));
app.use(flash());
// app.use(cookie())


// default routes
app.get('/', (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(300).redirect('/accounts/login')
    }
    return res.redirect('/accounts/home')
    // res.render('index', {
    //     document: "Index",
    //     title: "Demo"
    // })
})


// New router Define
const AccountRouter = require('./routers/AccountRouter');
app.use('/accounts', AccountRouter)


// error handling
app.use((req, res, next) => {
    next(createError(404))
})
app.use((err, req, res, next) => {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    return res.status(err.status).render('error', {
        document: "Not supported link",
        message: err.message
    });
})


// server and database
mongooseDB.connect()
    .then((result) => {
        if (result.success) {
            console.log("> " + result.message + ` - code: ${result.code}`)
            app.listen(PORT, () => {
                console.log("> " + `Website at: http://localhost:${PORT}`)
            })
        }
        else {
            console.log(result.message)
        }
    })
    .catch((err) => {
        console.log(err)
    })