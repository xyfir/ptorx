import { createStyles, WithStyles, withStyles, Theme } from '@material-ui/core';
import { PanelControls } from 'components/panel/Controls';
import { PanelContext } from 'lib/PanelContext';
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
    const { classes, user } = this.props;
    return (
      <PanelContext.Provider
        value={{
          ...this.state,
          onSelectCategory: this.onSelectCategory,
          reload: this.reload,
          user
        }}
      >
        <div className={classes.root}>
          <PanelControls />
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <Search />
          </main>
        </div>
      </PanelContext.Provider>
    );
  }
}

export const Panel = withStyles(styles)(_Panel);
