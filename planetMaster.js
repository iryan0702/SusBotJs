const emoteMaster = require("./emoteMaster");
const mobDictionary = require("./mobDictionary");
const { MessageEmbed } = require('discord.js');

// list from https://www.wikiwand.com/en/Planets_in_science_fiction#/Planet_lists
const planetNames = ["Aegis", "Aldabra", "Aldebaran", "Altair", "Alternia", "Amel", "Antar", "Arieka", "Athena", "Athos", "Aurelia", "Avalon", "Azeroth", "Ballybran", "Belzagor", "Botany", "Bronson", "Celeschul", "Chiron", "Chorus", "Chthon", "Chu", "Cocoon", "Corneria", "Coronis", "Cyteen", "Darkover", "Darwin", "Death", "Demeter", "Deucalion", "Downbelow", "Dragon", "Droo"];

var discoveryChance = 0.5;
var discoveryChanceDecay = 0.5;

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


function displayPlanetDetailEmbed(planet, mode, channel){
  var authorText = "Scanned Planet";
  if(mode == "stored"){
    authorText = "Stored Planet";
  }
  var floraEmoteString = "";
  for(let i = 0; i < planet.flora.length; i++){
    if(i != 0){
      floraEmoteString += "\n";
    }
    if(planet.floraDiscovery[i]){
      let floraItem = emoteMaster.getEmote(planet.flora[i]);
      floraEmoteString += `${floraItem} ${planet.flora[i]}`
    }else{
      floraEmoteString += `**[?]**`
    }
    if(planet.floraRateDiscovery[i]){
      floraEmoteString += ` – Quantity: ${planet.floraRate[i]}\n\\> Drops: `;
    }else{
      floraEmoteString += ` – Quantity: **[?]**\n\\> Drops: `;
    }
    if(planet.floraDiscovery[i]){
      let floraDrops = mobDictionary.getDrops(planet.flora[i]);
      for(let j = 0; j < floraDrops.length; j++){
        let floraDropItem = emoteMaster.getEmote(floraDrops[j]);
        floraEmoteString += floraDropItem;
      }
    }else{
      floraEmoteString += `**[?]**`
    }
  }
  var faunaEmoteString = "";
  for(let i = 0; i < planet.fauna.length; i++){
    if(i != 0){
      faunaEmoteString += "\n";
    }
    if(planet.faunaDiscovery[i]){
      let faunaItem = emoteMaster.getEmote(planet.fauna[i]);
      faunaEmoteString += `${faunaItem} ${planet.fauna[i]}`
    }else{
      faunaEmoteString += `**[?]**`
    }
    if(planet.faunaRateDiscovery[i]){
      faunaEmoteString += ` – Quantity: ${planet.faunaRate[i]}\n\\> Drops: `;
    }else{
      faunaEmoteString += ` – Quantity: **[?]**\n\\> Drops: `;
    }
    if(planet.faunaDiscovery[i]){
      let faunaDrops = mobDictionary.getDrops(planet.fauna[i]);
      for(let j = 0; j < faunaDrops.length; j++){
        let faunaDropItem = emoteMaster.getEmote(faunaDrops[j]);
        faunaEmoteString += faunaDropItem;
      }
    }else{
      faunaEmoteString += `**[?]**`
    }
  }
  var planetEmbed = new MessageEmbed()
  .setColor(planet.embedColor)
  .setTitle(`${planet.name}`)
  .setAuthor('Scanned Planet', 'https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg')
  .setDescription(`A ${planet.descriptor} Type-1 planet with basic resources.\n*Average Temperature:* **${planet.temperature}°C**\n*Atmospheric pressure:* **${planet.atmospheres} atm**`)
  .setThumbnail('https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg')
  .addFields(
    { name: `**Planet Flora:**`, value: `${floraEmoteString}` },
    { name: `**Planet Fauna:**`, value: `${faunaEmoteString}` },
    { name: `**Underground Resources:**`, value: `${emoteMaster.getEmote("Stone")}\n(Type-1 planets do not contain precious metals.)` }
  );

  if(planet.specials.length > 0){
    var specialsField;
    specialsDescription = "";
    for(let i = 0; i < planet.specials.length; i++){
      if(i != 0){
        specialsDescription += "\n";
      }
      specialsDescription += getSpecialsDescription(planet.specials[i]);
    }

    specialsField = { name: `**Special Attributes:**`, value: `${specialsDescription} ` };
    planetEmbed.addFields(specialsField);
  }

  if(mode == "scanned"){
    planetEmbed.setFooter('Store a planet into your database with "planets add"');
  }

  channel.send({ embeds: [planetEmbed] });
}


