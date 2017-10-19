import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// react-md
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

export default class SendMessage extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.state = { id: location.hash.split('/')[3] };
  }
  
  onSend() {
    request
      .post(`../api/emails/${this.state.id}/messages/`)
      .send({
        to: this.refs.to.value,
        subject: this.refs.subject.value,
        content: this.refs.message.value
      })
      .end((err, res) => {
        if (err || res.body.error)
          return swal('Error', res.body.message, 'error');

        swal(
          'Success',
          `Message sent to ${this.refs.to.value}`,
          'success'
        );

        location.hash = `#/emails/messages/${this.state.id}/list`;
      });
  }
  
  render() {
    return (
      <div className='message-send'>
        <nav className='navbar-sub'>
          <a href={`#/emails/messages/${this.state.id}/list`}>Inbox</a>
          <a href={`#/emails/edit/${this.state.id}`}>Edit Email</a>
        </nav>
        
        <Paper
          zDepth={1}
          component='section'
          className='section flex'
        >
          <TextField
            id='text--to'
            ref='to'
            type='text'
            label='To'
            className='md-cell'
          />

          <TextField
            id='text--subject'
            ref='subject'
            type='text'
            label='Subject'
            className='md-cell'
          />

          <TextField
            id='text--message'
            ref='message'
            rows={2}
            type='text'
            label='Message'
            className='md-cell'
          />
          
          <Button
            raised primary
            iconChildren='send'
            onClick={() => this.onSend()}
          >Send</Button>
        </Paper>
      </div>
    );
  }
  
}