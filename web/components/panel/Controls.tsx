import { SpeedDialAction, SpeedDialIcon, SpeedDial } from '@material-ui/lab';
import { PanelContext } from 'lib/PanelContext';
import { Delete, Add } from '@material-ui/icons';
import { CATEGORIES } from 'constants/categories';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  createStyles,
  ListItemText,
  DialogTitle,
  WithStyles,
  withStyles,
  ListItem,
  Dialog,
  List
} from '@material-ui/core';

const styles = createStyles({
  link: {
    textDecoration: 'none'
  },
  speedDial: {
    position: 'fixed',
    bottom: '1em',
    zIndex: 1
  }
});

interface PanelControlsState {
  create: boolean;
  open: boolean;
}

class _PanelControls extends React.Component<
  WithStyles<typeof styles>,
  PanelControlsState
> {
  state: PanelControlsState = { create: false, open: false };
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  onDelete() {
    const { dispatch, manage } = this.context;
    dispatch({ manage: manage == 'delete' ? null : 'delete' });
  }

  render() {
    const { create, open } = this.state;
    const { classes } = this.props;
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

        <SpeedDial
          open={open}
          icon={<SpeedDialIcon />}
          onBlur={() => this.setState({ open: false })}
          onClick={() => this.setState({ open: true })}
          onFocus={() => this.setState({ open: true })}
          onClose={() => this.setState({ open: false })}
          direction="up"
          ariaLabel="Controls"
          className={classes.speedDial}
          onMouseEnter={() => this.setState({ open: true })}
          onMouseLeave={() => this.setState({ open: false })}
        >
          <SpeedDialAction
            icon={<Delete />}
            onClick={() => this.onDelete()}
            tooltipTitle="Delete..."
          />
          <SpeedDialAction
            icon={<Add />}
            onClick={() => this.setState({ create: true })}
            tooltipTitle="Create new..."
          />
        </SpeedDial>
      </React.Fragment>
    );
  }
}

export const PanelControls = withStyles(styles)(_PanelControls);
