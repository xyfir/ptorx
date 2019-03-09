import { withSnackbar, withSnackbarProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  createStyles,
  WithStyles,
  Typography,
  withStyles,
  Button,
  Paper
} from '@material-ui/core';

const styles = createStyles({
  buttons: {
    flexDirection: 'column',
    display: 'flex'
  },
  button: {
    margin: '1em 0'
  },
  paper: {
    padding: '0.5em',
    margin: '1em'
  },
  root: {
    textAlign: 'center'
  }
});

class _PurchaseCredits extends React.Component<
  RouteComponentProps & withSnackbarProps & WithStyles<typeof styles>
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  componentDidMount() {
    const jwt = location.href.split('?jwt=')[1];
    if (!jwt) return;
    api
      .post('/payments/finish', { jwt })
      .then(() => {
        this.props.enqueueSnackbar('Payment complete');
        return api.get('/users');
      })
      .then(res => this.context.dispatch({ user: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  onBuy(tier: Ptorx.Payment['tier'], duration: Ptorx.Payment['duration']) {
    api
      .post('/payments/start', { tier, duration })
      .then(res => (location.href = res.data.url))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { classes } = this.props;
    const { user } = this.context;
    return (
      <div className={classes.root}>
        {user.tier == 'basic' ? (
          <Typography>
            Upgrade to receive more monthly credits and unlock new features like
            being able to save mail or send from your proxy emails.
          </Typography>
        ) : (
          <Typography>
            Buying any tier of any duration will replace your current one.
          </Typography>
        )}

        <Typography>Buy a year and the last two months are free.</Typography>

        <Paper elevation={2} className={classes.paper}>
          <Typography variant="h2">Premium</Typography>
          <Typography>Account topped up to 1,500 credits per month</Typography>
          <div className={classes.buttons}>
            <Button
              color="secondary"
              variant="contained"
              onClick={() => this.onBuy('premium', 'month')}
              className={classes.button}
            >
              $1 USD — 1 Month
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={() => this.onBuy('premium', 'year')}
            >
              $10 USD — 1 Year
            </Button>
          </div>
        </Paper>

        <Paper elevation={2} className={classes.paper}>
          <Typography variant="h2">Ultimate</Typography>
          <Typography>Account topped up to 10,000 credits per month</Typography>
          <div className={classes.buttons}>
            <Button
              color="secondary"
              variant="contained"
              onClick={() => this.onBuy('ultimate', 'month')}
              className={classes.button}
            >
              $5 USD — 1 Month
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={() => this.onBuy('ultimate', 'year')}
            >
              $50 USD — 1 Year
            </Button>
          </div>
        </Paper>
      </div>
    );
  }
}

export const PurchaseCredits = withSnackbar(
  withStyles(styles)(_PurchaseCredits)
);
