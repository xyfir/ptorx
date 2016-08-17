import React from "react";

// Constants
import { URL } from "../../../constants/config";

// Modules
import request from "../../../lib/request";

export default class ViewMessage extends React.Component {
    
    constructor(props) {
        super(props);
        
        this.state = {
            id: location.hash.split('/')[2], showReplyForm: false,
            message: location.hash.split('/')[2], loading: true,
            content: {}, showHeaders: false, showHTML: false
        };
        
        request({
            url: `${URL}api/emails/${this.state.id}/messages/${this.state.message}`,
            success: (res) => {
                if (res.error)
                    swal("Error", "Could not load message", "error");
                else
                    this.setState({ loading: false, content: res });
            }
        })
        
        this.onShowReplyForm = this.onShowReplyForm.bind(this);
        this.onShowHeaders = this.onShowHeaders.bind(this);
        this.onShowHTML = this.onShowHTML.bind(this);
        this.onReply = this.onReply.bind(this);
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
    
    onReply() {
        request({
            url: `${URL}api/emails/${this.state.id}/messages/${this.state.message}`,
            method: "POST", data: { content: this.refs.content.value },
            success: (res) => {
                if (res.error) {
                    swal("Error", res.message, "error");
                }
                else {
                    swal("Success", `Message sent to ${this.refs.to.value}`, "success");
                    location.hash = `emails/messages/${this.state.id}/list`;
                }
            }
        })
    }
    
    render() {
        if (this.state.loading) return <div />;
        
        return (
            <div className="message-view">
                <nav className="nav-bar-sub">
                    <a href={`#emails/messages/${this.state.id}/list`}>Messages</a>
                    <a href={`#emails/list`}>Emails</a>
                </nav>
                
                <hr />
                
                <table className="message">
                    <tr>
                        <th>From</th><td>{this.state.content.from}</td>
                    </tr>
                    <tr>
                        <th>To</th>
                        <td>{this.props.data.emails.find(e => {
                            return e.id == this.state.id;
                        }).address}</td>
                    </tr>
                    <tr>
                        <th>Subject</th>
                        <td>{this.state.content.subject}</td>
                    </tr>
                    <tr>
                        <th>Headers</th>
                        <td>{
                            this.state.showHeaders
                            ? (
                                <div className="headers">{
                                    this.state.content.headers.map(header => {
                                        return (
                                            <div className="header">
                                                <span>{header[0]}</span>
                                                <span>{header[1]}</span>
                                            </div>
                                        );
                                    })
                                }</div>
                            ) : (
                                <a onClick={this.onShowHeaders}>View Message Headers</a>
                            )
                        }</td>
                    </tr>
                    <tr>
                        <th>Text Content</th>
                        <td>{this.state.content.text}</td>
                    </tr>
                    {
                        this.state.content.html
                        ? (
                            <tr>
                                <th>HTML Content</th>
                                <td>{
                                    this.state.showHTML
                                    ? <div dangerouslySetInnerHTML={{ __html: this.state.content.html}} />
                                    : <a onClick={this.onShowHTML}>Show HTML Content</a>
                                }</td>
                            </tr>
                        ) : (<tr />)
                    }
                </table>
                
                <hr />
                
                {
                    this.state.onShowReplyForm
                    ? (
                        <div className="message-reply">
                            <textarea ref="content"></textarea>
                            
                            <button onClick={this.onReply} className="btn-primary">
                                Send Reply
                            </button>
                        </div>
                    ) : (
                        <button onClick={this.onShowReplyForm} className="btn-secondary">
                            Reply
                        </button>
                    )
                }
            </div>
        );
    }
    
}