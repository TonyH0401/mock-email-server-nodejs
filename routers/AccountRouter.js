const express = require('express')
const router = express.Router()
const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');
const { Schema } = require('mongoose');
const async = require('hbs/lib/async');


// /accounts/routes
router.get("/", async (req, res, next) => {
    let success = true
    let message = ""

    let admin = new AccountModel({
        first_name: "John",
        last_name: "Smith",
        username: "admin@email.com",
        password: 123456,
        phone_number: "0123123123",
    })
    await admin.save()
        .then(() => { message = "account added successfully" })
        .catch((err) => { success = false, message = err })

    let admin2 = new AccountModel({
        first_name: "Tony",
        last_name: "Stark",
        username: "admin2@email.com",
        password: 123456,
        phone_number: "0123123123",
    })
    await admin2.save()
        .then(() => { message = "account added successfully" })
        .catch((err) => { success = false, message = err })

    let admin3 = new AccountModel({
        first_name: "Tony",
        last_name: "Stark",
        username: "admin3@email.com",
        password: 123456,
        phone_number: "0123123123",
    })
    await admin3.save()
        .then(() => { message = "account added successfully" })
        .catch((err) => { success = false, message = err })


    return res.json({
        success: success,
        message: message
    })
})
router.get("/send-email", async (req, res, next) => {
    let success = true
    let email = new EmailModel({
        sender: "admin",
        subject: "demo subject",
        body: "demo body",
        receiver: [{ username: "admin3" }]
    })
    // email.receiver.push(["admin2", "admin3"])
    await email.save()
        .then(() => { message = "email added successfully" })
        .catch((err) => { success = false, message = err })

    return res.json({
        success: success,
        message: message
    })
})
router.get("/find", async (req, res, next) => {
    let success = true
    let message = ""
    let data
    try {
        data = await EmailModel.find()
    } catch (error) {
        sucess = false
        message = error
    }
    return res.json({
        success: success,
        data: data
    })
})
router.get('/login', (req, res, next) => {
    res.render('login')
})
router.get('/register', (req, res, next) => {
    res.render('register')
})
router.post('/register', (req, res) => {
    const { name, age } = req.body
    console.log(req.body)
    console.log(typeof req.body)
    return res.json(req.body)
})

// -----------------------------------------------------------------------------------------------
router.get("/create-mail", async (req, res, next) => {
    try {
        // const { username } = req.session.username;
        let username = "admin"
        let email = new EmailModel({
            sender: username
        })
        let result = await email.save()
        console.log(result)
        return res.status(200).json({
            data: result
        })
    } catch (error) {
        let message = error
        return res.status(500).render('error', {
            document: "Mail Creation Error",
            status: 500,
            message: message
        })
    }

    // const { username } = req.session.username;
    // let message = ""
    // let email = new EmailModel({
    //     // sender: username
    //     sender: "admin"
    // })
    // await email.save()
    //     .then(() => {
    //         message = "Mail created successfullt"
    //     })
    //     .catch((error) => {
    //         message = error
    //         return res.status(500).render('error', {
    //             document: "Mail Creation Error",
    //             status: 500,
    //             message: "Can not create Mail"
    //         })
    //     })
    // return res.render('create-mail')
    // return res.status(200).json({
    //     data: email
    // })
})



// router.post("/demo", (req, res, next) => {
//     let account1 = new AccountModel()
//     account1.save()
//         .then(() => { console.log(true) })
//         .catch((err) => { return res.json({ message: err }) })

//     let account2 = new AccountModel()
//     account2.blocked_user.push(account1)
//     account2.save()
//         .then(() => { console.log(true) })
//         .catch((err) => { return res.json({ message: err }) })

//     return res.json({ code: 1 })
// })


module.exports = router