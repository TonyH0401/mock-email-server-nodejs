const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const LabelModel = new Schema(
    {
        label_name: { type: String, unique: true, require: true },
        is_enable: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('LabelModel', LabelModel);