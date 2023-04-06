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
        blocked_user: [{ type: Schema.Types.ObjectId, ref: 'AccountModel' }],
        blocked_user_invs: [{ type: Schema.Types.ObjectId, ref: 'AccountModel' }],
        is_validated: { type: Boolean, default: false },
        two_auth: { type: Boolean, default: false },
        simple_view: { type: Boolean, default: true },
        // question: [
        //     {
        //         question_1: {type: String, default: "What is your pet's name?"},
        //         "What is your pet's name?": { type: String, require: true }
        //     },
        //     {
        //         question_2: "What was your nickname when you were young?",
        //         answer_2: { type: String, require: true }
        //     },
        //     {
        //         question_3: "What is your favourite food?",
        //         answer_3: { type: String, require: true }
        //     },
        //     {
        //         question_4: "What is your high school teacher's name?",
        //         answer_4: { type: String, require: true }
        //     }
        // ]
        // is_enable: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('AccountModel', AccountModel);