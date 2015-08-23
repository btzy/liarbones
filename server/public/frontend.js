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

  
function send_request (action, room_id, bid) { //bid is an optional parameter
  var action = action;
  var player_id = document.getElementById('player_id').value;
  //console.log(document.getElementById('player_id'));
  console.log('player ID'+ player_id);
  console.log(action);

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
  
function listen_request (room_id, last_index) {
  var player_id = document.getElementById('player_id').value;
  console.log(player_id);
  
  var params = 'PlayerID=' + player_id + '&GameRoom=' + room_id + '&LastIndex=' + last_index;
  
  var req = new XMLHttpRequest();
  req.open ('POST', '/lb/listen', true);
  req.send (params);
  
  //Create a new response_listener to listen for the request
  var listener = new response_listener(req);
}
  
function response_listener (req) {
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
}

