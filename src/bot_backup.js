var admin = require("firebase-admin");

const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')
const EthService = require('./lib/EthService')

let bot = new Bot()

var serviceAccount = require("./giftbot-key.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://collabot-toshi.firebaseio.com"
});

var db = admin.database();
var request = require('request');

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      // console.log("payment req event");
      onPaymentRequest(session, message)
      // welcome(session)
      break
  }
}

function onMessage(session, message) {
  // console.log(session);

  switch(session.get('action')){

    case 'searchUser':

      var individualRef = db.ref("users/"+session.user.toshi_id+"/individual/"+message.body);

      // console.log("toshi_id", session.user.toshi_id);

      individualRef.once("value", function(snapshot) {
        var exists = (snapshot.val() !== null);

        if(exists){
            var jsonData = snapshot.val();

            // console.log("existingGuy", jsonData);

            let controls = [
                  {type: 'button', label: 'Yes', value: 'yes'},
                  {type: 'button', label: 'No', value: 'no'}
                ]

            session.reply(SOFA.Message({
              body: jsonData.username+" is already your contact. Should we go ahead add an expense?",
              controls: controls
            }))

            session.set('toshi_id', jsonData.toshi_id)
            session.set('username', jsonData.username)

            

        }else{

          // console.log("search for: "+message.body);
          request('https://identity.service.tokenbrowser.com/v1/user/'+message.body, function (error, response, body) {
            // console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.

            var userObject = JSON.parse(body);
            // console.log(userObject);

            if(response.statusCode == 200){

                // session.set('searchuser', false);

                let controls = [
                  {type: 'button', label: 'Yes', value: 'yes'},
                  {type: 'button', label: 'No', value: 'no'}
                ]

                session.reply(SOFA.Message({
                  body: "Yay! Found "+userObject.username+"! Should we go ahead and add him?",
                  controls: controls
                }))

                // session.set('action', 'confirmUser')
                session.set('toshi_id', userObject.toshi_id)
                session.set('username', userObject.username)

                // console.log("setusername: "+userObject.username);
            }else{

              let controls = [
                  {type: 'button', label: 'Start Over', value: 'reset'},
                ]

              //When 404 or user not found
              session.reply(SOFA.Message({
                controls: controls,
                body: "Oops couldn't find this user! Could you try again?"
              }))
            }
            
          });
        }

      });
      
      
    break

    case 'addAmount':
      //when you want to set other non-default properties, you must construct the SOFA instance yourself

      console.log("addAmount");

      if(message.body % 1 == 0){
           session.reply(
            SOFA.Message({
              body: "Enter a description for the expense?",
              showKeyboard: true
            })
          );

          session.set('action', 'addTXDescription')
          session.set('txAmount', message.body)
      }else{
          session.reply(
            SOFA.Message({
              body: "Enter a number please! Let's try again",
              showKeyboard: true
            })
          );

      }
    
    break

    case 'addTXDescription':

      session.set('txDescription', message.body);

      let controls = [
        {type: "button", label: "Split Equally", value: "addTransaction"},
        {type: "button", label: "You owe the full amount", value: "addTransaction"},
        {type: "button", label: "They owe the full amount", value: "addTransaction"}
      ]


      session.reply(SOFA.Message({
        body: "How was this expense split?",
        controls: controls,
        showKeyboard: false,
      }))

      session.set('action', 'default')

      break

    case 'default':

      welcome(session)

      break

  }
// welcome(session);
  
  // if(session.get('addgroup') && typeof session.get('grouptype') != 'undefined'){

  //     var groupDetails = {};

  //     groupDetails['groupType'] = session.get('grouptype');
  //     groupDetails['groupName'] = message.body;

  //     console.log(groupDetails);
      
  //     // console.log(session.get('grouptype'))

  //     // var db = admin.database();
  //     var groupRef = db.ref("users/"+session.user.toshi_id+"/groups/"+message.body);

  //     groupRef.set(groupDetails);

  //     session.set('addgroup', false)
  //     session.set('grouptype', null)
      

  // }else{
  //   welcome(session);
  // }
}