function displayPlanetsSummaryEmbed(user, mode, channel){
  if(mode == "scanned"){
    var planetsList = user.scannedPlanets;

    if(planetsList.length > 0){
      var planetsEmbed = new MessageEmbed()
      .setColor("#bb0000")
      .setTitle(`:satellite: Scanned Planets`)
      .setAuthor(`${user.username}'s Scanned Planets`, 'https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg')
      .setDescription("A list of planets from your previous scan.\nSee a planet's details with `planets detail [name]`")
      .setThumbnail('https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg');

      for(let i = 0; i < planetsList.length; i++){
        let planet = planetsList[i];
        let dropsDescription = "";
        let planetName = planet.name;

        for(let j = 0; j < planet.flora.length; j++){
          if(planet.floraDiscovery[j]){
            dropsDescription += emoteMaster.getEmote(planet.flora[j]);
          }else{
            dropsDescription += "[?]";
          }
        }
        for(let j = 0; j < planet.fauna.length; j++){
          if(planet.faunaDiscovery[j]){
            dropsDescription += emoteMaster.getEmote(planet.fauna[j]);
          }else{
            dropsDescription += "[?]";
          }
        }
        if(planet.specials.length > 0){
          dropsDescription += "\n";
          for(let k = 0; k < planet.specials.length; k++){
            if(k != 0){
              dropsDescription += " ";
            }
            dropsDescription += " " + getSpecialsDescription(planet.specials[k], true);
          }
        }
        
        specialsField = { name: `**${planetName}**`, value: `Known resources: ${dropsDescription}\n` };

        planetsEmbed.addFields(specialsField);
      }
      planetsEmbed.setFooter('Scan for new planets with "scanner scan"');

      channel.send({ embeds: [planetsEmbed] });
    }else{
      var planetsEmbed = new MessageEmbed()
      .setColor("#bb0000")
      .setTitle(`:satellite: Scanned Planets`)
      .setAuthor(`${user.username}'s Scanned Planets`, 'https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg')
      .setDescription("You haven't scanned any planets!\nUse `scanner scan` to start!")
      .setThumbnail('https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg');

      channel.send({ embeds: [planetsEmbed] });
    }
  }else if(mode == "stored"){
    var planetsList = user.storedPlanets;

    if(planetsList.length > 0){
      var planetsEmbed = new MessageEmbed()
      .setColor("#bb0000")
      .setTitle(`:floppy_disk: Stored Planets (${planetsList.length}/${user.maxPlanetStorage})`)
      .setAuthor(`${user.username}'s Planet Database`, 'https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg')
      .setDescription("A list of planets in your database!")
      .setThumbnail('https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg');

      for(let i = 0; i < planetsList.length; i++){
        let planet = planetsList[i];
        let dropsDescription = "";
        let planetName = planet.name;

        for(let j = 0; j < planet.flora.length; j++){
          if(planet.floraDiscovery[j]){
            dropsDescription += emoteMaster.getEmote(planet.flora[j]);
          }else{
            dropsDescription += "[?]";
          }
        }
        for(let j = 0; j < planet.fauna.length; j++){
          if(planet.faunaDiscovery[j]){
            dropsDescription += emoteMaster.getEmote(planet.fauna[j]);
          }else{
            dropsDescription += "[?]";
          }
        }
        if(planet.specials.length > 0){
          dropsDescription += "\n";
          for(let k = 0; k < planet.specials.length; k++){
            if(k != 0){
              dropsDescription += " ";
            }
            dropsDescription += " " + getSpecialsDescription(planet.specials[k], true);
          }
        }
        
        specialsField = { name: `**${planetName}**`, value: `Known resources: ${dropsDescription}\n` };

        planetsEmbed.addFields(specialsField);
      }
      planetsEmbed.setFooter('See details with "planets details [name]"!');

      channel.send({ embeds: [planetsEmbed] });
    }else{
      var planetsEmbed = new MessageEmbed()
      .setColor("#bb0000")
      .setTitle(`:floppy_disk: Stored Planets (0/${user.maxPlanetStorage})`)
      .setAuthor(`${user.username}'s Planet Database`, 'https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg')
      .setDescription("You haven't stored any planets!\nUse `planets add [name]` to add a planet from your scan!")
      .setThumbnail('https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg');

      channel.send({ embeds: [planetsEmbed] });
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
exports.displayPlanetsSummaryEmbed = displayPlanetsSummaryEmbed;
exports.displayPlanetDetailEmbed = displayPlanetDetailEmbed;
exports.generatePlanet = generatePlanet;