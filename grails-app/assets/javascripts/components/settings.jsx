//= require react-with-addons
//= require ../stores/settings-store.js
//= require commons.jsx
//= require ../constants.js

var Settings = React.createClass({

	_initalValue: {},

	getInitialState: function() {

	  return {
	    settings: {},
	    success: null,
	  };
	},

	componentDidMount: function() {
		SettingsStore.get(function (settings) {
			this.state.settings = _.clone(settings, true);
			this._initalValue = _.clone(settings, true);
			this.setState(this.state);
		}.bind(this));
	},

	_onFormSubmit: function (e) {
		e.preventDefault();
		SettingsStore.update(this.state.settings, function (settings) {
			this._initalValue = _.clone(settings, true);
			this.state.settings = _.clone(settings, true);
			this.state.success = true;
			this.setState(this.state);
		}.bind(this))
	},

	_onFormReset: function (e) {
		e.preventDefault();
		this.state.settings = _.clone(this._initalValue, true);
		this.state.success = null;
		this.setState(this.state);
	},

	_onValueChange: function (e) {
		var $el = $(e.target);
		this.state.settings[$el.prop("name")] = $el.val();
		this.state.success = null;
		this.setState(this.state)
	},

	render: function() {
		var settings = this.state.settings;
		return (
			<div className="row">
				<div className="col-sm-12">
					<form className="form-horizontal" onSubmit={this._onFormSubmit} onReset={this._onFormReset}>
					<div className="form-group">
                        <label htmlFor={UserSettings.REFRESH_INTERVAL} className="col-sm-2 control-label">Refresh Interval</label>
                        
                        <div className="col-sm-10">
                          <div className="input-group">
					      	<input type="text" id={UserSettings.REFRESH_INTERVAL} name={UserSettings.REFRESH_INTERVAL} className="form-control" value={settings[UserSettings.REFRESH_INTERVAL]} onChange={this._onValueChange} placeholder="Time between list refreshs" />
					        <span className="input-group-addon">ms</span>
					      </div>    
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10">
                            <button type="submit" className="btn btn-default">Save</button>
                            <button type="reset" className="btn btn-warning">Reset</button>
                        </div>
                    </div>
                    <div className="col-sm-10 col-sm-offset-2">
                        <Alert visible={this.state.success !== null} type={this.state.success ? 'success' : 'danger'} text={this.state.success ? 'Saved.' : 'Error!'} />
                    </div>
					</form>
				</div>
			</div>
		);
	}
});