function onCommand(session, command) {

  switch (command.content.value) {

    case 'addGroupType':
      addGroupType(session)
      break
    case 'addGroupName':
      addGroupName(session, command.content.body)
      break
    case 'addIndividual':
      addIndividual(session)
      break
    case 'selectIndividual':
      selectIndividual(session)
      break
    case 'searchIndividual':
      searchIndividual(session)
      break
    case 'selectedIndividual':
      selectedIndividual(session, command.content.body)
      break
    case 'settleIndividualExpense':
      searchIndividualForSettlement(session)
       // selectedIndividual(session, command.content.body, "settle")
      break
    case 'selectedUserForSettlement':
      selectedUserForSettlement(session, command.content.body)
      break
    case 'addTransaction':
      addTransaction(session, command.content.body)
      break
    case 'paynow':
      paynow(session)
      break;
    // case 'gift':
    //   gift(session, command.content.body)
    //   break
    // case 'donate':
    //   donate(session)
    //   break
    case 'reset':
      // session.reset()
      welcome(session)
      break
    case 'yes':
      userConfirmed(session)
      break
    case 'no':
      userCancelled(session)
      break
    }
}

function onPayment(session, message) {
 
 
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      session.reply(SOFA.Message({
        body: `Thanks for the payment! 🙏`,
        showKeyboard: false
      })) 
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
   
      // console.log('toshi_id: '+session.data.toshi_id)
      // console.log('username: '+session.data.username)
      // console.log('selfUserName: '+session.user.username)
      // console.log('txHash:' +message.txHash)

      // var individualRef = db.ref("users/"+session.data.toshi_id+"/individual/"+session.user.username+"/txs");
      // individualRef.once("value", function(snapshot) {
      //   var exists = (snapshot.val() !== null);

      //   if(exists){
      //     // console.log("data", snapshot.val());


      //     var jsonData = snapshot.val();

      //     // let controls = [];

      //     for(var i in jsonData){

      //       // console.log("key: "+i);
            
      //       var txData = jsonData[i];

      //       for(var j in txData){
      //         console.log("key: "+j);
      //         console.log("value: "+txData[j]);
      //         if(j == 'txAmount' && txData[j] == session.data.txAmount){
      //           if(j == 'txDescription' && txData[j] == session.data.txDescription){
      //               var txHashRef = db.ref("users/"+session.data.toshi_id+"/individual/"+session.user.username+"/txs/"+i+"/txHash");
      //               txHashRef.set(message.txHash)
      //           }
      //         }
      //       }
      //     }


      //     let controls = [
      //       {type: "button", label: "Request", value: "paynow"},
      //       {type: "button", label: "Later", value: "later"}
      //     ]

      //     bot.client.send(session.data.toshi_id, SOFA.Message({
      //       body: 'Payment of '+session.data.txAmount+' cleared by '+session.user.username,
      //       controls: controls,
      //       showKeyboard: false,
      //     }));

      //     session.set('toshi_id', null)
      //     session.set('username', null)
      //     session.set('txAmount', null)
      //     session.set('txDescription', null)

      //   }

      // })



    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}


function paynow(session) {
  // console.log(session);

  console.log("amount", session.data.txAmount)

  // use a cache age of 10 seconds
  Fiat.fetch().then((toEth) => {
    //convert 50 US dollars to ETH.
    let ethVal = toEth.INR(session.data.txAmount)
    // console.log(ethVal)
    // session.sendEth(giftAmount)
    // request 2 ETH
    session.sendEth(ethVal, session.data.txDescription);

  })

  
}

function onPaymentRequest(session, message) {
  
  console.log(message);

}

// STATES

function welcome(session) {
  sendMessage(session, `Hello there! I'm Splitty! \nI can help you settle daily expenses with friends, roommates, figuring out costs for a group vacation or even when either one spots one another!`)
  sendMessage(session, `I can also help settle recurring individual utility bills like your newspaper, maid, gardener, milk, driver, dry cleaners and more.`);
  // console.log(session)
  // console.log(session.data.paymentAddress);
  // console.log(bot.client.config.paymentAddress);
  // console.log("EthBal: "+EthService.getBalance(session.data.paymentAddress));
}


function addGroupType(session) {

  var usersRef = db.ref("users/"+session.user.toshi_id);

  //Create userProfile JSON for Firebase
  var profileArray = {};
  var groupArray = {};
  profileArray['username'] = session.user.username;
  profileArray['name'] = session.user.name;
  profileArray['paymentAddress'] = session.user.payment_address;

  usersRef.update(profileArray);
      

  let controls = [
      {type: "button", label: "Apartment", value: "addGroupName"},
      {type: "button", label: "House", value: "addGroupName"},
      {type: "button", label: "Trip", value: "addGroupName"},
      {type: "button", label: "Other", value: "addGroupName"},
      {type: "button", label: "Existing Group", value: "addGroupName"}
    ]


  session.reply(SOFA.Message({
    body: "Select the type of the group or add against your existing group.",
    controls: controls,
    showKeyboard: false,
  }))

}

