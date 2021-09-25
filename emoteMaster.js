//T1 flora
var trigsEmote, meatberriesEmote, lognutsEmote, stonefruitsEmote, threadwoodEmote;
//T1 fauna
var firretsEmote, worvesEmote, kindlingsEmote, stringSnakesEmote, rockSquidsEmote;
//T1 Resources
var stoneEmote, clothEmote, woodEmote, foodEmote;

function load(client){
  stoneEmote = client.emojis.cache.get("885488434112786452").toString();
  clothEmote = client.emojis.cache.get("885488433798193152").toString();
  woodEmote = client.emojis.cache.get("885488434133733386").toString();
  foodEmote = client.emojis.cache.get("885488434343456809").toString();

  trigsEmote = client.emojis.cache.get("885488433911447602").toString();
  meatberriesEmote = client.emojis.cache.get("885488434179895336").toString();
  lognutsEmote = client.emojis.cache.get("885488433416527913").toString();
  stonefruitsEmote = client.emojis.cache.get("885488434104377354").toString();
  threadwoodEmote = client.emojis.cache.get("885488434553159690").toString();

  firretsEmote = client.emojis.cache.get("885488433332633622").toString();
  worvesEmote = client.emojis.cache.get("885488433596874792").toString();
  kindlingsEmote = client.emojis.cache.get("885488434188263424").toString();
  stringSnakesEmote = client.emojis.cache.get("885488433986936832").toString();
  rockSquidsEmote = client.emojis.cache.get("885488434217644132").toString();
}

function getEmote(mobId){
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

exports.load = load;
exports.getEmote = getEmote;