'use strict';
//= require react-with-addons
//= require ../lib/moment.js

var FromNow = React.createClass({

    render: function () {
        return (<span>{moment(this.props.time).fromNow()}</span>)
    }
});

var FormatDate = React.createClass({

    render: function () {
        return (<span>{moment(this.props.time).format("DD.MM.YY, HH:mm:ss.SSS")}</span>)
    }
});

var MaxButtonGroup = React.createClass({

    propTypes: {
        numbers: React.PropTypes.array.isRequired,
        current: React.PropTypes.number,
        onChange: React.PropTypes.func.isRequired
    },

    buttonClicked: function (e) {
        this.props.onChange($(e.target).data("value"))
    },

    render: function () {

        var maxes = [20, 50, 100]
        var buttons = []
        _.each(this.props.numbers, function (value) {
            var classes = cx({"btn": true, "btn-xs": true, "btn-default": this.props.current !== value, "btn-success": this.props.current === value});
            buttons.push(<button onClick={this.buttonClicked} type="button" className={classes} key={value} data-value={value}>{value}</button>)
        }.bind(this));
        return (<div className="btn-group" role="group" aria-label="MaxFilter">{buttons}</div>)
    }
})

var SortableColumn = React.createClass({

    onClick: function () {
        var order = 'desc'
        if (this.props.current.order === 'desc') {
            order = 'asc'
        }
        this.props.onToggled(this.props.field, order);
    },

    render: function () {
        var cx = React.addons.classSet;
        var classes = cx({
            'sorted': this.props.field === this.props.current.field,
            'asc': this.props.current.order === 'asc',
            'desc': this.props.current.order === 'desc'
        });
        return (
            <th><a href="jaspecvascript:void(0)" className={classes} onClick={this.onClick}>{this.props.text}</a></th>)
    }

});

var ValidateableInput = React.createClass({

    propTypes: {
        type: React.PropTypes.string,
        field: React.PropTypes.string.isRequired,
        text: React.PropTypes.string.isRequired,
        value: React.PropTypes.any,
        onChange: React.PropTypes.func.isRequired,
        error: React.PropTypes.object,
        placeholder: React.PropTypes.oneOfType([
            React.PropTypes.bool,
            React.PropTypes.string
        ])
    },

    render: function (argument) {
        var cx = React.addons.classSet;
        var formGroupClasses = cx({
            'form-group': true,
            'has-error': this.props.error[this.props.field] !== undefined
        });
        return (
            <div className={formGroupClasses}>
                <label htmlFor={this.props.field} className="col-sm-2 control-label">{this.props.text}</label>

                <div className="col-sm-10">
                    <input type={this.props.type || "text"} className="form-control" id={this.props.field} name={this.props.field} placeholder={this.props.placeholder || this.props.text}
                           required={this.props.required} value={this.props.value} onChange={this.props.onChange}/>
                </div>
            </div>
        )
    }
});

/**
 * taken from https://github.com/priteshgupta/React-Typeahead/blob/master/typeahead.js
 **/
var Typeahead = React.createClass({

    customWhere: function (arr, t) {
        var results = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];
            if (t(item)) {
                results.push(item);
            }
        }
        return results;
    },

    getInitialState: function () {
        return {value: '', index: -1, selected: true};
    },
    handleClick: function (e) {
        this.setState({value: e.target.innerHTML, selected: true});
        if (this.props.valueChange) {
            this.props.valueChange(e.target.innerHTML)
        }
    },
    handleChange: function (e) {
        this.setState({value: e.target.value, selected: false, index: 0});
    },
    selectItem: function (e) {
        if (this.state.selected) return;

        if (e.keyCode === 40 && this.state.index < this.items.length - 1) {
            this.setState({index: ++this.state.index});
        }
        else if (e.keyCode === 38 && this.state.index > 0) {
            this.setState({index: --this.state.index});
        }
        else if (e.keyCode === 13) {
            this.setState({value: this.items[this.state.index].key, selected: true, index: 0});
        }
    },
    handleFocus: function (e) {
        this.setState({selected: false});
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState({value: nextProps.value || '', index: -1, selected: true});
    },
    render: function () {
        this.items = [];

        var searchResult = this.state.selected || (
                <div className="list-group typeahead">
                    {this.items}
                </div>
            );

        this.state.selected || this.customWhere(this.props.array, function (el) {
            el = el.toLowerCase();
            var val = this.state.value.toLowerCase();

            return el.indexOf(val) > -1 || el.replace('-', ' ').indexOf(val) > -1;
        }.bind(this)).every(function (el, idx) {
            if (!this.state.value && idx > 9) return;
            var className = this.state.index === idx ? 'list-group-item active' : 'list-group-item';

            return this.items.push(<a key={el} className={className} onClick={this.handleClick}>{el}</a>);
        }, this);

        return (
            <div className="field-group">
                <input type="text" id={this.props.id} required className="form-control" value={this.state.value}
                       placeholder={this.props.placeholder}
                       onChange={this.handleChange} onKeyDown={this.selectItem} onFocus={this.handleFocus}/>
                {searchResult}
            </div>
        );
    }
});

var Alert = React.createClass({

    propTypes: {
        visible: React.PropTypes.bool.isRequired,
        type: React.PropTypes.oneOf(['success', 'danger', 'warning'])
    },

    getInitialState: function() {
        return {
            visible: false 
        };
    },

    componentWillReceiveProps: function(nextProps) {
      this.state.visible = nextProps.visible
      this.setState(this.state);
    },

    _hideAlert: function () {
        this.state.visible = false;
        this.setState(this.state)
    },

    render: function (argument) {
        var cx = React.addons.classSet;
        var alertClasses = cx({
            "alert": true,
            "alert-dismissible": true,
            "hidden": !this.state.visible, 
            "alert-success": this.props.type === "success",
            "alert-danger": this.props.type === "danger",
            "alert-warning": this.props.type === "warning",
        });
        return (
            <div className={alertClasses} role="alert">
                <button type="button" className="close" aria-label="Close" onClick={this._hideAlert}>
                    <span aria-hidden="true">&times;</span>
                </button>
                <strong>{this.props.text}</strong>
            </div>
            )
    }


});
