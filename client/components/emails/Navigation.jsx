import { Button } from 'react-md';
import React from 'react';

export default ({email}) => (
  <nav className='navbar'>
    <Button
      flat primary
      onClick={() => location.hash = `#/emails/edit/${email}`}
    >Email</Button>
    <Button
      flat primary
      onClick={() => location.hash = `#/emails/messages/${email}/list`}
    >Inbox</Button>
    <Button
      flat primary
      onClick={() => location.hash = `#/emails/messages/${email}/send`}
    >Send</Button>
  </nav>
);