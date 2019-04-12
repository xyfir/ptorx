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

interface PanelControlsState {
  create: boolean;
}

class _PanelControls extends React.Component<
  WithStyles<typeof styles>,
  PanelControlsState
> {
  state: PanelControlsState = { create: false };

  render() {
    const { classes } = this.props;
    const { create } = this.state;
    return (
      <React.Fragment>
        <Dialog
          open={create}
          onClose={() => this.setState({ create: false })}
          aria-labelledby="create-dialog"
        >
          <DialogTitle id="create-dialog-title">
            Create or add a new...
          </DialogTitle>
          <List>
            {CATEGORIES.filter(c => c.name != 'Messages').map(category => (
              <Link
                className={classes.link}
                onClick={() => this.setState({ create: false })}
                key={category.variable}
                to={`/app/${category.route}/add`}
              >
                <ListItem button>
                  <ListItemText primary={category.singular} />
                </ListItem>
              </Link>
            ))}
          </List>
        </Dialog>
        <Fab
          color="primary"
          onClick={() => this.setState({ create: true })}
          className={classes.fab}
          aria-label="Create new..."
        >
          <Add />
        </Fab>
      </React.Fragment>
    );
  }
}

export const PanelControls = withStyles(styles)(_PanelControls);
