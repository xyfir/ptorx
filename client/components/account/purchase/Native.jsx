import React from "react";

// Constants
import products from "constants/products";

// Modules
import request from "lib/request";

export default class NativePurchase extends React.Component {

    constructor(props) {
        super(props);

        this.state = { products: [] };
    }

    componentWillMount() {
        // inAppPurchase global set by cordova-plugin-inapppurchase in PG wrapper
        if (!window.inAppPurchase) {
            swal("Error", "An unknown error occured", "error");
            return;
        }

        // Load products using IDs from App Store / Play Store
        window.inAppPurchase.getProducts(products)
            .then(products => {
                this.setState({ products });
            })
            .catch(err => {
                swal("Error", "Could not load product list", "error");
            });
    }

    onPurchase(product) {
        swal({
            title: "Purchase",
            text: "Are you sure you'd like to purchase this item?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes"
        }, () => {
            let data;

            window.inAppPurchase.buy(product)
                .then(d => {
                    data = JSON.stringify(d);
                    
                    return window.inAppPurchase.consume(
                        data.productType, data.receipt, data.signature
                    );
                })
                .then(() => {
                    request({
                        url: "../api/account/native-purchase",
                        method: "POST", data
                    }, (res) => {
                        if (res.error) {
                            swal("Error", res.message, "error");
                        }
                        else {
                            location.hash = "#account";
                            location.reload();
                        }
                    });
                })
                .catch(err => {
                    swal("Error", "Could not purchase item", "error");
                });
        });
    }

    render() {
        return (
            <div className="purchase-subscription native">{
                this.state.products.map(p =>
                    <div className="product" key={p.productId}>
                        <span className="title">{p.title}</span>

                        <span className="description">{p.description}</span>

                        <button
                            className="btn-primary"
                            onClick={() => this.onPurchase(p.productId)}
                        >Buy ({p.price})</button>
                    </div>
                )
            }</div>
        )
    }

}