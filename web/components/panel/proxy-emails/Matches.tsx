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

interface ProxyEmailMatchesProps extends WithStyles<typeof styles> {
  proxyEmails: Ptorx.ProxyEmailList;
}

interface ProxyEmailMatchesState {
  perPage: number;
  page: number;
}

class _ProxyEmailMatches extends React.Component<
  ProxyEmailMatchesProps,
  ProxyEmailMatchesState
> {
  state: ProxyEmailMatchesState = { perPage: 5, page: 1 };

  render() {
    const { classes, proxyEmails } = this.props;
    const { perPage, page } = this.state;
    return (
      <div>
        <List>
          <ListSubheader color="primary">Proxy Emails</ListSubheader>
          {proxyEmails
            .slice((page - 1) * perPage, page * perPage)
            .map(proxyEmail => (
              <Link
                className={classes.link}
                key={proxyEmail.id}
                to={`/app/proxy-emails/${proxyEmail.id}`}
              >
                <ListItem button>
                  <ListItemText
                    primary={`${proxyEmail.fullAddress} — ${proxyEmail.name}`}
                    secondary={`Created ${moment
                      .unix(proxyEmail.created)
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
          count={proxyEmails.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const ProxyEmailMatches = withStyles(styles)(_ProxyEmailMatches);
