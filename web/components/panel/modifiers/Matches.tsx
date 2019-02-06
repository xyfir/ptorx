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

interface ModifierMatchesProps extends WithStyles<typeof styles> {
  modifiers: Ptorx.ModifierList;
}

class _ModifierMatches extends React.Component<ModifierMatchesProps> {
  render() {
    const { classes, modifiers } = this.props;
    return (
      <List>
        <ListSubheader color="primary">Modifiers</ListSubheader>
        {modifiers.map(modifier => (
          <Link
            className={classes.link}
            key={modifier.id}
            to={`/app/modifiers/${modifier.id}`}
          >
            <ListItem button>
              <ListItemText
                primary={`${modifier.type} — ${modifier.name}`}
                secondary={`Created ${moment.unix(modifier.created).fromNow()}`}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }
}

export const ModifierMatches = withStyles(styles)(_ModifierMatches);
