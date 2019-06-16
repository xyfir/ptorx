import { AddCircleOutline, AddCircle, Launch } from '@material-ui/icons';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { SearchMatches, SearchInput } from 'components/panel/utils/Search';
import { CATEGORIES, Category } from 'lib/categories';
import { RouteComponentProps } from 'react-router';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
// @ts-ignore
import * as copy from 'clipboard-copy';
import { Ptorx } from 'types/ptorx';
import { Link } from 'react-router-dom';
import { api } from 'lib/api';
import {
  ListItemText,
  createStyles,
  ListItemIcon,
  withStyles,
  WithStyles,
  ListItem,
  Divider,
  Button,
  List
} from '@material-ui/core';

const styles = createStyles({
  link: { textDecoration: 'none' },
  hr: {
    margin: '0.5em',
    marginBottom: '0'
  }
});

interface ExtensionProps
  extends WithStyles<typeof styles>,
    RouteComponentProps,
    WithSnackbarProps {
  aliases: Ptorx.AliasList;
}

class _Extension extends React.Component<ExtensionProps> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  onCreateInstantAlias() {
    const { enqueueSnackbar, history } = this.props;
    const { domains, dispatch } = this.context;
    const alias: Partial<Ptorx.Alias> = {
      domainId: domains[0].id,
      address: '',
      name: 'Instant Alias'
    };
    api
      .post('/aliases', alias)
      .then(res => {
        const _alias: Ptorx.Alias = res.data;
        copy(_alias.fullAddress);
        enqueueSnackbar('Alias address copied to clipboard');
        history.push(`/app/aliases/${_alias.id}`);
        return api.get('/aliases');
      })
      .then(res => dispatch({ aliases: res.data }))
      .catch(err => enqueueSnackbar(err.response.data.error));
  }

  onToggle(category: Category['name']) {
    const { categories, dispatch } = this.context;
    const _categories =
      categories.indexOf(category) > -1
        ? categories.filter(c => c != category)
        : categories.concat([category]);
    dispatch({ categories: _categories });
    localStorage.categories = _categories;
  }

  render() {
    const { categories, search } = this.context;
    const { classes } = this.props;
    return (
      <div>
        <SearchInput />
        {CATEGORIES.map(category => (
          <Button
            key={category.name}
            size="small"
            color={
              categories.indexOf(category.name) > -1 ? 'secondary' : 'default'
            }
            variant="text"
            onClick={() => this.onToggle(category.name)}
          >
            {category.name}
          </Button>
        ))}
        <Divider className={classes.hr} />

        {search ? (
          <SearchMatches />
        ) : (
          <List>
            <ListItem button onClick={() => this.onCreateInstantAlias()}>
              <ListItemIcon>
                <AddCircle />
              </ListItemIcon>
              <ListItemText primary="Create Instant Alias" />
            </ListItem>
            <Link className={classes.link} to="/app/aliases/add">
              <ListItem button>
                <ListItemIcon>
                  <AddCircleOutline />
                </ListItemIcon>
                <ListItemText primary="Create Custom Alias" />
              </ListItem>
            </Link>
            <ListItem button onClick={() => window.open('/app')}>
              <ListItemIcon>
                <Launch />
              </ListItemIcon>
              <ListItemText primary="Launch Ptorx" />
            </ListItem>
          </List>
        )}
      </div>
    );
  }
}

export const Extension = withSnackbar(withStyles(styles)(_Extension));
