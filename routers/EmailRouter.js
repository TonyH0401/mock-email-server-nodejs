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


module.exports = router