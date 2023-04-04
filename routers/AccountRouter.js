const express = require('express')
const router = express.Router()
const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');
const { loginValidation } = require('../middlewares/login-validator');


// /accounts/routes
router.get('/create-demo-account', async (req, res, next) => {
    try {

    } catch (error) {
        let message = error
        return res.status(500).render('error', {
            document: "Mail Creation Error",
            status: 500,
            message: message
        })
    }
})

// router.get("/", async (req, res, next) => {
//     let success = true
//     let message = ""

//     let admin = new AccountModel({
//         first_name: "John",
//         last_name: "Smith",
//         username: "admin@email.com",
//         password: 123456,
//         phone_number: "0123123123",
//     })
//     await admin.save()
//         .then(() => { message = "account added successfully" })
//         .catch((err) => { success = false, message = err })

//     let admin2 = new AccountModel({
//         first_name: "Tony",
//         last_name: "Stark",
//         username: "admin2@email.com",
//         password: 123456,
//         phone_number: "0123123123",
//     })
//     await admin2.save()
//         .then(() => { message = "account added successfully" })
//         .catch((err) => { success = false, message = err })

//     let admin3 = new AccountModel({
//         first_name: "Tony",
//         last_name: "Stark",
//         username: "admin3@email.com",
//         password: 123456,
//         phone_number: "0123123123",
//     })
//     await admin3.save()
//         .then(() => { message = "account added successfully" })
//         .catch((err) => { success = false, message = err })


//     return res.json({
//         success: success,
//         message: message
//     })
// })
// router.get("/send-email", async (req, res, next) => {
//     let success = true
//     let email = new EmailModel({
//         sender: "admin",
//         subject: "demo subject",
//         body: "demo body",
//         receiver: [{ username: "admin3" }, { username: "admin2" }]
//     })
//     // email.receiver.push(["admin2", "admin3"])
//     await email.save()
//         .then(() => { message = "email added successfully" })
//         .catch((err) => { success = false, message = err })

//     return res.json({
//         success: success,
//         message: message
//     })
// })
router.get("/find", async (req, res, next) => {
    try {
        let email = await EmailModel.find({ "receiver.username": "admin3" })
        if (!email) {
            return res.status(500).json({
                success: false,
                message: "No data"
            })
        }
        return res.status(200).json({
            success: true,
            data: email
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
})
router.get("/find-detail", async (req, res, next) => {
    try {
        let email = await EmailModel.find({ "receiver.username": "admin3" })
        if (!email) {
            return res.status(500).json({
                success: false,
                message: "No data"
            })
        }
        let data = []
        data = email.map(d => {
            return {
                _id: d._id,
                sender: d.sender,
                subject: d.subject,
                is_read: d.receiver.find(x => x.username == "admin3").is_read,
                is_star: d.receiver.find(x => x.username == "admin3").is_star,
                is_delete: d.receiver.find(x => x.username == "admin3").is_delete,
                is_star_send: d.is_star,
                normal_email: d.normal_email,
                createdAt: d.createdAt
            }
        })
        return res.status(200).json({
            success: true,
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
})
router.get("/update", async (req, res, next) => {
    try {
        let email = await EmailModel.findOne({ _id: "642c17db38f813d696a347b4" })
        if (!email) {
            return res.status(500).json({
                success: false,
                message: "No data found"
            })
        }
        email.receiver.find(x => x.username == "admin3").is_read = true
        let result = await email.save()
        return res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
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
router.get('/login', (req, res, next) => {
    return res.status(200).render('login', {
        error: req.flash("error") || ''
    })
})
router.post('/login', async (req, res, next) => {
    // email = username
    const { email, password } = req.body;
    let emailSubfix = email.substring(email.indexOf("@"), email.length)
    let { success, message } = await loginValidation(emailSubfix, email, password)
    if (!success) {
        req.flash("error", message)
        return res.status(300).redirect('/accounts/login')
    }
    req.session.username = email
    return res.status(200).redirect('/')
})

router.get("/create-email", async (req, res, next) => {
    try {
        // const { username } = req.session.username;
        let username = "admin"
        let email = new EmailModel({
            sender: username
        })
        let result = await email.save()
        // console.log(result)
        // return res.status(200).json({
        //     data: result
        // })
        return res.status(200).render('create-email', {
            data: result.sender
        })
    } catch (error) {
        let message = error
        return res.status(500).render('error', {
            document: "Mail Creation Error",
            status: 500,
            message: message
        })
    }
})


module.exports = router