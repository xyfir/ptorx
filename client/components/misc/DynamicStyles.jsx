import React from "react";

export default class DynamicStyles extends React.Component {
	
    constructor(props) {
        super(props);

        this.state = { styles: "" };
    }

    componentDidMount() {
        this.setState({ styles: this._generateStyles() });
    }

    _generateStyles() {
        return `
            div.ptorx > div {
                margin-top: ${
                    document.querySelector("nav.nav-bar").scrollHeight
                    + (this._isPhoneGap() && this._isIOS() ? 40 : 0)
                }px;
            }
            nav.nav-bar {${
                this._isPhoneGap() && this._isIOS()
                ? "padding-top: 40px;" : ""
            }}
        `;
    }

    _isPhoneGap() {
        return localStorage.getItem("isPhoneGap") || (
            (window.cordova || window.PhoneGap || window.phonegap)
            && /^file:\/{3}[^\/]/i.test(window.location.href)
        );
    }

    _isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

	render() {
		return <style>{this.state.styles}</style>;
	}

}