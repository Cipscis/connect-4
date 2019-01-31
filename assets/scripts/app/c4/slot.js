define(
	[],

	function () {
		const defaults = {
			value: null,
			unreachable: false
		};

		var Slot = function (options) {
			options = Object.assign({}, defaults, options);

			this.tile = options.tile;
			this.vital = options.vital || {};
			this.unreachable = options.unreachable;
			this.noWins = options.vital || {};
		};

		Slot.prototype.getTile = function () {
			return this.tile;
		};
		Slot.prototype.setTile = function (val) {
			this.tile = val;
			this.vital = {};
		};

		Slot.prototype.getVital = function (key) {
			return this.vital[key];
		};
		Slot.prototype.setVital = function (key, val) {
			this.vital[key] = val;
		};

		Slot.prototype.getUnreachable = function () {
			return this.unreachable;
		};
		Slot.prototype.setUnreachable = function (val) {
			this.unreachable = val;
		};

		Slot.prototype.getNoWins = function (key) {
			return this.noWins[key];
		};
		Slot.prototype.setNoWins = function (key, val) {
			this.noWins[key] = val;
		};

		return Slot;
	}
);