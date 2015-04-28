//= require react-with-addons

var cx = React.addons.classSet;
var Pager = React.createClass({

    _page: 1,

    toPage: function (page) {
        this.props.onChange(page)
    },

    getInitialState: function () {
        return {current: this._page};
    },

    render: function () {
        var start = 1;
        if (this.props.pages > 10) {
            start = this.props.current - 3;
            if (start < 1) {
                start = 1;
            }
        }
        var pages = [<PrevButton ref="prev-button" current={this.props.current} max={this.props.pages}
                                 pageChange={this.toPage} key="prev"/>];
        if (start > 1) {
            pages.push(<PageButton key={1} page={1} current={this.props.current} pageChange={this.toPage}/>);
            pages.push(<li className="disabled">
                <a href="javascript: void(0);" aria-label="...">
                    <span aria-hidden="true">...</span>
                </a>
            </li>)
        }
        var end = 1;
        for (var i = start; i <= this.props.pages && i <= start + 7; i++) {
            pages.push(<PageButton key={i} page={i} current={this.props.current} pageChange={this.toPage}/>);
            end = i;
        }
        if (end < this.props.pages) {
            if (end < this.props.pages - 1) {
                pages.push(<li className="disabled">
                    <a href="javascript: void(0);" aria-label="...">
                        <span aria-hidden="true">...</span>
                    </a>
                </li>);
            }
            pages.push(<PageButton key={this.props.pages} page={this.props.pages} current={this.props.current}
                                   pageChange={this.toPage}/>)
        }
        pages.push(<NextButton current={this.props.current} max={this.props.pages} pageChange={this.toPage} key="next"/>);
        return (
            <ul className="pagination pagination-sm pull-right">
                {pages}
            </ul>
        )
    }

});

var NextButton = React.createClass({
    handleClick: function () {
        if(this.props.current != this.props.max) {
            var current = this.props.current;
            var newPage = current < this.props.max ? current + 1 : this.props.max;
            this.props.pageChange(newPage);
        }
        
    },

    render: function () {
        var classes = cx({
            'disabled': this.props.current == this.props.max
        });
        return (
            <li className={classes}>
                <a href="javascript: void(0);" aria-label="Previous" onClick={this.handleClick}>
                    <i className="fa fa-caret-right" aria-hidden="true"></i>
                </a>
            </li>
        )
    }
});

var PageButton = React.createClass({
    handleClick: function () {
        if(this.props.page != this.props.current) {
                    this.props.pageChange(this.props.page);            
        }
    },

    render: function () {
        var classes = cx({
            'active': this.props.page == this.props.current
        });
        return (
            <li className={classes}>
                <a href="javascript: void(0);" aria-label="Previous" onClick={this.handleClick}>
                    <span aria-hidden="true">{this.props.page}</span>
                </a>
            </li>
        )
    }
});

var PrevButton = React.createClass({
    handleClick: function () {
        if(this.props.current != 1){
            var current = this.props.current;
            var newPage = current > 1 ? current - 1 : 1;
            this.props.pageChange(newPage);    
        }
    },

    render: function () {
        var classes = cx({
            'disabled': this.props.current == 1
        });
        return (
            <li className={classes}>
                <a href="javascript: void(0);" aria-label="Previous" onClick={this.handleClick}>
                    <i className="fa fa-caret-left" aria-hidden="true"></i>
                </a>
            </li>
        )
    }
});
