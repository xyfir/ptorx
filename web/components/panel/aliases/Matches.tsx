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

  render() {
    const { classes, aliases } = this.props;
    const { perPage, page } = this.state;
    return (
      <div>
        <List>
          <ListSubheader color="primary">Aliases</ListSubheader>
          {aliases.slice((page - 1) * perPage, page * perPage).map(alias => (
            <Link
              className={classes.link}
              key={alias.id}
              to={`/app/aliases/${alias.id}`}
            >
              <ListItem button>
                <ListItemText
                  primary={`${alias.fullAddress} — ${alias.name}`}
                  secondary={`Created ${moment.unix(alias.created).fromNow()}`}
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
          count={aliases.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const AliasMatches = withStyles(styles)(_AliasMatches);
