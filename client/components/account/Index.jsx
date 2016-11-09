import React from "react";

// Components
import Purchase from "./Purchase";

// Action creators
import { deleteEmail, addEmail } from "actions/creators/account/email";

// Modules
import request from "lib/request";

// Constants
import { URL } from "constants/config";
import { PURCHASE_SUBSCRIPTION } from "constants/views";

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
            return (
                <Purchase
                    data={this.props.data}
                    dispatch={this.props.dispatch}
                />
            );
        }
        
        return (
            <div className="account">
                <section className="referral-link">
                    <label>Referral Program</label>
                    <span className="input-description">
                        Refer new users to Ptorx and they'll receive 10% off of their first purchase.
                        <br />
                        You'll receive one week of free premium subscription time for every month they purchase.
                    </span>
                    <input
                        type="text" readonly
                        value={"https://ptorx.com/#?r=" + this.props.data.account.uid}
                        onFocus={(e) => e.target.select()}
                    />
                </section>

                {this.props.data.account.subscription > Date.now() ? (
                    <section className="subscription">
                        Your subscription will expire on <strong>{
                            (new Date(this.props.data.account.subscription))
                                .toLocaleString()
                        }</strong>
                        
                        <br />
                        
                        <button
                            onClick={() =>
                                location.hash = "#account/purchase-subscription"
                            }
                            className="btn btn-primary"
                        >
                            Extend Subscription
                        </button>
                    </section>
                ) : (
                    <section className="subscription">
                        You do not have a Ptorx Premium subscription.
                        
                        <br />

                        <button
                            onClick={() =>
                                location.hash = "#account/purchase-subscription"
                            }
                            className="btn btn-primary"
                        >
                            Purchase Subscription
                        </button>
                    </section>
                )}
                
                <section className="emails">
                    <h3>Emails</h3>
                    <p>
                        These are your real emails that will receive messages redirected from your Ptorx addresses.
                    </p>
                    <div className="main-emails">
                        <div className="add">
                            <input type="text" ref="email" placeholder="email@example.com" />
                            <span className="icon-add" title="Add Email" onClick={this.onAddEmail} />
                        </div>

                        <div className="list">{
                            this.props.data.account.emails.map(email => {
                                return (
                                    <div className="email">
                                        <span className="main-address">{email.address}</span>
                                        <a
                                            className="icon-trash"
                                            title="Remove Email"
                                            onClick={this.onDeleteEmail.bind(this, email.id)}
                                        >Delete Email</a>
                                    </div>
                                );
                            })
                        }</div>
                    </div>
                </section>
            </div>                
        );
    }    

}