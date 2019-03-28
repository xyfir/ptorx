import { withSnackbar, withSnackbarProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { PanelContext } from 'lib/PanelContext';
import { Search } from 'components/panel/Search';
import * as React from 'react';
// @ts-ignore
import * as copy from 'clipboard-copy';
import { Ptorx } from 'types/ptorx';
import { Link } from 'react-router-dom';
import { api } from 'lib/api';
import {
  Search as SearchIcon,
  AddCircleOutline,
  AddCircle,
  Launch
} from '@material-ui/icons';
import {
  InputAdornment,
  ListItemText,
  createStyles,
  ListItemIcon,
  withStyles,
  WithStyles,
  TextField,
  ListItem,
  List
} from '@material-ui/core';

const styles = createStyles({ link: { textDecoration: 'none' } });

interface ExtensionProps
  extends WithStyles<typeof styles>,
    RouteComponentProps,
    withSnackbarProps {
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

  render() {
    const { dispatch, search } = this.context;
    const { classes } = this.props;
    return search ? (
      <Search />
    ) : (
      <div>
        <TextField
          id="search"
          type="search"
          value={search}
          margin="normal"
          variant="outlined"
          onChange={e => dispatch({ search: e.target.value.toLowerCase() })}
          fullWidth
          autoFocus
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
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
      </div>
    );
  }
}

export const Extension = withSnackbar(withStyles(styles)(_Extension));
