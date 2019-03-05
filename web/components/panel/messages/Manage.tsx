import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { displayAddress } from 'lib/display-address';
import { PanelContext } from 'lib/PanelContext';
import { Attachment } from '@material-ui/icons';
import { TrixEditor } from 'react-trix';
import { sanitize } from 'dompurify';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  createStyles,
  Typography,
  WithStyles,
  withStyles,
  Tooltip,
  Button,
  Paper
} from '@material-ui/core';

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
  html: string;
  text: string;
}

class _ManageMessage extends React.Component<
  RouteComponentProps & InjectedNotistackProps & WithStyles<typeof styles>,
  ManageMessageState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: ManageMessageState = {
    showHeaders: false,
    renderHTML: false,
    deleting: false,
    reply: false,
    html: '',
    text: ''
  };

  componentDidMount() {
    const { enqueueSnackbar, match } = this.props;
    const messageId = +(match.params as { message: number }).message;
    api
      .get('/messages', { params: { message: messageId } })
      .then(res => this.setState({ message: res.data }))
      .catch(err => enqueueSnackbar(err.response.data.error));
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
    const {
      showHeaders,
      renderHTML,
      deleting,
      message,
      reply,
      html
    } = this.state;
    const { classes } = this.props;
    if (!message) return null;
    return (
      <div>
        <Typography variant="h2" className={classes.title}>
          {message.subject}
        </Typography>

        {message.attachments ? (
          <div className={classes.attachments}>
            {message.attachments.map((attachment, i) => (
              <Button
                key={i}
                href={`${api.defaults.baseURL}/messages/attachment?attachment=${
                  attachment.id
                }`}
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

        {showHeaders ? (
          message.headers.map((header, i) => (
            <Typography key={i}>
              <strong>{header.split(': ')[0]}</strong>:{' '}
              {header
                .split(': ')
                .slice(1)
                .join(': ')}
            </Typography>
          ))
        ) : (
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
        )}

        <Paper className={classes.content} elevation={2}>
          {renderHTML ? (
            <div dangerouslySetInnerHTML={{ __html: sanitize(message.html) }} />
          ) : (
            <React.Fragment>
              <pre className={classes.pre}>{message.text}</pre>
              {message.html && message.html != message.text ? (
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
