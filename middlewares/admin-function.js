const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');
const AdminModel = require('../model/AdminModel');

module.exports.getValidUserNumber = async () => {
    let validUsers = await AccountModel.find({ is_validated: true })
    return validUsers.length
}
module.exports.getInvalidUserNumber = async () => {
    let invalidUsers = await AccountModel.find({ is_validated: false })
    return invalidUsers.length
}
module.exports.getEmailNumber = async () => {
    let emails = await EmailModel.find({ email_type: "send" })
    return emails.length
}
