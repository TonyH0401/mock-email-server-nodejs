require('dotenv').config();
const express = require('express')
const router = express.Router()
const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');
const LabelModel = require('../model/LabelModel');
const validator_API = require('../middlewares/validator');
const randomstring = require('randomstring');
const function_API = require('../middlewares/function');
const moment = require('moment');
const fetch = require('node-fetch');
const { LOCALHOST } = process.env;


// /accounts/routes
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
// -----------------------------------
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
// -----------------------------------------------------------------------------------------------
router.get('/register', async (req, res, next) => {
    const email = req.session.email
    if (email) {
        return res.status(202).redirect('/accounts/home')
    }
    return res.status(200).render('register', {
        document: 'Register page',
        error: req.flash('error') || '',
        firstName: req.flash('firstName') || '',
        lastName: req.flash('lastName') || '',
        birthday: req.flash('birthday') || '',
        emailAddress: req.flash('emailAddress') || '',
        phoneNumber: req.flash('phoneNumber') || ''
    })
})
router.post('/register', async (req, res, next) => {
    try {
        const { firstName, lastName, birthday, inlineRadioOptions, emailAddress, phoneNumber, password, password2 } = req.body
        req.flash('firstName', firstName)
        req.flash('lastName', lastName)
        req.flash('birthday', birthday)
        req.flash('emailAddress', emailAddress)
        req.flash('phoneNumber', phoneNumber)
        const { success, message } = validator_API.checkEmailSubfix(emailAddress)
        if (!success) {
            req.flash('error', message)
            return res.status(300).redirect('/accounts/register')
        }
        if (phoneNumber.length != 10) {
            req.flash('error', 'Invalid phone number and length!')
            return res.status(300).redirect('/accounts/register')
        }
        if (password.length < 6) {
            req.flash('error', 'Password must be atleast 6 letters long!')
            return res.status(300).redirect('/accounts/register')
        }
        if (password != password2) {
            req.flash('error', 'Password does not match each other!')
            return res.status(300).redirect('/accounts/register')
        }
        const phoneObject = await validator_API.phoneExist(phoneNumber)
        if (phoneObject.success) {
            req.flash('error', phoneObject.message)
            return res.status(300).redirect('/accounts/register')
        }
        const userObject = await validator_API.emailExist(emailAddress)
        if (userObject.success) {
            req.flash('error', userObject.message)
            return res.status(300).redirect('/accounts/register')
        }
        let user = new AccountModel({
            first_name: firstName,
            last_name: lastName,
            gender: inlineRadioOptions,
            birthday: new Date(birthday).toUTCString(),
            email: emailAddress,
            password: password,
            phone_number: phoneNumber
        })
        let result = await user.save()
        return res.status(200).redirect('/accounts/login')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Registration Error",
            status: 500,
            message: error
        })
    }
})


router.get('/login', (req, res, next) => {
    const email = req.session.email
    if (email) {
        return res.status(300).redirect('/accounts/home')
    }
    return res.status(200).render('login', {
        document: 'Login page',
        error: req.flash("error") || '',
        email: req.flash('email') || ''
    })
})
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        req.flash('email', email)
        let emailSubfix = validator_API.checkEmailSubfix(email)
        if (!emailSubfix.success) {
            req.flash("error", emailSubfix.message)
            return res.status(300).redirect('/accounts/login')
        }
        let emailObject = await validator_API.emailExist(email)
        if (!emailObject.success) {
            req.flash('error', emailObject.message)
            return res.status(300).redirect('/accounts/login')
        }
        let passwordObject = await validator_API.checkPasswordEmail(email, password)
        if (!passwordObject.success) {
            req.flash('error', passwordObject.message)
            return res.status(300).redirect('/accounts/login')
        }
        let emailExist = await AccountModel.findOne({ email: email })
        if (!emailExist.is_validated) {
            return res.status(300).render('email-validation', {
                email: email
            })
        }
        if (emailExist.two_auth) {
            let result = function_API.randomPropety(emailExist.question)
            // console.log(result)
            req.flash('question', result.key)
            return res.status(300).render('two-authentication', {
                document: 'Two Authentication',
                email: email,
                question: function_API.questionTopic(result.key)
            })
        }
        req.session.email = email
        return res.status(200).redirect('/accounts/home')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Mail Login Error",
            status: 500,
            message: error
        })
    }
})
router.post('/email-validation', async (req, res, next) => {
    const { email, phoneNumber, password } = req.body
    try {
        let user = await AccountModel.findOne({ email: email })
        if (!user) {
            req.flash('error', 'User not found!')
            return res.status(300).redirect('/accounts/login')
        }
        if (user.phone_number != phoneNumber) {
            req.flash('error', 'Phone number is invalid in verification!')
            return res.status(300).redirect('/accounts/login')
        }
        if (user.password != password) {
            req.flash('error', 'Password is invalid in verification!')
            return res.status(300).redirect('/accounts/login')
        }
        user.is_validated = true
        let result = await user.save()
        // req.session.email = email
        return res.status(200).redirect('/accounts/login')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Email Validation Error",
            status: 500,
            message: error
        })
    }
})
router.post('/two-authentication', async (req, res, next) => {
    const { email, question } = req.body
    let question_key = req.flash('question')

    let user = await AccountModel.findOne({ email: email })
    if (!user.question[question_key]) {
        return res.redirect('/accounts/login')
    }
    if (user.question[question_key] != question) {
        req.flash('error', 'Two Authentication failed!')
        return res.redirect('/accounts/login')
    }
    req.session.email = email
    return res.status(200).redirect('/accounts/home')
})


