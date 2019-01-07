import { Slider, Button, Paper } from 'react-md';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

export class PurchaseCredits extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.onSlide(1);
  }

  async onPurchase(type: 'iap' | 'normal') {
    let res: AxiosResponse;
    try {
      res = await api.post('/account/credits/purchase', {
        type,
        package: this.state.package
      });
      location.href = res.data.url;
    } catch (err) {
      swal('Error', res.data.error, 'error');
    }
  }

  /** @param {number} tier */
  onSlide(tier) {
    this.setState(
      (() => {
        switch (tier) {
          case 1:
            return {
              cost: 5,
              package: 1,
              credits: 8333,
              costPerCredit: 0.0006,
              actionsPerDollar: 1666
            };
          case 2:
            return {
              cost: 10,
              package: 2,
              credits: 18181,
              costPerCredit: 0.00055,
              actionsPerDollar: 1818
            };
          case 3:
            return {
              cost: 25,
              package: 31,
              credits: 50000,
              costPerCredit: 0.0005,
              actionsPerDollar: 2000
            };
        }
      })()
    );
  }

  render() {
    const s = this.state;
    if (!s.package) return null;

    return (
      <Paper
        zDepth={1}
        component="section"
        className="purchase-credits section flex"
      >
        <div className="info">
          <p>
            Credits allow you to send, receive, reply to, and redirect mail. See
            the <a href="#/docs/help?section=credits">Help Docs</a> for more
            information about how they work.
          </p>
          <p>
            Ptorx offers a 30 day money-back guarantee for your first purchase.
            If you're not happy with your purchase within the first 30 days,
            we'll offer a full refund, no questions asked.
          </p>
        </div>

        <Slider
          discrete
          id="slider"
          min={1}
          max={3}
          step={1}
          label={`${s.credits} credits, $${s.cost} USD`}
          value={this.state.package}
          onChange={v => this.onSlide(v)}
          discreteTicks={1}
        />

        <ul className="package-info">
          <li>
            <span className="value">${s.costPerCredit}</span> cost per credit
          </li>
          <li>
            <span className="value">{Math.floor(s.credits / 2)}</span> total
            redirects, or <span className="value">{s.credits}</span> sends,
            receives, or replies*
          </li>
          <li>
            <span className="value">{s.actionsPerDollar / 2}</span> redirects,
            or <span className="value">{s.actionsPerDollar}</span> sends,
            receives, or replies* per dollar
          </li>
        </ul>

        <p className="note">
          * Replies sent from the Ptorx app. Replies sent from a non-Ptorx inbox
          cost double.
        </p>

        <Button
          raised
          primary
          onClick={() => this.onPurchase(window.cordova ? 'iap' : 'normal')}
        >
          Purchase
        </Button>
      </Paper>
    );
  }
}
