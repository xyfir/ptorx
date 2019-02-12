import { AccountBox, ExitToApp, Help } from '@material-ui/icons';
import { CATEGORIES, Category } from 'constants/categories';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import {
  ListItemSecondaryAction,
  ListSubheader,
  ListItemIcon,
  ListItemText,
  createStyles,
  Typography,
  WithStyles,
  withStyles,
  ListItem,
  Divider,
  Switch,
  List
} from '@material-ui/core';
import {
  ACCOWNT_API_URL,
  ACCOWNT_WEB_URL,
  HELP_DOCS_URL
} from 'constants/config';

const styles = createStyles({ link: { textDecoration: 'none' } });

class _DrawerContent extends React.Component<WithStyles<typeof styles>> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  onToggle(category: Category) {
    const { categories, dispatch } = this.context;
    const _categories =
      categories.indexOf(category) > -1
        ? categories.filter(c => c != category)
        : categories.concat([category]);
    dispatch({ categories: _categories });
    localStorage.categories = _categories;
  }

  render() {
    const { categories, user } = this.context;
    const { classes } = this.props;
    return (
      <div>
        <List>
          <ListSubheader>Filters</ListSubheader>
          {CATEGORIES.map(category => (
            <ListItem key={category.name}>
              <ListItemText primary={category.name} />
              <ListItemSecondaryAction>
                <Switch
                  onChange={() => this.onToggle(category.name)}
                  checked={categories.indexOf(category.name) > -1}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListSubheader>Credits: {user.credits}</ListSubheader>
          <a href={ACCOWNT_WEB_URL} className={classes.link}>
            <ListItem button>
              <ListItemIcon>
                <AccountBox />
              </ListItemIcon>
              <ListItemText primary="Account" />
            </ListItem>
          </a>
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
  }
}

export const DrawerContent = withStyles(styles)(_DrawerContent);
