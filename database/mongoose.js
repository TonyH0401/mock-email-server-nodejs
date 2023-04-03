const MONGO_DB = process.env.MONGO_DB;
const mongoose = require('mongoose');

async function connect() {
    let message = ''
    let result = {}
    await mongoose.connect(MONGO_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true
    })
        .then(() => {
            message = `Connect to ${MONGO_DB} - SUCCESS!`
            result = { success: true, code: mongoose.connection.readyState, message: message }
        })
        .catch((err) => {
            message = `Connect to ${MONGO_DB} - FAILED!`
            result = { success: false, code: mongoose.connection.readyState, message: message }
        })
    return result
}

module.exports = { connect }