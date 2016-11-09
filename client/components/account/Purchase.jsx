import React from "react";

// Action creators
import { purchaseSubscription } from "actions/creators/account/subscription";

// Constants
import { URL, STRIPE_KEY_PUB } from "constants/config";

// Modules
import request from "lib/request";

export default class Purchase extends React.Component {

    constructor(props) {
        super(props);
    }

    onPurchase(e) {
        e.preventDefault();

        const purchase = () => {
            Stripe.setPublishableKey(STRIPE_KEY_PUB);
            
            Stripe.card.createToken(this.refs.stripeForm, (s, res) => {
                if (res.error) {
                    swal("Error", res.error.message, "error");
                    return;
                }
                
                const data = {
                    subscription: +this.refs.subscription.value,
                    stripeToken: res.id
                };
                
                if (data.subscription == 0) {
                    swal("Error", "Select a subscription length", "error");
                    return;
                }
                
                request({
                    url: URL + "api/account/subscription",
                    method: "PUT", data, success: (res) => {
                        if (res.error) {
                            swal("Error", res.message, "error");
                        }
                        else {
                            location.hash = "#account";
                            location.reload();
                        }
                    }
                });
            });
        };
        
        // Dynamically load Stripe.js
        let element = document.createElement("script");
        element.src = "https://js.stripe.com/v2/";
        element.type = "text/javascript";
        element.onload = purchase;
        document.body.appendChild(element);
    }

    render() {
        const discount = (
            this.props.data.account.referral.referral
            || this.props.data.account.referral.affiliate
        ) && !this.props.data.account.referral.hasMadePurchase;

        return (
            <div className="purchase-subscription">
                <section>
                    {discount ? (
                        <p>
                            You will receive 10% off of your first purchase.
                        </p>
                    ) : (
                        <span />
                    )}

                    <form className="form" onSubmit={(e) => this.onPurchase(e)}>
                        <select ref="subscription" defaultValue="0">
                            <option value="0" disabled>
                                Subscription Length
                            </option>
                            <option value="1">1 Month   - $3</option>
                            <option value="2">6 Months  - $15</option>
                            <option value="3">12 Months - $24</option>
                        </select>
                    
                        <form ref="stripeForm" className="stripe-form">
                            <label>Card Number</label>
                            <input type="text" data-stripe="number"/>
            
                            <label>CVC</label>
                            <input type="number" data-stripe="cvc" />
                        
                            <div className="expiration">
                                <label>Expiration (MM/YYYY)</label>
                                <input
                                    type="number"
                                    data-stripe="exp-month"
                                    placeholder="07"
                                />
                                <span> / </span>
                                <input
                                    type="number"
                                    data-stripe="exp-year"
                                    placeholder="2020"
                                />
                            </div>

                            <button className="btn-primary">Purchase</button>
                        </form>
                    </form>
                </section>
            </div>
        )
    }

}