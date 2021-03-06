# Splitman - Toshi SOFA app
This repository contains the source code for splitman - a toshi app.

## What's going on here?
> What's Splitman?

Splitman is a toshi app developed for the Proffer Hackathon, which let's you add and settle daily expenses with friends, roommates, figuring out costs for a group activities, and also schedule recurring utility bill expenses like with newspaper, internet, dry cleaning and more. 

> Note: There was a conflict with the SEED deployment of the app. You will find two "splitman" apps in the toshi client. 
Please use the one deployed under username @arniesaha and not @arnabsaha

<img src = "https://lh3.googleusercontent.com/-XPCcUgT0ddM/Wgm0k5OqkGI/AAAAAAAAGsc/0k-FnkXJ-nMm408GmkcEMUxVMW4Y68CYACL0BGAYYCw/h2160/6374528080290022692%253Faccount_id%253D0" width="200px">

> How it will help me?

* Do you have pending tabs with friends or roommates that you have a difficult time to confront or account for?
* Do you use an existing payment recording app but wishing a payment feature directly built in the app?
* Would you like an ability to schedule reoccuring utility bill payments like your maid, newspaper, cable, internet without a bank in an easy conversational way?

If yes, then you will be stoked about "Splitman"!

> How App works?

<img src="https://lh3.googleusercontent.com/-Uz1i5fAEVJo/WgkmvUFiwqI/AAAAAAAAGrM/EOumDcVBozgIw2USrFOy79OfGD585m0YgCL0BGAYYCw/h2160/9035047960834344901%253Faccount_id%253D0" width="200px"> <img src="https://lh3.googleusercontent.com/-cfUkxCFgLlc/WgkmuViiitI/AAAAAAAAGq8/Bozv40AfkUwQjbyTyySgDdGPNTWz2HvtQCL0BGAYYCw/h2160/5026396371626723057%253Faccount_id%253D0" width="200px"> <img src="https://lh3.googleusercontent.com/-9D_hg8bp0UU/WgkmtkeSEGI/AAAAAAAAGqs/nV44TELFVukC-U_rJZpPNnNjxV4lODw_ACL0BGAYYCw/h2160/6290967093477318946%253Faccount_id%253D0" width="200px"> <img src="https://lh3.googleusercontent.com/-4qm0psu4HQc/Wgkmsh65gRI/AAAAAAAAGrg/47BEi_MJImk5f5p7_qBNw5xqhi_TyftIgCL0BGAYYCw/h2160/936967223953786355%253Faccount_id%253D0" width="200px">


The current bot can:

* Add new toshi users by their username: via https://www.toshi.org/docs/toshi-id-service/
* Search existing users
* Add expenses against existing users
* Settle all pending expenses (either "Pay" or "Request" owed amount)

> System Architecture

<img src="https://lh3.googleusercontent.com/-GIt6xXhXi1A/WgnGc-OXOKI/AAAAAAAAGss/j8KiQaVbCWM05zLW_u3-5CxLGsGSuobgACL0BGAYYCw/h349/2017-11-13.jpg" width="600px">

* Base architechture is of toshi's like above, but there's an additional firebase datastore layer for further interactions within the conversational bot.
* **firebase-admin**<br>
  Firebase is a json structure based real-time crossplatform datastorre, that records app level interactions, like adding users and pending transactions. Which helps in splitman's app flow. And will also enable creating webviews for users to view detailed transaction details in a separate webapp or toshi as well

  e.g. User and TX Structure in Firebase:
  key: 0x045f6c5770c23656b7483f9cf74d969a4a4b01f5

  ``` {
  "individual" : {
    "arnabq6" : {
      "payment_address" : "0xf0d0e26ae4e8e3b58941974f787695094ddf2288",
      "toshi_id" : "0x1a352bbc53b7afb3af874db414dc1cc2b28f71f5",
      "txs" : [ {
        "txAmount" : "300",
        "txDescription" : "Food",
        "txHash" : "0xc3ba7faafd0059cab953813c88d98ec31750ee3e2827ff89c41b797bcf2f774f",
        "txStatus" : "settled",
        "txTime" : 1510544649069,
        "txType" : "Split Equally"
      }, {
        "txAmount" : "500",
        "txDescription" : "Food",
        "txHash" : "0xa288943c30872affafb37941d1b5628a1754da8e6bfd68765a547ca6fdc447e2",
        "txStatus" : "settled",
        "txTime" : 1510544833879,
        "txType" : "They owe the full amount"
      },
      {
        "txAmount" : "250",
        "txDescription" : "Maid",
        "txStatus" : "pending",
        "txTime" : 1510544833879,
        "txType" : "Split Equally"
      } ],
      "username" : "arnabq6"
    }
  },
  "name" : "arnabnexus6",
  "paymentAddress" : "0x8f189bef6801bf9beb160cb2686b84ace1eb6cad",
  "username" : "arnabnexus6" } 

The top level data is your own user data which is stored under the key of toshi_id, and other transaction details stored under individual/<toshi-username> path

* web3 is used to listen/filter via the paymentAddress of interested parties to update backend transactionStatus



>To-Do/Roadmap for Splitman:

* Implement "Group" functionality 
* Individuals can add each other in groups (e.g. friends on a vacation trip, more than 2 roommates etc) could create groups and add each other to it
* The expenses in these groups would be settled based on the number group participants
* Schedule Later: Feature to schedule payment requests at a later date
* Reoccuring Payments: Schedule payments you need to make like the newspaper guy, maid, cable etc in a reccuring based on a date of choice or the schedule could be edited later
* Integration of proffer reputation service to individuals credit history which will impact future usescases with whom you would engage in social commerce
* Integration of toshi's client conversational UI in a native Android app, with additional features for users to view their transaction history, edit details with additional advanced native UI features like link previews, viewing tables besides the web3 injection.
* Provide deeplink-invite features to users who are not toshi or the native app 



>About Me

Product Architect @<a href="https://ohaiapp.com//">Ohai</a>, Cutting Chai Technologies Pvt. Ltd.
*  <a href="https://angel.co/arniesaha/">Arnab</a>

