import { WbSunny as Sun, Brightness2 as Moon, Menu } from '@material-ui/icons';
import { DrawerContent } from 'components/panel/DrawerContent';
import * as React from 'react';
import { NAME } from 'constants/config';
import {
  createStyles,
  WithStyles,
  withStyles,
  IconButton,
  Typography,
  Tooltip,
  Toolbar,
  Hidden,
  AppBar,
  Drawer,
  Theme
} from '@material-ui/core';

const DRAWER_WIDTH = 240;
const styles = (theme: Theme) =>
  createStyles({
    title: {
      flexGrow: 1
    },
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

  onTheme(dark: boolean) {
    localStorage.theme = dark ? 'dark' : 'light';
    location.reload();
  }

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
            <Typography
              className={classes.title}
              variant="h6"
              noWrap
              color="inherit"
            >
              {NAME}
            </Typography>
            <Tooltip title="Toggle light/dark theme" color="inherit">
              <IconButton
                onClick={() => this.onTheme(localStorage.theme != 'dark')}
              >
                {localStorage.theme == 'dark' ? <Sun /> : <Moon />}
              </IconButton>
            </Tooltip>
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
