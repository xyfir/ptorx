import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { Link } from 'react-router-dom';
import { NAME } from 'constants/config';
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

interface DomainMatchesProps extends WithStyles<typeof styles> {
  domains: Ptorx.DomainList;
}

class _DomainMatches extends React.Component<DomainMatchesProps> {
  render() {
    const { classes, domains } = this.props;
    return (
      <List>
        <ListSubheader color="primary">Domains</ListSubheader>
        {domains.map(domain => (
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
    );
  }
}

export const DomainMatches = withStyles(styles)(_DomainMatches);
