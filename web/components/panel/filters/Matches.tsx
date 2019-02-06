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

interface FilterMatchesProps extends WithStyles<typeof styles> {
  filters: Ptorx.FilterList;
}

class _FilterMatches extends React.Component<FilterMatchesProps> {
  render() {
    const { classes, filters } = this.props;
    return (
      <List>
        <ListSubheader color="primary">Filters</ListSubheader>
        {filters.map(filter => (
          <Link
            className={classes.link}
            key={filter.id}
            to={`/app/filters/${filter.id}`}
          >
            <ListItem button>
              <ListItemText
                primary={`${filter.type} — ${filter.name}`}
                secondary={`Created ${moment.unix(filter.created).fromNow()}`}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }
}

export const FilterMatches = withStyles(styles)(_FilterMatches);
