import { ACCOWNT_API_URL, HELP_DOCS_URL, NAME } from 'constants/config';
import { Search } from 'components/Search';
import * as React from 'react';
import { Menu } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import {
  ListItemText,
  createStyles,
  WithStyles,
  IconButton,
  Typography,
  ListItem,
  Toolbar,
  Divider,
  Hidden,
  AppBar,
  Drawer,
  Theme,
  List
} from '@material-ui/core';

const DRAWER_WIDTH = 240;
const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
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
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: DRAWER_WIDTH
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing.unit * 3
    }
  });

export interface PanelState {
  showDrawer: boolean;
  categories: Array<
    | 'primary emails'
    | 'proxy emails'
    | 'modifiers'
    | 'messages'
    | 'filters'
    | 'domains'
  >;
}

export class Panel extends React.Component<
  WithStyles<typeof styles>,
  PanelState
> {
  state: PanelState = { showDrawer: false, categories: ['proxy emails'] };

  onSelectCategory(category: PanelState['categories'][0]) {}

  render() {
    const { showDrawer, categories } = this.state;
    const { classes } = this.props;
    const drawer = (
      <div>
        <div className={classes.toolbar} />
        <Divider />
        <List>
          <ListItem
            selected={categories.indexOf('primary emails') > -1}
            onClick={() => this.onSelectCategory('primary emails')}
            button
          >
            <ListItemText primary="primary emails" />
          </ListItem>
          <ListItem
            selected={categories.indexOf('proxy emails') > -1}
            onClick={() => this.onSelectCategory('proxy emails')}
            button
          >
            <ListItemText primary="proxy emails" />
          </ListItem>
          <ListItem
            selected={categories.indexOf('modifiers') > -1}
            onClick={() => this.onSelectCategory('modifiers')}
            button
          >
            <ListItemText primary="modifiers" />
          </ListItem>
          <ListItem
            selected={categories.indexOf('messages') > -1}
            onClick={() => this.onSelectCategory('messages')}
            button
          >
            <ListItemText primary="messages" />
          </ListItem>
          <ListItem
            selected={categories.indexOf('filters') > -1}
            onClick={() => this.onSelectCategory('filters')}
            button
          >
            <ListItemText primary="filters" />
          </ListItem>
          <ListItem
            selected={categories.indexOf('domains') > -1}
            onClick={() => this.onSelectCategory('domains')}
            button
          >
            <ListItemText primary="domains" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <Link to="/app/account">
            <ListItem>
              <ListItemText primary="account" />
            </ListItem>
          </Link>
          <ListItem href={`${ACCOWNT_API_URL}/login/logout`}>
            <ListItemText primary="logout" />
          </ListItem>
          <ListItem target="_blank" href={`${HELP_DOCS_URL}#terminology`}>
            <ListItemText primary="help" />
          </ListItem>
        </List>
      </div>
    );
    return (
      <div className={classes.root}>
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
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <Drawer
              classes={{ paper: classes.drawerPaper }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Search categories={categories} />
        </main>
      </div>
    );
  }
}
