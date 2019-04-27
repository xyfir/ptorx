import { withSnackbar, WithSnackbarProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { PanelContext } from 'lib/PanelContext';
import { loadOpenPGP } from 'lib/load-openpgp';
import * as React from 'react';
// @ts-ignore
import * as copy from 'clipboard-copy';
import { api } from 'lib/api';
import {
  createStyles,
  WithStyles,
  Typography,
  withStyles,
  TextField,
  Button
} from '@material-ui/core';

const styles = createStyles({
  generate: {
    marginRight: '0.5em'
  },
  password: {
    marginBottom: '1em'
  }
});

interface PGPKeysState {
  generating: boolean;
  pass: string;
}

class _PGPKeys extends React.Component<
  RouteComponentProps & WithSnackbarProps & WithStyles<typeof styles>,
  PGPKeysState
> {
  state: PGPKeysState = { generating: false, pass: '' };
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  async onGenerate() {
    this.setState({ generating: true });

    const { dispatch, user } = this.context;
    const { pass } = this.state;

    const openpgp = await loadOpenPGP();
    const key = await openpgp.generateKey({
      numBits: 2048,
      userIds: [{ name: user.email, email: user.email }],
      passphrase: pass
    });

    const res = await api.put('/users/keys', {
      privateKey: key.privateKeyArmored,
      publicKey: key.publicKeyArmored
    });
    dispatch({ user: res.data });
    this.setState({ generating: false });
  }

  async onDelete() {
    const res = await api.put('/users/keys', {
      privateKey: null,
      publicKey: null
    });
    this.context.dispatch({ user: res.data });
  }

  render() {
    const { generating, pass } = this.state;
    const { classes } = this.props;
    const { user } = this.context;
    return (
      <div>
        <Typography>
          <strong>Note:</strong> This will <em>not</em> modify any existing
          messages stored on Ptorx.
        </Typography>

        <TextField
          fullWidth
          id="pass"
          type="password"
          value={pass}
          label="Mailbox Password"
          margin="normal"
          onChange={e => this.setState({ pass: e.target.value })}
          className={classes.password}
          helperText="Password to encrypt your private key which will encrypt stored mail"
          placeholder="A long and secure password..."
        />

        <Button
          color="primary"
          variant="contained"
          onClick={() => this.onGenerate()}
          disabled={generating || !pass}
          className={classes.generate}
        >
          {user.publicKey ? 'Re' : 'G'}enerate Keys
        </Button>

        {user.publicKey ? (
          <React.Fragment>
            <Button
              color="secondary"
              variant="contained"
              onClick={() => this.onDelete()}
              className={classes.generate}
            >
              Delete
            </Button>

            <Button
              variant="text"
              onClick={() => copy(user.publicKey)}
              className={classes.generate}
            >
              Copy Public Key
            </Button>

            <Button variant="text" onClick={() => copy(user.privateKey)}>
              Copy Private Key
            </Button>
          </React.Fragment>
        ) : null}
      </div>
    );
  }
}

export const PGPKeys = withSnackbar(withStyles(styles)(_PGPKeys));
