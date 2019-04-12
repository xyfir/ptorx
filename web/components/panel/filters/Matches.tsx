import { PanelContext } from 'lib/PanelContext';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { Link } from 'react-router-dom';
import {
  TablePagination,
  ListSubheader,
  ListItemText,
  createStyles,
  withStyles,
  WithStyles,
  Checkbox,
  ListItem,
  List
} from '@material-ui/core';

const styles = createStyles({ link: { textDecoration: 'none' } });

interface FilterMatchesProps extends WithStyles<typeof styles> {
  filters: Ptorx.FilterList;
}

interface FilterMatchesState {
  perPage: number;
  page: number;
}

class _FilterMatches extends React.Component<
  FilterMatchesProps,
  FilterMatchesState
> {
  state: FilterMatchesState = { perPage: 5, page: 1 };
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  onSelect(id: Ptorx.MessageList[0]['id']) {
    const { selections, dispatch } = this.context;
    let { filters } = selections;
    if (filters.includes(id)) filters = filters.filter(_id => _id != id);
    else filters = filters.concat(id);
    dispatch({ selections: { ...selections, filters } });
  }

  render() {
    const { selections, manage } = this.context;
    const { classes, filters } = this.props;
    const { perPage, page } = this.state;
    return (
      <div>
        <List>
          <ListSubheader color="primary">Filters</ListSubheader>
          {filters.slice((page - 1) * perPage, page * perPage).map(filter =>
            manage ? (
              <ListItem
                onClick={() => this.onSelect(filter.id)}
                button
                key={filter.id}
              >
                <Checkbox
                  checked={selections.filters.includes(filter.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText primary={filter.name} />
              </ListItem>
            ) : (
              <Link
                className={classes.link}
                key={filter.id}
                to={`/app/filters/${filter.id}`}
              >
                <ListItem button>
                  <ListItemText
                    primary={`${filter.type} — ${filter.name}`}
                    secondary={`Created ${moment
                      .unix(filter.created)
                      .fromNow()}`}
                  />
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
          count={filters.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const FilterMatches = withStyles(styles)(_FilterMatches);
