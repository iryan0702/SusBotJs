const tier1Flora = ["Trigs", "Meatberries", "Lognuts", "Stonefruits", "Threadwood"];
var trigsEmote, meatberriesEmote, lognutsEmote, stonefruitsEmote, threadwoodEmote;
const tier1Fauna = ["Firrets", "Worves", "Kindlings", "String Snakes", "Rock Squids"];
var firretsEmote, worvesEmote, kindlingsEmote, stringSnakesEmote, rockSquidsEmote;

const tier1Enviornment = ["Island", "Desert", "Mountain"];
const tier1Underground = ["Gravel"];


const resources = ["Stone", "Cloth", "Wood", "Food"];
var stoneEmote, clothEmote, woodEmote, foodEmote;

function load(client){
  stoneEmote = client.emojis.cache.get("885488434112786452");
  clothEmote = client.emojis.cache.get("885488433798193152");
  woodEmote = client.emojis.cache.get("885488434133733386");
  foodEmote = client.emojis.cache.get("885488434343456809");

  trigsEmote = client.emojis.cache.get("885488433911447602");
  meatberriesEmote = client.emojis.cache.get("885488434179895336");
  lognutsEmote = client.emojis.cache.get("885488433416527913");
  stonefruitsEmote = client.emojis.cache.get("885488434104377354");
  threadwoodEmote = client.emojis.cache.get("885488434553159690");

  firretsEmote = client.emojis.cache.get("885488433332633622");
  worvesEmote = client.emojis.cache.get("885488433596874792");
  kindlingsEmote = client.emojis.cache.get("885488434188263424");
  stringSnakesEmote = client.emojis.cache.get("885488433986936832");
  rockSquidsEmote = client.emojis.cache.get("885488434217644132");
}

function getEmoji(mobId){
  switch(mobId){
    case "Stone":
      return stoneEmote;
      break;
    case "Cloth":
      return clothEmote;
      break;
    case "Wood":
      return woodEmote;
      break;
    case "Food":
      return foodEmote;
      break;

    case "Trigs":
      return trigsEmote;
      break;
    case "Meatberries":
      return meatberriesEmote;
      break;
    case "Lognuts":
      return lognutsEmote;
      break;
    case "Stonefruits":
      return stonefruitsEmote;
      break;
    case "Threadwood":
      return threadwoodEmote;
      break;

    case "Firrets":
      return firretsEmote;
      break;
    case "Worves":
      return worvesEmote;
      break;
    case "Kindlings":
      return kindlingsEmote;
      break;
    case "String Snakes":
      return stringSnakesEmote;
      break;
    case "Rock Squids":
      return rockSquidsEmote;
      break;
  }
  return rockSquidsEmote;
}

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

exports.load = load;
exports.getEmoji = getEmoji;
exports.getDrops = getDrops;
exports.getRandomTier1Floras = getRandomTier1Floras;
exports.getRandomTier1Faunas = getRandomTier1Faunas;