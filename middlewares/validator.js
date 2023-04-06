const AccountModel = require('../model/AccountModel');

module.exports.checkEmailSubfix = (email) => {
    let emailSubfix = email.substring(email.indexOf("@"), email.length)
    if (emailSubfix != '@mymail.com') {
        return {
            success: false,
            message: `${emailSubfix} subfix is incorrect!`
        }
    }
    return {
        success: true,
        message: `${emailSubfix} is correct!`
    }
}

module.exports.isInputEmpty = (input) => {
    if (input.trim().length == 0) {
        return {
            success: false,
            message: 'Blank is not a valid input!'
        }
    }
    return {
        success: true,
        message: 'Correct input'
    }
}

module.exports.emailExist = async (email) => {
    const emailFound = await AccountModel.findOne({ email: email })
    if (emailFound) {
        return {
            success: true,
            message: `${email} existed!`
        }
    }
    else {
        return {
            success: false,
            message: `${email} does not existed!`
        }
    }
}

module.exports.phoneExist = async (phone) => {
    const phoneNumber = await AccountModel.findOne({ phone_number: phone })
    if (phoneNumber) {
        return {
            success: true,
            message: 'Phone number existed!'
        }
    }
    else {
        return {
            success: false,
            message: `${phone} does not exist!`
        }
    }
}

module.exports.checkPasswordEmail = async (email, password) => {
    const emailFound = await AccountModel.findOne({ email: email })
    if (emailFound.password != password) {
        return {
            success: false,
            message: 'Incorrect password!'
        }
    }
    return {
        success: true,
        message: 'Correct password!'
    }
}