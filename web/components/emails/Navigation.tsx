import { Button } from 'react-md';
import * as React from 'react';

export const EmailNavigation = ({ email }) => (
  <nav className="navbar">
    <Button
      flat
      primary
      onClick={() => (location.hash = `#/emails/edit/${email}`)}
    >
      Email
    </Button>
    <Button
      flat
      primary
      onClick={() => (location.hash = `#/emails/messages/${email}/list`)}
    >
      Inbox
    </Button>
    <Button
      flat
      primary
      onClick={() => (location.hash = `#/emails/messages/${email}/send`)}
    >
      Send
    </Button>
  </nav>
);
