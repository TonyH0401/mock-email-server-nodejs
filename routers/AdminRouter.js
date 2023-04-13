const express = require('express')
const router = express.Router()
const randomstring = require('randomstring');
const moment = require('moment');
const bcrypt = require('bcrypt');
// ---
const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');
const LabelModel = require('../model/LabelModel');
const AdminModel = require('../model/AdminModel');
const validator_API = require('../middlewares/validator');
const function_API = require('../middlewares/function');
const admin_function_API = require('../middlewares/admin-function');



router.get('/home', async (req, res, next) => {
    const session_admin = req.session.admin
    if (!session_admin) {
        return res.redirect('/admins/login')
    }
    let valid_user = await admin_function_API.getValidUserNumber()
    let invalid_user = await admin_function_API.getInvalidUserNumber()
    let emails = await admin_function_API.getEmailNumber()
    return res.render('admin/admin-home', {
        document: "Admin Home",
        valid_user: valid_user,
        invalid_user: invalid_user,
        emails: emails
    })
})


router.get('/login', async (req, res, next) => {
    let result = await function_API.isAdminExist()
    if (result.success == 0) {
        return res.status(500).render('error', {
            document: "Admin Page Error",
            status: 500,
            message: result.message
        })
    }

    const session_admin = req.session.admin
    if (session_admin) {
        return res.redirect('/admins/home')
    }
    return res.render('admin/admin-login', {
        document: "Admin Login",
        error: req.flash('error') || '',
        username: req.flash('username') || ''
    })
})
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body
    try {
        let adminExist = await AdminModel.findOne({ username: username })
        if (!adminExist) {
            req.flash('error', `${username} does not exist!`)
            return res.redirect('/admins/login')
        }
        const match = await bcrypt.compare(password, adminExist.password)
        if (match) {
            req.session.admin = adminExist.username
            return res.redirect('/admins/home')
        }
        else {
            req.flash('username', adminExist.username)
            req.flash('error', "Password is incorrect!")
            return res.redirect('/admins/login')
        }
    } catch (error) {
        return res.status(500).render('admin/admin-error', {
            document: "Login Error",
            status: 500,
            message: error
        })
    }
})


router.get('/valid-users', async (req, res, next) => {
    const session_admin = req.session.admin
    if (!session_admin) {
        return res.redirect('/admins/login')
    }
    try {
        let validUsers = await AccountModel.find({ is_validated: true })
        let data = []
        data = validUsers.map(d => {
            return {
                _id: d._id,
                type: "valid",
                email: d.email,
                fullname: d.first_name + " " + d.last_name,
                birthday: moment(d.birthday).format("MMM Do YYYY"),
                phone: d.phone_number,
                gender: d.gender,
                join_date: moment(d.createdAt).format('MMMM Do YYYY, h:mm:ss a')
            }
        })
        let valid_message = `There are <b>${data.length}</b> user(s) currently!`
        return res.render('admin/admin-user-list', {
            document: "Admin Valid Users",
            data: data,
            valid_message: valid_message || '',
            invalid_message: req.flash('error') || '',
        })
    } catch (error) {
        return res.status(500).render('admin/admin-error', {
            document: "Load Valid User Error",
            status: 500,
            message: error
        })
    }
})
router.get('/invalid-users', async (req, res, next) => {
    const session_admin = req.session.admin
    if (!session_admin) {
        return res.redirect('/admins/login')
    }
    try {
        let invalidUsers = await AccountModel.find({ is_validated: false })
        let data = []
        data = invalidUsers.map(d => {
            return {
                _id: d._id,
                type: "",
                email: d.email,
                fullname: d.first_name + " " + d.last_name,
                birthday: moment(d.birthday).format("MMM Do YYYY"),
                phone: d.phone_number,
                gender: d.gender,
                join_date: moment(d.createdAt).format('MMMM Do YYYY, h:mm:ss a')
            }
        })
        let invalid_message = ` There are <b>${data.length}</b> user(s) that have not activated their account currently!`
        return res.render('admin/admin-user-list', {
            document: "Admin Invalid Users",
            data: data,
            invalid_message: invalid_message || '',
            valid_message: req.flash('success') || '',
        })
    } catch (error) {
        return res.status(500).render('admin/admin-error', {
            document: "Load Invalid User Error",
            status: 500,
            message: error
        })
    }
})


router.get('/emails', async (req, res, next) => {
    const session_admin = req.session.admin
    if (!session_admin) {
        return res.redirect('/admins/login')
    }
    try {
        let drafts = await EmailModel.find({ email_type: "draft" })
        let draftNumber = drafts.length
        let emails = await EmailModel.find({ email_type: "send" })
        let data = []
        data = emails.map(d => {
            let temp = d._id.toString()
            // console.log(temp)
            // console.log(typeof temp)
            return {
                _id: d._id,
                short_id: temp.substring((temp.length / 2), temp.length),
                sender: d.sender,
                receiver: function_API.getListReceiverArrayFromArrayObject(d.receiver),
                subject: d.subject,
                body: d.body,
                created_at: moment(d.createdAt).format('MMMM Do YYYY, h:mm:ss a')
            }
        })
        let message = `There are <b>${data.length}</b> email(s) currently!`
        let draft = `There are <b>${draftNumber}</b> draft(s) currently!`
        return res.render('admin/admin-email-list', {
            document: "Email(s) List",
            data: data,
            message: message,
            draft: draft
        })
    } catch (error) {
        return res.status(500).render('admin/admin-error', {
            document: "Load Email Error",
            status: 500,
            message: error
        })
    }
})


router.get('/logout', async (req, res, next) => {
    const session_admin = req.session.admin
    if(!session_admin) {
        return res.redirect('/admins/login')
    }
    let admin = session_admin
    req.session.destroy()
    return res.redirect('/admins/login')
})


// admin router handling
router.use((req, res, next) => {
    return res.status(404).render('admin/admin-error', {
        document: "Not Found",
        status: 404,
        message: "This link is not supported!"
    })
})




module.exports = router