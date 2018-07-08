import { Button } from 'react-md';
import React from 'react';

export default class HowItWorks extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      view: 'start'
    };
  }

  onPlay() {
    this.setState({ view: 'play' });
  }

  render() {
    if (this.state.view == 'start')
      return (
        <div className="how-ptorx-works start">
          <h2>Interested in how Ptorx works?</h2>
          <Button
            flat
            primary
            iconChildren="info"
            onClick={() => this.onPlay()}
          >
            Learn More
          </Button>
        </div>
      );

    return (
      <div className="how-ptorx-works view">
        <span>Ptorx at its most basic level is very simple:</span>
        <ol>
          <li>
            Create a new proxy email from within the Ptorx app, site, or
            extension by choosing your own address and domain or letting Ptorx
            randomly choose for you.
          </li>
          <li>
            Optionally, enable redirecting incoming mail to one of your
            "primary" addresses, saving mail to Ptorx for later viewing, or
            both.
          </li>
          <li>
            Use your proxy email to create accounts, or give it to people as
            your contact address.
          </li>
          <li>
            A site or person sends mail to your proxy email. If your proxy
            address is set to redirect incoming mail to your primary address,
            the process will look something like this:
            <span className="address"> account-creation@some-site.com </span>
            to
            <span className="address"> proxy-address@ptorx.com </span>,
            redirected to
            <span className="address"> primary-address@gmail.com</span>.
          </li>
        </ol>
        <span>
          There are lots of other features as well, like filters, modifiers,
          saving mail, and much more!
        </span>
      </div>
    );
  }
}