function addGroupName(session, grouptype) {

  //when you want to set other non-default properties, you must construct the SOFA instance yourself
  session.reply(
    SOFA.Message({
      body: "Let's now add the name of the group!",
      showKeyboard: true
    })
  );

  session.set('addgroup', true)
  session.set('grouptype', grouptype)
}


function addIndividual(session) {

  var usersRef = db.ref("users/"+session.user.toshi_id);

  //Create userProfile JSON for Firebase
  var profileArray = {};
  var groupArray = {};
  profileArray['username'] = session.user.username;
  profileArray['name'] = session.user.name;
  profileArray['paymentAddress'] = session.user.payment_address;

  usersRef.update(profileArray);

  //when you want to set other non-default properties, you must construct the SOFA instance yourself
  session.reply(
    SOFA.Message({
      body: "Could you tell me the username of the person you want to request the payment from?",
      showKeyboard: true
    })
  );


  session.set('action', 'searchUser')

}


function selectIndividual(session) {

  let controls = [
      {type: "button", label: "Add New", value: "addIndividual"},
      {type: "button", label: "Existing", value: "searchIndividual"},
      {type: "button", label: "Not Now", value: "reset"}
    ]


  session.reply(SOFA.Message({
    body: "Add a new individual or search for an existing one?",
    controls: controls,
    showKeyboard: false,
  }))

}


function searchIndividual(session) {


  var individualRef = db.ref("users/"+session.user.toshi_id+"/individual");
  individualRef.once("value", function(snapshot) {
    var exists = (snapshot.val() !== null);

    if(exists){
      // console.log("data", snapshot.val());
      var jsonData = snapshot.val();

      let controls = [];

      for(var i in jsonData){
         
          controls.push({type: "button", label: i, value: "selectedIndividual"})
          
        }

      session.reply(SOFA.Message({
        body: "Select someone from your list",
        controls: controls,
        showKeyboard: false,
      }))

    }

  })

}


function searchIndividualForSettlement(session) {

  var individualRef = db.ref("users/"+session.user.toshi_id+"/individual");
  individualRef.once("value", function(snapshot) {
    var exists = (snapshot.val() !== null);

    if(exists){
      // console.log("data", snapshot.val());
      var jsonData = snapshot.val();

      let controls = [];

      for(var i in jsonData){
         
        controls.push({type: "button", label: i, value: "selectedUserForSettlement"})
          
      }

      session.reply(SOFA.Message({
        body: "Select someone from your list",
        controls: controls,
        showKeyboard: false,
      }))

    }

  })

}

function selectedUserForSettlement(session, username) {
  
  
  // request('https://identity.service.tokenbrowser.com/v1/user/'+username, function (error, response, body) {
   
  //   var userObject = JSON.parse(body);
  //   console.log(userObject);

  //   if(response.statusCode == 200){

  //       session.set('toshi_id', userObject.toshi_id)
  //       session.set('username', userObject.username)

  //       // userConfirmed(session)
      
  //   }else{

  //     let controls = [
  //         {type: 'button', label: 'Start Over', value: 'reset'},
  //       ]

  //     //When 404 or user not found
  //     session.reply(SOFA.Message({
  //       controls: controls,
  //       body: "Oops something went wrong while looking for this user! Could you try again?"
  //     }))
  //   }
    
  // });


    //TO-DO Respond with 
    //Amount to be settled


    // use a cache age of 10 seconds
  Fiat.fetch().then((toEth) => {
    //convert 50 US dollars to ETH.
    let ethVal = toEth.INR(500)
    // console.log(ethVal)
    // session.sendEth(giftAmount)
    // request 2 ETH
    session.sendEth(ethVal, session.get('toshi_id'));

  })



}

