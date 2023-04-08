const express = require('express')
const router = express.Router()
const randomstring = require('randomstring');
const moment = require('moment');
// ---
const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');
const validator_API = require('../middlewares/validator');
const function_API = require('../middlewares/function');


router.post('/create', async (req, res, next) => {
    try {
        const { email } = req.body
        let emailCreate = await EmailModel({
            sender: email
        })
        let result = await emailCreate.save()
        return res.status(200).json({
            success: true,
            message: "Success create new draft email",
            data: {
                _id: result._id
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
})
router.put('/update', async (req, res, next) => {
    const { subject, text, emailId } = req.body
    try {
        let email = await EmailModel.findOne({ _id: emailId })
        if (!email) {
            return res.status(500).render('error', {
                document: "Update Draft Error, Email not found!",
                status: 500,
                message: error
            })
        }
        email.subject = subject
        email.body = text
        let result = await email.save()
        return res.json({
            success: true,
            message: "Saved draft!"
            // text: text,
            // emailId: emailId
        })
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Draft Error",
            status: 500,
            message: error
        })
    }
})
router.post('/send-email', async (req, res, next) => {
    const { emailId, email, subject, message } = req.body
    return res.json({
        data: req.body
    })
})



module.exports = router