import React from "react";

// Action creators
import {
    loadMessages, deleteMessage
} from "actions/creators/messages";

// Modules
import parseQuery from "lib/parse-hash-query";
import request from "lib/request";

export default class MessageList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            id: location.hash.split('/')[2], rejected: !!parseQuery().rejected,
            loading: true
        };

        const url = `../api/emails/${this.state.id}/messages`
            + (this.state.rejected ? "?rejected=1" : "");

        request(url, (res) => {
            this.props.dispatch(loadMessages(res.messages));
            this.setState({ loading: false });
        });
    }

    onDeleteMessage(id) {
        swal({
            title: "Are you sure?",
            text: "This action cannot be undone",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!"
        }, () => {
            request({
                url: `../api/emails/${this.state.id}/messages/${id}`,
                method: "DELETE",
            }, (res) => {
                if (res.error)
                    swal("Error", "Could not delete message", "error");
                else
                    this.props.dispatch(deleteMessage(id));
            });
        });
    }

    render() {
        if (this.state.loading) return <div />;
        
        return (
            <div className="messages">
                <nav className="navbar-sub">
                    <a href={`#emails/messages/${this.state.id}/send`}>
                        Send Message
                    </a>
                    <a href={`#emails/edit/${this.state.id}`}>
                        Edit Email
                    </a>
                    <a onClick={() => {
                        if (this.state.rejected)
                            location.hash = location.hash.split('?')[0];
                        else
                            location.hash += "?rejected=1";
                        location.reload();
                    }}>
                        {this.state.rejected ? "" : "Rejected "}Messages
                    </a>
                </nav>
                
                <div className="list">{
                    this.props.data.messages.length
                    ? this.props.data.messages.map(msg => {
                        return (
                            <div className="message">
                                <span className="subject">
                                    <a href={
                                        "#emails/messages/" + this.state.id
                                        + "/view/" + msg.id
                                    }>{msg.subject}</a>
                                </span>
                                <span className="received">{
                                    (new Date(msg.received * 1000))
                                        .toLocaleString()
                                }</span>
                                <div className="controls">
                                    <a
                                        className="icon-trash"
                                        onClick={() => this.onDeleteMessage(msg.id)}
                                    >Delete</a>
                                </div>
                            </div>
                        );
                    }) : <h3>This inbox is empty</h3>
                }</div>
            </div>
        );
    }

}