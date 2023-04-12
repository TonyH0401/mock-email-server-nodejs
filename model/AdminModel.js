const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const AdminModel = new Schema(
    {
        username: { type: String, require: true, unique: true },
        password: { type: String, require: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('AdminModel', AdminModel);