import { TextField, Button, Paper } from 'react-md';
import { EmailNavigation } from 'components/emails/Navigation';
import * as moment from 'moment';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';
import * as qs from 'qs';

export class ViewMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: +this.props.match.params.email,
      message: +this.props.match.params.message,
      loading: true,
      content: {},
      showReplyForm: false
    };

    if (qs.parse(location.search).reply) this.state.showReplyForm = true;

    api
      .get(`/emails/${this.state.id}/messages/${this.state.message}`)
      .then(res => this.setState({ loading: false, content: res.data }))
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onReply() {
    const { App } = this.props;
    api
      .post(`/emails/${this.state.id}/messages/${this.state.message}`, {
        content: this._message.value
      })
      .then(res => {
        swal('Success', 'Reply sent.', 'success');
        // ** (updateCredits(res.data.credits));
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    if (this.state.loading) return null;

    return (
      <div className="view-message">
        <EmailNavigation email={this.state.id} />

        <Paper zDepth={1} component="section" className="message flex section">
          <div className="info">
            <span className="subject">{this.state.content.subject}</span>
            <span className="from">{this.state.content.from}</span>
            <span className="date">
              {moment
                .unix(this.state.content.received)
                .format('MMMM Do YYYY, HH:mm:ss')}
            </span>
          </div>

          <pre className="content">{this.state.content.text}</pre>
        </Paper>

        {this.state.showReplyForm ? (
          <Paper zDepth={1} className="reply section flex">
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
              onClick={() => this.onReply()}
            >
              Reply
            </Button>
          </Paper>
        ) : (
          <Button
            raised
            primary
            onClick={() => this.setState({ showReplyForm: true })}
          >
            Reply
          </Button>
        )}
      </div>
    );
  }
}
