const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const AccountModel = new Schema(
    {
        first_name: { type: String, require: true },
        last_name: { type: String, require: true },
        gender: { type: String, require: true },
        birthday: { type: Date, require: true },
        email: { type: String, require: true, unique: true },
        password: { type: String, require: true },
        phone_number: { type: String, require: true, unique: true },
        blocked_user: [{ type: String }],
        blocked_user_invs: [{ type: String }],
        is_validated: { type: Boolean, default: false },
        two_auth: { type: Boolean, default: false },
        simple_view: { type: Boolean, default: true },
        question: {
            pet_name: String,
            nickname: String,
            fav_food: String
        }
        // is_enable: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('AccountModel', AccountModel);