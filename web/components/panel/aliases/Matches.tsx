import { PanelContext } from 'lib/PanelContext';
import { FileCopy } from '@material-ui/icons';
import * as moment from 'moment';
import * as React from 'react';
// @ts-ignore
import * as copy from 'clipboard-copy';
import { Ptorx } from 'types/ptorx';
import { Link } from 'react-router-dom';
import {
  ListItemSecondaryAction,
  TablePagination,
  ListSubheader,
  ListItemText,
  createStyles,
  IconButton,
  withStyles,
  WithStyles,
  Checkbox,
  ListItem,
  List
} from '@material-ui/core';

const styles = createStyles({ link: { textDecoration: 'none' } });

interface AliasMatchesProps extends WithStyles<typeof styles> {
  aliases: Ptorx.AliasList;
}

interface AliasMatchesState {
  perPage: number;
  page: number;
}

class _AliasMatches extends React.Component<
  AliasMatchesProps,
  AliasMatchesState
> {
  state: AliasMatchesState = { perPage: 10, page: 1 };
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  onSelect(id: Ptorx.MessageList[0]['id']) {
    const { selections, dispatch } = this.context;
    let { aliases } = selections;
    if (aliases.includes(id)) aliases = aliases.filter(_id => _id != id);
    else aliases = aliases.concat(id);
    dispatch({ selections: { ...selections, aliases } });
  }

  render() {
    const { selections, manage } = this.context;
    const { classes, aliases } = this.props;
    const { perPage, page } = this.state;
    return (
      <div>
        <List>
          <ListSubheader color="primary">Aliases</ListSubheader>
          {aliases.slice((page - 1) * perPage, page * perPage).map(alias =>
            manage ? (
              <ListItem
                onClick={() => this.onSelect(alias.id)}
                button
                key={alias.id}
              >
                <Checkbox
                  checked={selections.aliases.includes(alias.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText primary={alias.fullAddress} />
              </ListItem>
            ) : (
              <Link
                className={classes.link}
                key={alias.id}
                to={`/app/aliases/${alias.id}`}
              >
                <ListItem button>
                  <ListItemText
                    primary={`${alias.fullAddress} — ${alias.name}`}
                    secondary={`Created ${moment
                      .unix(alias.created)
                      .fromNow()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      aria-label="Copy alias address to clipboard"
                      onClick={e => (
                        e.preventDefault(), copy(alias.fullAddress)
                      )}
                      color="secondary"
                    >
                      <FileCopy />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Link>
            )
          )}
        </List>
        <TablePagination
          onChangeRowsPerPage={e => this.setState({ perPage: +e.target.value })}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          onChangePage={(e, p) => this.setState({ page: p + 1 })}
          rowsPerPage={perPage}
          component="div"
          count={aliases.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const AliasMatches = withStyles(styles)(_AliasMatches);
