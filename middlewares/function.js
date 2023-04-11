const fetch = require('node-fetch');
const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');

module.exports.randomPropety = (obj) => {
    var keys = Object.keys(obj);
    let random = keys.length * Math.random() << 0
    return {
        key: keys[random],
        value: obj[keys[random]]
    }
}
module.exports.questionTopic = (key) => {
    let question = ''
    if (key == 'pet_name')
        question = "What is your pet's name?"
    if (key == 'fav_food')
        question = "What is your favourite food?"
    if (key == 'nickname')
        question = "What is your young nickname?"
    return question
}
module.exports.getQuotes = async () => {
    let data
    await fetch('https://api.quotable.io/random?maxLength=50')
        .then(async (response) => {
            data = await response.json()
        })
        .catch((err) => {
            console.log(err)
            data = {
                content: "No more quote!",
                author: "System"
            }
        })
    let result = data.content + " - " + data.author
    return result
}
module.exports.emailStringToArrayObject = async (emailString) => {
    let validEmails = []
    let invalidEmails = []
    let rawEmails = [... new Set(emailString.replace(/\s/g, '').split(","))]
    for (let index = 0; index < rawEmails.length; index++) {
        let email = rawEmails[index];
        let emailExist = await AccountModel.findOne({ email: email })
        if (!emailExist) {
            invalidEmails.push(email)
        }
        let emailObject = { email: email }
        validEmails.push(emailObject)
    }
    if (invalidEmails.length != 0) {
        return {
            success: false,
            message: `Invalid Emails: ${invalidEmails.toLocaleString()}`
        }
    }
    return {
        success: true,
        data: validEmails
    }
}
module.exports.getListReceiverFromArray = (receiver) => {
    let receiverList = []
    for (let index = 0; index < receiver.length; index++) {
        receiverList.push(receiver[index].email);
    }
    return receiverList.toLocaleString()
}
module.exports.getListReceiverArrayFromArrayObject = (receiver) => {
    let receiverList = []
    for (let index = 0; index < receiver.length; index++) {
        receiverList.push(receiver[index].email);
    }
    return receiverList
}
module.exports.emailCreate = async (session_email) => {
    try {
        const email = session_email
        let emailCreate = await EmailModel({
            sender: email
        })
        let result = await emailCreate.save()
        return {
            success: true,
            message: "Success create new draft email",
            data: {
                _id: result._id
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error
        }
    }
}
module.exports.getSimpleView = async (session_email) => {
    let accountInfo = await AccountModel.findOne({ email: session_email })
    return accountInfo.simple_view
}