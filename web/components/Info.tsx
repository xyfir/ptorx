import { ACCOWNT_URL } from 'constants/config';
import { Button } from '@material-ui/core';
import * as React from 'react';

export const Info = () => (
  <div>
    <h1>Send and Receive Mail Anonymously</h1>
    <p>
      Protect your privacy, strengthen your security, and take control of your
      emails.
    </p>
    <Button variant="contained" color="primary" href={ACCOWNT_URL}>
      Login
    </Button>{' '}
    or{' '}
    <Button variant="contained" color="primary" href={ACCOWNT_URL}>
      Register
    </Button>
    <h2>How It Works</h2>
    <ol>
      <li>Create a proxy email</li>
      <li>Tell us where to forward incoming mail to</li>
      <li>View mail sent to your proxy email from your preferred email app</li>
      <li>Reply to mail and it'll show as being sent from your proxy email</li>
    </ol>
    <h2>What's a Proxy Email?</h2>
    <p>
      A proxy email is like an email alias or a forwarding address. Any mail
      sent to it is redirected to the email addresses you configure. Proxy
      emails also allow for many extra features like filtering and modifying
      your incoming mail before it's forwarded.
    </p>
    <h2>Why Use a Proxy Email?</h2>
    <p>
      To prevent spam, keep your email off of "people search" websites, thwart
      hackers and spammers when database breaches occur, easily transfer mail
      when you update primary email addresses, filter out mail before it ever
      reaches your inbox, and the list goes on.
    </p>
    <h2>Bring Your Own Domains</h2>
    <p>
      As many of them as you want. Configure a few easy DNS records and create
      proxy emails for your own domain.
    </p>
    <h2>Open Source</h2>
    <p>
      Don't trust us with your emails?{' '}
      <a href="https://github.com/Xyfir/Ptorx">
        Our code is completely open source for you to view.
      </a>{' '}
      Host your own server if you'd like.
    </p>
  </div>
);
