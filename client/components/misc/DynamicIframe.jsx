import React from "react";

export default class DynamicIframe extends React.Component {

    constructor(props) {
        super(props);

        this._setHeight = this._setHeight.bind(this);
    }

    componentDidMount() {
        this.refs.frame.style.border = "none";
        this.interval = setInterval(() => this._setHeight(), 200);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    _getHeight(doc) {
        let body = doc.body, html = doc.documentElement;
        
        return Math.max(
            html.clientHeight, html.scrollHeight, html.offsetHeight,
            body.scrollHeight, body.offsetHeight
        );
    }

    _setHeight() {
        let doc = this.refs.frame.contentDocument
            ? this.refs.frame.contentDocument
            : this.refs.frame.contentWindow.document;
        
        this.refs.frame.style.height = this._getHeight(doc) + "px";
    }

    render() {
        return (
            <iframe
                ref="frame"
                src={this.props.src || ""}
                width="100%"
                scrolling="no"
                className={this.props.className}
            />
        );
    }

}