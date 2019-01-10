import { Button, DialogContainer } from 'react-md';
import * as React from 'react';
import { Link } from 'react-router-dom';

export class Welcome extends React.Component<{}, { welcome: boolean }> {
  constructor(props) {
    super(props);
    this.state = { welcome: !localStorage.hasRun };
  }

  onHideWelcome() {
    this.setState({ welcome: false });
    localStorage.hasRun = true;
  }

  render() {
    if (!this.state.welcome) return null;

    return (
      <DialogContainer
        id="welcome-dialog"
        onHide={() => this.onHideWelcome()}
        visible={true}
        focusOnMount={false}
      >
        <h2>What are credits?</h2>
        <p>
          Before you get started with Ptorx, it's important to take just a
          second to learn what credits are and how they work. Simply put:
          credits allow you to send and receive mail. This also includes
          redirecting incoming mail to your primary addresses and replying to
          received mail.
        </p>
        <p>
          Whenever you send or receive mail your credits will decrease, usually
          by one or two credits per action. When your credits reach 0, your
          proxy emails are <em>disabled</em>, meaning they'll no longer work!
          Once you receive credits afterwards, your proxy emails will be enabled
          again and everything will work as before.
        </p>
        <p>
          Credits can be{' '}
          <Link to="/app/account/credits/purchase">purchased</Link>, or{' '}
          <Link to="/app/account/credits/earn">earned</Link>, and are also
          rewarded when you <Link to="/app/account/credits/earn">refer</Link>{' '}
          other users to Ptorx!
        </p>
        <p>
          If you're ever feeling confused, open the app menu and check out the{' '}
          <Link to="/app/docs/help">Help Docs</Link>!
        </p>
        <Button primary raised onClick={() => this.onHideWelcome()}>
          Got it, thanks!
        </Button>
      </DialogContainer>
    );
  }
}
