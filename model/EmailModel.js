const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const EmailModel = new Schema(
    {
        sender: { type: String, required: true },
        subject: String,
        body: String,
        receiver: [{
            username: { type: String },
            is_read: { type: Boolean, default: false },
            is_star: { type: Boolean, default: false },
            is_delete: { type: Boolean, default: false }
        }],
        is_star: { type: Boolean, default: false },
        normal_email: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('EmailModel', EmailModel);