router.get('/forgot-password', async (req, res, next) => {
    const email = req.session.email
    if (email) {
        return res.status(200).redirect('/accounts/home')
    }
    return res.status(200).render('forgot-password', {
        error: req.flash('error') || '',
        success: req.flash('success') || ''
    })
})
router.post('/forgot-password', async (req, res, next) => {
    const { emailAddress, phone } = req.body

    try {
        if (!validator_API.checkEmailSubfix(emailAddress).success) {
            req.flash('error', `${emailAddress} has invalid email subfix!`)
            return res.status(500).redirect('/accounts/forgot-password')
        }
        let user = await AccountModel.findOne({ email: emailAddress })
        if (!user) {
            req.flash('error', `${emailAddress} does not exist!`)
            return res.status(500).redirect('/accounts/forgot-password')
        }
        if (user.phone_number != phone) {
            req.flash('error', 'Phone number does not exist!')
            return res.status(500).redirect('/accounts/forgot-password')
        }
        let new_password = randomstring.generate().substring(0, 6)
        user.password = new_password
        let result = await user.save()
        req.flash('success', `Your new password: ${new_password}`)
        return res.status(200).redirect('/accounts/forgot-password')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Forgot Password Error",
            status: 500,
            message: error
        })
    }
})


router.get('/change-password', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(200).redirect('/accounts/login')
    }
    return res.status(200).render('change-password', {
        document: 'Change Password',
        error: req.flash('error') || '',
        success: req.flash('success') || ''
    })
})
router.post('/change-password', async (req, res, next) => {
    const email = req.session.email
    const { oldPassword, newPassword, newPassword2 } = req.body
    try {
        let user = await AccountModel.findOne({ email: email })
        if (user.password != oldPassword) {
            req.flash('error', 'Wrong old password input!')
            return res.status(500).redirect('/accounts/change-password')
        }
        if (newPassword != newPassword2) {
            req.flash('error', 'New password does not match each other!')
            return res.status(500).redirect('/accounts/change-password')
        }
        if (oldPassword == newPassword) {
            req.flash('error', 'New password can not be Old password!')
            return res.status(500).redirect('/accounts/change-password')
        }
        if (newPassword.length < 6) {
            req.flash('error', 'New password must be atleast 6 letters!')
            return res.status(500).redirect('/accounts/change-password')
        }
        user.password = newPassword
        let result = await user.save()
        req.flash('success', 'New password successfully changed')
        return res.status(200).redirect('/accounts/change-password')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Change Password Error",
            status: 500,
            message: error
        })
    }
})


