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
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  onSelect(id: Ptorx.MessageList[0]['id']) {
    const { selections, dispatch } = this.context;
    let { domains } = selections;
    if (domains.includes(id)) domains = domains.filter(_id => _id != id);
    else domains = domains.concat(id);
    dispatch({ selections: { ...selections, domains } });
  }

  render() {
    const { selections, manage } = this.context;
    const { classes, domains } = this.props;
    const { perPage, page } = this.state;
    return (
      <div>
        <List>
          <ListSubheader color="primary">Domains</ListSubheader>
          {domains.slice((page - 1) * perPage, page * perPage).map(domain =>
            manage ? (
              <ListItem
                onClick={() => this.onSelect(domain.id)}
                button
                key={domain.id}
              >
                <Checkbox
                  checked={selections.domains.includes(domain.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText primary={domain.domain} />
              </ListItem>
            ) : (
              <Link
                className={classes.link}
                key={domain.id}
                to={domain.isCreator ? `/app/domains/${domain.id}` : '/app'}
              >
                <ListItem button>
                  <ListItemText
                    primary={domain.domain}
                    secondary={
                      domain.isCreator
                        ? `Added to Ptorx ${moment
                            .unix(domain.created)
                            .fromNow()}`
                        : `You are authorized to use this${
                            domain.global ? ' global ' : ' '
                          }domain`
                    }
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
          count={domains.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const DomainMatches = withStyles(styles)(_DomainMatches);
