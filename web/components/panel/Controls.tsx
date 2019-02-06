import { DrawerContent } from 'components/panel/DrawerContent';
import * as React from 'react';
import { NAME } from 'constants/config';
import { Menu } from '@material-ui/icons';
import {
  createStyles,
  WithStyles,
  withStyles,
  IconButton,
  Typography,
  Toolbar,
  Hidden,
  AppBar,
  Drawer,
  Theme
} from '@material-ui/core';

const DRAWER_WIDTH = 240;
const styles = (theme: Theme) =>
  createStyles({
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: DRAWER_WIDTH,
        flexShrink: 0
      }
    },
    appBar: {
      marginLeft: DRAWER_WIDTH,
      [theme.breakpoints.up('sm')]: {
        width: `calc(100% - ${DRAWER_WIDTH}px)`
      }
    },
    menuButton: {
      marginRight: 20,
      [theme.breakpoints.up('sm')]: { display: 'none' }
    },
    drawerPaper: {
      width: DRAWER_WIDTH
    }
  });

interface PanelControlsState {
  showDrawer: boolean;
}

class _PanelControls extends React.Component<WithStyles<typeof styles>> {
  state: PanelControlsState = { showDrawer: false };

  render() {
    const { showDrawer } = this.state;
    const { classes } = this.props;
    return (
      <React.Fragment>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              onClick={() => this.setState({ showDrawer: !showDrawer })}
              className={classes.menuButton}
              aria-label="Open drawer"
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" color="inherit" noWrap>
              {NAME}
            </Typography>
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer}>
          <Hidden smUp implementation="css">
            <Drawer
              open={this.state.showDrawer}
              anchor="left"
              variant="temporary"
              onClose={() => this.setState({ showDrawer: !showDrawer })}
              classes={{ paper: classes.drawerPaper }}
            >
              <DrawerContent />
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <Drawer
              classes={{ paper: classes.drawerPaper }}
              variant="permanent"
              open
            >
              <DrawerContent />
            </Drawer>
          </Hidden>
        </nav>
      </React.Fragment>
    );
  }
}

export const PanelControls = withStyles(styles)(_PanelControls);
