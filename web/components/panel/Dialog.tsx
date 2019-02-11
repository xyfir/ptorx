import { Redirect, Switch, Route } from 'react-router';
import { ManagePrimaryEmail } from 'components/panel/primary-emails/Manage';
import { ManageProxyEmail } from 'components/panel/proxy-emails/Manage';
import { AddPrimaryEmail } from 'components/panel/primary-emails/Add';
import { ManageModifier } from 'components/panel/modifiers/Manage';
import { AddProxyEmail } from 'components/panel/proxy-emails/Add';
import { ManageMessage } from 'components/panel/messages/Manage';
import { ManageFilter } from 'components/panel/filters/Manage';
import { ManageDomain } from 'components/panel/domains/Manage';
import { AddModifier } from 'components/panel/modifiers/Add';
import { SendMessage } from 'components/panel/messages/Send';
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
import 'trix/dist/trix.css';
import 'trix';

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
    },
    content: {
      padding: '1em'
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
        <DialogContent className={classes.content}>
          {closing ? (
            <Redirect to="/app" />
          ) : (
            <Switch>
              <Route
                path="/app/primary-emails/add"
                component={AddPrimaryEmail}
              />
              <Route path="/app/proxy-emails/add" component={AddProxyEmail} />
              <Route path="/app/modifiers/add" component={AddModifier} />
              <Route path="/app/messages/send" component={SendMessage} />
              <Route path="/app/filters/add" component={AddFilter} />
              <Route path="/app/domains/add" component={AddDomain} />
              <Route
                path="/app/primary-emails/:primaryEmail"
                component={ManagePrimaryEmail}
              />
              <Route
                path="/app/proxy-emails/:proxyEmail"
                component={ManageProxyEmail}
              />
              <Route
                path="/app/modifiers/:modifier"
                component={ManageModifier}
              />
              <Route path="/app/messages/:message" component={ManageMessage} />
              <Route path="/app/filters/:filter" component={ManageFilter} />
              <Route path="/app/domains/:domain" component={ManageDomain} />
              <Route path="/app/credits" component={null} />
            </Switch>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}

export const PanelDialog = withMobileDialog()(withStyles(styles)(_PanelDialog));
