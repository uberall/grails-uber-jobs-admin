var SettingsStore = {

	CONFIG_KEY: 'uberjobs.user.settings',

	_inital: {
		refreshInterval: 5000
	},

	_current: null,

	get: function (success) {
		var fromStore = localStorage.getItem(this.CONFIG_KEY);
		var result = null
		if(!fromStore){
			result = this._inital;
		} else {
			result = JSON.parse(fromStore);
		}
		this._current = result;
		success(result)
	},

	update: function (settings, success) {
		localStorage.setItem(this.CONFIG_KEY, JSON.stringify(settings));
		// we parse everything again!
		this.get(success)
	},

	getSetting: function (setting) {
		return this._current[setting];
	}
};