router.get('/security-question', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.redirect('/accounts/login')
    }
    let user = await AccountModel.findOne({ email: email })
    return res.status(200).render('security-question', {
        document: 'Security Questions',
        sq_enable: (user.two_auth) ? true : ''
    })
})
router.post('/security-question', async (req, res, next) => {
    const { petName, nickName, favFood } = req.body
    const email = req.session.email
    if (petName.length * nickName.length * favFood.length == 0) {
        return res.json({
            success: false,
            message: "Security Questions can not be empty!"
        })
    }
    if (petName.length == 0) {
        return res.json({
            success: false,
            message: "Question 1 can not be empty!"
        })
    }
    if (nickName.length == 0) {
        return res.json({
            success: false,
            message: "Question 2 can not be empty!"
        })
    }
    if (favFood.length == 0) {
        return res.json({
            success: false,
            message: "Question 3 can not be empty!"
        })
    }
    let user = await AccountModel.findOne({ email: email })
    user.question.pet_name = petName
    user.question.nickname = nickName
    user.question.fav_food = favFood
    user.two_auth = true
    await user.save()
    return res.json({
        success: true
    })
})
router.put('/security-question', async (req, res, next) => {
    const email = req.session.email
    let user = await AccountModel.findOne({ email: email })
    user.question.pet_name = ''
    user.question.nickname = ''
    user.question.fav_food = ''
    user.two_auth = false
    await user.save()
    return res.json({
        success: true
    })
})


router.get('/home', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(300).redirect('/accounts/login')
    }
    let user = await AccountModel.findOne({ email: email })
    let genderOpt = [
        { value: "male", select: false },
        { value: "female", select: false },
        { value: "other", select: false }
    ]
    genderOpt.find(x => x.value == user.gender).select = true
    return res.render('home', {
        document: 'Home page',
        error: req.flash('error') || '',
        success: req.flash('success') || '',
        firstName: user.first_name,
        lastName: user.last_name,
        birthday: moment(user.birthday).format('YYYY-MM-DD'),
        gender: genderOpt,
        email: user.email,
        phoneNumber: user.phone_number
    })
})
router.post('/change-account-info', async (req, res, next) => {
    const email = req.session.email
    const { firstName, lastName, birthday, inlineRadioOptions, phoneNumber } = req.body

    try {
        let user = await AccountModel.findOne({ email: email })
        if (user.phone_number != phoneNumber) {
            const phoneObject = await validator_API.phoneExist(phoneNumber)
            if (phoneObject.success) {
                req.flash('error', phoneObject.message)
                return res.status(300).redirect('/accounts/home')
            }
        }
        user.first_name = firstName
        user.last_name = lastName
        user.birthday = new Date(birthday).toUTCString()
        user.gender = inlineRadioOptions
        user.phone_number = phoneNumber
        let result = await user.save()
        return res.status(200).redirect('/accounts/home')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Home Error",
            status: 500,
            message: error
        })
    }
})


router.get('/email', async (req, res, next) => {
    let email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    let result = await function_API.emailCreate(email)
    if (!result.success) {
        return res.status(500).render('error', {
            document: "Account Email Error",
            status: 500,
            message: result.message
        })
    }
    return res.redirect(`/accounts/email/create-email/${result.data._id}`)
})
router.get('/email/create-email/:email_id', async (req, res, next) => {
    let email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { email_id } = req.params
    let emailExit = await EmailModel.findOne({ _id: email_id, sender: email })
    if (!emailExit) {
        return res.status(500).render('error', {
            document: "Email not found!",
            status: 404,
            message: "Email does not exist!"
        })
    }
    if (emailExit.email_type == "send") {
        return res.status(500).render('error', {
            document: "Email sent error",
            status: 500,
            message: "Email can not be re-send!"
        })
    }

    let labelList = await LabelModel.find({
        email: email,
        is_enable: true
    })

    let quote = await function_API.getQuotes()
    let subject = emailExit.subject
    let text = emailExit.body
    return res.render('create-email', {
        quote: quote,
        email_id: email_id,
        subject: subject,
        text: text,
        error: req.flash('error') || '',
        labelList: labelList
    })
})


