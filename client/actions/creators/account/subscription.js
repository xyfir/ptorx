import { PURCHASE_SUBSCRIPTION } from "../../types/account/subscription";

export function purchaseSubscription(subscription) {
    return {
        type: PURCHASE_SUBSCRIPTION, subscription
    };
};