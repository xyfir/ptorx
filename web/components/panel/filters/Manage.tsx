import { withSnackbar, withSnackbarProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { ChipSelector } from 'components/panel/utils/ChipSelector';
import { PanelContext } from 'lib/PanelContext';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  FormControlLabel,
  createStyles,
  WithStyles,
  withStyles,
  Typography,
  TextField,
  Checkbox,
  Button
} from '@material-ui/core';

const TYPES: { label: string; value: Ptorx.Filter['type'] }[] = [
  { label: 'Subject', value: 'subject' },
  { label: 'Address', value: 'address' },
  { label: 'Header', value: 'header' },
  { label: 'HTML', value: 'html' },
  { label: 'Text', value: 'text' }
];

const styles = createStyles({
  title: {
    fontSize: '200%'
  },
  button: {
    marginRight: '0.5em'
  }
});

interface ManageFilterState {
  deleting: boolean;
  filter?: Ptorx.Filter;
}

class _ManageFilter extends React.Component<
  RouteComponentProps & withSnackbarProps & WithStyles<typeof styles>,
  ManageFilterState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: ManageFilterState = { deleting: false, filter: null };

  componentDidMount() {
    this.load();
  }

  onChange(key: keyof Ptorx.Filter, value: any) {
    this.setState({ filter: { ...this.state.filter, [key]: value } });
  }

  onDelete() {
    if (!this.state.deleting) return this.setState({ deleting: true });
    api
      .delete('/filters', { params: { filter: this.state.filter.id } })
      .then(() => {
        this.props.history.push('/app');
        return api.get('/filters');
      })
      .then(res => this.context.dispatch({ filters: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  onSubmit() {
    api
      .put('/filters', this.state.filter)
      .then(res => {
        this.load();
        return api.get('/filters');
      })
      .then(res => this.context.dispatch({ filters: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  load() {
    const filterId = +(this.props.match.params as { filter: number }).filter;
    api
      .get('/filters', { params: { filter: filterId } })
      .then(res => this.setState({ filter: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { deleting, filter } = this.state;
    const { classes } = this.props;
    if (!filter) return null;
    return (
      <div>
        <Typography variant="h2" className={classes.title}>
          {filter.name}
        </Typography>
        <Typography variant="body2">
          Created on {moment.unix(filter.created).format('LLL')}
        </Typography>

        <TextField
          fullWidth
          id="name"
          type="text"
          value={filter.name}
          margin="normal"
          onChange={e => this.onChange('name', e.target.value)}
          helperText="Name your filter to find it easier"
          placeholder="My Filter"
        />
        <ChipSelector
          items={TYPES}
          title="Filter Type"
          onSelect={t => this.onChange('type', t)}
          selected={[filter.type]}
        />
        <TextField
          fullWidth
          id="find"
          type="text"
          value={filter.find}
          margin="normal"
          onChange={e => this.onChange('find', e.target.value)}
          helperText={`The ${
            filter.regex ? 'regular expression' : 'value'
          } the filter should search ${
            TYPES.find(t => t.value == filter.type).label
          } content for and which incoming mail ${
            filter.blacklist ? 'cannot' : 'must'
          } match to pass the filter`}
          placeholder={filter.regex ? 'F(i|1)?nd' : 'Find'}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filter.blacklist}
              onChange={e => this.onChange('blacklist', e.target.checked)}
            />
          }
          label="Blacklist"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={filter.regex}
              onChange={e => this.onChange('regex', e.target.checked)}
            />
          }
          label="Regular Expression"
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

export const ManageFilter = withSnackbar(withStyles(styles)(_ManageFilter));
