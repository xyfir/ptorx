import { TextField, Button, Paper } from 'react-md';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Components
import Navigation from 'components/emails/Navigation';

// Actions
import { updateCredits } from 'actions/account';

export default class SendMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { id: location.hash.split('/')[3] };
  }

  onSend() {
    const { App } = this.props;

    request
      .post(`/api/emails/${this.state.id}/messages/`)
      .send({
        to: this._to.value,
        subject: this._subject.value,
        content: this._message.value
      })
      .end((err, res) => {
        if (err) return swal('Error', res.body.message, 'error');

        App.dispatch(updateCredits(res.body.credits));
        swal('Success', `Message sent to ${this._to.value}`, 'success');
        location.hash = `#/emails/messages/${this.state.id}/list`;
      });
  }

  render() {
    return (
      <div className="message-send">
        <Navigation email={this.state.id} />

        <Paper zDepth={1} component="section" className="section flex">
          <TextField
            id="text--to"
            ref={i => (this._to = i)}
            type="text"
            label="To"
          />

          <TextField
            id="text--subject"
            ref={i => (this._subject = i)}
            type="text"
            label="Subject"
          />

          <TextField
            id="text--message"
            ref={i => (this._message = i)}
            rows={2}
            type="text"
            label="Message"
          />

          <Button
            raised
            primary
            iconChildren="send"
            onClick={() => this.onSend()}
          >
            Send
          </Button>
        </Paper>
      </div>
    );
  }
}
