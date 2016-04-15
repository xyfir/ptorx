import React from "react";

// Components
import Send from "./Send";
import View from "./View";
import List from "./List";

export default class Messages extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        switch (this.props.data.view.split('/')[3]) {=
            case "SEND":
                return <Send data={this.props.data} dispatch={this.props.dispatch} />;
            case "VIEW":
                return <View data={this.props.data} dispatch={this.props.dispatch} />;
            case "LIST":
                return <List data={this.props.data} dispatch={this.props.dispatch} />;
        }
    }

}