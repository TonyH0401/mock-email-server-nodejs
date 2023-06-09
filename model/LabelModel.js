const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const LabelModel = new Schema(
    {
        email: { type: String, require: true },
        label_name: { type: String, require: true },
        is_enable: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('LabelModel', LabelModel);