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

interface PrimaryEmailMatchesProps extends WithStyles<typeof styles> {
  primaryEmails: Ptorx.PrimaryEmailList;
}

interface PrimaryEmailMatchesState {
  perPage: number;
  page: number;
}

class _PrimaryEmailMatches extends React.Component<
  PrimaryEmailMatchesProps,
  PrimaryEmailMatchesState
> {
  state: PrimaryEmailMatchesState = { perPage: 5, page: 1 };
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  onSelect(id: Ptorx.MessageList[0]['id']) {
    const { selections, dispatch } = this.context;
    let { primaryEmails } = selections;
    if (primaryEmails.includes(id))
      primaryEmails = primaryEmails.filter(_id => _id != id);
    else primaryEmails = primaryEmails.concat(id);
    dispatch({ selections: { ...selections, primaryEmails } });
  }

  render() {
    const { classes, primaryEmails } = this.props;
    const { selections, manage } = this.context;
    const { perPage, page } = this.state;
    return (
      <div>
        <List>
          <ListSubheader color="primary">Primary Emails</ListSubheader>
          {primaryEmails
            .slice((page - 1) * perPage, page * perPage)
            .map(primaryEmail =>
              manage ? (
                <ListItem
                  onClick={() => this.onSelect(primaryEmail.id)}
                  button
                  key={primaryEmail.id}
                >
                  <Checkbox
                    checked={selections.primaryEmails.includes(primaryEmail.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText primary={primaryEmail.address} />
                </ListItem>
              ) : (
                <Link
                  className={classes.link}
                  key={primaryEmail.id}
                  to={`/app/primary-emails/${primaryEmail.id}`}
                >
                  <ListItem button>
                    <ListItemText
                      primary={primaryEmail.address}
                      secondary={`${
                        primaryEmail.verified ? 'V' : 'Unv'
                      }erified email added ${moment
                        .unix(primaryEmail.created)
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
          count={primaryEmails.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const PrimaryEmailMatches = withStyles(styles)(_PrimaryEmailMatches);
