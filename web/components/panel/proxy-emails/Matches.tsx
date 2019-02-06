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

interface ProxyEmailMatchesProps extends WithStyles<typeof styles> {
  proxyEmails: Ptorx.ProxyEmailList;
}

class _ProxyEmailMatches extends React.Component<ProxyEmailMatchesProps> {
  render() {
    const { classes, proxyEmails } = this.props;
    return (
      <List>
        <ListSubheader color="primary">Proxy Emails</ListSubheader>
        {proxyEmails.map(proxyEmail => (
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
    );
  }
}

export const ProxyEmailMatches = withStyles(styles)(_ProxyEmailMatches);
