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
router.get('/email-list-based-on-label/:labelID', async (req, res, next) => {
    const session_email = req.session.email
    const labelID = req.params.labelID

    // get the total email list
    let userSender = await EmailModel.find({ sender: session_email }).populate('label')
    let userReceiver = await EmailModel.find({ "receiver.email": session_email }).populate('label')
    let temp = userSender.concat(userReceiver)
    // get the label information
    let label = await LabelModel.findOne({ _id: labelID })
    // get the emails that has a label
    let data = temp.filter(x => x.label)
    // get the emails that has a specific label
    let result = []
    data.forEach(element => {
        if (element.label._id.equals(label._id))
            result.push(element)
    });
    if (result.length == 0) {
        req.flash('error', `Label '${label.label_name}' has no emails!`)
        return res.redirect('/accounts/label-management')
    }
    let result2 = []
    result2 = result.map(d => {
        return {
            _id: d._id,
            receiver: function_API.getListReceiverFromArray(d.receiver).substring(0, 10),
            is_star_send: d.is_star_sender,
            is_delete_send: d.is_delete_sender,
            email_type: d.email_type,
            createdAt: d.createdAt,
            body: d.body.substring(0, 10),
            subject: d.subject.substring(0, 5),
            emailNotation: (d.email_type == 'send') ? "Send" : "Receive"
        }
    })
    return res.render('view-email-list-label', {
        document: "Label View'",
        category: `Label '${label.label_name}' of `,
        user_email: session_email,
        emailList: result2
    })
})



module.exports = router