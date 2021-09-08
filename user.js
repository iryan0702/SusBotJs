const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  lastUsername: { // the username of the user since the last getUser(), should only be used for debugging
    type: String
  },
  sus: {
    type: Boolean,
    default: false
  },
  credits: {
    type: Number,
    default: 0
  },
  listenMode: {
    type: String,
    default: "none"
  },
  /// minigame variables
  gameHardMode: {
    type: Boolean,
    default: false
  },
  matchGameItem: { //correct answer
    type: String,
    default: "none"
  },
  matchGameStartTime: {
    type: Number
  },
  matchGameInvalidAnswers: { //num. of invalid answers from player, exit game after 3
    type: Number
  },
  fitGameAnswer1: {
    type: String
  },
  fitGameAnswer2: {
    type: String
  },
  fitGameAnswer3: {
    type: String
  },
  fitGameStartTime: {
    type: Number
  },
  fitGameInvalidAnswers: { //num. of invalid answers from player, exit game after 3
    type: Number
  }, /// give command memory
  giveTargetUserId: {
    type: String
  }, 
  giveAmount: {
    type: Number
  }, 
  credits: {
    type: Number,
    default: 0
  }, 
  lastWorkTime: {
    type: Number,
    default: 0
  }, 
  workCollectionPower: {
    type: Number,
    default: 1
  }
}, {timestamps: true})

const User = mongoose.model("User", userSchema);
module.exports = User;