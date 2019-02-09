import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { PanelContext } from 'lib/PanelContext';
import * as moment from 'moment';
import { DOMAIN } from 'constants/config';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  FormControlLabel,
  TablePagination,
  createStyles,
  ListItemText,
  WithStyles,
  withStyles,
  Typography,
  TextField,
  Checkbox,
  ListItem,
  Button,
  Paper,
  List
} from '@material-ui/core';

const styles = createStyles({
  main: {
    margin: '2em 0'
  },
  title: {
    fontSize: '200%'
  },
  title2: {
    fontSize: '150%'
  },
  button: {
    marginRight: '0.5em'
  },
  dnsRecord: {
    margin: '1em 0'
  },
  selectedUser: {
    padding: '0.5em',
    margin: '1em'
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
  domainUser?: Ptorx.DomainUserList[0];
  deleting: boolean;
  domain?: Ptorx.Domain;
  search: string;
  page: number;
}

class _ManageDomain extends React.Component<
  RouteComponentProps & InjectedNotistackProps & WithStyles<typeof styles>,
  ManageDomainState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: ManageDomainState = {
    domainUsers: null,
    domainUser: null,
    deleting: false,
    domain: null,
    search: '',
    page: 1
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

  onChangeUser(key: keyof Ptorx.DomainUserList[0], value: any) {
    this.setState({ domainUser: { ...this.state.domainUser, [key]: value } });
  }

  onDeleteUser() {
    const { domainUser, domain } = this.state;
    api
      .delete('/domains/users', {
        params: { domain: domain.id, key: domainUser.requestKey }
      })
      .then(() => {
        this.setState({ domainUser: null });
        this.loadUsers();
      })
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  onSaveUser() {
    api
      .put('/domains/users', this.state.domainUser)
      .then(() => this.loadUsers())
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
    const { classes } = this.props;
    const {
      domainUsers,
      domainUser,
      deleting,
      domain,
      search,
      page
    } = this.state;
    if (!domain || !domainUsers) return null;

    const matches = domainUsers.filter(
      u => u.label.indexOf(search) > -1 || u.requestKey == search
    );

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
            <Typography variant="h3" className={classes.title2}>
              Users
            </Typography>
            <TextField
              fullWidth
              id="search"
              type="search"
              value={search}
              margin="normal"
              onChange={e =>
                this.setState({ search: e.target.value.toLowerCase() })
              }
              placeholder="Search..."
            />
            {domainUser ? (
              <Paper className={classes.selectedUser} elevation={2}>
                <TextField
                  fullWidth
                  id="label"
                  value={domainUser.label}
                  margin="normal"
                  onChange={e =>
                    this.onChangeUser('label', e.target.value.toLowerCase())
                  }
                  placeholder="user label"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={domainUser.authorized}
                      onChange={e =>
                        this.onChangeUser('authorized', e.target.checked)
                      }
                    />
                  }
                  label="Authorized"
                />
                <div>
                  <Button
                    color="primary"
                    variant="text"
                    onClick={() => this.onSaveUser()}
                  >
                    Save
                  </Button>
                  <Button
                    color="secondary"
                    variant="text"
                    onClick={() => this.onDeleteUser()}
                  >
                    Delete
                  </Button>
                </div>
              </Paper>
            ) : null}
            <List dense>
              {matches.map(_domainUser => (
                <ListItem
                  key={_domainUser.requestKey}
                  button
                  onClick={() => this.setState({ domainUser: _domainUser })}
                  selected={
                    domainUser &&
                    _domainUser.requestKey == domainUser.requestKey
                  }
                >
                  <ListItemText
                    primary={_domainUser.label || _domainUser.requestKey}
                    secondary={`${
                      _domainUser.authorized ? 'A' : 'Una'
                    }uthorized — Requested access ${moment
                      .unix(_domainUser.created)
                      .fromNow()}`}
                  />
                </ListItem>
              ))}
            </List>
            <TablePagination
              rowsPerPageOptions={[10]}
              onChangePage={(e, p) => this.setState({ page: p + 1 })}
              rowsPerPage={10}
              component="div"
              count={matches.length}
              page={page - 1}
            />
          </div>
        ) : (
          <div className={classes.main}>
            <Typography variant="h3" className={classes.title2}>
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
