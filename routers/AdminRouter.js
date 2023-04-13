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


// /admin/home
router.get('/home', async (req, res, next) => {
    const session_admin = req.session.admin
    if (!session_admin) {
        return res.redirect('/admins/login')
    }
    return res.json({
        success: true
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
        return res.status(500).render('error', {
            document: "Login Error",
            status: 500,
            message: error
        })
    }
})



module.exports = router