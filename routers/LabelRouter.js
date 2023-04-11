const express = require('express')
const router = express.Router()
const randomstring = require('randomstring');
const moment = require('moment');
// ---
const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');
const LabelModel = require('../model/LabelModel');
const validator_API = require('../middlewares/validator');
const function_API = require('../middlewares/function');

router.get('/change-status/:_id/:status', async (req, res, next) => {
    const session_email = req.session.email
    const { _id, status } = req.params
    if (!session_email) {
        return res.status(300).redirect('/accounts/login')
    }
    try {
        let labelExist = await LabelModel.findOne({ _id: _id })
        if (!labelExist) {
            return res.status(500).render('error', {
                document: "Update Label Status Error",
                status: 404,
                message: 'Label _id does not exist!'
            })
        }
        labelExist.is_enable = (status == "true") ? true : false
        let result = await labelExist.save()
        return res.redirect('/accounts/label-management')
    } catch (error) {
        return res.status(500).render('error', {
            document: "Update Label Status Error",
            status: 500,
            message: 'Label _id does not exist!'
        })
    }
})




module.exports = router