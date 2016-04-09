import { PURCHASE_SUBSCRIPTION } from "../../types/account/subscription";

export function purchaseSubscription(months) {
    return {
        type: PURCHASE_SUBSCRIPTION, months
    };
};