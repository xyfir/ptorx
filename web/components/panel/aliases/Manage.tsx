import { withSnackbar, withSnackbarProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { AliasWaterfall } from 'components/panel/aliases/Waterfall';
import { PanelContext } from 'lib/PanelContext';
import { Refresh } from '@material-ui/icons';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
// @ts-ignore
import * as copy from 'clipboard-copy';
import { api } from 'lib/api';
import {
  FormControlLabel,
  createStyles,
  WithStyles,
  withStyles,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  Button
} from '@material-ui/core';

const styles = createStyles({
  genPass: {
    marginLeft: '0.5em'
  },
  smtpKey: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    fontSize: '200%'
  },
  button: {
    marginRight: '0.5em'
  }
});

interface ManageAliasState {
  alias?: Ptorx.Alias;
  deleting: boolean;
}

class _ManageAlias extends React.Component<
  RouteComponentProps & withSnackbarProps & WithStyles<typeof styles>,
  ManageAliasState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: ManageAliasState = { deleting: false, alias: null };

  componentDidMount() {
    this.load();
  }

  onChange = (key: keyof Ptorx.Alias, value: any) => {
    this.setState({ alias: { ...this.state.alias, [key]: value } });
  };

  onDelete() {
    if (!this.state.deleting) return this.setState({ deleting: true });
    api
      .delete('/aliases', {
        params: { alias: this.state.alias.id }
      })
      .then(() => {
        this.props.history.push('/app');
        return api.get('/aliases');
      })
      .then(res => this.context.dispatch({ aliases: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  onSave() {
    api
      .put('/aliases', this.state.alias)
      .then(() => {
        this.load();
        return api.get('/aliases');
      })
      .then(res => this.context.dispatch({ aliases: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  load() {
    const aliasId = +(this.props.match.params as {
      alias: number;
    }).alias;
    api
      .get('/aliases', { params: { alias: aliasId } })
      .then(res => this.setState({ alias: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { alias, deleting } = this.state;
    const { classes } = this.props;
    if (!alias) return null;
    return (
      <div>
        <Typography variant="h2" className={classes.title}>
          {alias.fullAddress} — {alias.name}
        </Typography>
        <Typography variant="body2">
          Created on {moment.unix(alias.created).format('LLL')}
        </Typography>
        <Button
          onClick={() => copy(alias.fullAddress)}
          variant="text"
          color="primary"
        >
          Copy Address
        </Button>

        <TextField
          fullWidth
          id="name"
          type="text"
          value={alias.name}
          margin="normal"
          onChange={e => this.onChange('name', e.target.value)}
          helperText="Display name used for redirected mail"
          placeholder="My Alias"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={alias.saveMail}
              onChange={e => this.onChange('saveMail', e.target.checked)}
            />
          }
          label="Save Incoming Mail"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={alias.canReply}
              onChange={e => this.onChange('canReply', e.target.checked)}
            />
          }
          label="Allow Anonymous Replies"
        />

        <div className={classes.smtpKey}>
          <TextField
            fullWidth
            id="name"
            type="text"
            value={alias.smtpKey}
            margin="normal"
            helperText="SMTP credentials passkey"
            placeholder="Save alias to generate SMTP passkey"
          />
          <IconButton
            onClick={() => this.onChange('smtpKey', '')}
            disabled={!alias.smtpKey}
            className={classes.genPass}
          >
            <Refresh />
          </IconButton>
        </div>

        <AliasWaterfall alias={alias} onChange={this.onChange} />

        <div>
          <Button
            color="primary"
            variant="contained"
            onClick={() => this.onSave()}
            className={classes.button}
          >
            Save
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

export const ManageAlias = withSnackbar(withStyles(styles)(_ManageAlias));
