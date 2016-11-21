import React from "react";

// Constants
import { URL } from "constants/config";

// Modules
import request from "lib/request";

export default class SendMessage extends React.Component {
    
    constructor(props) {
        super(props);
        
        this.state = { id: location.hash.split('/')[2] };
        
        this.onSend = this.onSend.bind(this);
    }
    
    onSend() {
        request({
            url: `${URL}api/emails/${this.state.id}/messages/`,
            method: "POST", data: {
                to: this.refs.to.value, subject: this.refs.subject.value,
                content: this.refs.content.value
            }, success: (res) => {
                if (res.error) {
                    swal("Error", res.message, "error");
                }
                else {
                    swal(
                        "Success",
                        `Message sent to ${this.refs.to.value}`,
                        "success"
                    );

                    location.hash = `emails/messages/${this.state.id}/list`;
                }
            }
        })
    }
    
    render() {
        return (
            <div className="message-send">
                <nav className="nav-bar-sub">
                    <a href={`#emails/messages/${this.state.id}/list`}>
                        Messages
                    </a>
                    <a href={`#emails/edit/${this.state.id}`}>
                        Edit Email
                    </a>
                </nav>
                
                <input type="text" ref="to" placeholder="To" />
                
                <input type="text" ref="subject" placeholder="Subject" />
                
                <textarea ref="content"></textarea>
                
                <button onClick={this.onSend} className="btn-primary">
                    Send Message
                </button>
            </div>
        );
    }
    
}