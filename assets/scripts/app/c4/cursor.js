define(
	[],

	function () {
		const defaults = {
			x: 0,
			y: 0
		};

		var Cursor = function (options) {
			options = Object.assign({}, defaults, options);

			if (!options.board) {
				throw new Error('Cursor cannot be created without a board.');
			}

			this.x = options.x;
			this.y = options.y;
			this.board = options.board;
		};

		Cursor.prototype.getSlot = function () {
			return this.board.slots[this.x][this.y];
		};

		Cursor.prototype.getTile = function () {
			return this.getSlot().getTile();
		};

		Cursor.prototype.getVital = function (key) {
			return this.getSlot().getVital(key);
		};

		Cursor.prototype.getUnreachable = function () {
			return this.getSlot().getUnreachable();
		};

		Cursor.prototype.getNoWins = function (key) {
			return this.getSlot().getNoWins(key);
		};


		Cursor.prototype.up = function (i = 1) {
			var newY = this.y + i;

			if (this.board.isInBounds({x: this.x, y: newY})) {
				this.y = newY;
				return this;
			}
		};

		Cursor.prototype.down = function (i = 1) {
			return this.up(-i);
		};

		Cursor.prototype.right = function (i = 1) {
			var newX = this.x + i;

			if (this.board.isInBounds({x: newX, y: this.y})) {
				this.x = newX;
				return this;
			}
		};

		Cursor.prototype.left = function (i = 1) {
			return this.right(-i);
		};

		Cursor.prototype.upRight = function (i = 1) {
			var coords = {x: this.x, y: this.y};

			try {
				return this.up(i).right(i);
			} catch (e) {
				this.x = coords.x;
				this.y = coords.y;
			}
		};

		Cursor.prototype.downLeft = function (i = 1) {
			return this.upRight(-i);
		};

		Cursor.prototype.upLeft = function (i = 1) {
			var coords = {x: this.x, y: this.y};

			try {
				return this.up(i).left(i);
			} catch (e) {
				this.x = coords.x;
				this.y = coords.y;
			}
		};

		Cursor.prototype.downRight = function (i = 1) {
			return this.upLeft(-i);
		};

		return Cursor;
	}
);