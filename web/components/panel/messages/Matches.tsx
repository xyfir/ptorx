import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { Link } from 'react-router-dom';
import {
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

class _MessageMatches extends React.Component<MessageMatchesProps> {
  render() {
    const { classes, messages } = this.props;
    return (
      <List>
        <ListSubheader color="primary">Messages</ListSubheader>
        {messages.map(modifier => (
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
    );
  }
}

export const MessageMatches = withStyles(styles)(_MessageMatches);
