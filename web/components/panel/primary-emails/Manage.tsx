import { withSnackbar, withSnackbarProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { PanelContext } from 'lib/PanelContext';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  createStyles,
  WithStyles,
  withStyles,
  Typography,
  Button
} from '@material-ui/core';

const styles = createStyles({
  title: {
    fontSize: '200%'
  },
  button: {
    marginTop: '0.5em'
  }
});

interface ManagePrimaryEmailState {
  deleting: boolean;
  primaryEmail?: Ptorx.PrimaryEmail;
}

class _ManagePrimaryEmail extends React.Component<
  RouteComponentProps & withSnackbarProps & WithStyles<typeof styles>,
  ManagePrimaryEmailState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: ManagePrimaryEmailState = { deleting: false, primaryEmail: null };

  componentDidMount() {
    this.load();
  }

  onDelete() {
    if (!this.state.deleting) return this.setState({ deleting: true });
    api
      .delete('/primary-emails', {
        params: { primaryEmail: this.state.primaryEmail.id }
      })
      .then(() => {
        this.props.history.push('/app');
        return api.get('/primary-emails');
      })
      .then(res => this.context.dispatch({ primaryEmails: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  load() {
    const primaryEmailId = +(this.props.match.params as {
      primaryEmail: number;
    }).primaryEmail;
    api
      .get('/primary-emails', { params: { primaryEmail: primaryEmailId } })
      .then(res => this.setState({ primaryEmail: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { primaryEmail, deleting } = this.state;
    const { classes } = this.props;
    if (!primaryEmail) return null;
    return (
      <div>
        <Typography variant="h2" className={classes.title}>
          {primaryEmail.address}
        </Typography>
        <Typography variant="body2">
          Added on {moment.unix(primaryEmail.created).format('LLL')}
        </Typography>
        <Typography variant="body2">
          Address is {primaryEmail.verified ? '' : 'un'}verified.
        </Typography>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => this.onDelete()}
          className={classes.button}
        >
          {deleting ? 'Confirm Delete' : 'Delete'}
        </Button>
      </div>
    );
  }
}

export const ManagePrimaryEmail = withSnackbar(
  withStyles(styles)(_ManagePrimaryEmail)
);
