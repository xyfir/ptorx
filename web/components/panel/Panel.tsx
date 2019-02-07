import { createStyles, WithStyles, withStyles, Theme } from '@material-ui/core';
import { PanelControls } from 'components/panel/Controls';
import { PanelContext } from 'lib/PanelContext';
import { PanelDialog } from 'components/panel/Dialog';
import { Create } from 'components/panel/Create';
import { Search } from 'components/panel/Search';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { api } from 'lib/api';

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
  categories: Array<
    | 'Primary Emails'
    | 'Proxy Emails'
    | 'Modifiers'
    | 'Messages'
    | 'Filters'
    | 'Domains'
  >;
  primaryEmails: Ptorx.PrimaryEmailList;
  proxyEmails: Ptorx.ProxyEmailList;
  modifiers: Ptorx.ModifierList;
  dispatch: (state: Partial<PanelState>) => void;
  messages: Ptorx.MessageList;
  filters: Ptorx.FilterList;
  domains: Ptorx.DomainList;
  search: string;
  user: Ptorx.User;
}

export interface PanelProps extends WithStyles<typeof styles> {
  user: Ptorx.User;
}

class _Panel extends React.Component<PanelProps, PanelState> {
  state: PanelState = {
    primaryEmails: [],
    proxyEmails: [],
    categories: (localStorage.categories || 'Proxy Emails').split(','),
    modifiers: [],
    dispatch: state => this.setState(state as PanelState),
    messages: [],
    filters: [],
    domains: [],
    search: '',
    user: this.props.user
  };

  componentDidMount() {
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
    const { classes } = this.props;
    return (
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
    );
  }
}

export const Panel = withStyles(styles)(_Panel);
