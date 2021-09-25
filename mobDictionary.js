const tier1Flora = ["Trigs", "Meatberries", "Lognuts", "Stonefruits", "Threadwood"];
const tier1Fauna = ["Firrets", "Worves", "Kindlings", "String Snakes", "Rock Squids"];
const resources = ["Stone", "Cloth", "Wood", "Food"];

const emoteMaster = require("./emoteMaster");

function getDrops(mobId){
  switch(mobId){
    case "Trigs":
      return ["Wood"];
      break;
    case "Meatberries":
      return ["Food"];
      break;
    case "Lognuts":
      return ["Wood", "Food"];
      break;
    case "Stonefruits":
      return ["Stone", "Food"];
      break;
    case "Threadwood":
      return ["Wood", "Cloth"];
      break;

    case "Firrets":
      return ["Wood", "Cloth"];
      break;
    case "Worves":
      return ["Cloth"];
      break;
    case "Kindlings":
      return ["Wood"];
      break;
    case "String Snakes":
      return ["Cloth", "Food"];
      break;
    case "Rock Squids":
      return ["Stone", "Food"];
      break;
  }
  return [];
}

function getRandomTier1Floras(amount){
  shuffle(tier1Flora);
  return tier1Flora.slice(0,Math.min(tier1Flora.length, amount));
}

function getRandomTier1Faunas(amount){
  shuffle(tier1Fauna);
  return tier1Fauna.slice(0,Math.min(tier1Fauna.length, amount));
}

//Knuth Shuffle from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

exports.getDrops = getDrops;
exports.getRandomTier1Floras = getRandomTier1Floras;
exports.getRandomTier1Faunas = getRandomTier1Faunas;