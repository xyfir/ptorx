import React from "react";

// Action creators
import { purchaseSubscription } from "../../actions/creators/account/subscription";

// Constants
import { URL, STRIPE_KEY_PUB } from "../../constants/config";

// Modules
import request from "../../lib/request";

export default class Purchase extends React.Component {

    constructor(props) {
        super(props);

        this.onPurchase = this.onPurchase.bind(this);
    }

    onPurchase() {
        const purchase = () => {
            Stripe.setPublishableKey(STRIPE_KEY_PUB);
            
            Stripe.card.createToken(this.refs.stripeForm, (s, res) => {
            if (res.error) {
                swal("Error", res.error.message, "error");
                return;
            }
            
            let data = {
                months: +this.refs.subscription.value,
                stripeToken: res.id
            };
            
            if (data.months == 0) {
                swal("Error", "Select a subscription length", "error");
                return;
            }
            
            request({
                url: URL + "api/account/subscription",
                method: "PUT", data, success: (res) => {
                    if (res.err) {
                        swal("Error", res.message, "error");
                    }
                    else {
                        const days = [0, 30, 180, 360][data.months];
                        let subscription = this.props.data.account.subscription;
                        
                        if (subscription == 0)
                            subscription = Date.now() + (days * 86400 * 1000);
                        else
                            subscription += (days * 86400 * 1000);
                        
                        this.props.dispatch(purchaseSubscription(subscription));
                        swal("Purchase Complete", "", "success");
                    }
                }
            });
        })};
        
        // Dynamically load Stripe.js
        let element = document.createElement('script');
        element.src = 'https://js.stripe.com/v2/';
        element.type = 'text/javascript';
        element.onload = purchase;
        document.body.appendChild(element);
    }

    render() {
        return (
            <div className="purchase-subscription">
                <div className="form">
                    <select ref="subscription" defaultValue="0">
                        <option value="0" disabled>Subscription Length</option>
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
                            <input type="number" data-stripe="exp-month" placeholder="07"/>
                            <span> / </span>
                            <input type="number" data-stripe="exp-year" placeholder="2020" />
                        </div>
                    </form>
                    
                    <button onClick={this.onPurchase} className="btn-primary">Purchase</button>
                </div>
            </div>
        )
    }

}