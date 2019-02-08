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

interface MessageMatchesProps extends WithStyles<typeof styles> {
  messages: Ptorx.MessageList;
}

interface MessageMatchesState {
  perPage: number;
  page: number;
}

class _MessageMatches extends React.Component<
  MessageMatchesProps,
  MessageMatchesState
> {
  state: MessageMatchesState = { perPage: 5, page: 1 };

  render() {
    const { classes, messages } = this.props;
    const { perPage, page } = this.state;
    return (
      <div>
        <List>
          <ListSubheader color="primary">Messages</ListSubheader>
          {messages
            .slice((page - 1) * perPage, page * perPage)
            .map(modifier => (
              <Link
                className={classes.link}
                key={modifier.id}
                to={`/app/messages/${modifier.id}`}
              >
                <ListItem button>
                  <ListItemText
                    primary={`${modifier.from} — ${modifier.subject}`}
                    secondary={`Received ${moment
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
          count={messages.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const MessageMatches = withStyles(styles)(_MessageMatches);
