const AccountModel = require('../model/AccountModel');

module.exports.loginValidation = async (subfix, username, password) => {
    if (subfix != "@mymail.com") {
        message = "Wrong email subfix"
        return {
            success: false,
            message: message
        }
    }
    if (username.length == 0) {
        message = "Email is empty"
        return {
            success: false,
            message: message
        }
    }
    if (password.length == 0) {
        message = "Password is empty"
        return {
            success: false,
            message: message
        }
    }
    const userExist = await AccountModel.findOne({ username: username })
    if (!userExist) {
        message = `${username} does not exit`
        return {
            success: false,
            message: message
        }
    }
    else {
        if (password != userExist.password) {
            message = "Wrong password"
            return {
                success: false,
                message: message
            }
        }
    }
    return {
        success: true,
        message: "valid username and password"
    }
}