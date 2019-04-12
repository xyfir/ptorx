import { PanelContext } from 'lib/PanelContext';
import { Category } from 'constants/categories';
import * as React from 'react';
import * as Fuse from 'fuse.js';
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

interface MatchesProps extends WithStyles<typeof styles> {
  secondaryAction?: JSX.Element;
  description: (item: any) => string;
  category: Category;
  noLink?: boolean;
  name: (item: any) => string;
}

interface MatchesState {
  perPage: number;
  page: number;
}

class _Matches extends React.Component<MatchesProps, MatchesState> {
  state: MatchesState = { perPage: 5, page: 1 };

  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  onSelect(id: number) {
    const { selections, dispatch } = this.context;
    const { category } = this.props;
    let items: number[] = selections[category.variable];

    if (items.includes(id)) items = items.filter(_id => _id != id);
    else items = items.concat(id);

    dispatch({
      selections: {
        ...selections,
        [category.variable]: items
      }
    });
  }

  search(): any[] {
    const { category } = this.props;
    const { search } = this.context;
    let items = this.context[category.variable];

    if (search) {
      const fuse = new Fuse(items, {
        shouldSort: true,
        threshold: 0.4,
        keys: [
          'from',
          'name',
          'type',
          'domain',
          'address',
          'subject',
          'fullAddress'
        ]
      });
      items = fuse.search(search);
    }

    return items;
  }

  render() {
    const { selections, manage } = this.context;
    const { perPage, page } = this.state;
    const items = this.search();
    const {
      secondaryAction,
      description,
      category,
      classes,
      noLink,
      name
    } = this.props;
    return (
      <div>
        <List>
          <ListSubheader color="primary">{category.name}</ListSubheader>
          {items.slice((page - 1) * perPage, page * perPage).map(item =>
            manage ? (
              <ListItem
                onClick={() => this.onSelect(item.id)}
                button
                key={item.id}
              >
                <Checkbox
                  checked={selections[category.variable].includes(item.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText primary={name(item)} />
              </ListItem>
            ) : (
              <Link
                className={classes.link}
                key={item.id}
                to={noLink ? '/app' : `/app/${category.route}/${item.id}`}
              >
                <ListItem button>
                  <ListItemText
                    primary={name(item)}
                    secondary={description(item)}
                  />
                </ListItem>
                {secondaryAction}
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
          count={items.length}
          page={page - 1}
        />
      </div>
    );
  }
}

export const Matches = withStyles(styles)(_Matches);
