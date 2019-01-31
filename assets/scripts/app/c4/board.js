define(
	[
		'c4/slot',
		'c4/cursor'
	],

	function (Slot, Cursor) {
		const defaults = {
			width: 7,
			height: 6
		};

		var Board = function (options) {
			options = Object.assign({}, defaults, options);

			this.width = options.width;
			this.height = options.height;

			this.slots = new Array(this.width);
			for (let x = 0; x < this.width; x++) {
				this.slots[x] = new Array(this.height);
				for (let y = 0; y < this.height; y++) {
					this.slots[x][y] = new Slot();
				}
			}
		};

		Board.prototype.placeTile = function (coords, tile) {
			var {x, y} = coords;

			try {
				if (typeof y === 'undefined') {
					y = this.getColHeight(x);
				}

				if (this.isInBounds({x, y})) {
					this.slots[x][y].setTile(tile);

					return true;
				}
			} catch (e) {
				console.error(e.message);

				return false;
			}
		};

		Board.prototype.getColHeight = function (x, throwError) {
			var height = 0;

			if (this.isInBounds({x}, throwError)) {

				let col = this.slots[x];
				for (y = 0; y < col.length; y++) {
					let slot = col[y];

					if (slot.getTile()) {
						height++;
					} else {
						break;
					}
				}

			}

			return height;
		};

		Board.prototype.isInBounds = function (coords, throwError) {
			var {x, y} = coords;
			var xInBounds = true;
			var yInBounds = true;
			var inBounds;

			if (typeof x !== 'undefined') {
				xInBounds = x >= 0 && x < this.width;
			}

			if (typeof y !== 'undefined') {
				yInBounds = y >= 0 && y < this.height;
			}

			inBounds = xInBounds && yInBounds;

			if (throwError && !inBounds) {
				throw new RangeError(`Coordinates (${x}, ${y}) are out of bounds. Board dimensions are (0, 0) through (${this.width-1}, ${this.height-1}).`);
			}

			return inBounds;
		};

		Board.prototype.getCursor = function (coords) {
			if (this.isInBounds(coords, true)) {
				return new Cursor(Object.assign({}, coords, {board: this}));
			}
		};

		Board.prototype.getSlot = function (coords) {
			var {x, y} = coords;

			if (this.isInBounds(coords, true)) {
				return this.slots[x][y];
			}
		};

		return Board;
	}
);