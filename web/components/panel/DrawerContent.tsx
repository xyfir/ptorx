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
import { PanelState } from './Panel';

const styles = createStyles({ link: { textDecoration: 'none' } });

const Filter = ({ category }: { category: PanelState['categories'][0] }) => (
  <PanelContext.Consumer>
    {context => (
      <ListItem>
        <ListItemText primary={category} />
        <ListItemSecondaryAction>
          <Switch
            onChange={() =>
              context.dispatch(
                context.categories.indexOf(category) > -1
                  ? {
                      categories: context.categories.filter(c => c != category)
                    }
                  : { categories: context.categories.concat([category]) }
              )
            }
            checked={context.categories.indexOf(category) > -1}
          />
        </ListItemSecondaryAction>
      </ListItem>
    )}
  </PanelContext.Consumer>
);

const _DrawerContent = ({ classes }: WithStyles<typeof styles>) => (
  <PanelContext.Consumer>
    {context => (
      <div>
        <ListSubheader>Filters</ListSubheader>
        <List>
          <Filter category="Primary Emails" />
          <Filter category="Proxy Emails" />
          <Filter category="Modifiers" />
          <Filter category="Messages" />
          <Filter category="Filters" />
          <Filter category="Domains" />
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