function selectedIndividual(session, username) {
  
  
  request('https://identity.service.tokenbrowser.com/v1/user/'+username, function (error, response, body) {
   
    var userObject = JSON.parse(body);
    // console.log(userObject);

    if(response.statusCode == 200){

        session.set('toshi_id', userObject.toshi_id)
        session.set('username', userObject.username)

        userConfirmed(session)
      
    }else{

      let controls = [
          {type: 'button', label: 'Start Over', value: 'reset'},
        ]

      //When 404 or user not found
      session.reply(SOFA.Message({
        controls: controls,
        body: "Oops something went wrong while looking for this user! Could you try again?"
      }))
    }
    
  });

}



function addTransaction(session, txType) {

  var txDetails = {};

  txDetails['txAmount'] = session.get('txAmount');
  txDetails['txDescription'] = session.get('txDescription');
  txDetails['txType'] = txType; 

  // console.log(txDetails);
  
  // console.log(session.get('grouptype'))

  // var db = admin.database();
  var individualRef = db.ref("users/"+session.user.toshi_id+"/individual/"+session.get('username')+"/txs/pending");

  individualRef.once("value", function(snapshot) {
    var exists = (snapshot.val() !== null);

    if(exists){
      // console.log("data", snapshot.val());
      var jsonData = snapshot.val();
      var txs = {};
      var i = 0;
      for (i; i < jsonData.length; i++) {
          var txData = jsonData[i];
          txs[i] = txData;
          // console.log(txData);
      }
      
      txs[i++] = txDetails;


      individualRef.set(txs);

    }else{
      var firstTX = {};
      firstTX[0] = txDetails;
      individualRef.set(firstTX);
    }

    sendMessage(session, "Expense added! What next?")

  });

}


function requestPayment(session, toshi_id, txAmount, txDescription) {

  const unit = require('ethjs-unit');

  Fiat.fetch().then((toEth) => {
    //convert 50 US dollars to ETH.
    let ethVal = toEth.INR(txAmount)
    console.log(ethVal);
    // session.sendEth(giftAmount)
    //convert ether to wei
    var weiValue = unit.toWei(ethVal, 'ether');
    console.log("weiVal", weiValue);

    // bot.client.send(toshi_id, SOFA.PaymentRequest({
    //   "body": txDescription,
    //   "value": weiValue.toString(16),
    //   "destinationAddress": session.get('paymentAddress')
    // }));

    bot.client.send(toshi_id, SOFA.PaymentRequest({
      "body": "Payment of "+txAmount+" requested by "+session.user.username+" for "+txDescription,
      "value": weiValue.toString(16),
      "destinationAddress": bot.client.config.paymentAddress
    }));

  })

}

function userConfirmed(session) {

  var userDetails = {};

  userDetails['toshi_id'] = session.get('toshi_id');
  userDetails['username'] = session.get('username');

  console.log(userDetails);
  
  // console.log(session.get('grouptype'))

  // var db = admin.database();
  var individualRef = db.ref("users/"+session.user.toshi_id+"/individual/"+userDetails['username']);

  individualRef.update(userDetails);


  //when you want to set other non-default properties, you must construct the SOFA instance yourself
  session.reply(
    SOFA.Message({
      body: "Enter the amount you spent?",
      showKeyboard: true
    })
  );

  session.set('action', 'addAmount')

}


function settle(session) {

  var userDetails = {};

  userDetails['toshi_id'] = session.get('toshi_id');
  userDetails['username'] = session.get('username');

  console.log(userDetails);
  
  // console.log(session.get('grouptype'))

  // var db = admin.database();
  var individualRef = db.ref("users/"+session.user.toshi_id+"/individual/"+userDetails['username']);

  individualRef.update(userDetails);


  //when you want to set other non-default properties, you must construct the SOFA instance yourself
  session.reply(
    SOFA.Message({
      body: "Enter the amount you spent?",
      showKeyboard: true
    })
  );

  session.set('action', 'addAmount')

}


function userCancelled(session) {

  session.set('toshi_id', null)
  session.set('searchuser', false)
  welcome(session)
}

// HELPERS

function sendMessage(session, message) {

  let controls = [
      {
        type: "group",
        label: "Add an expense",
        controls: [
          // {type: "button", label: "Group", value: "addGroupType"},
          // {type: "button", label: "Individual", value: "addIndividual"}
          {type: "button", label: "Individual", value: "selectIndividual"}
        ]
      },
      {
        type: "group",
        label: "Settle expenses",
        controls: [
          // {type: "button", label: "Group", value: "settleGroupExpenses"},
          {type: "button", label: "Individual", value: "settleIndividualExpense"}
        ]
      }
    ]

  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}
