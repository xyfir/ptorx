import React from "react";

// Constants
import { URL } from "constants/config";

// Modules
import request from "lib/request";

export default class ViewMessage extends React.Component {
    
    constructor(props) {
        super(props);
        
        this.state = {
            id: location.hash.split('/')[2], showReplyForm: false,
            message: location.hash.split('/')[4], loading: true,
            content: {}, showHeaders: false, showHTML: false
        };
        
        request(
            `${URL}api/emails/${this.state.id}/messages/${this.state.message}`,
            (res) => {
                if (res.error)
                    swal("Error", "Could not load message", "error");
                else
                    this.setState({ loading: false, content: res });
            }
        );
        
        this.onShowHeaders = this.onShowHeaders.bind(this);
        this.onShowHTML = this.onShowHTML.bind(this);
    }
    
    onShowReplyForm() {
        this.setState({ showReplyForm: true });
    }
    
    onShowHeaders() {
        this.setState({ showHeaders: true });
    }
    
    onShowHTML() {
        this.setState({ showHTML: true });
    }
    
    onReply(e) {
        e.preventDefault();

        request({
            url: `${URL}api/emails/${this.state.id}/messages/${this.state.message}`,
            method: "POST", data: { content: this.refs.content.value }
        }, (res) => {
            if (res.error) {
                swal("Error", res.message, "error");
            }
            else {
                swal("Success", `Message sent to ${this.refs.to.value}`, "success");
                location.hash = `emails/messages/${this.state.id}/list`;
            }
        });
    }
    
    render() {
        if (this.state.loading) return <div />;
        
        return (
            <div className="message-view">
                <nav className="nav-bar-sub">
                    <a href={`#emails/messages/${this.state.id}/list`}>
                        Messages
                    </a>
                    <a href={`#emails/messages/${this.state.id}/list?rejected=1`}>
                        Rejected Messages
                    </a>
                    <a href={`#emails/list`}>Emails</a>
                </nav>
                
                <dl className="message">
                        <dt>From</dt>
                        <dd>{this.state.content.from}</dd>

                        <dt>To</dt>
                        <dd>{this.props.data.emails.find(e => {
                            return e.id == this.state.id;
                        }).address}</dd>

                        <dt>Subject</dt>
                        <dd>{this.state.content.subject}</dd>
                    
                        <dt>Headers</dt>
                        <dd>{this.state.showHeaders ? (
                            <dl className="headers">{
                                this.state.content.headers.map(header => {
                                    return (
                                        <div className="header">
                                            <dt>{header[0]}</dt>
                                            <dd>{header[1]}</dd>
                                        </div>
                                    );
                                })
                            }</dl>
                        ) : (
                            <a onClick={this.onShowHeaders}>
                                View Message Headers
                            </a>
                        )}</dd>
                    
                        <dt>Text Content</dt>
                        <dd className="text">{this.state.content.text}</dd>
                    
                    {this.state.content.html ? (
                        <div>
                            <dt>HTML Content</dt>
                            <dd>{this.state.showHTML ? (
                                <div
                                    className="html"
                                    dangerouslySetInnerHTML={{
                                        __html: this.state.content.html
                                    }}
                                />
                            ) : (
                                <a onClick={this.onShowHTML}>
                                    Show HTML Content
                                </a>
                            )}</dd>
                        </div>
                    ) : (
                        <div />
                    )}
                </dl>
                
                {this.state.showReplyForm ? (
                    <form
                        className="message-reply"
                        onSubmit={(e) => this.onReply(e)}
                    >
                        <textarea ref="content" />
                        
                        <button className="btn-primary">
                            Send Reply
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => this.onShowReplyForm()}
                        className="btn-secondary"
                    >Reply</button>
                )}
            </div>
        );
    }
    
}