//require('dotenv').config();
const keepAlive = require('./server')

const { Client, Intents } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const Database = require("@replit/database")
const mongoose = require("mongoose");
const UserM = require("./user");

const token = process.env.DISCORDJS_BOT_TOKEN;
const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
const client = new Client({ intents });
const db = new Database();

const mobDictionary = require("./mobDictionary");
const planetGenerator = require("./planetGenerator");

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
    mobDictionary.load(client);

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
    
    else if(command == 'scanner'){
      if(args[0] == 'scan'){
        var scanCooldown = 60 * 60;
        var lastScan = (message.createdTimestamp - user.lastScanTime)/1000;
        if(lastScan > scanCooldown || user.id == devId){
          user.lastScanTime = message.createdTimestamp;
          user.scannedPlanets = [];
          user.scannedPlanets.push(planetGenerator.generatePlanet(user));
          user.scannedPlanets.push(planetGenerator.generatePlanet(user));

          displayPlanetsSummaryEmbed(user, "scanned", message.channel);
          
        }else{
          message.channel.send(`Your scanner is cooling down! Please wait ${(Math.floor((scanCooldown - lastScan)/60))} Minutes and ${Math.ceil((scanCooldown - lastScan)%60)} Seconds!\nUpgrade your scanner system to decrease this cooldown (not a feature yet).`);
        }
      }else{
        displayPlanetsSummaryEmbed(user, "scanned", message.channel);
      }
    }

    else if(command == 'planets' || command == 'planet'){
      if(args[0] == 'detail' || args[0] == 'details'){
        if(args[1]){
          for(let i = 0; i < user.scannedPlanets.length; i++){
            if(args[1].toLowerCase() == user.scannedPlanets[i].name.toLowerCase()){
              displayPlanetDetailEmbed(user.scannedPlanets[i], message.channel);
              return;
            }
          }
          for(let i = 0; i < user.storedPlanets.length; i++){
            if(args[1].toLowerCase() == user.storedPlanets[i].name.toLowerCase()){
              displayPlanetDetailEmbed(user.storedPlanets[i], message.channel);
              return;
            }
          }
        }else{
          message.channel.send("Command: `planets detail [planet name]`");
        }
      }else{
        var planetCommandInfo = new MessageEmbed()
          .setColor('#bb0000')
          .setTitle(":ringed_planet: Planet command:")
          .setDescription('`planet details [name]`: get details about any scanned or stored planet\n~~planet add [name]~~: add a scanned planet to your stored planets list\n~~planet remove [name]~~: remove a planet from your stored planets list\n~~planet list~~: get a list of your stored planets')
        message.channel.send({ embeds: [planetCommandInfo] });
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
          .setTitle(user.gameHardMode ? 'Sussy game: fit – HARD' : 'Sussy game: fit')
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
          var outputStr = "Leaderboard (Matching – HARD):";
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
          var outputStr = "Leaderboard (Fit – HARD):";
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
      if(command == 'sussy sussy clear the leaderboard'){
          db.set("matchLeaderboard", {})
          message.channel.send("Cleared leaderboard!");
      }
    }
  }

  //always save user info
  user.save();
});

async function listenModeResponses(user, message){
  const content = message.content.toLowerCase().replace(/\s+/g, ' ').trim();
  if(user.listenMode == "reply"){
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

function displayPlanetsSummaryEmbed(user, mode, channel){
  if(mode == "scanned"){
    var planetsList = user.scannedPlanets;

    if(planetsList.length > 0){
      var planetsEmbed = new MessageEmbed()
      .setColor("#bb0000")
      .setTitle(`Scanned Planets`)
      .setAuthor(`${user.username}'s Scanned Planets`, 'https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg')
      .setDescription("A list of planets from your previous scan.\nSee a planet's details with `planets detail [name]`!")
      .setThumbnail('https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg');

      for(let i = 0; i < planetsList.length; i++){
        let planet = planetsList[i];
        let dropsDescription = "";
        let planetName = planet.name;

        for(let j = 0; j < planet.flora.length; j++){
          if(planet.floraDiscovery[j]){
            dropsDescription += mobDictionary.getEmoji(planet.flora[j]).toString();
          }else{
            dropsDescription += "[?]";
          }
        }
        for(let j = 0; j < planet.fauna.length; j++){
          if(planet.faunaDiscovery[j]){
            dropsDescription += mobDictionary.getEmoji(planet.fauna[j]).toString();
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
            dropsDescription += " " + planetGenerator.getSpecialsDescription(planet.specials[k], true);
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
      .setTitle(`Scanned Planets`)
      .setAuthor(`${user.username}'s Scanned Planets`, 'https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg')
      .setDescription("You haven't scanned any planets!\nUse `scanner scan` to start!")
      .setThumbnail('https://preview.free3d.com/img/2015/12/2179865938982077987/3g3fvmbw-900.jpg');

      channel.send({ embeds: [planetsEmbed] });
    }
  }
}

function displayPlanetDetailEmbed(planet, channel){
  var floraEmoteString = "";
  for(let i = 0; i < planet.flora.length; i++){
    if(i != 0){
      floraEmoteString += "\n";
    }
    if(planet.floraDiscovery[i]){
      let floraItem = mobDictionary.getEmoji(planet.flora[i]).toString();
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
        let floraDropItem = mobDictionary.getEmoji(floraDrops[j]).toString();
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
      let faunaItem = mobDictionary.getEmoji(planet.fauna[i]).toString();
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
        let faunaDropItem = mobDictionary.getEmoji(faunaDrops[j]).toString();
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
    { name: `**Underground Resources:**`, value: `${mobDictionary.getEmoji("Stone").toString()}\n(Type-1 planets do not contain precious metals.)` }
  );

  if(planet.specials.length > 0){
    var specialsField;
    specialsDescription = "";
    for(let i = 0; i < planet.specials.length; i++){
      if(i != 0){
        specialsDescription += "\n";
      }
      specialsDescription += planetGenerator.getSpecialsDescription(planet.specials[i]);
    }

    specialsField = { name: `**Special Attributes:**`, value: `${specialsDescription} ` };
    planetEmbed.addFields(specialsField);
  }

  planetEmbed.setFooter('Store a planet into your database with "planets add" (not yet)');

  channel.send({ embeds: [planetEmbed] });
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

client.login(token);

keepAlive();
