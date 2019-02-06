import { ACCOWNT_API_URL, HELP_DOCS_URL, NAME } from 'constants/config';
import { AccountBox, ExitToApp, Help, Menu } from '@material-ui/icons';
import { PanelContext } from 'lib/PanelContext';
import { Search } from 'components/panel/Search';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { Link } from 'react-router-dom';
import { api } from 'lib/api';
import {
  ListItemSecondaryAction,
  ListSubheader,
  ListItemIcon,
  ListItemText,
  createStyles,
  WithStyles,
  withStyles,
  IconButton,
  Typography,
  ListItem,
  Toolbar,
  Divider,
  Switch,
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
    link: {
      textDecoration: 'none'
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
  primaryEmails: Ptorx.PrimaryEmailList;
  proxyEmails: Ptorx.ProxyEmailList;
  modifiers: Ptorx.ModifierList;
  messages: Ptorx.MessageList;
  filters: Ptorx.FilterList;
  domains: Ptorx.DomainList;
}

export interface PanelProps extends WithStyles<typeof styles> {
  user: Ptorx.User;
}

class _Panel extends React.Component<PanelProps, PanelState> {
  state: PanelState = {
    primaryEmails: [],
    proxyEmails: [],
    categories: ['proxy emails'],
    showDrawer: false,
    modifiers: [],
    messages: [],
    filters: [],
    domains: []
  };

  componentDidMount() {
    this.reload();
  }

  onSelectCategory(category: PanelState['categories'][0]) {}

  reload() {
    Promise.all([
      api.get('/primary-emails'),
      api.get('/proxy-emails'),
      api.get('/modifiers'),
      api.get('/messages'),
      api.get('/filters'),
      api.get('/domains')
    ])
      .then(res =>
        this.setState({
          primaryEmails: res[0].data,
          proxyEmails: res[1].data,
          modifiers: res[2].data,
          messages: res[3].data,
          filters: res[4].data,
          domains: res[5].data
        })
      )
      .catch(console.error);
  }

  render() {
    const { showDrawer, categories } = this.state;
    const { classes, user } = this.props;
    const drawer = (
      <div>
        <ListSubheader>Filters</ListSubheader>

        <List>
          <ListItem>
            <ListItemText primary="Primary Emails" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('primary emails')}
                checked={categories.indexOf('primary emails') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText primary="Proxy Emails" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('proxy emails')}
                checked={categories.indexOf('proxy emails') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText primary="Modifiers" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('modifiers')}
                checked={categories.indexOf('modifiers') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText primary="Messages" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('messages')}
                checked={categories.indexOf('messages') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText primary="Filters" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('filters')}
                checked={categories.indexOf('filters') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText primary="Domains" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('domains')}
                checked={categories.indexOf('domains') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>

        <Divider />

        <List>
          <Link to="/app/account" className={classes.link}>
            <ListItem button>
              <ListItemIcon>
                <AccountBox />
              </ListItemIcon>
              <ListItemText primary="Account" />
            </ListItem>
          </Link>
          <a href={`${ACCOWNT_API_URL}/login/logout`} className={classes.link}>
            <ListItem button>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </a>
          <a
            href={`${HELP_DOCS_URL}#terminology`}
            target="_blank"
            className={classes.link}
          >
            <ListItem button>
              <ListItemIcon>
                <Help />
              </ListItemIcon>
              <ListItemText primary="Help" />
            </ListItem>
          </a>
        </List>
      </div>
    );
    return (
      <PanelContext.Provider
        value={{ ...this.state, reload: this.reload, user }}
      >
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
      </PanelContext.Provider>
    );
  }
}

export const Panel = withStyles(styles)(_Panel);
