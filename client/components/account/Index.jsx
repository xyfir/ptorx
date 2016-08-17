import React from "react";

// Components
import Purchase from "./Purchase";

// Action creators
import { deleteEmail, addEmail } from "../../actions/creators/account/email";

// Modules
import request from "../../lib/request";

// Constants
import { URL } from "../../constants/config";
import { PURCHASE_SUBSCRIPTION } from "../../constants/views";

export default class Account extends React.Component {

    constructor(props) {
        super(props);

        this.onAddEmail = this.onAddEmail.bind(this);
    }

    onAddEmail() {
        const email = this.refs.email.value;
        
        request({
            url: URL + "api/account/email/" + email,
            method: "POST", success: (res) => {
                if (res.error) {
                    swal("Error", res.message, "error");
                }
                else {
                    this.props.dispatch(addEmail(res.id, email));
                }
            }
        })
    }

    onDeleteEmail(id) {
        swal({
            title: "Are you sure?",
            text: "Any redirect emails linked to this address will be deleted.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!"
        }, () => {
            request({
                url: URL + "api/account/email/" + id,
                method: "DELETE", success: (res) => {
                    if (res.error) {
                        swal("Error", "Could not delete address", "error");
                    }
                    else {
                        this.props.dispatch(deleteEmail(id));
                    }
                }
            });
        });
    }

    render() {
        if (this.props.data.view == PURCHASE_SUBSCRIPTION) {
            return <Purchase data={this.props.data} dispatch={this.props.dispatch} />;
        }
        
        return (
            <div className="account">
                <div className="subscription">{
                    this.props.data.account.subscription > Date.now()
                    ? (
                       <div>
                           Your subscription will expire on <strong>{
                               (new Date(this.props.data.account.subscription)).toLocaleString()
                           }</strong>
                           <br />
                           <a href="#account/purchase-subscription" className="btn btn-primary">
                               Extend Subscription
                           </a>
                       </div> 
                    )
                    : (
                        <div>
                            You do not have a Ptorx Premium subscription.
                            <br />
                            <a href="#account/purchase-subscription" className="btn btn-primary">
                                Purchase Subscription
                            </a>
                        </div>
                    )
                }</div>
                
                <hr />
                
                <h3>Emails</h3>
                <p>These are your real emails that will receive messages redirected from your Ptorx addresses.</p>
                <div className="emails">
                    <div className="add">
                        <input type="text" ref="email" placeholder="email@example.com" />
                        <span className="icon-add" title="Add Email" onClick={this.onAddEmail} />
                    </div>

                    <div className="list">{
                        this.props.data.account.emails.map(email => {
                            return (
                                <div className="email">
                                    <span className="main-address">{email.address}</span>
                                    <span
                                        className="icon-trash"
                                        title="Remove Email"
                                        onClick={this.onDeleteEmail.bind(this, email.id)}
                                    />
                                </div>
                            );
                        })
                    }</div>
                </div>
            </div>                
        );
    }    

}