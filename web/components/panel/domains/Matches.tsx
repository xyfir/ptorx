import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { Link } from 'react-router-dom';
import { NAME } from 'constants/config';
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

interface DomainMatchesProps extends WithStyles<typeof styles> {
  domains: Ptorx.DomainList;
}

interface DomainMatchesState {
  perPage: number;
  page: number;
}

class _DomainMatches extends React.Component<
  DomainMatchesProps,
  DomainMatchesState
> {
  state: DomainMatchesState = { perPage: 5, page: 1 };

  render() {
    const { classes, domains } = this.props;
    const { perPage, page } = this.state;
    return (
      <div>
        <List>
          <ListSubheader color="primary">Domains</ListSubheader>
          {domains.slice((page - 1) * perPage, page * perPage).map(domain => (
            <Link
              className={classes.link}
              key={domain.id}
              to={`/app/domains/${domain.id}`}
            >
              <ListItem button>
                <ListItemText
                  primary={domain.domain}
                  secondary={
                    domain.isCreator
                      ? `Added to ${NAME} ${moment
                          .unix(domain.created)
                          .fromNow()}`
                      : `You are authorized to use this${
                          domain.global ? ' global ' : ' '
                        }domain`
                  }
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
          count={domains.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const DomainMatches = withStyles(styles)(_DomainMatches);