router.get('/receive-email', async (req, res, next) => {
    let email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    let emailList = await EmailModel.find({ "receiver.email": email })
    let isSimpleView = await function_API.getSimpleView(email)
    let data = []
    data = emailList.map(d => {
        return {
            _id: d._id,
            sender: d.sender,
            is_star_send: d.is_star_sender,
            is_delete_send: d.is_delete_sender,
            email_type: d.email_type,
            is_read: d.receiver.find(x => x.email == email).is_read ? true : '',
            is_star: d.receiver.find(x => x.email == email).is_star ? true : '',
            is_delete: d.receiver.find(x => x.email == email).is_delete ? true : '',
            createdAt: d.createdAt,
            body: (isSimpleView) ? '' : d.body,
            subject: d.subject,
            emailNotation: "Received",
            editOption: true
        }
    })
    return res.render('view-email-list', {
        document: "Received Emails",
        category: "Received Emails of ",
        user_email: email,
        emailList: data,
        emailPlaceholderReceive: true
    })
})
router.get('/draft-email', async (req, res, next) => {
    let email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    let emailList = await EmailModel.find({
        sender: email,
        email_type: "draft"
    })
    let isSimpleView = await function_API.getSimpleView(email)
    let data = []
    data = emailList.map(d => {
        return {
            _id: d._id,
            sender: d.sender,
            is_star_send: d.is_star_sender,
            is_delete_send: d.is_delete_sender,
            email_type: d.email_type,
            createdAt: d.createdAt,
            body: (isSimpleView) ? '' : d.body,
            subject: d.subject,
            emailNotation: "Draft"
        }
    })
    return res.render('view-email-list', {
        document: "Draft Emails",
        category: "Draft Emails of ",
        user_email: email,
        emailList: data,
        emailPlaceholderDraft: true
    })
})
router.get('/send-email', async (req, res, next) => {
    let email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    let emailList = await EmailModel.find({
        sender: email,
        email_type: "send"
    })
    let isSimpleView = await function_API.getSimpleView(email)
    let data = []
    data = emailList.map(d => {
        return {
            _id: d._id,
            receiver: function_API.getListReceiverFromArray(d.receiver).substring(0, 10),
            is_star_send: d.is_star_sender,
            is_delete_send: d.is_delete_sender,
            email_type: d.email_type,
            createdAt: d.createdAt,
            body: (isSimpleView) ? '' : d.body,
            subject: d.subject,
            emailNotation: "Send"
        }
    })
    return res.render('view-email-list-send', {
        document: "Send Emails",
        category: "Send Emails of ",
        user_email: email,
        emailList: data,
        emailPlaceholderReceive: true
    })
})
router.get('/star-email', async (req, res, next) => {
    let email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    let isSimpleView = await function_API.getSimpleView(email)
    // draft send
    let data = []
    let emailListStarSender = await EmailModel.find({
        sender: email,
        is_star_sender: true,
        is_delete_sender: false,
    })
    data = emailListStarSender.map(d => {
        let draft_sender_receiver_temp = (d.email_type == "draft") ? email : function_API.getListReceiverFromArray(d.receiver).substring(0, 10);
        let emailNotation_temp = (d.email_type == "draft") ? "Draft" : "Send";
        return {
            _id: d._id,
            draft_sender_receiver: draft_sender_receiver_temp,
            is_star_send: d.is_star_sender,
            createdAt: d.createdAt,
            body: (isSimpleView) ? '' : d.body,
            subject: d.subject,
            emailNotation: emailNotation_temp
        }
    })
    // receive
    let emailListStarReceiver = await EmailModel.find({
        "receiver.email": email,
        "receiver.is_star": true,
        "receiver.is_delete": false
    })
    let data2 = []
    data2 = emailListStarReceiver.map(d => {
        return {
            _id: d._id,
            draft_sender_receiver: d.sender,
            is_star: d.receiver.find(x => x.email == email).is_star,
            createdAt: d.createdAt,
            body: (isSimpleView) ? '' : d.body,
            subject: d.subject,
            emailNotation: "Receive"
        }
    })
    let data3 = data2.concat(data)
    return res.render('view-email-list-star', {
        document: "Star Emails",
        category: "Star Emails of ",
        user_email: email,
        emailList: data3
    })
})
router.get('/delete-email', async (req, res, next) => {
    let email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    let isSimpleView = await function_API.getSimpleView(email)
    // draft send
    let data = []
    let emailListStarSender = await EmailModel.find({
        sender: email,
        is_delete_sender: true
    })
    data = emailListStarSender.map(d => {
        let draft_sender_receiver_temp = (d.email_type == "draft") ? email : function_API.getListReceiverFromArray(d.receiver).substring(0, 10);
        let emailNotation_temp = (d.email_type == "draft") ? "Draft" : "Send";
        return {
            _id: d._id,
            draft_sender_receiver: draft_sender_receiver_temp,
            is_delete_send: d.is_delete_sender,
            createdAt: d.createdAt,
            body: (isSimpleView) ? '' : d.body,
            subject: d.subject,
            emailNotation: emailNotation_temp
        }
    })
    // receive
    let emailListStarReceiver = await EmailModel.find({
        "receiver.email": email,
        "receiver.is_delete": true
    })
    let data2 = []
    data2 = emailListStarReceiver.map(d => {
        return {
            _id: d._id,
            draft_sender_receiver: d.sender,
            is_delete: d.receiver.find(x => x.email == email).is_delete,
            createdAt: d.createdAt,
            body: (isSimpleView) ? '' : d.body,
            subject: d.subject,
            emailNotation: "Receive"
        }
    })
    let data3 = data2.concat(data)
    return res.render('view-email-list-delete', {
        document: "Delete Emails",
        category: "Delete Emails of ",
        user_email: email,
        emailList: data3
    })
})


