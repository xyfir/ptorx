import { ACCOWNT_API_URL, HELP_DOCS_URL } from 'constants/config';
import { AccountBox, ExitToApp, Help } from '@material-ui/icons';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ListItemSecondaryAction,
  ListSubheader,
  ListItemIcon,
  ListItemText,
  createStyles,
  WithStyles,
  withStyles,
  ListItem,
  Divider,
  Switch,
  List
} from '@material-ui/core';

const styles = createStyles({ link: { textDecoration: 'none' } });

const _DrawerContent = ({ classes }: WithStyles<typeof styles>) => (
  <PanelContext.Consumer>
    {context => (
      <div>
        <ListSubheader>Filters</ListSubheader>

        <List>
          <ListItem>
            <ListItemText primary="Primary Emails" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('primary emails')}
                checked={context.categories.indexOf('primary emails') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText primary="Proxy Emails" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('proxy emails')}
                checked={context.categories.indexOf('proxy emails') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText primary="Modifiers" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('modifiers')}
                checked={context.categories.indexOf('modifiers') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText primary="Messages" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('messages')}
                checked={context.categories.indexOf('messages') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText primary="Filters" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('filters')}
                checked={context.categories.indexOf('filters') > -1}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <ListItem>
            <ListItemText primary="Domains" />
            <ListItemSecondaryAction>
              <Switch
                onChange={() => this.onSelectCategory('domains')}
                checked={context.categories.indexOf('domains') > -1}
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
    )}
  </PanelContext.Consumer>
);

export const DrawerContent = withStyles(styles)(_DrawerContent);
