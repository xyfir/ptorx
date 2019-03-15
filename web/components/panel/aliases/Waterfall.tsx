import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import {
  TablePagination,
  createStyles,
  ListItemText,
  WithStyles,
  withStyles,
  Typography,
  TextField,
  ListItem,
  Button,
  Paper,
  List
} from '@material-ui/core';

const styles = createStyles({
  paper: {
    padding: '0.5em',
    margin: '2em 0'
  },
  title: {
    fontSize: '200%'
  }
});

type LinkType = 'Primary Email' | 'Modifier' | 'Filter';

interface AliasWaterfallProps {
  onChange(key: keyof Ptorx.Alias, value: any): void;
  alias: Ptorx.Alias;
}

interface AliasWaterfallState {
  selected?: {
    type: LinkType;
    id: number;
  };
  search: string;
  mode: 'linked' | 'search';
  page: number;
}

class _AliasWaterfall extends React.Component<
  AliasWaterfallProps & WithStyles<typeof styles>,
  AliasWaterfallState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: AliasWaterfallState = {
    search: '',
    mode: 'linked',
    page: 1
  };

  /**
   * @param up - Moving an item "up" really means _lowering_ its `orderIndex`
   *  so that it's displayed earlier on in the list.
   */
  onMove(up: boolean) {
    const { alias, onChange } = this.props;
    const { selected } = this.state;
    const links = alias.links
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const index = links.findIndex(l =>
      selected.type == 'Primary Email'
        ? selected.id == l.primaryEmailId
        : selected.type == 'Modifier'
        ? selected.id == l.modifierId
        : selected.type == 'Filter'
        ? selected.id == l.filterId
        : false
    );

    // Prevent moving beyond edge
    if (up && links[index].orderIndex == 0) return;
    if (!up && links[index].orderIndex == links.length - 1) return;

    // Change orderIndex of target and element which switched places with target
    links[index].orderIndex += up ? -1 : 1;
    links[up ? index - 1 : index + 1].orderIndex += up ? 1 : -1;

    onChange('links', links);
  }

  onUnlink() {
    const { alias, onChange } = this.props;
    const { selected } = this.state;

    // Remove link from list
    const links = alias.links.filter(l =>
      selected.type == 'Primary Email'
        ? selected.id != l.primaryEmailId
        : selected.type == 'Modifier'
        ? selected.id != l.modifierId
        : selected.type == 'Filter'
        ? selected.id != l.filterId
        : true
    );

    // Adjust orderIndexes
    links
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .forEach((l, i) => (l.orderIndex = i));

    onChange('links', links);
    this.setState({ selected: null });
  }

  onLink() {
    const { alias, onChange } = this.props;
    const { selected } = this.state;
    const link: Ptorx.AliasLink = {
      aliasId: alias.id,
      orderIndex: alias.links.length
    };
    switch (selected.type) {
      case 'Primary Email':
        link.primaryEmailId = selected.id;
        break;
      case 'Modifier':
        link.modifierId = selected.id;
        break;
      case 'Filter':
        link.filterId = selected.id;
        break;
    }
    onChange('links', [...alias.links, link]);
    this.setState({ selected: null });
  }

  render() {
    const { primaryEmails, modifiers, filters } = this.context;
    const { selected, search, mode, page } = this.state;
    const { alias, classes } = this.props;
    let matches: {
      id: number;
      name: string;
      type: LinkType;
    }[] =
      mode == 'search'
        ? []
            // Convert and combine primary emails, modifiers, and filters
            .concat(
              primaryEmails.map(e => ({
                id: e.id,
                name: e.address,
                type: 'Primary Email'
              })),
              modifiers.map(m => ({
                id: m.id,
                name: m.name,
                type: 'Modifier'
              })),
              filters.map(f => ({ id: f.id, name: f.name, type: 'Filter' }))
            )
            // Filter out items already linked to the alias
            .filter(
              m =>
                (m.type != 'Primary Email' ||
                  alias.links.findIndex(l => l.primaryEmailId == m.id) == -1) &&
                (m.type != 'Modifier' ||
                  alias.links.findIndex(l => l.modifierId == m.id) == -1) &&
                (m.type != 'Filter' ||
                  alias.links.findIndex(l => l.filterId == m.id) == -1)
            )
        : alias.links
            // Sort our linked items in ascending order
            .sort((a, b) => a.orderIndex - b.orderIndex)
            // Convert and combine our linked items
            .map(l => ({
              id: l.primaryEmailId || l.modifierId || l.filterId,
              name: l.primaryEmailId
                ? primaryEmails.find(e => e.id == l.primaryEmailId).address
                : l.modifierId
                ? modifiers.find(m => m.id == l.modifierId).name
                : l.filterId
                ? filters.find(f => f.id == l.filterId).name
                : null,
              type: l.primaryEmailId
                ? 'Primary Email'
                : l.modifierId
                ? 'Modifier'
                : l.filterId
                ? 'Filter'
                : null
            }));
    matches = matches.filter(m => m.name.toLowerCase().indexOf(search) > -1);
    return (
      <Paper elevation={2} className={classes.paper}>
        <Typography variant="h3" className={classes.title}>
          Waterfall: {mode == 'linked' ? 'Linked' : 'Link New'}
        </Typography>

        <TextField
          fullWidth
          id="search"
          type="search"
          value={search}
          margin="normal"
          onChange={e =>
            this.setState({ search: e.target.value.toLowerCase() })
          }
          placeholder="Search..."
        />
        {mode == 'linked' ? (
          <React.Fragment>
            <Button
              color="secondary"
              variant="text"
              onClick={() => this.onUnlink()}
              disabled={!selected}
            >
              Unlink
            </Button>
            <Button
              variant="text"
              onClick={() => this.onMove(true)}
              disabled={!selected}
            >
              Move Up
            </Button>
            <Button
              variant="text"
              onClick={() => this.onMove(false)}
              disabled={!selected}
            >
              Move Down
            </Button>
          </React.Fragment>
        ) : (
          <Button
            color="secondary"
            variant="text"
            onClick={() => this.onLink()}
            disabled={!selected}
          >
            Link
          </Button>
        )}
        <List dense>
          {matches.slice((page - 1) * 5, page * 5).map(m => (
            <ListItem
              key={m.type + m.id}
              button
              selected={
                selected && selected.type == m.type && selected.id == m.id
              }
              onClick={() =>
                this.setState({ selected: { type: m.type, id: m.id } })
              }
            >
              <ListItemText primary={`${m.type} — ${m.name}`} />
            </ListItem>
          ))}
          {!matches.length ? (
            <ListItem button>
              <ListItemText
                primary={
                  mode == 'linked' ? 'No linked items' : 'No matching items'
                }
              />
            </ListItem>
          ) : null}
        </List>
        <TablePagination
          rowsPerPageOptions={[5]}
          onChangePage={(e, p) => this.setState({ page: p + 1 })}
          rowsPerPage={5}
          component="div"
          count={matches.length}
          page={page - 1}
        />

        <Button
          color="primary"
          variant="text"
          onClick={() =>
            this.setState({
              selected: null,
              mode: mode == 'linked' ? 'search' : 'linked'
            })
          }
        >
          {mode == 'linked' ? 'Link New...' : 'View Linked'}
        </Button>
      </Paper>
    );
  }
}

export const AliasWaterfall = withStyles(styles)(_AliasWaterfall);