router.get('/view-email-detail/:emailId', async (req, res, next) => {
    const { emailId } = req.params
    let email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    let emailExist = await EmailModel.findOne({ _id: emailId })
    let returnLabel = ''
    let labelExist = await emailExist.populate('label')
    if (labelExist.label) {
        returnLabel = labelExist.label.label_name
    }
    if (emailExist.email_type != "draft") {
        let data = {
            _id: emailExist._id,
            sender: emailExist.sender,
            subject: emailExist.subject,
            body: emailExist.body,
            receiver: function_API.getListReceiverFromArray(emailExist.receiver),
            label: returnLabel
        }
        return res.render('view-email-detail', {
            document: "Detail View",
            data: data,
            error: req.flash('error') || ''
        })
    }
    return res.redirect(`/accounts/email/create-email/${emailId}`)
})
router.post('/reply-forward', async (req, res, next) => {
    const session_email = req.session.email
    const { emailID, emailSender, emailReceiver, message, reply, forward } = req.body
    let email = await EmailModel.findOne({ _id: emailID })
    let newSubject = ''
    let newMessage = ''
    let newReceiver = ''
    let newEmailID = ''
    let document = ''
    if (!email) {
        return res.status(500).render('error', {
            document: "Reply Forward Error",
            status: 500,
            message: error
        })
    }
    if (reply) {
        // console.log("reply")
        // console.log(req.body)
        document = "Reply Email"
        newSubject = "Re: " + email.subject
        newMessage = "\n\n==========" + "\nSender: " + emailSender + "\nReceiver: " + emailReceiver + "\n" + message
        let newEmail = new EmailModel({
            sender: session_email,
            subject: newSubject,
            body: newMessage
        })
        newEmailID = newEmail._id
        let result = await newEmail.save()
        newReceiver = emailReceiver.replace(session_email, emailSender)
    }
    if (forward) {
        document = "Forward Email"
        // console.log("forward")
        newSubject = "Fwd: " + email.subject
        newMessage = "\n\n==========" + "\nSender: " + emailSender + "\nReceiver: " + emailReceiver + "\n" + message
        let newEmail = new EmailModel({
            sender: session_email,
            subject: newSubject,
            body: newMessage
        })
        newEmailID = newEmail._id
        let result = await newEmail.save()
    }
    return res.render('reply-forward-create-email', {
        document: document,
        receiver: newReceiver,
        subject: newSubject,
        body: newMessage,
        emailID: newEmailID,
        error: req.flash('error') || ''
    })
})


