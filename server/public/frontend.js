"use strict";
//API Method (SEND)
//Request:
//Action:”JOIN”,PlayerID:<string>,GameRoom:<string>
//Action:”BID”,PlayerID:<string>,GameRoom:<string>,Bid:<integer>


//API Method (LISTEN)
//Request:
//PlayerID:<string>,GameRoom:<string>,LastIndex:<integer>
  
//Response(array):
//Action:”START”,MyCoins:<integer>,OpponentCoins:<integer>,MyHealth:<integer>,OpponentHealth:<integer>
//Action:”ROLLDICE”,MyDice:<integer>,RoundNumber:<integer>,OpponentDice:<integer>,MyCoins:<integer>,OpponentCoins:<integer>,MyHealth://<integer>,OpponentHealth:<integer>
//Action:”CLASH”,MyBid:<integer>,OpponentBid:<integer>,MyDice:<integer>,OpponentDice:<integer>,MyCoins:<integer>,OpponentCoins:<integer>,MyHealth://<integer>,OpponentHealth:<integer>
//Action:”END”,Win:<boolean>,NumberOfRounds:<integer>,MyCoins:<integer>,OpponentCoins:<integer>,MyHealth:<integer>,OpponentHealth:<integer>

var last_index = 0;

  
function send_request (action, room_id, bid) { //bid is an optional parameter
  var player_id = document.getElementById('player_id').value;
  //console.log(document.getElementById('player_id'));
  //console.log('player ID'+ player_id);
  console.log(action);
  
  if (action === "JOIN") {
    $.ajax(
    { url: '/lb/send', 
      method: "POST", 
      data: {
        Action:action,
        PlayerID:player_id, 
        GameRoom:room_id
      },
      dataType:"json",                      
      success:function(data){console.log('response received');}
    });
  }
  else if (action === "BID") {
    $.ajax(
    { url: '/lb/send', 
      method: "POST", 
      data: {
        Action:action,
        PlayerID:player_id, 
        GameRoom:room_id,
        Bid:bid
      },
      dataType:"json",                      
      success:function(data){console.log('response received');}
    });
  }
  else console.log("error");
}
  
function listen_request (room_id) {
  var player_id = document.getElementById('player_id').value;
  //API Method (LISTEN)
  //Request:
  //PlayerID:<string>,GameRoom:<string>,LastIndex:<integer>
  
  $.ajax(
    { url: '/lb/listen', 
      method: "POST", 
      data: {
        PlayerID:player_id, 
        GameRoom:room_id,
        LastIndex: last_index
      },
      dataType:"json",                      
      success: function(data) {
        //console.log(data);
        //console.log(data[0].Action);

        console.log(last_index);
        handle_response(data, room_id);
        last_index++;
      }
    }
  );
}


function handle_response(data, room_id) {
  console.log(data);
  console.log(data.length);
  var responses = [];
  
  for (var i = 0; i < data.length; i++){
    responses.push(data[i]);
    if (data[i].Action === 'START') {
      console.log('Game started.');
    }
    //Display dice.
    else if (data[i].Action === 'ROLLDICE') {
      //console.log('My die: ' + data[i].MyDice);
      //console.log('Opponent\'s die: ' + data[i].OpponentDice);
      //Prompt for a bid. 
      var player_bid = prompt('Enter your bid', 0);
      send_request ('BID', room_id, player_bid);
    }
    else if (data[i].Action === 'CLASH') {
    console.log('Clashing!');
    alert('Your Bid: ' + data[i].MyBid + 'Opponent Bid: ' + data[i].OpponentBid);
    }
    
    else if (data[i].Action === 'END') {
      console.log('End phase.');
    }
    updateDisplay(data, i);
  }
  //Send another listener.
  //listen_request(room_id);
}


function updateDisplay(data, i) {
  var info_board = document.getElementById('info_board');
  var list = (info_board.getElementsByTagName('li'));
  //console.log(data[i]);
  list.my_coins.innerHTML ='My Coins: ' + data[i].MyCoins;
  list.my_die.innerHTML = 'My Dice:' + data[i].MyDice;
  list.opp_die.innerHTML = 'Opponent\'s Dice: ' + data[i].OpponentDice;
  list.my_health.innerHTML = 'My Health: ' + data[i].MyHealth;
  list.opp_health.innerHTML = 'Opponent\'s Health: ' + data[i].OpponentHealth;
}
  
  
  //var params = 'PlayerID=' + player_id + '&GameRoom=' + room_id + '&LastIndex=' + last_index;
  
  //var req = new XMLHttpRequest();
  //req.open ('POST', '/lb/listen', true);
  //req.send (params);
  
  //Create a new response_listener to listen for the request
  //var listener = new response_listener(req);
  
/*function response_listener (req) {
  //Use the previous XMLHttpRequest in the outer scope
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 200) {
      response = req.responseText;
      console.log(response);
      //Pass the response to a handle_response function
      handle_response(response);
    } 
  }
}

function handle_response (response) {
  var response = JSON.parse(response);
  //if response.Action.
}*/

