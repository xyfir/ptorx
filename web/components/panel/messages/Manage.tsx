import { withSnackbar, WithSnackbarProps } from 'notistack';
import { simpleParser, ParsedMail } from 'mailparser';
import { RouteComponentProps } from 'react-router';
import { addHook, sanitize } from 'dompurify';
import { displayAddress } from 'lib/display-address';
import { PanelContext } from 'lib/PanelContext';
import { loadOpenPGP } from 'lib/load-openpgp';
import { Attachment } from '@material-ui/icons';
import { TrixEditor } from 'react-trix';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  createStyles,
  Typography,
  WithStyles,
  withStyles,
  TextField,
  Tooltip,
  Button,
  Paper
} from '@material-ui/core';

// Hook into HTML sanitizer to modify render
// Force links in message HTML to open in a new tab
addHook('afterSanitizeAttributes', node => {
  if (node.tagName == 'A') (node as HTMLAnchorElement).target = '_blank';
});

const styles = createStyles({
  pre: {
    overflow: 'auto'
  },
  title: {
    fontSize: '200%'
  },
  reply: {
    marginRight: '0.5em'
  },
  content: {
    minWidth: '20em',
    padding: '0.5em',
    margin: '2em 0'
  },
  buttons: {
    marginTop: '2em'
  },
  renderHTML: {
    marginTop: '1em'
  },
  attachments: {
    margin: '0.5em 0'
  }
});

interface ManageMessageState {
  showHeaders: boolean;
  renderHTML: boolean;
  deleting: boolean;
  message?: Ptorx.Message;
  reply: boolean;
  mail?: ParsedMail;
  pass: string;
  html: string;
  text: string;
}

class _ManageMessage extends React.Component<
  RouteComponentProps & WithSnackbarProps & WithStyles<typeof styles>,
  ManageMessageState
