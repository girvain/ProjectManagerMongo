var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

var UserSchema = new mongoose.Schema({
  name: {
    type: String
    //required: true
  },
  description: {
    type: String
    //required: true,
  },
  milestones: [
    {
      title: {
        type: String
        //required: true,
        //unique: true
      },
      description: {
        type: String
      },
      due_date: {
        type: String
      },
      completeDate: {
        type: String
      }
    }
  ],
  members: [
    {
      unique: true,
      type: String
    }
  ]
});
var Project = mongoose.model("Project", UserSchema);
module.exports = Project;
