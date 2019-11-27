var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
var uniqueValidator = require('mongoose-unique-validator');

var TalkSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    speaker: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    tags: [
        {
            type: Object
        }
    ],
    ratings: [
        {
            type: Object
        }
    ]
});
//TalkSchema.plugin(uniqueValidator);

var Talk = mongoose.model("Talk", TalkSchema);
module.exports = Talk;
