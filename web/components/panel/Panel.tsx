import { SearchMatches, SearchInput } from 'components/panel/utils/Search';
import { SnackbarProvider } from 'notistack';
import { PanelNavigation } from 'components/panel/Navigation';
import { PanelControls } from 'components/panel/Controls';
import { PanelContext } from 'lib/PanelContext';
import { PanelDialog } from 'components/panel/Dialog';
import { Category } from 'constants/categories';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  createStyles,
  WithStyles,
  withStyles,
  Button,
  Theme
} from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      padding: theme.spacing(3)
    }
  });

export interface PanelState {
  unlockedPrivateKey?: import('openpgp').key.Key;
  primaryEmails?: Ptorx.PrimaryEmailList;
  categories: Category['name'][];
  modifiers?: Ptorx.ModifierList;
  selections: {
    primaryEmails: Ptorx.PrimaryEmailList[0]['id'][];
    modifiers: Ptorx.ModifierList[0]['id'][];
    messages: Ptorx.MessageList[0]['id'][];
    filters: Ptorx.FilterList[0]['id'][];
    domains: Ptorx.DomainList[0]['id'][];
    aliases: Ptorx.AliasList[0]['id'][];
  };
  dispatch: (state: Partial<PanelState>) => void;
  messages?: Ptorx.MessageList;
  filters?: Ptorx.FilterList;
  domains?: Ptorx.DomainList;
  aliases?: Ptorx.AliasList;
  loading: boolean;
  manage?: 'delete';
  search: string;
  user: Ptorx.User;
}

export interface PanelProps extends WithStyles<typeof styles> {
  user: Ptorx.User;
}

class _Panel extends React.Component<PanelProps, PanelState> {
  state: PanelState = {
    categories: (localStorage.categories || 'Aliases').split(','),
    selections: {
      primaryEmails: [],
      modifiers: [],
      messages: [],
      aliases: [],
      domains: [],
      filters: []
    },
    dispatch: state => this.setState(state as PanelState),
    loading: true,
    manage: null,
    search: '',
    user: this.props.user
  };

  componentDidMount() {
    Promise.all([
      api.get('/primary-emails'),
      api.get('/aliases'),
      api.get('/modifiers'),
      api.get('/messages'),
      api.get('/filters'),
      api.get('/domains')
    ])
      .then(res =>
        this.setState({
          primaryEmails: res[0].data,
          aliases: res[1].data,
          modifiers: res[2].data,
          messages: res[3].data,
          filters: res[4].data,
          domains: res[5].data,
          loading: false
        })
      )
      .catch(console.error);
  }

  render() {
    if (this.state.loading) return null;
    const { classes } = this.props;
    return (
      <SnackbarProvider
        action={[
          <Button color="primary" size="small" key={0}>
            Dismiss
          </Button>
        ]}
        maxSnack={2}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <PanelContext.Provider value={this.state}>
          <div className={classes.root}>
            <PanelNavigation />
            <main className={classes.content}>
              <div className={classes.toolbar} />
              <SearchInput />
              <PanelControls />
              <SearchMatches />
              <PanelDialog />
            </main>
          </div>
        </PanelContext.Provider>
      </SnackbarProvider>
    );
  }
}

export const Panel = withStyles(styles)(_Panel);
