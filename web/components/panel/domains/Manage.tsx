import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { PanelContext } from 'lib/PanelContext';
import * as moment from 'moment';
import { DOMAIN } from 'constants/config';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  createStyles,
  WithStyles,
  withStyles,
  Typography,
  TextField,
  Button
} from '@material-ui/core';

const styles = createStyles({
  main: {
    margin: '2em 0'
  },
  title: {
    fontSize: '200%'
  },
  button: {
    marginRight: '0.5em'
  },
  dnsRecord: {
    margin: '1em 0'
  },
  verifyTitle: {
    fontSize: '150%'
  }
});

const DNSRecord = ({
  className,
  hostname,
  value,
  type
}: {
  className: string;
  hostname: string;
  value: string;
  type: string;
}) => (
  <div className={className}>
    <TextField fullWidth value={type} label="Type" margin="normal" />
    <TextField fullWidth value={hostname} label="Hostname" margin="normal" />
    <TextField fullWidth value={value} label="Value" margin="normal" />
  </div>
);

interface ManageDomainState {
  domainUsers?: Ptorx.DomainUserList;
  deleting: boolean;
  domain?: Ptorx.Domain;
}

class _ManageDomain extends React.Component<
  RouteComponentProps & InjectedNotistackProps & WithStyles<typeof styles>,
  ManageDomainState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: ManageDomainState = {
    domainUsers: null,
    deleting: false,
    domain: null
  };

  componentDidMount() {
    this.load();
  }

  componentDidUpdate() {
    if (!this.state.domainUsers && this.state.domain) this.loadUsers();
  }

  onDelete() {
    if (!this.state.deleting) return this.setState({ deleting: true });
    api
      .delete('/domains', { params: { domain: this.state.domain.id } })
      .then(() => {
        this.props.history.push('/app');
        return api.get('/domains');
      })
      .then(res => this.context.dispatch({ domains: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  onVerify() {
    api
      .post('/domains/verify', { domainId: this.state.domain.id })
      .then(() => {
        this.load();
        return api.get('/domains');
      })
      .then(res => this.context.dispatch({ domains: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  loadUsers() {
    api
      .get('/domains/users', { params: { domain: this.state.domain.id } })
      .then(res => this.setState({ domainUsers: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  load() {
    const domainId = +(this.props.match.params as { domain: number }).domain;
    api
      .get('/domains', { params: { domain: domainId } })
      .then(res => this.setState({ domain: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { deleting, domain } = this.state;
    const { classes } = this.props;
    if (!domain) return null;
    return (
      <div>
        <Typography variant="h2" className={classes.title}>
          {domain.domain}
        </Typography>
        <Typography variant="body2">
          Created on {moment.unix(domain.created).format('LLL')}
        </Typography>
        {domain.verified ? (
          <div className={classes.main}>
            Domain users Domain users Domain users Domain users Domain users
          </div>
        ) : (
          <div className={classes.main}>
            <Typography variant="h3" className={classes.verifyTitle}>
              Verify
            </Typography>
            <Typography variant="body2">
              Configure the following DNS records to verify your domain:
            </Typography>
            <DNSRecord
              className={classes.dnsRecord}
              hostname={domain.domain}
              value={`v=spf1 include:${DOMAIN} ~all`}
              type="TXT"
            />
            <DNSRecord
              className={classes.dnsRecord}
              hostname={`${domain.selector}._domainkey.${domain.domain}`}
              value={domain.publicKey}
              type="TXT"
            />
            <DNSRecord
              className={classes.dnsRecord}
              hostname={domain.domain}
              value={DOMAIN}
              type="MX"
            />
          </div>
        )}
        <div>
          {domain.verified ? null : (
            <Button
              color="primary"
              variant="contained"
              onClick={() => this.onVerify()}
              className={classes.button}
            >
              Verify
            </Button>
          )}
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

export const ManageDomain = withSnackbar(withStyles(styles)(_ManageDomain));
