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
//      unique: true, // this had to come out because mongo checks all array values for uniqueness just like a object member like email in the user.js
      type: String
    }
  ]
});
var Project = mongoose.model("Project", UserSchema);
module.exports = Project;
