define(
	[
		'c4/board',

		'util/throttleDebounce'
	],

	function (Board, throttleDebounce) {
		const Players = {
			PLAYER_ONE: 1,
			PLAYER_TWO: 2
		};

		const selectors = {
			col: '.js-c4-col',
			tile: '.js-c4-tile'
		};

		const classes = {
			value: {
				[Players.PLAYER_ONE]: 'player1',
				[Players.PLAYER_TWO]: 'player2'
			},

			vital: {
				[Players.PLAYER_ONE]: 'vital1',
				[Players.PLAYER_TWO]: 'vital2'
			},

			unreachable: 'unreachable',

			noWins: {
				[Players.PLAYER_ONE]: 'no-wins1',
				[Players.PLAYER_TWO]: 'no-wins2'
			}
		};

		const width = 7;
		const height = 6;
		const winningLength = 4;

		const computer = Players.PLAYER_TWO;

		var board;
		var currentPlayer;
		var gameSolution;

		var c4 = {
			init: {
				all: function (options) {
					options = Object.assign({width, height}, options);

					c4.init._board(options);
					c4.init._currentPlayer(options);

					c4.init._events(options);

					// c4.turn.human(3);
					// c4.turn.human(0);
					// c4.turn.human(3);
					// c4.turn.human(1);
					// c4.turn.human(3);
					// c4.turn.human(1);
					// c4.turn.human(2);
					// c4.turn.human(2);
					// c4.turn.human(4);
					// c4.turn.human(2);
				},

				_board: function (options) {
					board = new Board(options);
				},

				_currentPlayer: function (options) {
					currentPlayer = Players.PLAYER_ONE;
				},

				_events: function (options) {
					var $cols = document.querySelectorAll(selectors.col);

					for (let x = 0; x < $cols.length; x++) {
						let $col = $cols[x];

						$col.addEventListener('click', throttleDebounce.throttle(() => {c4.turn.human(x);}, 500));
					}
				}
			},

			turn: {
				human: function (x) {
					if (currentPlayer !== computer) {
						c4.turn._do(x);
					}
				},

				computer: function () {
					if (currentPlayer === computer) {
						let x = c4.ai.pickBestCol(currentPlayer);

						c4.turn._do(x);
					}
				},

				_do: function (x, player) {
					if (typeof player === 'undefined') {
						player = currentPlayer;
					}

					if (!gameSolution) {
						if (c4.turn._placeTile(x, currentPlayer)) {
							let wins = c4.analyse.checkForWinner({x});
							if (wins.length) {
								gameSolution = wins;
								console.log('Winner!', gameSolution, currentPlayer);
							}

							c4.turn._next();
						}
					}
				},

				_placeTile: function (x, player) {
					var success = board.placeTile({x}, player);

					if (typeof player === 'undefined') {
						player = player;
					}

					if (success === true) {
						c4.ui.placeTile({x}, player);

						c4.analyse.findVitalPoints();
						c4.analyse.findUnreachable();
						c4.analyse.findNoWins();
					}

					return success;
				},

				_next: function () {
					currentPlayer = c4.turn.getOtherPlayer(currentPlayer);

					if (currentPlayer === computer) {
						c4.turn.computer();
					}

					return currentPlayer;
				},

				getOtherPlayer: function (player) {
					var newPlayer;

					if (player === Players.PLAYER_ONE) {
						newPlayer = Players.PLAYER_TWO;
					} else {
						newPlayer = Players.PLAYER_ONE;
					}

					return newPlayer;
				}
			},

			analyse: {
				checkForWinner: function (coords, player, potentialWins) {
					var {x, y} = coords;
					var cursor;
					var wins = [];

					var directions = [
						['up', 'down'],
						['left', 'right'],
						['upRight', 'downLeft'],
						['upLeft', 'downRight']
					];

					if (typeof y === 'undefined') {
						y = board.getColHeight(x) - 1;
					}
					if (typeof player === 'undefined') {
						player = currentPlayer;
					}

					cursor = board.getCursor({x, y});

					for (let i in directions) {
						let directionSet = directions[i];

						// Treat the current slot as though it is filled with player's tile
						let win = [{x, y}];
						for (let j in directionSet) {
							let direction = directionSet[j];

							cursor = board.getCursor({x, y});

							// While we can go in this direction and the slot either has
							// the specified player's tile in it or, if we're checking
							// for potential wins, may have no tile in it but is reachable.
							// Potential wins are not checked for vertically
							while (cursor[direction]() &&
								(
									(cursor.getTile() === player) ||
									(
										(i > 0 && potentialWins) &&
										!(cursor.getTile() || cursor.getUnreachable())
									)
								)
							) {
								win.push({x: cursor.x, y: cursor.y});
							}
						}

						if (win.length >= winningLength) {
							wins.push(win);
						}
					}

					return wins;
				},

				findVitalPoints: function () {
					// A vital point is a point where, if a tile is placed there,
					// it will create a solution

					for (let i in Players) {
						let player = Players[i];

						for (let x = 0; x < width; x++) {
							for (let y = 0; y < height; y++) {
								let slot = board.getSlot({x, y});
								let wins;

								if (slot.getTile() || slot.getVital(player)) {
									continue;
								}

								wins = c4.analyse.checkForWinner({x, y}, player);

								if (wins.length) {
									slot.setVital(player, true);
									c4.ui.setVital({x, y}, player);
								}
							}
						}
					}
				},

				findUnreachable: function () {
					for (let x = 0; x < width; x++) {
						for (let y = 0; y < height; y++) {
							let cursor = board.getCursor({x, y});

							if (cursor.getUnreachable() === true) {
								continue;
							}

							while (cursor.down()) {

								// Tiles above a shared vital point are unreachable
								if (cursor.getVital(Players.PLAYER_ONE) && cursor.getVital(Players.PLAYER_TWO)) {

									cursor.getSlot().setUnreachable(true);
									c4.ui.setUnreachable({x, y});

									// Every slot above this one will also be unreachable
									let upCursor = board.getCursor({x, y});
									while (upCursor.up()) {
										upCursor.getSlot().setUnreachable(true);
										c4.ui.setUnreachable({x: upCursor.x, y: upCursor.y});
									}

								}

							}
						}
					}
				},

				findNoWins: function () {
					for (let i in Players) {
						let player = Players[i];
						for (let x = 0; x < width; x++) {
							for (let y = 0; y < height; y++) {
								let slot = board.getSlot({x, y});
								let potentialWins;

								if (slot.getNoWins(player)) {
									continue;
								}

								potentialWins = c4.analyse.checkForWinner({x, y}, player, true);

								if (!potentialWins.length) {
									slot.setNoWins(player, true);
									c4.ui.setNoWins({x, y}, player);
								}
							}
						}
					}
				}
			},

			ai: {
				pickBestCol: function (player) {
					var priorities = [];
					var maxPriority;
					var cols = [];
					var col;

					// Collect priorities
					for (let x = 0; x < width; x++) {
						let priority = c4.ai._getColPriority(x, player);
						priorities.push(priority);

						if ((typeof maxPriority === 'undefined') || priority > maxPriority) {
							maxPriority = priority;
						}
					}

					// Find max priority
					for (let x = 0; x < priorities.length; x++) {
						let priority = priorities[x];

						if (priority === maxPriority) {
							cols.push(x);
						}
					}

					// Pick one of the best columns at random
					col = Math.floor(Math.random() * cols.length);
					col = cols[col];

					return col;
				},

				_getColPriority: function (x, player) {
					var y = board.getColHeight(x);
					var priority = 0;

					// You can't go here because the column is full
					if (y >= height) {
						return -100;
					}

					// If you go here, you will win
					if (c4.analyse.checkForWinner({x, y}, player).length) {
						return 1000;
					}

					// If your opponent goes here, they will win
					if (c4.analyse.checkForWinner({x, y}, c4.turn.getOtherPlayer()).length) {
						return 900;
					}

					// TODO: Create a cloned board so you can see what effect
					// the next move here would have

					return priority;
				}
			},

			ui: {
				placeTile: function (coords, player) {
					var $tile = c4.ui._getTile(coords);

					$tile.classList.add(classes.value[player]);

					for (let i in classes.vital) {
						$tile.classList.remove(classes.vital[i]);
					}
				},

				setVital: function (coords, player) {
					var $tile = c4.ui._getTile(coords);

					$tile.classList.add(classes.vital[player]);
				},

				setUnreachable: function (coords) {
					var $tile = c4.ui._getTile(coords);

					$tile.classList.add(classes.unreachable);
				},

				setNoWins: function (coords, player) {
					var $tile = c4.ui._getTile(coords);

					$tile.classList.add(classes.noWins[player]);
				},

				_getTile: function (coords) {
					var {x, y} = coords;
					if (typeof y === 'undefined') {
						y = board.getColHeight(x) - 1;
					}

					var $cols = document.querySelectorAll(selectors.col);
					var $col = $cols[x];

					var $tiles = $col.querySelectorAll(selectors.tile);
					var $tile = $tiles[y];

					return $tile;
				}
			}
		};

		return {
			init: c4.init.all
		};
	}
);