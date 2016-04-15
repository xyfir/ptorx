import React from "react";

// Action creators
import {
    loadEmails, deleteEmail
} from "../../actions/creators/emails";

// Constants
import { URL } from "../../constants/config";

// Modules
import ajax from "../../lib/ajax";

export default class EmailList extends React.Component {

    constructor(props) {
        super(props);

        if (props.data.emails.length == 0) {
            ajax({
                url: URL + "api/emails", success: (res) => {
                    this.props.dispatch(loadEmails(res.emails));
                }
            });
        }
    }

    onDeleteEmail(id) {
        swal({
            title: "Are you sure?",
            text: "You will no longer receive emails sent to this address.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!"
        }, () => {
            ajax({
                url: URL + "api/emails/" + id,
                method: "DELETE", success: (res) => {
                    if (res.error) {
                        swal("Error", "Could not delete email", "error");
                    }
                    else {
                        this.props.dispatch(deleteEmail(id));
                    }
                }
            });
        });
    }

    render() {
        return (
            <div className="emails">
                <a href="#emails/create" className="btn btn-primary">Create an Email</a>
                <hr />
                <div className="list">{
                    this.props.data.emails.map(email => {
                        return (
                            <div className="email">
                                <span className="name"><a href={`#emails/edit/${email.id}`}>
                                    {email.name}
                                </a></span>
                                <span
                                    className="icon-trash"
                                    title="Delete Email"
                                    onClick={this.onDeleteEmail.bind(this, email.id) }
                                />
                                <span className="address">{email.address}</span>
                                <span className="description">{email.description}</span>
                            </div>
                        );
                    })
                }</div>
            </div>
        );
    }

}