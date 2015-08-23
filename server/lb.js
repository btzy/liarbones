module.exports = (function() {
	var games = {};
	// games[gameroom]={players[playerid]:{listenqueue:[<json>],res:<object>,last<integer>,coins,health,bid,dice},roundnumber,roundstate}
	// roundstate=0(not started),1(awaiting bids),2(clashed),9:(ended)
	var get_opponent = function(gameroom, playerid) {
		for (var opponentid in games[gameroom].players) {
			if (games[gameroom].players.hasOwnProperty(opponentid)) {
				if (opponentid !== playerid) {
					return games[gameroom].players[opponentid];
				}
			}
		}
	};
	var get_player_data = function(player, opponent) {
		return {
			MyCoins: player.coins,
			OpponentCoins: opponent.coins,
			MyHealth: player.health,
			OpponentHealth: opponent.health
		};
	};
	var try_flush_queue = function(player) {
		if (player.res && player.listenqueue.length > player.last) {
			player.res.send(JSON.stringify(player.listenqueue.slice(player.last)));
			player.res = null;
		}
	}
	var add_to_queue = function(player, data) {
		player.listenqueue.push(JSON.parse(JSON.stringify(data)));
		try_flush_queue(player);
	}
	var clash = function(gameroom) {
		var p1 = null,
			p2 = null;
		for (var playerid in games[gameroom].players) {
			if (games[gameroom].players.hasOwnProperty(playerid)) {
				if (p1) p2 = games[gameroom].players[playerid];
				else p1 = games[gameroom].players[playerid];
			}
		}
		p1.coins -= p1.bid;
		p2.coins -= p2.bid;
		if (p1.bid > p2.bid) {
			p2.health -= p1.dice;
		}
		else if (p2.bid > p1.bid) {
			p1.health -= p2.dice;
		}
		else {
			p1.health -= p2.dice;
			p2.health -= p1.dice;
		}
		var playerdata = get_player_data(p1, p2);
		playerdata.MyBid = p1.bid;
		playerdata.OpponentBid = p2.bid;
		playerdata.MyDice = p1.dice;
		playerdata.OpponentDice = p2.dice;
		playerdata.Action = "CLASH";
		add_to_queue(p1, playerdata);
		playerdata = get_player_data(p2, p1);
		playerdata.MyBid = p2.bid;
		playerdata.OpponentBid = p1.bid;
		playerdata.MyDice = p2.dice;
		playerdata.OpponentDice = p1.dice;
		playerdata.Action = "CLASH";
		add_to_queue(p2, playerdata);
		p1.bid = p2.bid = -1;
		if (p1.health > 0 && p2.health > 0 && games[gameroom].roundnumber < 4) {
			++games[gameroom].roundnumber;
			return run_generate_dice(gameroom);
		}
		games[gameroom].roundstate = 9;
		playerdata = get_player_data(p1, p2);
		playerdata.NumberOfRounds = games[gameroom].roundnumber;
		playerdata.Win = (p1.health != p2.health) ? (p1.health > p2.health) : (p1.coins >=
			p2.coins);
		playerdata.Action = "END";
		add_to_queue(p1, playerdata);
		playerdata = get_player_data(p2, p1);
		playerdata.NumberOfRounds = games[gameroom].roundnumber;
		playerdata.Win = (p2.health != p1.health) ? (p2.health > p1.health) : (p2.coins >=
			p1.coins);
		playerdata.Action = "END";
		add_to_queue(p2, playerdata);
	}
	var try_clash = function(gameroom) {
		for (var playerid in games[gameroom].players) {
			if (games[gameroom].players.hasOwnProperty(playerid)) {
				if (games[gameroom].players[playerid].bid == -1) return;
			}
		}
		clash(gameroom);
	}
	var do_bid = function(gameroom, playerid, bid) {
		games[gameroom].players[playerid].bid = bid;
		try_clash(gameroom);
	};
	var try_bid = function(gameroom, playerid, bid) {
		if (games.hasOwnProperty(gameroom) && games[gameroom].players.hasOwnProperty(
				playerid) && Object.keys(games[gameroom].players).length >= 2 && games[
				gameroom].roundstate === 1 && bid >= 0 && bid <= games[gameroom].players[
				playerid].coins) {
			do_bid(gameroom, playerid, bid);
		}
	};
	var run_generate_dice = function(gameroom) {
		for (var playerid in games[gameroom].players) {
			if (games[gameroom].players.hasOwnProperty(playerid)) {
				games[gameroom].players[playerid].dice = parseInt(Math.random() * 6, 10) +
					1;
			}
		}
		games[gameroom].roundstate = 1;
		for (var playerid in games[gameroom].players) {
			if (games[gameroom].players.hasOwnProperty(playerid)) {
				var player = games[gameroom].players[playerid];
				var opponent = get_opponent(gameroom, playerid)
				var playerdata = get_player_data(player, opponent);
				playerdata.RoundNumber = games[gameroom].roundnumber;
				playerdata.MyDice = player.dice;
				playerdata.OpponentDice = opponent.dice;
				playerdata.Action = "ROLLDICE";
				add_to_queue(player, playerdata);
			}
		}
	}
	var start_game = function(gameroom) {
		for (var playerid in games[gameroom].players) {
			if (games[gameroom].players.hasOwnProperty(playerid)) {
				var player = games[gameroom].players[playerid];
				var opponent = get_opponent(gameroom, playerid);
				var playerdata = get_player_data(player, opponent);
				playerdata.Action = "START";
				add_to_queue(player, playerdata);
			}
		}
		games[gameroom].roundnumber = 1;
		run_generate_dice(gameroom);
	};
	var try_start_game = function(gameroom) {
		if (games.hasOwnProperty(gameroom) && Object.keys(games[gameroom].players)
			.length >= 2 && games[gameroom].roundnumber === 0) {
			start_game(gameroom);
		}
	};
	var ret = {};
	ret.init = function(app, path) {
		app.post(path + "/listen", function(req, res) {
			if (!req.body.LastIndex) req.body.LastIndex = 0;
			req.body.LastIndex = parseInt(req.body.LastIndex, 10);
			if (games.hasOwnProperty(req.body.GameRoom) && games[req.body.GameRoom]
				.players.hasOwnProperty(req.body.PlayerID)) {
				games[req.body.GameRoom].players[req.body.PlayerID].res = res;
				games[req.body.GameRoom].players[req.body.PlayerID].last = req.body.LastIndex;
				setTimeout(function() {
					if (games[req.body.GameRoom].players[req.body.PlayerID].res) {
						games[req.body.GameRoom].players[req.body.PlayerID].res.send(JSON.stringify(
							[]));
						games[req.body.GameRoom].players[req.body.PlayerID].res = null;
					}
				}, 30000);
				try_flush_queue(games[req.body.GameRoom].players[req.body.PlayerID]);
			}
			else {
				return res.send(JSON.stringify([]));
			}

		});
		app.post(path + "/send", function(req, res) {
      console.log('Command received.' + req.body + req);
			switch (req.body.Action) {
				case "JOIN":
					if (!req.body.GameRoom || !req.body.PlayerID) {
            console.log("Missing POST data.");
            return res.send("Missing POST data.");
          }
            
					if (!games.hasOwnProperty(req.body.GameRoom)) games[req.body.GameRoom] = {
						players: {},
						roundnumber: 0,
						roundstate: 0
					};
          console.log('testing');
					if (!games[req.body.GameRoom].players.hasOwnProperty(req.body.PlayerID) &&
						games[req.body.GameRoom].roundnumber === 0) {
						games[req.body.GameRoom].players[req.body.PlayerID] = {
							res: null,
							coins: 20,
							health: 10,
							bid: -1,
							dice: -1,
							listenqueue: []
						};
            console.log('trying to start game...');
						try_start_game(req.body.GameRoom);
					}
					break;
				case "BID":
					if (!req.body.GameRoom || !req.body.PlayerID || typeof req.body.Bid ===
						"undefined") return res.send("Missing POST data.");
					req.body.Bid = parseInt(req.body.Bid, 10);
					try_bid(req.body.GameRoom, req.body.PlayerID, req.body.Bid);
					break;
				default:
					return res.send("Unknown action.");
			}
			res.send("Command OK.");
		});
	};
	return ret;
})();