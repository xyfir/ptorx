import { withSnackbar, withSnackbarProps } from 'notistack';
import { PanelContext } from 'lib/PanelContext';
import { TrixEditor } from 'react-trix';
import * as React from 'react';
import { api } from 'lib/api';
import {
  createStyles,
  WithStyles,
  withStyles,
  TextField,
  Button
} from '@material-ui/core';

const styles = createStyles({
  controlGroup: {
    marginBottom: '1em',
    alignItems: 'center',
    display: 'flex'
  }
});

interface SendMessageState {
  isValidFrom: boolean;
  subject: string;
  from: string;
  html: string;
  text: string;
  to: string;
}

class _SendMessage extends React.Component<
  withSnackbarProps & WithStyles<typeof styles>,
  SendMessageState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: SendMessageState = {
    isValidFrom: false,
    subject: '',
    from: '',
    html: '',
    text: '',
    to: ''
  };

  onChangeFrom(from: string) {
    this.setState({
      isValidFrom:
        this.context.aliases.findIndex(e => e.fullAddress == from) > -1,
      from
    });
  }

  onSend() {
    const { subject, from, html, text, to } = this.state;
    const { aliases, dispatch } = this.context;
    const { enqueueSnackbar } = this.props;
    const aliasId = aliases.find(p => p.fullAddress == from).id;
    api
      .post('/messages/send', { aliasId, subject, html, text, to })
      .then(() => {
        enqueueSnackbar(`Message sent to ${to} from ${from}`);
        this.setState({
          isValidFrom: false,
          subject: '',
          from: '',
          html: '',
          text: '',
          to: ''
        });
        return api.get('/users');
      })
      .then(res => dispatch({ user: res.data }))
      .catch(err => enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { isValidFrom, subject, from, html, to } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <TextField
          fullWidth
          id="from"
          type="email"
          error={!!from && !isValidFrom}
          value={from}
          margin="normal"
          onChange={e => this.onChangeFrom(e.target.value)}
          helperText={!!from && !isValidFrom ? 'Not a valid alias' : undefined}
          placeholder={`From: alias@${process.enve.DOMAIN}`}
        />
        <TextField
          fullWidth
          id="to"
          type="email"
          value={to}
          margin="normal"
          onChange={e => this.setState({ to: e.target.value })}
          placeholder="To: user@example.com"
        />
        <div className={classes.controlGroup}>
          <TextField
            fullWidth
            id="subject"
            value={subject}
            margin="normal"
            onChange={e => this.setState({ subject: e.target.value })}
            placeholder="Subject: Hello!"
          />
          <Button
            color="primary"
            variant="text"
            onClick={() => this.onSend()}
            disabled={!isValidFrom || !subject || !html || !to}
          >
            Send
          </Button>
        </div>
        <TrixEditor
          value={html}
          onChange={(html, text) => this.setState({ html, text })}
          mergeTags={[]}
          placeholder="Message..."
        />
      </div>
    );
  }
}

export const SendMessage = withSnackbar(withStyles(styles)(_SendMessage));
