import React from "react";

// Components
import Messages from "./messages/Index";
import Create from "./Create";
import Edit from "./Edit";
import List from "./List";

export default class Emails extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        switch (this.props.data.view.split('/')[1]) {
            case "MESSAGES":
                return <Messages data={this.props.data} dispatch={this.props.dispatch} />;
            case "CREATE":
                return <Create data={this.props.data} dispatch={this.props.dispatch} />;
            case "EDIT":
                return <Edit data={this.props.data} dispatch={this.props.dispatch} />;
            case "LIST":
                return <List data={this.props.data} dispatch={this.props.dispatch} />;
        }
    }

}