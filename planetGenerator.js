const mobDictionary = require("./mobDictionary");

// list from https://www.wikiwand.com/en/Planets_in_science_fiction#/Planet_lists
const planetNames = ["Aegis", "Aldabra", "Aldebaran", "Altair", "Alternia", "Amel", "Antar", "Arieka", "Athena", "Athos", "Aurelia", "Avalon", "Azeroth", "Ballybran", "Belzagor", "Botany", "Bronson", "Celeschul", "Chiron", "Chorus", "Chthon", "Chu", "Cocoon", "Corneria", "Coronis", "Cyteen", "Darkover", "Darwin", "Death", "Demeter", "Deucalion", "Downbelow", "Dragon's Egg", "Droo"];

var discoveryChance = 0.9;
var discoveryChanceDecay = 0.7;

function generatePlanet(user){
  var planet = {};
  planet.type = 1;

  do{
    planet.name = planetNames[Math.floor(Math.random() * planetNames.length)];

    var duplicate = false;
    for(let i = 0; i < user.scannedPlanets.length; i++){
      if(user.scannedPlanets[i].name == planet.name){
        duplicate = true;
        continue;
      }
    }
    for(let i = 0; i < user.storedPlanets.length; i++){
      if(user.storedPlanets[i].name == planet.name){
        duplicate = true;
        continue;
      }
    }
  }while(duplicate);

  planet.temperature = Math.floor(Math.random()*101) - 20;
  planet.atmospheres = Math.floor((0.01+Math.random()*Math.random())*200)/10;
  planet.flora = mobDictionary.getRandomTier1Floras(Math.ceil(Math.random()*2));
  planet.fauna = mobDictionary.getRandomTier1Faunas(Math.max(1,Math.floor(Math.random()*2) + 2 - planet.flora.length));
  planet.floraRate = [];
  planet.faunaRate = [];
  planet.flora.forEach((e) => {planet.floraRate.push(Math.floor(Math.random()*25.1)/10+0.5)})
  planet.fauna.forEach((e) => {planet.faunaRate.push(Math.floor(Math.random()*15.1)/10+0.5)})

  planet.specials = [];
  setPlanetSpecials(planet, user, 0.8);
  setPlanetDescriptor(planet);

  // set discovery status from scan, represented as arrays of booleans, 1 = discovered
  discoveryChance = 0.9;
  
  planet.floraDiscovery = [];
  planet.faunaDiscovery = [];  
  planet.floraRateDiscovery = [];
  planet.faunaRateDiscovery = [];
  for(let i = 0; i < planet.flora.length; i++){
    planet.floraRateDiscovery.push(getDiscovery());
  }
  for(let i = 0; i < planet.fauna.length; i++){
    planet.faunaRateDiscovery.push(getDiscovery());
  }
  for(let i = 0; i < planet.flora.length; i++){
    planet.floraDiscovery.push(getDiscovery());
  }
  for(let i = 0; i < planet.fauna.length; i++){
    planet.faunaDiscovery.push(getDiscovery());
  }

  return planet;
}

function getDiscovery(){
  let discovered = Math.random() < discoveryChance;
  if(discovered){
    discoveryChance *= discoveryChanceDecay;
  }
  return discovered;
}

function setPlanetSpecials(planet, user, specialsChance){
  if(Math.random() >= specialsChance){
    return;
  }

  switch(Math.floor(Math.random() * 5)){
    case 0:
      specialAdd(planet, "Poisonous");
      break;
    case 1:
      if(planet.atmospheres >= 5){
        specialAdd(planet, "High Pressure");
      }
      break;
    case 2:
      planet.temperature = Math.floor(Math.random()*50) - 121;
      specialAdd(planet, "Frosted");
      break;
    case 3:
      if(planet.fauna.includes("Rock Squids") || planet.fauna.length == 1){
        planet.fauna = ["Rock Squids"];
        planet.faunaRate = [(Math.floor(Math.random()*15.1+32)/10)];
        specialAdd(planet, "Oceanic");
      }
      break;
    case 4:
      specialAdd(planet, "Ruinous");
      break;
    default:
      break;
  }

  setPlanetSpecials(planet, user, specialsChance/2);
}

function setPlanetDescriptor(planet){
  planet.descriptor = "very normal";
  planet.embedColor = "#919191";
  if(planet.specials.includes("Poisonous")){
    planet.descriptor = "dangerous";
    planet.embedColor = "#3b9641";
  }else if(planet.specials.includes("High Pressure")){
    planet.descriptor = "dense";
    planet.embedColor = "#7a7869";
  }else if(planet.specials.includes("Frosted")){
    planet.descriptor = "chilling";
    planet.embedColor = "#70deff";
  }else if(planet.specials.includes("Oceanic")){
    planet.descriptor = "mostly ocean";
    planet.embedColor = "#375fcc";
  }else if(planet.specials.includes("Ruinous")){
    planet.descriptor = "ruinous";
    planet.embedColor = "#d4bb72";
  }else{
    for(let i = 0; i < 3; i++){
      switch(Math.floor(Math.random() * 5)){
        case 0:
          if(planet.temperature <= -10){
            planet.descriptor = "cold";
            planet.embedColor = "#6ed1ff";
          }
          break;
        case 1:
          if(planet.temperature >= 60){
            planet.descriptor = "sorching";
            planet.embedColor = "#f5763b";
          }
          break;
        case 2:
          if(Math.random() < 0.3){
            planet.descriptor = "cloudy";
            planet.embedColor = "#ebf6f7";
          }
          break;
        case 3:
          if(Math.random() < 0.3){
            planet.descriptor = "mountainous";
            planet.embedColor = "#7d7c77";
          }
          break;
        case 4:
          if(Math.random() < 0.3){
            planet.descriptor = "dry";
            planet.embedColor = "#f0dc78";
          }
          break;
        default:
          break;
      }
    }
  }
}

function getSpecialsDescription(special, shortened = false){
  switch(special){
    case "Poisonous":
      return shortened ? "[POISONOUS]" : "**[POISONOUS]** The poisonous flora must be thrown away at maximum yields.";
    case "High Pressure":
      return shortened ? "[HIGH PRESSURE]" : "**[HIGH PRESSURE]** The pressure weakens motion and lengthens collection cooldowns.";
    case "Frosted":
      return shortened ? "[FROSTED]" : "**[FROSTED]** The extreme cold reduces all fauna yields.";
    case "Oceanic":
      return shortened ? "[OCEANIC]" : "**[OCEANIC]** The planet harbors only sea creatures at high quantities.";
    case "Ruinous":
      return shortened ? "[RUINOUS]" : "**[RUINOUS]** The artifacts left by ancient civilizations are buried underground.";
    default:
      return "ERROR";
  }
  return "ERROR";
}

function specialAdd(planet, special){
  if(planet.specials.includes(special)){
    return;
  }else{
    planet.specials.push(special);
  }
}

exports.getSpecialsDescription = getSpecialsDescription;
exports.generatePlanet = generatePlanet;