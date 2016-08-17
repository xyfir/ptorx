import React from "react";

// Action creators
import {
    loadMessages, deleteMessage
} from "../../../actions/creators/messages";

// Constants
import { URL } from "../../../constants/config";

// Modules
import request from "../../../lib/request";

export default class MessageList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            id: location.hash.split('/')[2], loading: true
        };

        request({
            url: `${URL}api/emails/${this.state.id}/messages`,
            success: (res) => {
                this.props.dispatch(loadMessages(res.messages));
                this.setState({ loading: false });
            }
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
                url: `${URL}api/emails/${this.state.id}/messages/${id}`,
                method: "DELETE", success: (res) => {
                    if (res.error) {
                        swal("Error", "Could not delete message", "error");
                    }
                    else {
                        this.props.dispatch(deleteMessage(id));
                    }
                }
            });
        });
    }

    render() {
        if (this.state.loading) return <div />;
        
        return (
            <div className="messages">
                <nav className="nav-bar-sub">
                    <a href={`#emails/messages/${this.state.id}/send`}>Send Message</a>
                    <a href={`#emails/list`}>Emails</a>
                </nav>
                
                <div className="list">{
                    this.props.data.messages.length
                    ? this.props.data.messages.map(msg => {
                        return (
                            <div className="message">
                                <span className="subject">
                                    <a href={`#emails/messages/${this.state.id}/view/${msg.id}`}>
                                        {msg.subject}
                                    </a>
                                </span>
                                <span
                                    className="icon-trash"
                                    title="Delete Message"
                                    onClick={this.onDeleteMessage.bind(this, msg.id) }
                                />
                                <span className="received">{
                                    (new Date(msg.received * 1000)).toLocaleString()
                                }</span>
                            </div>
                        );
                    }) : <h3>Your inbox is empty</h3>
                }</div>
            </div>
        );
    }

}