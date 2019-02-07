import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { Link } from 'react-router-dom';
import {
  TablePagination,
  ListSubheader,
  ListItemText,
  createStyles,
  withStyles,
  WithStyles,
  ListItem,
  List
} from '@material-ui/core';

const styles = createStyles({ link: { textDecoration: 'none' } });

interface ModifierMatchesProps extends WithStyles<typeof styles> {
  modifiers: Ptorx.ModifierList;
}

interface ModifierMatchesState {
  perPage: number;
  page: number;
}

class _ModifierMatches extends React.Component<
  ModifierMatchesProps,
  ModifierMatchesState
> {
  state: ModifierMatchesState = { perPage: 5, page: 1 };

  render() {
    const { classes, modifiers } = this.props;
    const { perPage, page } = this.state;
    return (
      <div>
        <List>
          <ListSubheader color="primary">Modifiers</ListSubheader>
          {modifiers
            .slice((page - 1) * perPage, page * perPage)
            .map(modifier => (
              <Link
                className={classes.link}
                key={modifier.id}
                to={`/app/modifiers/${modifier.id}`}
              >
                <ListItem button>
                  <ListItemText
                    primary={`${modifier.type} — ${modifier.name}`}
                    secondary={`Created ${moment
                      .unix(modifier.created)
                      .fromNow()}`}
                  />
                </ListItem>
              </Link>
            ))}
        </List>
        <TablePagination
          onChangeRowsPerPage={e => this.setState({ perPage: +e.target.value })}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          onChangePage={(e, p) => this.setState({ page: p + 1 })}
          rowsPerPage={perPage}
          component="div"
          count={modifiers.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const ModifierMatches = withStyles(styles)(_ModifierMatches);
