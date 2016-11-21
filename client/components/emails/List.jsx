import React from "react";

// Action creators
import {
    loadEmails, deleteEmail
} from "actions/creators/emails";

// Constants
import { URL } from "constants/config";

// Modules
import request from "lib/request";
import findMatches from "lib/find-matching";

// Components
import Search from "components/misc/Search";

export default class EmailList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            search: { query: "", type: 0 }
        };
        
        this.onSearch = this.onSearch.bind(this);

        if (props.data.emails.length == 0) {
            request({
                url: URL + "api/emails", success: (res) => {
                    this.props.dispatch(loadEmails(res.emails));
                }
            });
        }
    }

    onSearch(search) {
        this.setState({ search });
    }

    onDeleteEmail(id) {
        swal({
            title: "Are you sure?",
            text: "You will no longer receive emails sent to this address. \
                You will not be able to recreate this address.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!"
        }, () => {
            request({
                url: URL + "api/emails/" + id,
                method: "DELETE", success: (res) => {
                    if (res.error)
                        swal("Error", "Could not delete email", "error");
                    else
                        this.props.dispatch(deleteEmail(id));
                }
            });
        });
    }

    render() {
        return (
            <div className="emails">
                <button onClick={() => {
                    location.hash = "#emails/create";
                }}
                    className="btn-primary"
                >
                    Create an Email
                </button>
                
                <Search onSearch={this.onSearch} type="email" />
                
                <div className="list">{
                    findMatches(
                        this.props.data.emails, this.state.search
                    ).map(email => {
                        return (
                            <div className="email">
                                <span className="name">
                                    <a href={`#emails/edit/${email.id}`}>
                                        {email.name}
                                    </a>
                                </span>
                                <span className="address">{
                                    email.address
                                }</span>
                                <span className="description">{
                                    email.description
                                }</span>
                                <div className="controls">
                                    <a
                                        className="icon-trash"
                                        onClick={
                                            () => this.onDeleteEmail(email.id)
                                        }
                                    >Delete</a>
                                    <a
                                        className="icon-duplicate"
                                        href={`#emails/create?copy=${email.id}`}
                                    >Duplicate</a>
                                </div>
                            </div>
                        );
                    })
                }</div>
            </div>
        );
    }

}