import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { ChipSelector } from 'components/panel/utils/ChipSelector';
import { PanelContext } from 'lib/PanelContext';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  createStyles,
  WithStyles,
  withStyles,
  Typography,
  TextField,
  Button
} from '@material-ui/core';

const TARGETS: { label: string; value: Ptorx.Modifier['target'] }[] = [
  { label: 'Subject', value: 'subject' },
  { label: 'HTML', value: 'html' },
  { label: 'Text', value: 'text' }
];

const styles = createStyles({
  title: {
    fontSize: '200%'
  },
  button: {
    marginRight: '0.5em'
  },
  textarea: {
    minWidth: '20em'
  }
});

interface ManageModifierState {
  deleting: boolean;
  modifier?: Ptorx.Modifier;
}

class _ManageModifier extends React.Component<
  RouteComponentProps & InjectedNotistackProps & WithStyles<typeof styles>,
  ManageModifierState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: ManageModifierState = { deleting: false, modifier: null };

  componentDidMount() {
    this.load();
  }

  onChange(key: keyof Ptorx.Modifier, value: any) {
    this.setState({ modifier: { ...this.state.modifier, [key]: value } });
  }

  onDelete() {
    if (!this.state.deleting) return this.setState({ deleting: true });
    api
      .delete('/modifiers', { params: { modifier: this.state.modifier.id } })
      .then(() => {
        this.props.history.push('/app');
        return api.get('/modifiers');
      })
      .then(res => this.context.dispatch({ modifiers: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  onSubmit() {
    api
      .put('/modifiers', this.state.modifier)
      .then(res => {
        this.load();
        return api.get('/modifiers');
      })
      .then(res => this.context.dispatch({ modifiers: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  load() {
    const modifierId = +(this.props.match.params as { modifier: number })
      .modifier;
    api
      .get('/modifiers', { params: { modifier: modifierId } })
      .then(res => this.setState({ modifier: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { deleting, modifier } = this.state;
    const { classes } = this.props;
    if (!modifier) return null;
    return (
      <div>
        <Typography variant="h2" className={classes.title}>
          {modifier.name}
        </Typography>
        <Typography variant="body2">
          Created on {moment.unix(modifier.created).format('LLL')}
        </Typography>

        <TextField
          fullWidth
          id="name"
          type="text"
          value={modifier.name}
          margin="normal"
          onChange={e => this.onChange('name', e.target.value)}
          helperText="Name your modifier to find it easier"
          placeholder="My Modifier"
        />
        <ChipSelector
          items={TARGETS}
          title="Target"
          onSelect={t => this.onChange('target', t)}
          selected={[modifier.target]}
        />
        <TextField
          id="template"
          type="text"
          value={modifier.template}
          margin="normal"
          onChange={e => this.onChange('template', e.target.value)}
          fullWidth
          multiline
          className={classes.textarea}
          helperText="The template to use on the target"
          placeholder={`Hello from """replace("from", "Bob", "Alice")"""!`}
        />

        <div>
          <Button
            color="primary"
            variant="contained"
            onClick={() => this.onSubmit()}
            className={classes.button}
          >
            Save
          </Button>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => this.onDelete()}
          >
            {deleting ? 'Confirm Delete' : 'Delete'}
          </Button>
        </div>
      </div>
    );
  }
}

export const ManageModifier = withSnackbar(withStyles(styles)(_ManageModifier));
