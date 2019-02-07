import { CATEGORIES } from 'constants/categories';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Add } from '@material-ui/icons';
import {
  createStyles,
  ListItemText,
  DialogTitle,
  WithStyles,
  withStyles,
  ListItem,
  Dialog,
  List,
  Fab
} from '@material-ui/core';

const styles = createStyles({
  link: {
    textDecoration: 'none'
  },
  fab: {
    position: 'fixed',
    bottom: '1em',
    zIndex: 1
  }
});

interface CreateState {
  open: boolean;
}

class _Create extends React.Component<WithStyles<typeof styles>, CreateState> {
  state: CreateState = { open: false };

  render() {
    const { classes } = this.props;
    const { open } = this.state;
    return (
      <React.Fragment>
        <Dialog
          open={open}
          onClose={() => this.setState({ open: false })}
          aria-labelledby="create-dialog"
        >
          <DialogTitle id="create-dialog-title">Create a new...</DialogTitle>
          <List>
            {CATEGORIES.map(category => (
              <Link
                className={classes.link}
                onClick={() => this.setState({ open: false })}
                key={category}
                to={`/app/${category.toLowerCase().replace(' ', '-')}/add`}
              >
                <ListItem button>
                  <ListItemText
                    primary={category.substr(0, category.length - 1)}
                  />
                </ListItem>
              </Link>
            ))}
          </List>
        </Dialog>
        <Fab
          color="primary"
          onClick={() => this.setState({ open: true })}
          className={classes.fab}
          aria-label="Create new..."
        >
          <Add />
        </Fab>
      </React.Fragment>
    );
  }
}

export const Create = withStyles(styles)(_Create);
