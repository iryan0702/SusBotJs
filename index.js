//require('dotenv').config();
const keepAlive = require('./server')

const { Client, Intents } = require('discord.js');

const Database = require("@replit/database");
const mongoose = require("mongoose");
const UserM = require("./user");

const token = process.env.DISCORDJS_BOT_TOKEN;
const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
const client = new Client({ intents });
const db = new Database();

const { MessageEmbed } = require('discord.js');

const emoteMaster = require("./emoteMaster");
const mobDictionary = require("./mobDictionary");
const planetMaster = require("./planetMaster");

// mongoDB connection string
const databaseLink = "mongodb+srv://iryan0702:tempInsecurePassword@susbotjs.6rrp1.mongodb.net/SusBotJs?retryWrites=true&w=majority";
var databaseLoaded = false;
mongoose.connect(databaseLink)
  .then((result) => {
    console.log("connected to database!")
    databaseLoaded = true;
  })
  .catch((error) => console.log(`error: ${error}`));

const prefix = "sus ";
const devId = '95070190370299904';

// constant
const matchGameItems = ["salad","taco","sandwich","pizza","fries","hamburger","hotdog","bacon","waffle","pancakes","cheese","bread","carrot","eggplant","avocado","broccoli","corn","tomato","strawberry","peach","pineapple","lemon","tangerine","apple","pear"];
const matchGameItemsHard = ["banana","watermelon","grapes","coconut","kiwi","garlic","onion","potato","egg","burrito","cookie","beer","tea","candy","milk","doughnut"];

const workoutList = ["bench press", "squats", "inclined press", "declined press", "pushups", "shrugs", "dips", "pullups", "lateral fly", "chest fly", "crunches", "inverted fly", "bicep curls", "hammer curls", "dead lifts", "overhead press", "overhead tricep"];
const workoutReps = ["5", "8", "10", "12", "15"];
const workoutSets = ["3", "3", "3", "3", "4", "5"];

// user object definition
var User = function (id) {
    this.id = id;
    this.sus = false;
    this.listenMode = "none";

    this.gameHardMode = false;

    this.matchGameItem = "none";
    this.matchGameStartTime;
    this.matchGameInvalidAnswers;

    this.fitGameAnswer1 = 0;
    this.fitGameAnswer2 = 0;
    this.fitGameStartTime;
    this.fitGameInvalidAnswers;

    this.giveTargetUserId;
    this.giveAmount;

    setUndefinedUserVariables(this);
};

function setUndefinedUserVariables(user){
  if(user.version === undefined || user.version != 3){
    console.log(`user version was ${user.version}! updating!`)
    user.version = 3;
    if(user.credits === undefined){
      user.credits = 0;
    }
    if(user.lastWorkTime === undefined){
      user.lastWorkTime = 0;
    }
    if(user.workCollectionPower === undefined){
      user.workCollectionPower = 1;
    }
  }
}

db.get("users").then(users => {
  if (!users) {
    db.set("users", {})
  }
})

db.get("matchLeaderboard").then(matchLeaderboard => {
  if (!matchLeaderboard) {
    db.set("matchLeaderboard", {})
  }
})

db.get("matchLeaderboardHard").then(matchLeaderboardHard => {
  if (!matchLeaderboardHard) {
    db.set("matchLeaderboardHard", {})
  }
})

db.get("fitLeaderboard").then(fitLeaderboard => {
  if (!fitLeaderboard) {
    db.set("fitLeaderboard", {})
  }
})