router.get('/search-email-basic', async (req, res, next) => {
    const session_email = req.session.email
    if (!session_email) {
        return res.status(300).redirect('/accounts/login')
    }
    return res.render('search-basic', {
        document: "Search Email",
        error: req.flash('error') || '',
        success: req.flash('success') || '',
        category: "Search email of ",
        user_email: session_email
    })
})
router.post('/search-email-basic', async (req, res, next) => {
    // let sample_text_subject = 'Fwd'
    // let sample_text_email_sender = 'steveroger@mymail.com'
    let sample_text_email_sender = req.session.email
    let sample_text_subject = req.body.search

    let emailSenderType = await EmailModel.find({
        subject: {
            $regex: sample_text_subject,
            $options: 'i'
        },
        sender: sample_text_email_sender
    })
    let data1 = []
    data1 = emailSenderType.map(d => {
        return {
            _id: d._id,
            subject: d.subject,
            createdAt: d.createdAt,
            emailNotation: (d.email_type == "draft") ? 'Draft' : 'Sender'
        }
    })
    let emailReceiverType = await EmailModel.find({
        subject: {
            $regex: sample_text_subject,
            $options: 'i'
        },
        "receiver.email": sample_text_email_sender
    })
    let data2 = []
    data2 = emailReceiverType.map(d => {
        return {
            _id: d._id,
            subject: d.subject,
            createdAt: d.createdAt,
            emailNotation: 'Receiver'
        }
    })

    let result = data1.concat(data2)
    let error = ''
    let success = ''
    if (result.length == 0) {
        error = `No match for '${sample_text_subject}'!`
    }
    else {
        success = `Email(s) found: ${result.length}`
    }
    return res.render('search-basic', {
        document: "Search Email",
        error: error || '',
        success: success || '',
        category: "Search email of ",
        user_email: sample_text_email_sender,
        emailList: result
    })
})
router.get('/search-email-advance', async (req, res, next) => {
    const session_email = req.session.email
    if (!session_email) {
        return res.status(300).redirect('/accounts/login')
    }
    return res.render('search-advance', {
        document: "Advance Search Email",
        error: req.flash('error') || '',
        success: req.flash('success') || '',
        category: "Advance Search email of ",
        user_email: session_email
    })
})
router.post('/search-email-advance', async (req, res, next) => {
    const session_email = req.session.email
    const { sender, receiver, subject, body } = req.body

    let emailSearch = await EmailModel.find({
        sender: sender,
        "receiver.email": receiver,
        subject: {
            $regex: subject,
            $options: 'i'
        },
        body: {
            $regex: body,
            $options: 'i'
        }
    })
    let data = []
    data = emailSearch.map(d => {
        return {
            _id: d._id,
            subject: d.subject,
            createdAt: d.createdAt,
            emailNotation: (emailSearch.email_type == "draft") ? 'Draft' : ((emailSearch.email_type == "Send") ? 'Send' : 'Receive')
        }
    })

    let error = ''
    let success = ''
    if (data.length == 0) {
        error = `No match for '${sender}', '${receiver}', '${subject}', '${body}'!`
    }
    else {
        success = `Email(s) found: ${data.length}`
    }
    return res.render('search-advance', {
        document: "Advance Search Email",
        error: error || '',
        success: success || '',
        category: "Advance Search email of ",
        user_email: session_email,
        emailList: data
    })
})


router.get('/label-management', async (req, res, next) => {
    const session_email = req.session.email
    if (!session_email) {
        return res.status(300).redirect('/accounts/login')
    }
    let labelList = await LabelModel.find({
        email: session_email
    })
    let data = []
    data = labelList.map(d => {
        return {
            _id: d._id,
            label_name: d.label_name,
            createdAt: d.createdAt,
            available: (d.is_enable) ? true : ''
        }
    })
    return res.render('create-label', {
        document: "Label Management",
        error: req.flash('error') || '',
        success: req.flash('success') || '',
        category: "Label Management of ",
        user_email: session_email,
        labelList: data
    })
})
router.post('/label-management', async (req, res, next) => {
    const session_email = req.session.email
    const { label } = req.body

    let normalizeLabel = label.toLowerCase().trim()
    let labelExist = await LabelModel.findOne({
        email: session_email,
        label_name: normalizeLabel
    })
    if (labelExist) {
        req.flash('error', `Label: ${normalizeLabel} existed for ${session_email}!`)
        return res.redirect('/accounts/label-management')
    }
    try {
        let newLabel = new LabelModel({
            email: session_email,
            label_name: normalizeLabel
        })
        let result = await newLabel.save()
        req.flash('success', `Created Label: ${normalizeLabel}`)
        return res.redirect('/accounts/label-management')
    } catch (error) {
        req.flash('error', error)
        return res.redirect('/accounts/label-management')
    }
})


