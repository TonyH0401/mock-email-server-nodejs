const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const EmailModel = new Schema(
    {
        sender: { type: String, required: true },
        subject: String,
        body: String,
        receiver: [{
            email: { type: String },
            is_read: { type: Boolean, default: false },
            is_star: { type: Boolean, default: false },
            is_delete: { type: Boolean, default: false }
            // is_spam: { type: Boolean, default: false }
        }],
        label: { type: Schema.Types.ObjectId, ref: 'LabelModel' },
        is_star_sender: { type: Boolean, default: false },
        is_delete_sender: { type: Boolean, default: false },
        email_type: { type: String, default: "draft" }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('EmailModel', EmailModel);