db.get("fitLeaderboardHard").then(fitLeaderboardHard => {
  if (!fitLeaderboardHard) {
    db.set("fitLeaderboardHard", {})
  }
})

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in!`);
    emoteMaster.load(client);

    client.user.setActivity('check commands with Sus help!', { type: 'PLAYING' })
});

client.on('messageCreate', async message => {
  //log all messages (debug), comment out when unused to protect privacy
  //console.log(`${message.author.tag} sent a message: ${message.content} (id: ${message.author.id})`);

  // stop mischievious individual from botting
  // if(message.author.id == '92855204713607168'){
  //   message.channel.send(`Sorry, you have been put in sussy jail for botting!`) 
  // }

  // if database is not loaded, do not process any message
  if(!databaseLoaded){
    return;
  }

  //do not read bot/own messages
  if(message.author.bot){
    return;
  }
  
  //unless necessary, all message checks should use cleaned up content (ignore caps, extra spaces)
  const content = message.content.toLowerCase().replace(/\s+/g, ' ').trim();
  const args = content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  //get all stored user properties of message sender (or create a new user object if none exist) from database
  const user = await getUser(message.author.id);
  user.username = message.author.username;

  //if the user has a special listenMode , respond accordingly to the message
  //if appropriate, return and do not process the message as a normal command
  var listenContinue = await listenModeResponses(user, message);
  if(listenContinue){
    user.save();
    return;
  }

  //////
  /// responses that do not trigger on command prefix:
  //////

  // simple reply (used to check if bot is up)
  if(content == "sus"){
    message.channel.send("SUS");
    return;
  }

  if(content.includes("sad")){
    message.channel.send("Cheer up! Being sad is hella sussy!");
  }

  //////
  /// prefixed commands:
  //////
  if (content.startsWith(prefix)){
    // console.log(`command ${command}`);
    // console.log(`args ${args}`);
    if(command == 'check'){
      if(user.sus){
          message.channel.send("You are sussy!");
      }else{
          message.channel.send("You are not sussy!");
      }
    }

    else if(command == 'vent'){
      user.sus = true;
      message.channel.send("You are now sussy!");
    }

    else if(command == 'unvent'){
      user.sus = false;
      message.channel.send("You are now not sussy!");
    }

    else if(command == 'p' || command == 'profile'){
      message.channel.send(`You have ${user.credits} credits!`);
    }

    else if(command == 'give'){
      var targetUser = getUserFromMention(args[0]);
      console.log(targetUser);
      if(targetUser){
        var giveAmount = parseInt(args[1], 10);
        console.log(giveAmount);
        if(!isNaN(giveAmount) && giveAmount == parseFloat(args[1])){
          if(giveAmount <= user.credits){
            user.giveTargetUserId = targetUser.id;
            user.giveAmount = giveAmount;
            message.channel.send(`You are about to give ${targetUser.username} ${user.giveAmount} credits! Are you sure? (type exactly "YES" to confirm)`);
            user.listenMode = "giveConfirmation";
          }else if(giveAmount < 0){
            message.channel.send("you can't give negative credits!");
          }else{
            message.channel.send("you don't have enough credits to give");
          }
        }else{
          message.channel.send("you gotta do `sus [user mention] [whole number amount]` bro");
        }
      }else{
        message.channel.send("you gotta do `sus [user mention] [whole number amount]` dude");
      }
    }

    else if(command == 'listen'){
      user.listenMode = 'reply';
      message.channel.send(`Listening to <@${message.author.id}>`);
    }
    
    else if(command == 'scanner' || command == 'sc'){
      if(args[0] == 'scan'){
        var scanCooldown = 60 * 60;
        var lastScan = (message.createdTimestamp - user.lastScanTime)/1000;
        if(lastScan > scanCooldown || user.id == devId){
          user.lastScanTime = message.createdTimestamp;
          user.scannedPlanets = [];
          user.scannedPlanets.push(planetMaster.generatePlanet(user));
          user.scannedPlanets.push(planetMaster.generatePlanet(user));

          planetMaster.displayPlanetsSummaryEmbed(user, "scanned", message.channel);
          
        }else{
          message.channel.send(`Your scanner is cooling down! Please wait ${(Math.floor((scanCooldown - lastScan)/60))} Minutes and ${Math.ceil((scanCooldown - lastScan)%60)} Seconds!\nUpgrade your scanner system to decrease this cooldown (not a feature yet).`);
        }
      }else if(args[0] == 'list'){
        planetMaster.displayPlanetsSummaryEmbed(user, "scanned", message.channel);
      }else{
        var scannerCommandInfo = new MessageEmbed()
          .setColor('#bb0000')
          .setTitle(":satellite: Scannner command:")
          .setDescription('`scanner scan`: scan for new planets!\n`scanner list`: get a list of planets from your last scan')
          .setFooter('Alias: "sc"');
        message.channel.send({ embeds: [scannerCommandInfo] });
      }
    }

    else if(command == 'planets' || command == 'planet' || command == 'pl'){
      if(args[0] == 'detail' || args[0] == 'details'){
        if(args[1]){
          for(let i = 0; i < user.scannedPlanets.length; i++){
            if(args[1].toLowerCase() == user.scannedPlanets[i].name.toLowerCase()){
              planetMaster.displayPlanetDetailEmbed(user.scannedPlanets[i], "scanned", message.channel);
              return;
            }
          }
          for(let i = 0; i < user.storedPlanets.length; i++){
            if(args[1].toLowerCase() == user.storedPlanets[i].name.toLowerCase()){
              planetMaster.displayPlanetDetailEmbed(user.storedPlanets[i], "stored", message.channel);
              return;
            }
          }
          message.channel.send("No planet with the name found?");
        }else{
          message.channel.send("Command: `planets detail [planet name]`");
        }
      }else if(args[0] == 'add'){
        if(args[1]){
          if(user.maxPlanetStorage <= user.storedPlanets.length){
            message.channel.send("You have too many planets in your database!\nRemove some with `planets remove [name]`");
          }else{
            var planetToAdd;
            for(let i = 0; i < user.scannedPlanets.length; i++){
              if(args[1].toLowerCase() == user.scannedPlanets[i].name.toLowerCase()){
                planetToAdd = user.scannedPlanets[i];
                break;
              }
            }
            if(planetToAdd){
              let alreadyAdded = false;
              for(let i = 0; i < user.storedPlanets.length; i++){
                if(args[1].toLowerCase() == user.storedPlanets[i].name.toLowerCase()){
                  alreadyAdded = true;
                  break;
                }
              }
              if(alreadyAdded){
                message.channel.send("That planet is already added!");
              }else{
                user.storedPlanets.push(planetToAdd);
                var addPlanetInfo = new MessageEmbed()
                  .setColor('#bb0000')
                  .setTitle(":ringed_planet: Added Planet:")
                  .setDescription(`Added ${planetToAdd.name} to your planet database!`)
                message.channel.send({ embeds: [addPlanetInfo] });
              }
            }else{
              message.channel.send("That planet is not in your scanned list!");
            }
          }
        }else{
          message.channel.send("Command: `planets add [planet name]`");
        }
      }else if(args[0] == 'remove'){
        if(args[1]){
          let i;
          for(i = 0; i < user.storedPlanets.length; i++){
            if(args[1].toLowerCase() == user.storedPlanets[i].name.toLowerCase()){
              break;
            }
          }
          if(i < user.storedPlanets.length){
            var removePlanetInfo = new MessageEmbed()
              .setColor('#bb0000')
              .setTitle(":ringed_planet: Removed Planet:")
              .setDescription(`Removed ${user.storedPlanets[i].name} from your planet database!`)
            message.channel.send({ embeds: [removePlanetInfo] });
            user.storedPlanets.splice(i, 1);
          }else{
            message.channel.send("That planet is not in your database!");
          }
        }else{
          message.channel.send("Command: `planets remove [planet name]`");
        }
      }else if(args[0] == 'list'){
        planetMaster.displayPlanetsSummaryEmbed(user, "stored", message.channel);
      }else{
        var planetCommandInfo = new MessageEmbed()
          .setColor('#bb0000')
          .setTitle(":ringed_planet: Planet command:")
          .setDescription('`planet details [name]`: get details about any scanned or stored planet\n`planet add [name]`: store a scanned planet in your database\n`planet remove [name]`: remove a planet from your database\n`planet list`: get a list of planets in your database')
          .setFooter('Alias: "pl"');
        message.channel.send({ embeds: [planetCommandInfo] });
      }
    }

    else if(command == 'ship'){
      var shipInfo = new MessageEmbed()
        .setColor('#bb0000')
        .setTitle(":rocket: Your ship:")
        .setAuthor(`${user.username}'s Ship`, 'https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg')
        .setDescription('`planet details [name]`: get details about any scanned or stored planet\n`planet add [name]`: store a scanned planet in your database\n`planet remove [name]`: remove a planet from your database\n`planet list`: get a list of planets in your database')
      message.channel.send({ embeds: [shipInfo] });
    }

    else if(command == 'journey' || command == 'jr'){
      if(args[0] == 'info'){
        if(user.journeying){
          let journeyProgress = updateJourneyLocation(user, message.createdTimestamp);
          let journeyDisplayString = getJourneyDisplayString(user, journeyProgress);

          var journeyTime = user.journeySteps.reduce((a, b) => a + b, 0)*user.journeyTimePerStep; //in mili
          var journeyTimeLeft = Math.max(0,Math.ceil((journeyTime+user.journeyStartTime-message.createdTimestamp)/1000));
          var journeySecond = journeyTimeLeft%60;
          var journeyMinute = (journeyTimeLeft-journeySecond)%3600;
          var journeyHour = journeyTimeLeft-journeyMinute-journeySecond;

          journeyHour /= 3600;
          journeyMinute /= 60;

          var travelInfo = new MessageEmbed()
            .setColor('#2e0045')
            .setTitle(":milky_way: Journey:")
            .setDescription(`Start: \`${user.sourceLocation.toLowerCase()}\`\n${journeyDisplayString}\nDestination: \`${user.targetLocation.toUpperCase()}\`\n\nCurrent location: \`${user.currentLocation}\`\nTime remaining: \`${journeyHour}h ${journeyMinute}m ${journeySecond}s\`\nYour journey is ${Math.floor(journeyProgress*10000)/100}% complete!`)
          message.channel.send({ embeds: [travelInfo] });

          if(journeyProgress >= 1){
            user.journeying = false;
            user.currentLocation = user.currentLocation.toLowerCase().trim();
            message.channel.send("Journey complete!");
          }
        }else{
          var travelInfo = new MessageEmbed()
            .setColor('#2e0045')
            .setTitle(":milky_way: Journey:")
            .setDescription(`--------------------:rocket:--------------------\n\nYou are currently at: \`${user.currentLocation.toLowerCase()}\``)
          message.channel.send({ embeds: [travelInfo] });
        }
      }else if(args[0] == 'start'){
        if(user.journeying){
          message.channel.send("You are already on a journey!\nUse `journey cancel` to cancel your current journey.");
        }else if(args[1]){
          if(args[1].match("^[a-zA-Z ]+$")){
            if(args[1].length < 2){
              message.channel.send("The destination name is too short!");
            }else if(args[1].length <= 12){
              var distanceArray = getDistanceArray(user.currentLocation, args[1]);
              var journeyTimePerStep = Math.ceil(60*60*1000/user.engineSpeed);
              user.journeyTimePerStep = journeyTimePerStep;
              user.journeySteps = distanceArray;
              var distance = distanceArray.reduce((a, b) => a + b, 0);
              var journeyTime = Math.ceil(distance*journeyTimePerStep/1000); //in seconds
              var journeySecond = journeyTime%60;
              var journeyMinute = (journeyTime-journeySecond)%3600;
              var journeyHour = journeyTime-journeyMinute-journeySecond;
              journeyHour /= 3600;
              journeyMinute /= 60;
              let journeyDisplayString = getJourneyDisplayString(user, 0);
              user.sourceLocation = user.currentLocation.trim();
              user.targetLocation = args[1].trim();
              var travelInfo = new MessageEmbed()
                .setColor('#2e0045')
                .setTitle(":milky_way: Journey:")
                .setDescription(`Start: \`${user.sourceLocation.toLowerCase()}\`\n${journeyDisplayString}\nDestination: \`${user.targetLocation.toUpperCase()}\`\n\nThe distance between \`${user.currentLocation.toLowerCase()}\` and \`${args[1].toUpperCase()}\` is **${distance}SU** (Space Units)\nYour engine speed is **${user.engineSpeed}SU/hr**\nThis journey will take \`${journeyHour}h ${journeyMinute}m ${journeySecond}s\`\n\nAre you sure you want to start this journey?\n\`"YES" to start.\``)
              message.channel.send({ embeds: [travelInfo] });
              user.listenMode = "journeyConfirmation";
            }else{
              message.channel.send("The destination name is too long!");
            }
          }else{
            message.channel.send("The destination name can only contain alphabets!");
          }
        }else{
          message.channel.send("Command: `journey start [target location]`");
        }
      }else if(args[0] == 'cancel'){
        if(user.journeying){
          updateJourneyLocation(user, message.createdTimestamp);
          user.journeying = false;
          user.currentLocation = user.currentLocation.toLowerCase().trim();
          var cancelInfo = new MessageEmbed()
            .setColor('#2e0045')
            .setTitle(":milky_way: Journey:")
            .setDescription(`Journey cancelled!`)
          message.channel.send({ embeds: [cancelInfo] });
        }else{
          message.channel.send("You are not currently on a journey!");
        }
      }else{
        var journeyCommandInfo = new MessageEmbed()
          .setColor('#2e0045')
          .setTitle(":milky_way: Journey command:")
          .setDescription('`journey start [name]`: start a journey to a new location!\n`journey cancel`: cancel your current journey\n`journey info`: see details on your current journey and location')
          .setFooter('Alias: "jr"');
        message.channel.send({ embeds: [journeyCommandInfo] });
      }
    }

    else if(command == 'work'){
      if(args[0] == "hard"){
        message.channel.send(`more like ur mum works hard lmao`);
      }else{
        var lastWork = (message.createdTimestamp - user.lastWorkTime)/1000;
        if(lastWork >= 60){
          var workMessage = "";
          user.lastWorkTime = message.createdTimestamp;
          var collectionPowerMultiplier = Math.min(Math.floor(lastWork/60), user.workCollectionPower);
          if(collectionPowerMultiplier > 1){
            workMessage += `You performed ${collectionPowerMultiplier} minutes worth of work!`;
          }
          var creditGain = 0;
          for(let i = 0; i < collectionPowerMultiplier; i++){
            creditGain += Math.floor(Math.random() * 3 + 1);
          }
          user.credits += creditGain;
          switch(Math.floor(Math.random() * 4)){
            case 3:
              workMessage += `\nYou took out some garbage and found ${creditGain} ship credits!`;
              break;
            case 2:
              workMessage += `\nYou rewired some panels and earned ${creditGain} ship credits!`;
              break;
            case 1:
              workMessage += `\nYou shot some asteroids and collected ${creditGain} ship credits!`;
              break;
            case 0:
            default:
              workMessage += `\nYou tinkered with the engine and earned ${creditGain} ship credits!`;
          }
          workMessage += `\nYou now have ${user.credits} credits!`;
          message.channel.send(workMessage);
        }else{
        message.channel.send(`There is nothing to do! Please wait ${parseInt(60 - lastWork, 10)} seconds!`);
        }
      }
    }

    else if(command == 'upgrades'){
      var workCollectionPowerPrice = parseInt(Math.pow(user.workCollectionPower,1.6),10);
      var helpEmbed = new MessageEmbed()
        .setColor('#bb0000')
        .setTitle('Upgrades')
        .setAuthor('Sus upgrades', 'https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
        .setDescription('list of upgrades:')
        .setThumbnail('https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
        .addFields(
          { name: `Work collection power lv ${user.workCollectionPower+1}: ${workCollectionPowerPrice} Creds`, value: `Increase your work collection power: whenever you work, get up to **${user.workCollectionPower+1}** minutes worth of work credits from the time since you last worked! \nid: \`WCPower\`` }
        )
        .setFooter('purchase with "sus buy". progress may be reset at any moment lol');

      message.channel.send({ embeds: [helpEmbed] });
    }

    else if(command == 'buy'){
      var workCollectionPowerPrice = parseInt(Math.pow(user.workCollectionPower,1.6),10);
      if(args[0] == "wcpower"){
        if(user.credits >= workCollectionPowerPrice){
          user.credits -= workCollectionPowerPrice;
          user.workCollectionPower++;
          message.channel.send(`Purchased work collection power +1!`);
        }else{
          message.channel.send(`You do not have enough credits!`);
        }
      }else{
          message.channel.send("What do you want to buy? Check out `sus upgrades` for options!");
      }
    }

    else if(command == 'gaming'){
      if(args[0] == 'match'){
        if(args[1] == 'hard'){
          user.gameHardMode = true;
        }else{
          user.gameHardMode = false;
        }
        var items = ["salad","taco","sandwich","pizza","fries","hamburger","hotdog","bacon","waffle","pancakes","cheese","bread","carrot","eggplant","avocado","broccoli","corn","tomato","strawberry","peach","pineapple","lemon","tangerine","apple","pear","salad","taco","sandwich","pizza","fries","hamburger","hotdog","bacon","waffle","pancakes","cheese","bread","carrot","eggplant","avocado","broccoli","corn","tomato","strawberry","peach","pineapple","lemon","tangerine","apple","pear"];
        var hardItems = ["banana","watermelon","grapes","coconut","kiwi","garlic","onion","potato","egg","burrito","cookie","beer","tea","candy","milk","doughnut","banana","watermelon","grapes","coconut","kiwi","garlic","onion","potato","egg","burrito","cookie","beer","tea","candy","milk","doughnut"];

        if(user.gameHardMode){
          items = items.concat(hardItems);
        }
        shuffle(items);

        user.matchGameStartTime = message.createdTimestamp;
        user.matchGameItem = items.pop();
        user.listenMode = "matchGame";
        user.matchGameInvalidAnswers = 0;
        console.log(`${message.author.tag} is playing the sus game! \n ~the answer is ${user.matchGameItem}~`);

        var gridSize = user.gameHardMode ? 9 : 7;
        var fieldText = "";
        for(let i = 0; i < gridSize*gridSize; i++){
          if(i != 0 && i % gridSize == 0){
            fieldText += "\n";
          }
          fieldText += ":" + items.pop() + ":";
        }

        var matchGameEmbed = new MessageEmbed()
          .setColor('#bb0000')
          .setTitle(user.gameHardMode ? 'Sussy game: match (HARD)' : 'Sussy game: match')
          .setAuthor('Sus gaming!', 'https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
          .setDescription('Type the name of the emote without a pair! (exactly the name of the emote)\n(`exit` to exit)')
          .setThumbnail('https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
          .addFields(
            { name: 'Sus check', value: fieldText}
          );
        message.channel.send({ embeds: [matchGameEmbed] });
      }else if(args[0] == 'fit'){
        var boardSize = 8;
        var pieceSize = 4;
        if(args[1] == 'hard'){
          user.gameHardMode = true;
          boardSize = 9;
          pieceSize = 5;
        }else{
          user.gameHardMode = false;
        }
        var items, answer, boardMatrix, pieceMatrix;
        var numbers = [0,1,2,3,4,5,6,7];
        var solvable = false;
        
        while(!solvable){
          items = [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7];
          var extraItems = [0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0];

          if(user.gameHardMode){
            items = items.concat(extraItems);
          }

          shuffle(items);

          boardMatrix = [];
          for(let i = 0; i < boardSize; i++) {
            boardMatrix[i] = [];
            for(let j = 0; j < boardSize; j++) {
              boardMatrix[i][j] = items[i*boardSize+j];
            }
          }

          for(let i = 0; i < 16; i++) {
            shuffle(numbers);
            answer = numbers.slice(0,user.gameHardMode ? 3:2);
            var maxd = boardSize - pieceSize + 1;
            var di = Math.floor(Math.random() * maxd);
            var dj = Math.floor(Math.random() * maxd);
            var numTiles = 0;
            pieceMatrix = []
            pieceColors = []
            for(let i = 0; i < pieceSize; i++) {
              pieceMatrix[i] = [];
              for(let j = 0; j < pieceSize; j++) {
                var boardVal = boardMatrix[i+di][j+dj];
                if(answer.includes(boardVal)){
                  if(Math.random()<0.8){
                    if(!(pieceColors.includes(boardVal))){
                      pieceColors.push(boardVal);
                    }
                    pieceMatrix[i][j] = 1;
                    numTiles++;
                  }else{
                    pieceMatrix[i][j] = 0;
                  }
                }else{
                  pieceMatrix[i][j] = 0;
                }
              }
            }

            // piece has too few colors, retry
            if((!user.gameHardMode && pieceColors.length <= 1)
            || (user.gameHardMode && pieceColors.length <= 2)){
              continue;
            }

            // too few/many tiles, retry
            //console.log(numTiles);
            if((!user.gameHardMode && numTiles < 5 || numTiles > 7)
            || (user.gameHardMode && numTiles < 7 || numTiles > 8)){
              continue;
            }

            // look for extra answers from all possible piece positions
            var extraAnswer = false;
            extraAnswerLoop:
              for(let i = 0; i < maxd; i++) {
                for(let j = 0; j < maxd; j++) {
                  //the correct answer is not an extra answer
                  if(i == di && j == dj){
                    continue;
                  }

                  //check the shape of the piece from the offset for two or less colors
                  var offsetColors = [];
                  for(let k = 0; k < pieceSize; k++) {
                    for(let l = 0; l < pieceSize; l++) {
                      if(pieceMatrix[k][l] == 1){
                        var tileColor = boardMatrix[i+k][j+l];
                        if(!(offsetColors.includes(tileColor))){
                          offsetColors.push(tileColor);
                        }
                      }
                    }
                  }

                  // if two or less colors appear, there is an extra answer
                  if((!user.gameHardMode && offsetColors.length <= 2)
                  || (user.gameHardMode && offsetColors.length <= 3)){
                    extraAnswer = true;
                    break extraAnswerLoop;
                  }
                }
              }

            // extraAnswer = retry
            if(extraAnswer){
              continue;
            }

            solvable = true;
            break;
          }
        }

        user.fitGameStartTime = message.createdTimestamp;
        var answerTranslation = ["red", "orange", "yellow", "green", "blue", "purple", "brown", "white"];
        user.fitGameAnswer1 = answerTranslation[answer[0]];
        user.fitGameAnswer2 = answerTranslation[answer[1]];
        user.fitGameAnswer3 = answerTranslation[answer[2]];
        //user.fitGameAnswer4 = answerTranslation[answer[3]];
        user.listenMode = "fitGame";
        user.fitGameInvalidAnswers = 0;
        if(user.gameHardMode){
          console.log(`${message.author.tag} is playing the fit game! \n ~the answer is ${user.fitGameAnswer1}, ${user.fitGameAnswer2}, and ${user.fitGameAnswer3}~`);
        }else{
          console.log(`${message.author.tag} is playing the fit game! \n ~the answer is ${user.fitGameAnswer1} and ${user.fitGameAnswer2}~`);
        }

        var pieceText = "";
        for(let i = 0; i < pieceSize; i++){
          if(i != 0){
            pieceText += "\n";
          }
          for(let j = 0; j < pieceSize; j++){
            var correspondingEmote = "warning"; //default error emote
            switch(pieceMatrix[i][j]){
              case 0:
                correspondingEmote = "black_large_square";
                break;
              case 1:
                correspondingEmote = "red_square";
                break;
              default:
                console.log("FIT GAME PIECE SWITCH EXCEPTION?!")
            }
            pieceText += ":" + correspondingEmote + ":";
          }
        }

        var boardText = "";
        var boardTranslation = ["a","vs","yellow_square","green_square","blue_square","purple_square","brown_square","white_circle"];
        for(let i = 0; i < boardSize; i++){
          if(i != 0){
            boardText += "\n";
          }
          for(let j = 0; j < boardSize; j++){
            boardText += ":" + boardTranslation[boardMatrix[i][j]] + ":";
          }
        }
        
        var fitGameEmbed = new MessageEmbed()
          .setColor('#bb0000')
          .setTitle(user.gameHardMode ? 'Sussy game: fit ??? HARD' : 'Sussy game: fit')
          .setAuthor('Sus gaming!', 'https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
          .setDescription(user.gameHardMode ? 'This sussy piece can be placed on the board so that it is only touching THREE colors! What THREE colors are they?\n(`exit` to exit)' : 'This sussy piece can be placed on the board so that it is only touching two colors! What two colors are they?\n(`exit` to exit)')
          .setThumbnail('https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
          .addFields(
            { name: 'Piece', value: pieceText},
            { name: 'Board', value: boardText}
          );
        message.channel.send({ embeds: [fitGameEmbed] });

      }else if(args[0] == 'leaderboard'){

        // FIGURE OUT ASYNC STUFF
        db.get("matchLeaderboard").then(matchLeaderboard => {
          var outputStr = "Leaderboard (Matching):";
          for (const [key, value] of Object.entries(matchLeaderboard)) {
            outputStr += "\n";
            outputStr += `${value[1]}: ${value[0]}s`;
          }
          message.channel.send(outputStr).then(
            db.get("matchLeaderboardHard").then(matchLeaderboardHard => {
          var outputStr = "Leaderboard (Matching ??? HARD):";
          for (const [key, value] of Object.entries(matchLeaderboardHard)) {
            outputStr += "\n";
            outputStr += `${value[1]}: ${value[0]}s`;
          }
          message.channel.send(outputStr).then(db.get("fitLeaderboard").then(fitLeaderboard => {
          var outputStr = "Leaderboard (Fit):";
          for (const [key, value] of Object.entries(fitLeaderboard)) {
            outputStr += "\n";
            outputStr += `${value[1]}: ${value[0]}s`;
          }
          message.channel.send(outputStr).then(db.get("fitLeaderboardHard").then(fitLeaderboardHard => {
          var outputStr = "Leaderboard (Fit ??? HARD):";
          for (const [key, value] of Object.entries(fitLeaderboardHard)) {
            outputStr += "\n";
            outputStr += `${value[1]}: ${value[0]}s`;
          }
          message.channel.send(outputStr);
        }));
        }));
        }));
        });

      }else{
        var gamingEmbed = new MessageEmbed()
          .setColor('#bb0000')
          .setTitle('Sus gaming options')
          .setAuthor('Sus gaming', 'https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
          .setDescription('list of gaming options:')
          .setThumbnail('https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
          .addFields(
            { name: 'match', value: 'find the sus one out!' },
            { name: 'fit', value: 'what colors are sus?' },
            { name: 'leaderboard', value: "check everyone's highest scores!"},
            { name: 'hard', value: "add [hard] to the end for hardmode!"}
          )
          .setFooter('Truly a gamer moment.');
        message.channel.send({ embeds: [gamingEmbed] });
      }
    }

    ///////////////////////////
    /// COMMANDS WHICH DO NOT RELY ON USER OBJECT
    ///////////////////////////
    else if (command == 'ping') {  
        message.channel.send('Testing...').then (async (msg) =>{
            msg.delete()
            var ping = (msg.createdTimestamp - message.createdTimestamp)/2;
            if(ping >= 100){
                extraMessage = "Your ping is hella sus!"
            }else{
                extraMessage = "Your ping is not sussy!"
            }
            message.channel.send(`Your ping is ${ping}ms and API latency is ${Math.round(client.ws.ping)}ms\n${extraMessage}`);
        })
    }

    else if(command == 'help'){
      switch(args[0]){
        case "2":
          var helpEmbed = new MessageEmbed()
          .setColor('#404040')
          .setTitle('Misc commands (2/2)')
          .setAuthor('Sus help', 'https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
          .setDescription('list of commands:')
          .setThumbnail('https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
          .addFields(
            { name: 'sus check', value: 'check susness' },
            { name: 'sus vent', value: 'detroit: become sus' },
            { name: 'sus unvent', value: 'not sus' },
            { name: 'sus listen', value: 'r-repeat next thing you say, you sussy baka' },
            { name: 'sus ping', value: 'check if ping is sussy' },
            { name: 'sus gaming', value: 'choose from over 1!!! non-sus mini games!' },
            { name: 'sus workout', value: 'generate a sussy workout routine' },
            { name: 'sus', value: 'SUS' },
            { name: 'sus help', value: 'this tbh' }
          )
          .setFooter('Use "help [page #]" to see more!');
          message.channel.send({ embeds: [helpEmbed] });
          break;
        case "1":
        default:
          var helpEmbed = new MessageEmbed()
          .setColor('#bb0000')
          .setTitle('Game commands (1/2)')
          .setAuthor('Sus help', 'https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
          .setDescription('list of commands:')
          .setThumbnail('https://ih1.redbubble.net/image.1707617979.4007/flat,128x,075,f-pad,128x128,f8f8f8.jpg')
          .addFields(
            { name: 'sus scanner', value: 'scan for new planets!' },
            { name: 'sus planets', value: 'manage your planets!' },
            { name: 'sus work', value: 'earn some credits! (1 min cooldown)' },
            { name: 'sus upgrades', value: 'spend your hard earned credits!' },
            { name: 'sus give', value: 'give some credits!' }
          )
          .setFooter('Use "help [page #]" to see more!');
          message.channel.send({ embeds: [helpEmbed] });
      }
    }

    else if(command == 'workout'){
        message.channel.send("Generating a new sussy workout:");
        var workoutString = "";
        shuffle(workoutList);
        for(let i = 0; i < 6; i++){
            if(i != 0){
                workoutString += "\n";
            }
            shuffle(workoutReps);
            shuffle(workoutSets);
            workoutString += `${workoutList[i]}: ${workoutSets[0]} sets ${workoutReps[0]} reps each`;
        }
        message.channel.send(workoutString);
    }

    /// ADMIN TEST COMMANDS
    if(message.author.id == '95070190370299904'){
      //something weird so it's harder to accidentally proc this
      if(command == 'sussysussycleartheleaderboard'){
          db.set("matchLeaderboard", {})
          message.channel.send("Cleared leaderboard!");
      }
      if(command == 'spacetimewarp'){
        user.journeyStartTime -= 3600000;
      }
      if(command == 'activitycheck'){
        if(args[0]){
          console.log("activityCheck???");
          let messageArray = getMessages(message.channel, args[0],message.author.id);
          // for(let i = 0; i < messageArray.length; i++){
          //   console.log(messageArray[i].content);
          // }
        }
      }
      if(command == 'convertstamp'){
        console.log("convertstamp???");
        console.log(convertTimestamp(message.createdTimestamp));
      }
      
      if(command == 'testboi'){
        var testEmbed = new MessageEmbed()
        .setColor('#222222')
        .setTitle(':milky_way: Journey')
        .setDescription('Start: `earth`\n:milky_way:`M` ?????????\n:milky_way:`O` ??????\n:milky_way:`O` ?????????\n:milky_way:`N` \n:milky_way:`B` ??????\n:rocket:`A` ?????????\n:milky_way:`B` \n:milky_way:`O` ??????\n:milky_way:`O` ?????????\n:milky_way:`N` ??????\nDestination: `MOONBABOON`\n\nCurrent Location: `MOONB`\nTime Left: `1h 26m 49s`\nnYour journey is `55.3%` complete!')
        message.channel.send({ embeds: [testEmbed] });
      }
      if(command == 'testboi2'){
        var testEmbed = new MessageEmbed()
        .setColor('#222222')
        .setTitle(':milky_way: Journey')
        .setDescription('Start: `earth`\n:milky_way:`M` ?????????\n:milky_way:`O` ??????\n:milky_way:`O` ?????????\n:milky_way:`N` \n:milky_way:`B` ??????\n:rocket:`_` ?????????\n:milky_way:`_` \n:milky_way:`_` ??????\n:milky_way:`_` ?????????\n:milky_way:`_` ??????\nDestination: `MOONBABOON`\n\nCurrent Location: `MOONB`\nTime Left: `1h 26m 49s`\nnYour journey is `55.3%` complete!')
        message.channel.send({ embeds: [testEmbed] });
      }
      if(command == 'testboi3'){
        var testEmbed = new MessageEmbed()
        .setColor('#222222')
        .setTitle(':milky_way: Journey')
        .setDescription('Start: `moonbaboon`\n:milky_way:`E-?????????`\n:milky_way:`A-??????`\n:milky_way:`R-?????????`\n:milky_way:`T-` \n:rocket:`b-??????`\n:milky_way:`a-?????????`\n:milky_way:`b-` \n:milky_way:`o-??????`\n:milky_way:`o-?????????`\n:milky_way:`n-??????`\nDestination: `EARTH`\n\nCurrent Location: `EARTbaboon`\nTime Left: `1h 26m 49s`\nYour journey is `42.6%` complete!')
        message.channel.send({ embeds: [testEmbed] });
      }
      if(command == 'testboi4'){
        var testEmbed = new MessageEmbed()
        .setColor('#222222')
        .setTitle(':milky_way: Journey')
        .setDescription('Start: `moonbaboon`\n:milky_way:`E` ?????????\n:milky_way:`A` ??????\n:milky_way:`R` ?????????\n:milky_way:`T` \n:rocket:`b` ??????\n:milky_way:`a` ?????????\n:milky_way:`b` \n:milky_way:`o` ??????\n:milky_way:`o` ?????????\n:milky_way:`n` ??????\nDestination: `EARTH`\n\nCurrent Location: `EARTbaboon`\nTime Left: `1h 26m 49s`\nYour journey is `42.6%` complete!')
        message.channel.send({ embeds: [testEmbed] });
      }
    }
  }

  //always save user info
  user.save();
});

async function listenModeResponses(user, message){
  const content = message.content.toLowerCase().replace(/\s+/g, ' ').trim();
  if(user.listenMode == "journeyConfirmation"){
    if(message.content == "YES"){
      user.journeyStartTime = message.createdTimestamp;
      user.journeying = true;
      var journeyEmbed = new MessageEmbed()
        .setColor('#2e0045')
        .setTitle(':milky_way: Journey Started!')
        .setDescription('Good luck!')
      message.channel.send({ embeds: [journeyEmbed] });
    }else{
      message.channel.send(`Response is not exactly \`YES\`. Journey cancelled.`);
    }
    user.listenMode = "none";
    return true;
  }else if(user.listenMode == "reply"){
    message.channel.send(`${message.author.username} said ${message.content}!`);
    user.listenMode = "none";
    return true;

  }else if(user.listenMode == "giveConfirmation"){
    if(message.content == "YES"){
      message.channel.send(`Credits given!`);
      user.credits -= user.giveAmount;
      let targetUser = await getUser(user.giveTargetUserId);
      targetUser.credits += user.giveAmount;
      targetUser.save();
    }else{
      message.channel.send(`Answer not exactly "YES", canceled.`);
    }
    user.listenMode = "none";
    return true;
  }else if(user.listenMode == "matchGame"){
    if(matchGameItems.includes(content) || (user.gameHardMode && matchGameItemsHard.includes(content))){
      if(content === user.matchGameItem){
        message.channel.send("Congrats! You did it!").then(async (msg) =>{
          var time = (msg.createdTimestamp - user.matchGameStartTime)/1000.0
          message.channel.send(`Your time was ${time}s!`);

          if(user.gameHardMode){
            db.get("matchLeaderboardHard").then(matchLeaderboardHard => {
              if(!(message.author.id in matchLeaderboardHard) || (message.author.id in matchLeaderboardHard && time < matchLeaderboardHard[message.author.id][0])){
                matchLeaderboardHard[message.author.id] = [time, message.author.tag];
                message.channel.send(`A new personal record!`);
              }
              db.set("matchLeaderboardHard", matchLeaderboardHard);
            })
          }else{
            db.get("matchLeaderboard").then(matchLeaderboard => {
              if(!(message.author.id in matchLeaderboard) || (message.author.id in matchLeaderboard && time < matchLeaderboard[message.author.id][0])){
                matchLeaderboard[message.author.id] = [time, message.author.tag];
                message.channel.send(`A new personal record!`);
              }
              db.set("matchLeaderboard", matchLeaderboard);
            })
          }
        })
        user.listenMode = "none";
      }else{
        message.channel.send(`the correct answer was ${user.matchGameItem} you sussy boi`);
        user.listenMode = "none";
      }
    }else{
      user.matchGameInvalidAnswers++;
      if(content == "exit"){
        message.channel.send(`look at this quitter lmaaooooooo`);
        user.listenMode = "none";
      }else if(user.matchGameInvalidAnswers < 3){
        message.channel.send(`that's not a valid option sussy boi`);
      }else{
        message.channel.send(`ok ur just trolling now`);
        user.listenMode = "none";
      }
    }
    return true;

  }else if(user.listenMode == "fitGame"){
    var validAnswers = ["red", "orange", "yellow", "green", "blue", "purple", "brown", "white"];
    var answerCount = 0;
    for(let i = 0; i < validAnswers.length; i++){
      if(content.includes(validAnswers[i])){
        answerCount++;
      }
    }
    if((!user.gameHardMode && answerCount == 2)
    || (user.gameHardMode && answerCount == 3)){
      if(content.includes(user.fitGameAnswer1) && content.includes(user.fitGameAnswer2) && (!user.gameHardMode || content.includes(user.fitGameAnswer3))){
        message.channel.send("Congrats! You did it!").then(async (msg) =>{
          var time = (msg.createdTimestamp - user.fitGameStartTime)/1000.0
          message.channel.send(`Your time was ${time}s!`);

          if(user.gameHardMode){
            db.get("fitLeaderboardHard").then(fitLeaderboardHard => {
              if(!(message.author.id in fitLeaderboardHard) || (message.author.id in fitLeaderboardHard && time < fitLeaderboardHard[message.author.id][0])){
                fitLeaderboardHard[message.author.id] = [time, message.author.tag];
                message.channel.send(`A new personal record!`);
              }
              db.set("fitLeaderboardHard", fitLeaderboardHard);
            })
          }else{
            db.get("fitLeaderboard").then(fitLeaderboard => {
              if(!(message.author.id in fitLeaderboard) || (message.author.id in fitLeaderboard && time < fitLeaderboard[message.author.id][0])){
                fitLeaderboard[message.author.id] = [time, message.author.tag];
                message.channel.send(`A new personal record!`);
              }
              db.set("fitLeaderboard", fitLeaderboard);
            })
          }
        })
      }else{
        if(user.gameHardMode){
          message.channel.send(`the correct answer was ${user.fitGameAnswer1}, ${user.fitGameAnswer2}, and ${user.fitGameAnswer3} you sussy boi`);
        }else{
          message.channel.send(`the correct answer was ${user.fitGameAnswer1} and ${user.fitGameAnswer2} you sussy boi`);
        }
      }
      user.listenMode = "none";
    }else{
      user.fitGameInvalidAnswers++;
      if(content == "exit"){
        message.channel.send(`look at this quitter lmaaooooooo`);
        user.listenMode = "none";
      }else if(user.fitGameInvalidAnswers < 3){
        message.channel.send(`please only input two valid colors:\n\`red, orange, yellow, green, blue, purple, brown, white\``);
      }else{
        message.channel.send(`im concerned for ur ability to follow instructions`);
        user.listenMode = "none";
      }
    }
    return true;
  }
  return false;
}

function updateJourneyLocation(user, currentTime){
  var s = user.sourceLocation.toLowerCase();
  var t = user.targetLocation.toUpperCase() + "                    "; //if target name is shorter, you might go to "ASH smth" at some point in time
  var steps = user.journeySteps;
  var tps = user.journeyTimePerStep;
  var timePassed = currentTime - user.journeyStartTime; //will be modified
  var totalTimePassed = timePassed; //Will not be modified
  var stepsPassed = 0;
  var totalTimeRequired = 0;
  for(let i = 0; i < steps.length; i++){
    totalTimeRequired += steps[i] * tps;
  }
  for(let i = 0; i < steps.length; i++){
    if(timePassed > steps[i] * tps){
      timePassed -= steps[i] * tps;
      stepsPassed++;
    }else{
      break;
    }
  }

  user.currentLocation = t.substring(0,stepsPassed) + s.substring(Math.min(stepsPassed,s.length),s.length);

  return Math.min(1,totalTimePassed/totalTimeRequired);
}

// progress from 0-1
function getJourneyDisplayString(user, progress){
  var c = user.currentLocation;
  var totalJourneySteps = user.journeySteps.reduce((a, b) => a + b, 0);;
  var completedSteps = Math.floor(progress*totalJourneySteps);

  var finalString = "";
  var progressBar = "???".repeat(completedSteps) + "???".repeat(totalJourneySteps-completedSteps);
  var stepsProcessed = 0;
  
  for(let i = 0; i < user.journeySteps.length; i++){
    if(i != 0){
      finalString += "\n";
    }

    let stepLetter = c[i];
    let emote = ":milky_way:";
    if(!stepLetter || stepLetter == " "){
      stepLetter = "_";
    }
    if((stepsProcessed + user.journeySteps[i] > completedSteps && stepsProcessed <= completedSteps)){
      emote = ":rocket:";
    }
    finalString += `${emote}\`${stepLetter}: ${progressBar.substring(stepsProcessed,stepsProcessed+user.journeySteps[i])}\``;
    stepsProcessed += user.journeySteps[i];
  }

  return finalString;
}

// getUserFromMention from https://discordjs.guide/miscellaneous/parsing-mention-arguments.html#implementation
function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
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

// get "distance" between 2 locations, based on name
// each character difference is equal to 1 unit of distance
function getDistanceArray(name1, name2){
  var dif = [];
  var i = 0;
  var s1 = name1.toLowerCase();
  var s2 = name2.toLowerCase();
  while(i < name1.length || i < name2.length){
    let v1 = 96;
    let v2 = 96;
    if(i < s1.length){
      v1 = s1.charCodeAt(i);
      if(v1 == 32){
        v1 = 96;
      }
    }
    if(i < s2.length){
      v2 = s2.charCodeAt(i);
      if(v2 == 32){
        v2 = 96;
      }
    }
    dif.push(Math.abs(v1-v2));
    i++;
  }
  return dif;
}

// get user from MongoDB, if user does not already exist, create a new user
async function getUser(searchId){
  var returnUser = await UserM.findOne({id: searchId}).exec();
  // console.log(`in function ${returnUser.id}`);

  if(!returnUser){
    returnUser = new UserM({
      id: searchId
    });

    returnUser = returnUser.save()
      .then((result) => {
        console.log(`saved user ${result.id}`);
        return result;
      })
      .catch((error) => {
        console.log(error);
        throw new Error('New user was not saved in database!');
      });

    console.log(`Created new user with ${returnUser.id}`);
  }

  return returnUser;
}

async function getMessages(channel, idToBreak, authorId) {
  const sum_messages = [];
  let last_id;
  var maxPerFetch = 50;
  var lastTimestamp = -999;

  while (true) {
    const options = { limit: maxPerFetch };
    if (last_id) {
      options.before = last_id;
    }

    const messages = await channel.messages.fetch(options);
    last_id = messages.last().id;
    var toBreak = false;

    messages.forEach(message => {
      if(message.author.id == authorId){
        sum_messages.push(message);
        if(message.id == idToBreak){
          toBreak = true;
        }

        var thisTimestamp = message.createdTimestamp;
        if(lastTimestamp == -999){
          lastTimestamp = thisTimestamp;
        }

        if((lastTimestamp-thisTimestamp) > 1000*60*60*2){
          var lastT = convertTimestamp(lastTimestamp);
          var thisT = convertTimestamp(thisTimestamp);
          console.log(`There is a substancial time gap between ${lastT} and ${thisT}`);
        }

        lastTimestamp = thisTimestamp;
      }
    })

    if (toBreak || messages.size != maxPerFetch) {
      break;
    }
  }
  return sum_messages;
}

function convertTimestamp(timestampMili) {
  var timestamp = (timestampMili/1000) - 7*60*60;
  var d = new Date(timestamp * 1000), // Convert the passed timestamp to milliseconds
      yyyy = d.getFullYear(),
      mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
      dd = ('0' + d.getDate()).slice(-2),         // Add leading 0.
      hh = d.getHours(),
      h = hh,
      min = ('0' + d.getMinutes()).slice(-2),     // Add leading 0.
      ampm = 'AM',
      time;

  if (hh > 12) {
      h = hh - 12;
      ampm = 'PM';
  } else if (hh === 12) {
      h = 12;
      ampm = 'PM';
  } else if (hh == 0) {
      h = 12;
  }

  // ie: 2014-03-24, 3:00 PM
  time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
  return time;
}

client.login(token);

keepAlive();
