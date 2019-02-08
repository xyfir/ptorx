import { Redirect, Switch, Route } from 'react-router';
import { AddPrimaryEmail } from 'components/panel/primary-emails/Add';
import { AddFilter } from 'components/panel/filters/Add';
import { AddDomain } from 'components/panel/domains/Add';
import * as React from 'react';
import { Close } from '@material-ui/icons';
import { NAME } from 'constants/config';
import {
  withMobileDialog,
  DialogContent,
  createStyles,
  DialogTitle,
  WithStyles,
  withStyles,
  IconButton,
  Typography,
  Hidden,
  Dialog,
  Theme
} from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
    title: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing.unit * 2,
      margin: 0
    },
    close: {
      position: 'absolute',
      color: theme.palette.grey[500],
      right: theme.spacing.unit,
      top: theme.spacing.unit
    }
  });

interface PanelDialogState {
  closing: boolean;
}

interface PanelDialogProps extends WithStyles<typeof styles> {
  fullScreen: boolean;
}

class _PanelDialog extends React.Component<PanelDialogProps, PanelDialogState> {
  state: PanelDialogState = { closing: false };

  componentDidUpdate() {
    if (this.state.closing) this.setState({ closing: false });
  }

  render() {
    const { fullScreen, classes } = this.props;
    const { closing } = this.state;
    return (
      <Dialog
        aria-labelledby="panel-dialog"
        fullScreen={fullScreen}
        onClose={() => this.setState({ closing: true })}
        open={location.pathname.length > 5}
      >
        <Hidden smUp implementation="css">
          <DialogTitle disableTypography className={classes.title}>
            <Typography variant="h6">{NAME}</Typography>
            <IconButton
              aria-label="Close"
              className={classes.close}
              onClick={() => this.setState({ closing: true })}
            >
              <Close />
            </IconButton>
          </DialogTitle>
        </Hidden>
        <DialogContent>
          {closing ? (
            <Redirect to="/app" />
          ) : (
            <Switch>
              <Route
                path="/app/primary-emails/add"
                component={AddPrimaryEmail}
              />
              <Route path="/app/proxy-emails/add" render={() => null} />
              <Route path="/app/modifiers/add" render={() => null} />
              <Route path="/app/messages/send" render={() => null} />
              <Route path="/app/messages/add" render={() => null} />
              <Route path="/app/filters/add" component={AddFilter} />
              <Route path="/app/domains/add" component={AddDomain} />
              <Route
                path="/app/primary-emails/:primaryEmail"
                render={() => null}
              />
              <Route path="/app/proxy-emails/:proxyEmail" render={() => null} />
              <Route path="/app/modifiers/:modifier" render={() => null} />
              <Route path="/app/messages/:message" render={() => null} />
              <Route path="/app/filters/:filter" render={() => null} />
              <Route path="/app/domains/:domain" render={() => null} />
              <Route path="/app/account/credits" render={() => null} />
              <Route path="/app/account" render={() => null} />
            </Switch>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}

export const PanelDialog = withMobileDialog()(withStyles(styles)(_PanelDialog));