> {
  static contextType = PanelContext;
  attachmentUrls: string[] = [];
  context!: React.ContextType<typeof PanelContext>;
  state: ManageMessageState = {
    showHeaders: false,
    renderHTML: false,
    deleting: false,
    reply: false,
    pass: '',
    html: '',
    text: ''
  };

  async componentDidMount() {
    const { enqueueSnackbar, match } = this.props;
    const { unlockedPrivateKey } = this.context;

    try {
      const res = await api.get('/messages', {
        params: { message: +(match.params as { message: number }).message }
      });
      const message: Ptorx.Message = res.data;

      // Decrypt if needed and able
      if (message.raw.startsWith('-----BEGIN PGP MESSAGE-----')) {
        try {
          const openpgp = await loadOpenPGP();
          const plaintext = await openpgp.decrypt({
            message: await openpgp.message.readArmored(message.raw),
            privateKeys: [unlockedPrivateKey]
          });
          message.raw = plaintext.data as string;
        } catch (err) {}
      }

      // Parse raw message if able
      let mail: ParsedMail;
      if (!message.raw.startsWith('-----BEGIN PGP MESSAGE-----')) {
        // Parse raw email
        mail = await simpleParser(message.raw);

        // Generate URLs for each attachment
        if (mail.attachments) {
          this.attachmentUrls = mail.attachments.map(a =>
            URL.createObjectURL(new Blob([a.content]))
          );
        }
      }

      this.setState({ message, mail });
    } catch (err) {
      enqueueSnackbar(err.response.data.error);
    }
  }

  componentWillUnmount() {
    this.attachmentUrls.forEach(url => URL.revokeObjectURL(url));
  }

  onDelete() {
    if (!this.state.deleting) return this.setState({ deleting: true });
    api
      .delete('/messages', { params: { message: this.state.message.id } })
      .then(() => {
        this.props.history.push('/app');
        return api.get('/messages');
      })
      .then(res => this.context.dispatch({ messages: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  async onDecrypt() {
    const { enqueueSnackbar } = this.props;
    const { dispatch, user } = this.context;
    const { message, pass } = this.state;
    let unlockedPrivateKey;
    const openpgp = await loadOpenPGP();

    // Decrypt private key
    try {
      const { keys } = await openpgp.key.readArmored(user.privateKey);
      await keys[0].decrypt(pass);
      dispatch({ unlockedPrivateKey: keys[0] });
      unlockedPrivateKey = keys[0];
    } catch (err) {
      enqueueSnackbar('Could not decrypt private key with password');
      return;
    }

    // Decrypt message
    try {
      const plaintext = await openpgp.decrypt({
        message: await openpgp.message.readArmored(message.raw),
        privateKeys: [unlockedPrivateKey]
      });
      message.raw = plaintext.data as string;

      // Parse raw email
      const mail = await simpleParser(message.raw);

      // Generate URLs for each attachment
      if (mail.attachments) {
        this.attachmentUrls = mail.attachments.map(a =>
          URL.createObjectURL(new Blob([a.content]))
        );
      }

      this.setState({ mail });
    } catch (err) {
      enqueueSnackbar('Could not decrypt message with private key');
    }
  }

  onReply() {
    const { message, reply, html, text } = this.state;
    const { enqueueSnackbar } = this.props;
    if (!reply) return this.setState({ reply: true });
    api
      .post('/messages/reply', { messageId: message.id, html, text })
      .then(() => {
        enqueueSnackbar('Reply sent');
        this.setState({ reply: false, html: '', text: '' });
        return api.get('/users');
      })
      .then(res => this.context.dispatch({ user: res.data }))
      .catch(err => enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { unlockedPrivateKey } = this.context;
    const {
      showHeaders,
      renderHTML,
      deleting,
      message,
      reply,
      pass,
      html,
      mail
    } = this.state;
    const { classes } = this.props;

    if (!message) return null;

    return (
      <div>
        <Typography variant="h2" className={classes.title}>
          {message.subject}
        </Typography>

        {mail && mail.attachments ? (
          <div className={classes.attachments}>
            {mail.attachments.map((attachment, i) => (
              <Button
                key={i}
                href={this.attachmentUrls[i]}
                size="small"
                variant="text"
                download={attachment.filename}
              >
                <Attachment />
                {attachment.filename}
              </Button>
            ))}
          </div>
        ) : null}

        {!showHeaders ? (
          <Tooltip
            interactive
            title={
              <Button
                onClick={() => this.setState({ showHeaders: true })}
                variant="text"
                color="inherit"
                size="small"
              >
                Show Full Headers
              </Button>
            }
          >
            <div>
              <Typography>
                <strong>Received</strong>:{' '}
                {moment.unix(message.created).format('LLL')}
              </Typography>
              <Typography>
                <strong>From</strong>: {displayAddress(message.from)}
              </Typography>
              <Typography>
                <strong>To</strong>: {displayAddress(message.to)}
              </Typography>
            </div>
          </Tooltip>
        ) : mail ? (
          mail.headerLines.map((header, i) => (
            <Typography key={i}>
              <strong>{header.key}</strong>:{' '}
              {header.line
                .split(': ')
                .slice(1)
                .join(': ')}
            </Typography>
          ))
        ) : null}

        <Paper className={classes.content} elevation={2}>
          {message.raw.startsWith('-----BEGIN PGP MESSAGE-----') &&
          !unlockedPrivateKey ? (
            <div>
              <TextField
                fullWidth
                id="pass"
                type="password"
                value={pass}
                label="Mailbox Password"
                margin="normal"
                onChange={e => this.setState({ pass: e.target.value })}
                helperText="Enter your mailbox password to decrypt this email"
              />
              <Button
                onClick={() => this.onDecrypt()}
                variant="contained"
                color="primary"
              >
                Decrypt
              </Button>
            </div>
          ) : renderHTML ? (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitize(mail.html as string)
              }}
            />
          ) : (
            <React.Fragment>
              <pre className={classes.pre}>{mail && mail.text}</pre>

              {mail && mail.html && mail.html != mail.text ? (
                <Button
                  size="small"
                  color="secondary"
                  variant="outlined"
                  onClick={() => this.setState({ renderHTML: true })}
                  className={classes.renderHTML}
                >
                  Render HTML
                </Button>
              ) : null}
            </React.Fragment>
          )}
        </Paper>

        {reply ? (
          <TrixEditor
            value={html}
            onChange={(html, text) => this.setState({ html, text })}
            mergeTags={[]}
            placeholder="Message..."
          />
        ) : null}

        <div className={reply ? classes.buttons : ''}>
          <Button
            color="primary"
            variant="contained"
            onClick={() => this.onReply()}
            className={classes.reply}
          >
            {reply ? 'Send' : 'Reply'}
          </Button>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => this.onDelete()}
          >
            {deleting ? 'Confirm Delete' : 'Delete'}
          </Button>
        </div>
      </div>
    );
  }
}

export const ManageMessage = withSnackbar(withStyles(styles)(_ManageMessage));
