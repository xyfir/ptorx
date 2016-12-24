import marked from "marked";
import React from "react";

// Modules
import request from "lib/request";

// Components
import DynamicIframe from "./DynamicIframe";

export default class HelpDocs extends React.Component {
	
    constructor(props) {
        super(props);

        this.state = { show: false };
    }

    componentDidUpdate() {
        if (this.state.show) {
            const url
                = "https://api.github.com/repos/Xyfir/Documentation/contents/"
                + "ptorx/help.md";

            request(url, (res) => {
                // Add CSS files
                this.refs.frame.refs.frame.contentDocument.head.innerHTML = `
                    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700" rel="stylesheet" type="text/css">
                    <link rel="stylesheet" href="../static/css/style.css">
                `;

                // Convert markdown to html
                this.refs.frame.refs.frame.contentDocument.body.innerHTML = `
                    <div class="help-docs markdown">${
                        marked(
                            window.atob(res.content), { santize: true }
                        )
                    }</div>
                `;
            });
        }
    }

    onShowHelp() {
        this.setState({ show: !this.state.show });
    }

	render() {
        if (this.state.show) {
            return (
                <div className="help-docs">
                    <a
                        className="icon-close"
                        onClick={() => this.onShowHelp()}
                        title="Close help documents"
                    />
                    
                    <DynamicIframe ref="frame" className="documentation" />
                </div>
            );
        }
        else {
            return (
                <a
                    className="icon-info"
                    onClick={() => this.onShowHelp()}
                    title="Show help documents"
                />
            );
        }
	}

}