router.get('/block-user', async (req, res, next) => {
    const session_email = req.session.email
    if (!session_email) {
        return res.status(300).redirect('/accounts/login')
    }
    let emailInfo = await AccountModel.findOne({ email: session_email })
    let blockList = emailInfo.blocked_user
    let data = []
    data = blockList.map(d => {
        return {
            blockEmail: d
        }
    })
    return res.render('block-user', {
        document: 'Block User',
        category: 'Block Users of ',
        user_email: session_email,
        error: req.flash('error') || '',
        success: req.flash('success') || '',
        blockUserList: data
    })
})
router.post('/block-user', async (req, res, next) => {
    const session_email = req.session.email
    const { email } = req.body
    if (!session_email) {
        return res.status(200).redirect('/accounts/login')
    }

    if (session_email == email) {
        req.flash('error', 'You can not block yourself')
        return res.redirect('/accounts/block-user')
    }

    let emailExist = await AccountModel.findOne({ email: email })
    if (!emailExist) {
        req.flash('error', `${email} does not exist!`)
        return res.redirect('/accounts/block-user')
    }
    let myEmail = await AccountModel.findOne({ email: session_email })
    try {
        if (!myEmail.blocked_user.includes(email)) {
            myEmail.blocked_user.push(email)
        }
        else {
            req.flash('error', `${email} is already blocked!`)
            return res.redirect('/accounts/block-user')
        }
        if (!emailExist.blocked_user_invs.includes(session_email)) {
            emailExist.blocked_user_invs.push(session_email)
        }
        else {
            return res.redirect('/accounts/block-user')
        }
        let result = await myEmail.save()
        let result2 = await emailExist.save()
        req.flash('success', `${email} blocked!`)
        return res.redirect('/accounts/block-user')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Block User Error",
            status: 500,
            message: error
        })
    }
})
router.get('/remove-block-user/:email', async (req, res, next) => {
    const session_email = req.session.email
    const { email } = req.params
    if (!session_email) {
        return res.status(200).redirect('/accounts/login')
    }
    try {
        // unblock them from me
        let accountInfo = await AccountModel.findOne({ email: session_email })
        let blockList = accountInfo.blocked_user
        let index = blockList.indexOf(email)
        if (index > -1) {
            blockList.splice(index, 1)
        }
        accountInfo.blocked_user = blockList
        let result = await accountInfo.save()
        // unblock me from them
        let accountInfo2 = await AccountModel.findOne({ email: email })
        let blockList2 = accountInfo2.blocked_user_invs
        let index2 = blockList2.indexOf(session_email)
        if (index2 > -1) {
            blockList2.splice(index2, 1)
        }
        accountInfo2.blocked_user = blockList2
        let result2 = await accountInfo2.save()
    } catch (error) {
        return res.status(500).render('error', {
            document: "Unnlock User Error",
            status: 500,
            message: error
        })
    }
    return res.redirect('/accounts/block-user')
})


router.get('/change-view', async (req, res, next) => {
    const session_email = req.session.email
    if (!session_email) {
        return res.status(300).redirect('/accounts/login')
    }
    let accountInfo = await AccountModel.findOne({ email: session_email })
    if (!accountInfo) {
        return res.status(300).redirect('/accounts/login')
    }
    let accountViewSimple = accountInfo.simple_view

    return res.render('change-view', {
        document: "Account's View",
        error: req.flash('error') || '',
        user_email: session_email,
        category: (accountViewSimple == true) ? "Simple View of " : "Detail View of ",
        simpleView: (accountViewSimple == true) ? "true" : ''
    })
})
router.post('/change-view', async (req, res, next) => {
    const session_email = req.session.email
    const { simple, detail } = req.body
    let accountInfo = await AccountModel.findOne({ email: session_email })
    try {
        if (simple) {
            accountInfo.simple_view = false
        }
        if (detail) {
            accountInfo.simple_view = true
        }
        let result = await accountInfo.save()
        return res.redirect('/accounts/change-view')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Change View Error",
            status: 500,
            message: error
        })
    }
})


router.get('/logout', async (req, res, next) => {
    const session_email = req.session.email
    if(!session_email) {
        return res.redirect('/accounts/login')
    }
    let email = session_email
    req.session.destroy()
    return res.redirect('/accounts/login')
})




router.get('/view-page', async (req, res, next) => {
    let result = await function_API.getQuotes()
    return res.render('create-email', {
        quote: result
    })
})


// router.get("/create-email", async (req, res, next) => {
//     try {
//         // const { username } = req.session.username;
//         let username = "admin"
//         let email = new EmailModel({
//             sender: username
//         })
//         let result = await email.save()
//         // console.log(result)
//         // return res.status(200).json({
//         //     data: result
//         // })
//         return res.status(200).render('create-email', {
//             data: result.sender
//         })
//     } catch (error) {
//         let message = error
//         return res.status(500).render('error', {
//             document: "Mail Creation Error",
//             status: 500,
//             message: message
//         })
//     }
// })


module.exports = router