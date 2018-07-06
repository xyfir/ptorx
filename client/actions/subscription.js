import { PURCHASE_SUBSCRIPTION } from 'constants/actions';

export function purchaseSubscription(subscription) {
  return {
    type: PURCHASE_SUBSCRIPTION,
    subscription
  };
}
