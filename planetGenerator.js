const mobDictionary = require("./mobDictionary");

// list from https://www.wikiwand.com/en/Planets_in_science_fiction#/Planet_lists
const planetNames = ["Aegis", "Aldabra", "Aldebaran", "Altair", "Alternia", "Amel", "Antar", "Arieka", "Athena", "Athos", "Aurelia", "Avalon", "Azeroth", "Ballybran", "Belzagor", "Botany", "Bronson", "Celeschul", "Chiron", "Chorus", "Chthon", "Chu", "Cocoon", "Corneria", "Coronis", "Cyteen"];

const descriptors = ["barren", "dusty", "cloudy", "wet", "dry", "flourishing", "green", "lively"];

function generatePlanet(scannerTier, scannerLevel){
  var planet = {};
  planet.type = 1;
  planet.name = planetNames[Math.floor(Math.random() * planetNames.length)];
  planet.temperature = Math.floor(Math.random()*101) - 50;
  planet.atmospheres = Math.floor(Math.random()*10);
  planet.descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
  planet.flora = mobDictionary.getRandomTier1Floras(Math.ceil(Math.random()*2));
  planet.fauna = mobDictionary.getRandomTier1Faunas(Math.ceil(Math.random()*2));

  return planet;
}

exports.generatePlanet = generatePlanet;