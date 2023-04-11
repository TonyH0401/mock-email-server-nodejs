const express = require('express')
const router = express.Router()
const randomstring = require('randomstring');
const moment = require('moment');
// ---
const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');
const validator_API = require('../middlewares/validator');
const function_API = require('../middlewares/function');
const LabelModel = require('../model/LabelModel');


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
// not finished
router.post('/send-email', async (req, res, next) => {
    // console.log(req.body)
    const { emailId, email, subject, message, labels } = req.body
    let emailValid = await function_API.emailStringToArrayObject(email)
    if (!emailValid.success) {
        req.flash('error', emailValid.message)
        return res.redirect(`/accounts/email/create-email/${emailId}`)
    }
    // check block and blocked email - not finished
    // intersect of the 2 emails
    let emailExist = await EmailModel.findOne({ _id: emailId })
    if (!emailExist) {
        req.flash('error', 'Email ID does not exist!')
        return res.redirect(`/accounts/home`)
    }
    emailExist.subject = subject
    emailExist.body = message
    emailExist.receiver = emailValid.data
    emailExist.email_type = "send"
    if (labels != "default") {
        let label = await LabelModel.findOne({ _id: labels })
        if (label) {
            emailExist.label = label._id
        }
    }
    let result = await emailExist.save()
    req.flash('success', 'Sent Email!')
    return res.redirect('/accounts/home')
})
router.get('/update-is-read/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.receiver.find(x => x.email == email).is_read = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/receive-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})
router.get('/update-is-star/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.receiver.find(x => x.email == email).is_star = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/receive-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})
router.get('/update-is-deleted/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.receiver.find(x => x.email == email).is_delete = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/receive-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})
router.get('/update-is-star-send/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.is_star_sender = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/draft-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})
router.get('/update-is-deleted-send/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.is_delete_sender = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/draft-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})
router.get('/update-is-star-send-send/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.is_star_sender = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/send-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})
router.get('/update-is-deleted-send-send/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.is_delete_sender = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/send-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})
router.get('/update-is-star-draft-send/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.is_star_sender = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/star-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})
router.get('/update-is-star-receive/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.receiver.find(x => x.email == email).is_star = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/star-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})
router.get('/update-is-deleted-email-section-sender/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.is_delete_sender = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/delete-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})
router.get('/update-is-deleted-email-section/:emailId/:status', async (req, res, next) => {
    const email = req.session.email
    if (!email) {
        return res.status(202).redirect('/accounts/home')
    }
    const { emailId, status } = req.params
    try {
        let emailExist = await EmailModel.findOne({ _id: emailId })
        emailExist.receiver.find(x => x.email == email).is_delete = (status == "true") ? true : false
        let result = await emailExist.save()
        return res.redirect('/accounts/delete-email')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Email Error",
            status: 500,
            message: error
        })
    }
})




module.exports = router