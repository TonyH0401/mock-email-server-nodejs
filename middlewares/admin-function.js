const AccountModel = require('../model/AccountModel');
const EmailModel = require('../model/EmailModel');
const AdminModel = require('../model/AdminModel');
const fetch = require('node-fetch');

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
module.exports.getAnimeQuote = async () => {
    let data
    await fetch('https://animechan.vercel.app/api/random')
        .then(async (response) => {
            let result = await response.json()
            let quote = `"${result.quote}"`
            let author = result.character + " - " + result.anime
            data = {
                quote: quote,
                author: author
            }
        })
        .catch((err) => {
            console.log(err)
            data = {
                quote: "No anime quote!",
                author: "System"
            }
        })
    return data
}