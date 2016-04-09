import React from "react";

// Action creators
import { purchaseSubscription } from "../../actions/creators/account/subscription";

// Constants
import { URL, STRIPE_KEY_PUB } from "../../constants/config";

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
                this.props.dispatch(error(res.error.message));
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
            
            ajax({
                url: URL + "api/account/subscription",
                method: "PUT", data, success: (res) => {
                    if (res.err) {
                        swal("Error", res.message, "error");
                    }
                    else {
                        this.props.dispatch(purchaseSubscription(months));
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
                    
                        <label>Expiration (MM/YYYY)</label>
                        <input type="number" data-stripe="exp-month" placeholder="07"/>
                        <span> / </span>
                        <input type="number" data-stripe="exp-year" placeholder="2020" />
                    </form>
                    
                    <button onClick={this.onPurchase} className="btn-primary">Purchase</button>
                </div>
            </div>
        )
    }

}