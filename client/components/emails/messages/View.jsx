import request from 'superagent';
import moment from 'moment';
import React from 'react';
import swal from 'sweetalert';

// react-md
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

// Modules
import parseQuery from 'lib/parse-hash-query';

export default class ViewMessage extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      id: location.hash.split('/')[3], message: location.hash.split('/')[5],
      showReplyForm: false, loading: true, content: {},
    };

    if (parseQuery().reply) this.state.showReplyForm = true;
    
    request
      .get(`/api/emails/${this.state.id}/messages/${this.state.message}`)
      .end((err, res) => {
        if (err || res.body.error)
          swal('Error', 'Could not load message', 'error');
        else
          this.setState({ loading: false, content: res.body });
      });
  }
  
  onReply() {
    request
      .post(`/api/emails/${this.state.id}/messages/${this.state.message}`)
      .send({ content: this.refs.message.value })
      .end((err, res) => {
        if (err || res.body.error)
          swal('Error', res.body.message, 'error');
        else
          swal('Success', 'Reply sent.', 'success');
      });
  }
  
  render() {
    if (this.state.loading) return null;
    
    return (
      <div className='view-message'>
        <nav className='navbar-sub'>
          <a href={`#/emails/messages/${this.state.id}/list`}>Inbox</a>
          <a href={`#/emails/edit/${this.state.id}`}>Edit Email</a>
        </nav>

        <Paper
          zDepth={1}
          component='section'
          className='message flex section'
        >
          <div className='info'>
            <span className='subject'>{this.state.content.subject}</span>
            <span className='from'>{this.state.content.from}</span>
            <span className='date'>{
              moment(this.state.content.timestamp)
                .format('MMMM Do YYYY, HH:mm:ss')
            }</span>
          </div>

          <pre className='content'>{this.state.content.text}</pre>
        </Paper>
        
        {this.state.showReplyForm ? (
          <Paper
            zDepth={1}
            className='reply section flex'
          >
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
              onClick={() => this.onReply()}
            >Reply</Button>
          </Paper>
        ) : (
          <Button
            raised primary
            onClick={() => this.setState({ showReplyForm: true })}
          >Reply</Button>
        )}
      </div>
    );
  }
  
}