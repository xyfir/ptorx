import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { Link } from 'react-router-dom';
import {
  ListItemText,
  createStyles,
  withStyles,
  WithStyles,
  ListItem,
  List
} from '@material-ui/core';

const styles = createStyles({ link: { textDecoration: 'none' } });

interface PrimaryEmailMatchesProps extends WithStyles<typeof styles> {
  primaryEmails: Ptorx.PrimaryEmailList;
}

class _PrimaryEmailMatches extends React.Component<PrimaryEmailMatchesProps> {
  render() {
    const { classes, primaryEmails } = this.props;
    return (
      <List>
        {primaryEmails.map(primaryEmail => (
          <Link
            className={classes.link}
            key={primaryEmail.id}
            to={`/app/primary-emails/${primaryEmail.id}`}
          >
            <ListItem button>
              <ListItemText
                primary={primaryEmail.address}
                secondary={`${
                  primaryEmail.verified ? 'Unv' : 'V'
                }erified email added ${moment
                  .unix(primaryEmail.created)
                  .fromNow()}`}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }
}

export const PrimaryEmailMatches = withStyles(styles)(_PrimaryEmailMatches);
