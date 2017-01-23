import React from "react";

// Modules
import request from "lib/request";

// Components
import StripePurchase from "./purchase/Stripe";
import NativePurchase from "./purchase/Native";

export default class Purchase extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            useNative: localStorage.getItem("isPhoneGap") == "true"
        };
    }

    render() {
        return this.state.useNative
            ? (<NativePurchase {...this.props} />)
            : (<StripePurchase {...this.props} />);
    }

}