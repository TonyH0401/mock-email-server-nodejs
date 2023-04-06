const express = require('express')
const router = express.Router()
const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');
const validator_API = require('../middlewares/validator');
const randomstring = require('randomstring');
const function_API = require('../middlewares/function');
const moment = require('moment');


// /accounts/routes
// router.get('/create-demo-account', async (req, res, next) => {
//     try {

//     } catch (error) {
//         let message = error
//         return res.status(500).render('error', {
//             document: "Mail Creation Error",
//             status: 500,
//             message: message
//         })
//     }
// })

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
    // console.log(req.body)
    const { petName, nickName, favFood } = req.body
    const email = req.session.email
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
        error: req.flash('error'),
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