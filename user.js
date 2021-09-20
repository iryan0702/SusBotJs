const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  username: { // the username of the user since the last getUser()
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
  matchGameStartTime: Number,
  matchGameInvalidAnswers: Number, //num. of invalid answers from player, exit game after 3
  fitGameAnswer1: String,
  fitGameAnswer2: String,
  fitGameAnswer3: String,
  fitGameStartTime: Number,
  fitGameInvalidAnswers: Number, //num. of invalid answers from player, exit game after 3
  /// give command memory
  giveTargetUserId: String,
  giveAmount: Number,
  // Space game memory
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
  }, 
  lastScanTime: {
    type: Number,
    default: 0
  }, 
  scannedPlanets: {
    type: Array,
    default: []
  }, 
  storedPlanets: {
    type: Array,
    default: []
  }, 
  maxPlanetStorage: {
    type: Number,
    default: 3
  }, 
  currentLocation: {
    type: String,
    default: "nowhere"
  }, 
  sourceLocation: String, 
  targetLocation: String,
  journeyStartTime: {
    type: Number,
    default: 0
  },
  journeying: {
    type: Boolean,
    default: false
  },
  journeySteps: {
    type: Array,
    default: []
  },
  engineSpeed: {
    type: Number,
    default: 10
  }
}, {timestamps: true})

const User = mongoose.model("User", userSchema);
module.exports = User;