import Typed from 'typed.js';
import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default class HowItWorks extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      view: 'start', paused: false, complete: false
    };
  }

  onPlay() {
    let state = Object.assign({}, this.state);

    // Go from start to set-1
    if (state.view == 'start') {
      state = { view: 'set-1', paused: false };
    }
    // Pause set-1 if active, else go to set-2
    else if (state.view == 'set-1') {
      if (state.complete)
        state = { view: 'set-2', paused: false, complete: false };
      else
        state.paused = !state.paused;
    }
    // Pause set-2 if active, else start over at step-1
    else if (state.view == 'set-2') {
      if (state.complete)
        state = { view: 'set-1', paused: false, complete: false };
      else
        state.paused = !state.paused;
    }

    // Toggle active state, no need to create new typed
    if (state.paused != this.state.paused)
      return this.setState(state, () => this.typed.toggle());

    // Destroy old typed
    if (state.view != this.state.view && this.typed)
      this.typed.destroy();

    this.setState(state, () => {
      this.typed = new Typed('span.typed', {
        stringsElement: 'div.typed-strings.' + state.view,
        smartBackspace: true,
        onComplete: () => this.setState({ complete: true }),
        startDelay: 1000,
        backDelay: 1000,
        typeSpeed: 45,
        backSpeed: 0,
        fadeOut: true,
        loop: false
      });
    });
  }

  render() {
    if (this.state.view == 'start') return (
      <div className='how-ptorx-works start'>
        <h2>How Ptorx Works</h2>
        <Button
          icon primary
          iconChildren='play_circle_outline'
          onClick={() => this.onPlay()}
        />
      </div>
    )

    return (
      <div className='how-ptorx-works'>
        <div className='typed-container'>
          <span className='typed' />
        </div>

        <Button
          icon primary
          onClick={() => this.onPlay()}
          iconChildren={
            this.state.paused || this.state.complete
              ? 'play_circle_outline'
              : 'pause_circle_outline'
          }
        />

        <div className='typed-strings set-1'>
          <span>Curious how Ptorx works?</span>
          <span><strong>Step 1.</strong> Create a new proxy email from within the Ptorx app.</span>
          <span>Customize your address. How about <span className='address'>your-custom-proxy-address@ptorx.com</span>?</span>
          <span>Feeling indecisive? Let Ptorx choose for you.</span>
          <span>Maybe we'll choose <span className='address'>lazydog27@ptorx.com</span>.</span>
          <span>You can also use your own domain. <span className='address'>lazydog27@your-domain.com</span> sounds good.</span>
          <span><strong>Step 2.</strong> You can optionally point it to any of your real, "primary" email addresses.</span>
          <span><span className='address'>your-primary-address@gmail.com</span></span>
          <span><span className='address'>your-primary-address@aol.com</span></span>
          <span><span className='address'>your-primary-address@any-domain.com</span></span>
          <span><strong>Step 3.</strong> Use your proxy email in place of your primary one.</span>
          <span>Use it to create accounts, or give it to people as your contact address.</span>
          <span><strong>Step 4.</strong> Some site or person sends mail to your proxy email.</span>
          <span>If your proxy address is set to redirect incoming mail to your primary address:</span>
          <span>from <span className='address'>account-creation@some-site.com</span> to <span className='address'>your-proxy-address@ptorx.com</span> redirected to <span className='address'>your-primary-address@gmail.com</span></span>
          <span>Then when you open up Gmail or whatever your preferred email client is...</span>
          <span>"You've got mail!"</span>
          <span>Don't want to redirect mail? Then have it stored on Ptorx, and access it from our app.</span>
          <span>Ready to hear about more of the features Ptorx offers?</span>
        </div>

        <div className='typed-strings set-2'>
          <span>Need more control over what mail you receive? Good thing Ptorx has filters.</span>
          <span>Create one or multiple filters that can be linked to one or multiple proxy emails.</span>
          <span>You can filter incoming mail by its subject, sender address, sender domain, text content, html content, or its headers.</span>
          <span>With one click or tap, you can also completely ignore any mail marked as spam!</span>
          <span>Now whenever your proxy address receives mail, we check if the message matches any linked filters.</span>
          <span>If there is a match for a blacklist filter, the message gets rejected.</span>
          <span>The message also gets rejected if it doesn't match all of your linked whitelist filters.</span>
          <span>That way you only receive the mail you want from each proxy email.</span>
          <span>Now, what if you start getting spam from an address, and you just want to stop receiving mail from it altogether?</span>
          <span>Delete it! If you think you might need it again in the future, simply disable mail redirection.</span>
          <span>Ptorx will save any incoming mail for three days, which can then be accessed from within the app.</span>
          <span>What if you want to modify the content of incoming mail before it gets redirected to you?</span>
          <span>Ptorx can do that too. Say hello to modifiers.</span>
          <span>Available modifiers are:</span>
          <span>text only, find and replace (with or without regular expressions),</span>
          <span>overwrite the subject, tag the subject with custom text,</span>
          <span>concatenate multiple email fields together,</span>
          <span>and the Builder modifier for complete control over certain email fields and their values.</span>
          <span>Like filters, you can attach one or multiple modifiers to one or multiple proxy emails.</span>
          <span>When mail comes in, we check for linked modifiers, and modify the incoming mail accordingly.</span>
          <span>The modified mail is then sent away to your primary address.</span>
          <span>This still isn't all of the features Ptorx offers.</span>
          <span>Check the <a href="https://ptorx.com/features">features list</a>, or start a free trial and experience it yourself.</span>
        </div>
      </div>
    );
  }

}