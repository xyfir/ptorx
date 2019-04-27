import { SpeedDialAction, SpeedDialIcon, SpeedDial } from '@material-ui/lab';
import { PanelContext } from 'lib/PanelContext';
import { Delete, Add } from '@material-ui/icons';
import { PanelState } from 'components/panel/Panel';
import { CATEGORIES } from 'constants/categories';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { api } from 'lib/api';
import {
  createStyles,
  ListItemText,
  DialogTitle,
  WithStyles,
  withStyles,
  ListItem,
  Dialog,
  Button,
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

  onSetManage(_manage: PanelState['manage']) {
    const { dispatch, manage } = this.context;
    dispatch({
      selections: {
        primaryEmails: [],
        modifiers: [],
        messages: [],
        filters: [],
        aliases: [],
        domains: []
      },
      manage: _manage && manage == _manage ? undefined : _manage
    });
  }

  async onDelete() {
    const { selections, dispatch } = this.context;

    // Delete all selected items
    for (let category of CATEGORIES) {
      for (let id of selections[category.variable]) {
        await api.delete(`/${category.route}`, {
          params: { [category.variableSingular]: id }
        });
      }
    }

    // Update lists
    const res = await Promise.all(CATEGORIES.map(c => api.get(`/${c.route}`)));
    const state: Partial<PanelState> = {
      selections: {
        primaryEmails: [],
        modifiers: [],
        messages: [],
        filters: [],
        aliases: [],
        domains: []
      }
    };
    CATEGORIES.forEach((c, i) => (state[c.variable] = res[i].data));
    dispatch(state);
  }

  render() {
    const { create, open } = this.state;
    const { classes } = this.props;
    const { manage } = this.context;
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
                  <ListItemText primary={category.nameSingular} />
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
            icon={<Add />}
            onClick={() => this.setState({ create: true })}
            tooltipTitle="Create a new..."
          />
          <SpeedDialAction
            icon={<Delete />}
            onClick={() => this.onSetManage('delete')}
            tooltipTitle="Toggle deletion mode"
          />{' '}
        </SpeedDial>

        {manage == 'delete' ? (
          <Button
            onClick={() => this.onDelete()}
            variant="text"
            color="primary"
          >
            Delete Selected
          </Button>
        ) : null}
        {manage ? (
          <Button onClick={() => this.onSetManage(undefined)} variant="text">
            Cancel
          </Button>
        ) : null}
      </React.Fragment>
    );
  }
}

export const PanelControls = withStyles(styles)(_PanelControls);
