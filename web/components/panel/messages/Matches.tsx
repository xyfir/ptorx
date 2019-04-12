import { displayAddress } from 'lib/display-address';
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
  state: MessageMatchesState = { perPage: 25, page: 1 };
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  onSelect(id: Ptorx.MessageList[0]['id']) {
    const { selections, dispatch } = this.context;
    let { messages } = selections;
    if (messages.includes(id)) messages = messages.filter(_id => _id != id);
    else messages = messages.concat(id);
    dispatch({ selections: { ...selections, messages } });
  }

  render() {
    const { selections, manage } = this.context;
    const { classes, messages } = this.props;
    const { perPage, page } = this.state;
    return (
      <div>
        <List>
          <ListSubheader color="primary">Messages</ListSubheader>
          {messages.slice((page - 1) * perPage, page * perPage).map(message =>
            manage ? (
              <ListItem
                onClick={() => this.onSelect(message.id)}
                button
                key={message.id}
              >
                <Checkbox
                  checked={selections.messages.includes(message.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText
                  primary={`${displayAddress(message.from)} — ${
                    message.subject
                  }`}
                />
              </ListItem>
            ) : (
              <Link
                className={classes.link}
                key={message.id}
                to={`/app/messages/${message.id}`}
              >
                <ListItem button>
                  <ListItemText
                    primary={`${displayAddress(message.from)} — ${
                      message.subject
                    }`}
                    secondary={`Received ${moment
                      .unix(message.created)
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
          count={messages.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const MessageMatches = withStyles(styles)(_MessageMatches);
