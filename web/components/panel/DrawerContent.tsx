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

class CategoryToggle extends React.Component<{
  category: PanelState['categories'][0];
}> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  onToggle() {
    const { categories, dispatch } = this.context;
    const { category } = this.props;
    const _categories =
      categories.indexOf(category) > -1
        ? categories.filter(c => c != category)
        : categories.concat([category]);
    dispatch({ categories: _categories });
    localStorage.categories = _categories;
  }

  render() {
    const { categories } = this.context;
    const { category } = this.props;
    return (
      <ListItem>
        <ListItemText primary={category} />
        <ListItemSecondaryAction>
          <Switch
            onChange={() => this.onToggle()}
            checked={categories.indexOf(category) > -1}
          />
        </ListItemSecondaryAction>
      </ListItem>
    );
  }
}

const _DrawerContent = ({ classes }: WithStyles<typeof styles>) => (
  <div>
    <ListSubheader>Filters</ListSubheader>
    <List>
      <CategoryToggle category="Primary Emails" />
      <CategoryToggle category="Proxy Emails" />
      <CategoryToggle category="Modifiers" />
      <CategoryToggle category="Messages" />
      <CategoryToggle category="Filters" />
      <CategoryToggle category="Domains" />
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

export const DrawerContent = withStyles(styles)(_DrawerContent);
