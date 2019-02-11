import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { PanelContext } from 'lib/PanelContext';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  FormControlLabel,
  createStyles,
  WithStyles,
  withStyles,
  Typography,
  TextField,
  Checkbox,
  Button
} from '@material-ui/core';

const styles = createStyles({
  title: {
    fontSize: '200%'
  },
  button: {
    marginRight: '0.5em'
  }
});

interface ManageProxyEmailState {
  proxyEmail?: Ptorx.ProxyEmail;
  deleting: boolean;
}

class _ManageProxyEmail extends React.Component<
  RouteComponentProps & InjectedNotistackProps & WithStyles<typeof styles>,
  ManageProxyEmailState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: ManageProxyEmailState = { deleting: false, proxyEmail: null };

  componentDidMount() {
    this.load();
  }

  onChange(key: keyof Ptorx.ProxyEmail, value: any) {
    this.setState({ proxyEmail: { ...this.state.proxyEmail, [key]: value } });
  }

  onDelete() {
    if (!this.state.deleting) return this.setState({ deleting: true });
    api
      .delete('/proxy-emails', {
        params: { proxyEmail: this.state.proxyEmail.id }
      })
      .then(() => {
        this.props.history.push('/app');
        return api.get('/proxy-emails');
      })
      .then(res => this.context.dispatch({ proxyEmails: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  onSave() {
    api
      .put('/proxy-emails', this.state.proxyEmail)
      .then(() => {
        this.load();
        return api.get('/proxy-emails');
      })
      .then(res => this.context.dispatch({ proxyEmails: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  load() {
    const proxyEmailId = +(this.props.match.params as {
      proxyEmail: number;
    }).proxyEmail;
    api
      .get('/proxy-emails', { params: { proxyEmail: proxyEmailId } })
      .then(res => this.setState({ proxyEmail: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { proxyEmail, deleting } = this.state;
    const { classes } = this.props;
    if (!proxyEmail) return null;
    return (
      <div>
        <Typography variant="h2" className={classes.title}>
          {proxyEmail.fullAddress} — {proxyEmail.name}
        </Typography>
        <Typography variant="body2">
          Created on {moment.unix(proxyEmail.created).format('LLL')}
        </Typography>

        <TextField
          fullWidth
          id="name"
          type="text"
          value={proxyEmail.name}
          margin="normal"
          onChange={e => this.onChange('name', e.target.value)}
          helperText="Name your proxy email to find it easier"
          placeholder="My Proxy Email"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={proxyEmail.saveMail}
              onChange={e => this.onChange('saveMail', e.target.checked)}
            />
          }
          label="Save Incoming Mail"
        />

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

export const ManageProxyEmail = withSnackbar(
  withStyles(styles)(_ManageProxyEmail)
);
