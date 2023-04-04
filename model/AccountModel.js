const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const AccountModel = new Schema(
    {
        // first_name: { type: String, default: "John" },
        // last_name: { type: String, default: "Smith" },
        // username: { type: String, default: "example@username", unique: true },
        // password: { type: String, default: "123" },
        // phone_number: { type: String, default: "0000" },

        first_name: { type: String, require: true },
        last_name: { type: String, require: true },
        username: { type: String, require: true, unique: true },
        password: { type: String, require: true },
        phone_number: { type: String, require: true },
        date_join: { type: Date, default: Date.now },
        blocked_user: [{ type: Schema.Types.ObjectId, ref: 'AccountModel' }],
        blocked_user_invs: [{ type: Schema.Types.ObjectId, ref: 'AccountModel' }],
        is_available: { type: Boolean, default: true },
        two_auth: { type: Boolean, default: false },
        simple_view: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('AccountModel', AccountModel);