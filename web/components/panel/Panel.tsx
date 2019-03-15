import { SnackbarProvider } from 'notistack';
import { PanelControls } from 'components/panel/Controls';
import { PanelContext } from 'lib/PanelContext';
import { PanelDialog } from 'components/panel/Dialog';
import { Category } from 'constants/categories';
import { Create } from 'components/panel/Create';
import { Search } from 'components/panel/Search';
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
      padding: theme.spacing.unit * 3
    }
  });

export interface PanelState {
  primaryEmails?: Ptorx.PrimaryEmailList;
  aliases?: Ptorx.AliasList;
  categories: Category[];
  modifiers?: Ptorx.ModifierList;
  dispatch: (state: Partial<PanelState>) => void;
  messages?: Ptorx.MessageList;
  filters?: Ptorx.FilterList;
  domains?: Ptorx.DomainList;
  loading: boolean;
  search: string;
  user: Ptorx.User;
}

export interface PanelProps extends WithStyles<typeof styles> {
  user: Ptorx.User;
}

class _Panel extends React.Component<PanelProps, PanelState> {
  state: PanelState = {
    categories: (localStorage.categories || 'Aliases').split(','),
    dispatch: state => this.setState(state as PanelState),
    loading: true,
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
          <Button color="primary" size="small">
            Dismiss
          </Button>
        ]}
        maxSnack={2}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <PanelContext.Provider value={this.state}>
          <div className={classes.root}>
            <PanelControls />
            <main className={classes.content}>
              <div className={classes.toolbar} />
              <Create />
              <Search />
              <PanelDialog />
            </main>
          </div>
        </PanelContext.Provider>
      </SnackbarProvider>
    );
  }
}

export const Panel = withStyles(styles)(_Panel);
