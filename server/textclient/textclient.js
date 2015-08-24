$(document).ready(function(){
    var _enable_handler=null;
    var _enable_backhandler=null;
    $("#inputbox").keydown(function(e){
        if(e.which===13){
            if(_enable_handler){
                _enable_handler($("#inputbox").val());
            }
        }
        else if(e.which===8){
            if(_enable_backhandler&&$("#inputbox").val()===""){
                _enable_backhandler();
                e.preventDefault();
            }
        }
    });
    var output=function(message){
        $("#displaybox").append("<br>"+message);
        $("#displaybox").scrollTop($("#displaybox").prop("scrollHeight"));
    }
    var disable=function(){
        $("#inputbox").prop("disabled",true);
        $("#inputbox").val("");
        _enable_handler=null;
        _enable_backhandler=null;
    }
    var enable=function(handler,backhandler){
        $("#inputbox").prop("disabled",false);
        $("#inputbox").val("");
        $("#inputbox").focus();
        _enable_handler=handler;
        if(backhandler)_enable_backhandler=backhandler;
    }
    $("#inputbox").focus();
    var _listen_data=[];
    var _listen_callbacks=[];
    var _listen_index=0;
    var _listen_start=false;
    var _despatch_callback=function(){
        if(_listen_index<_listen_callbacks.length&&_listen_index<_listen_data.length){
            var _li=_listen_index;
            ++_listen_index;
            _listen_callbacks[_li](_listen_data[_li]);
            _despatch_callback();
        }
    }
    var start_listener=function(playerid,gameroom){
        _listen_data=[];
        _listen_callbacks=[];
        var index=0;
        _listen_index=0;
        _listen_start=true;
        var _listen=function(){
            $.post(window.location.protocol+"//"+window.location.host+"/lb/listen",{PlayerID:playerid,GameRoom:gameroom,LastIndex:index},function(data){
                _listen_data.push.apply(_listen_data,data); // concats array
                index=_listen_data.length;
                if(_listen_start){
                    _despatch_callback();
                    _listen();
                }
            },"json");
        }
        _listen();
    };
    var stop_listener=function(){
        _listen_start=false;
    }
    var listen=function(callback){
        _listen_callbacks.push(callback);
        _despatch_callback();
    }
    var end_game=function(playerid,message){
        output("Game ended. "+((message.Win)?"Congratulations, you have won!":"You have lost."));
        output("Your Coins: "+message.MyCoins+". Opponent Coins: "+message.OpponentCoins+". Your Health: "+message.MyHealth+". Opponent Health: "+message.OpponentHealth+".");
        output("Press \"Enter\" to continue...");
        enable(function(data){
            disable();
            prompt_game_room(playerid);
        });
    }
    var play_game_turn=function(playerid,gameroom){
        listen(function(message){
            if(message.Action=="END"){
                return end_game(playerid,message);
            }
            if(message.Action=="ROLLDICE"){
                output("=== Round #"+message.RoundNumber+" ===");
                output("Your Dice: "+message.MyDice+". Opponent Dice: "+message.OpponentDice+". Your Coins: "+message.MyCoins+". Opponent Coins: "+message.OpponentCoins+". Your Health: "+message.MyHealth+". Opponent Health: "+message.OpponentHealth+".");
                output("Please enter your bid:");
                enable(function(data){
                    if(parseInt(data,10).toString()==data){
                        disable();
                        data=parseInt(data,10);
                        if(data>=0&&data<=message.MyCoins){
                            output("You bidded "+data+" coins.");
                            $.post(window.location.protocol+"//"+window.location.host+"/lb/send",{Action:"BID",PlayerID:playerid,GameRoom:gameroom,Bid:data},function(data){
                                if(data==="Command OK."){
                                    output("Awaiting opponent...");
                                    listen(function(message){
                                        if(message.Action=="CLASH"){
                                            output("Opponent bidded "+message.OpponentBid+" coins.");
                                            if(message.MyBid>message.OpponentBid){
                                                output("You win this round :)");
                                            }
                                            else if(message.MyBid<message.OpponentBid){
                                                output("You lose this round :(");
                                            }
                                            else{
                                                output("This round is a draw.");
                                            }
                                            play_game_turn(playerid,gameroom);
                                        }
                                        else{
                                            output("Server error. Please try another game room.");
                                            stop_listener();
                                            prompt_game_room(playerid);
                                        }
                                    });
                                }
                                  else{
                                    output("Server error. Please try another game room.");
                                    stop_listener();
                                    prompt_game_room(playerid);
                                }
                            },"text");
                        }
                    }
                });
            }
            else{
                output("Server error. Server responded with the following:");
                output(JSON.stringify(message));
                stop_listener();
                prompt_game_room(playerid);
            }
        });
    }
    var start_game=function(playerid,gameroom){
        $.post(window.location.protocol+"//"+window.location.host+"/lb/send",{Action:"JOIN",PlayerID:playerid,GameRoom:gameroom},function(data){
            if(data==="Command OK."){
                output("Joined game at room \""+gameroom+"\".");
                output("Awaiting opponent...");
                start_listener(playerid,gameroom);
                listen(function(message){
                    if(message.Action=="START"){
                        output("Game started.");
                        play_game_turn(playerid,gameroom);
                    }
                    else{
                        output("Server error. Please try another game room.");
                        stop_listener();
                        prompt_game_room(playerid);
                    }
                });
            }
            else{
                output("Server error. Server responded with the following:");
                output(data);
                prompt_game_room(playerid);
            }
        },"text");
    }
    var prompt_game_room=function(playerid){
        output("Please enter game room: [ press backspace to log out ]");
        enable(function(data){
            if(data){
                disable();
                start_game(playerid,data);
            }
        },function(){
            disable();
            localStorage.removeItem("PlayerID");
            output("Successfully logged out.");
            prompt_welcome();
        });
    }
    var prompt_welcome=function(){
        if(!localStorage.getItem("PlayerID")){
            output("Welcome! Please enter your name:");
            enable(function(data){
                if(data){
                    disable();
                    localStorage.setItem("PlayerID",data);
                    prompt_welcome();
                }
            });
        }
        else{
            output("Welcome, "+localStorage.getItem("PlayerID")+"!");
            prompt_game_room(localStorage.getItem("PlayerID"));
        }
    }
    output("===== Liarbones Text Client =====");
    prompt_welcome();
});