import { Button } from 'react-md';
import * as React from 'react';
import { Link } from 'react-router-dom';

export const EmailNavigation = ({ email }) => (
  <nav className="navbar">
    <Link to={`/app/proxy-emails/edit/${email}`}>
      <Button flat primary>
        Email
      </Button>
    </Link>
    <Link to={`/app/proxy-emails/messages/${email}/list`}>
      <Button flat primary>
        Inbox
      </Button>
    </Link>
    <Link to={`/app/proxy-emails/messages/${email}/send`}>
      <Button flat primary>
        Send
      </Button>
    </Link>
  </nav>
);
