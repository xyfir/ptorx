import {
  ACCOWNT_WEB_URL,
  ACCOWNT_API_URL,
  NAME,
  DOCS_URL
} from 'constants/config';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import {
  createStyles,
  Typography,
  WithStyles,
  withStyles,
  Button,
  Theme
} from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
    buttons: {
      marginBottom: '1.5em'
    },
    footer: {
      fontFamily: '"Roboto"'
    },
    root: {
      padding: '2em'
    },
    h1: {
      fontWeight: 'bold',
      fontSize: '250%',
      color: theme.palette.primary.main
    },
    h2: {
      fontWeight: 'bold',
      fontSize: '200%',
      color: theme.palette.secondary.main
    },
    ol: {
      fontFamily: '"Roboto"',
      fontSize: '110%'
    },
    or: {
      fontFamily: '"Roboto"',
      fontWeight: 'bold',
      fontSize: '110%',
      margin: '0.5em'
    },
    p: {
      fontSize: '110%',
      lineHeight: '125%',
      marginBottom: '1.5em'
    },
    a: {
      textDecoration: 'none',
      color: theme.palette.primary.main
    }
  });

interface InfoProps extends WithStyles<typeof styles> {
  user?: Ptorx.User;
}

const _Info = ({ classes, user }: InfoProps) => (
  <div className={classes.root}>
    <Typography variant="h1" className={classes.h1}>
      Send and Receive Mail Anonymously
    </Typography>
    <Typography className={classes.p}>
      Protect your privacy, strengthen your security, and take control of your
      emails with {NAME}.
    </Typography>
    {user ? (
      <div className={classes.buttons}>
        <Button variant="contained" color="primary" href="/app">
          Go to App
        </Button>
        <span className={classes.or}>or</span>
        <Button
          variant="contained"
          color="secondary"
          href={`${ACCOWNT_API_URL}/login/logout`}
        >
          Logout
        </Button>
      </div>
    ) : (
      <div className={classes.buttons}>
        <Button variant="contained" color="primary" href={ACCOWNT_WEB_URL}>
          Login
        </Button>
        <span className={classes.or}>or</span>
        <Button variant="contained" color="secondary" href={ACCOWNT_WEB_URL}>
          Register
        </Button>
      </div>
    )}
    <Typography variant="h2" className={classes.h2}>
      How It Works
    </Typography>
    <ol className={classes.ol}>
      <li>Create a proxy email</li>
      <li>Tell us where to forward incoming mail to</li>
      <li>View mail sent to your proxy email from your preferred email app</li>
      <li>Reply to mail and it'll show as being sent from your proxy email</li>
    </ol>
    <Typography variant="h2" className={classes.h2}>
      What's a Proxy Email?
    </Typography>
    <Typography className={classes.p}>
      A proxy email is like an email alias or a forwarding address. Any mail
      sent to it is redirected to the email addresses you configure. Proxy
      emails also allow for many extra features like filtering and modifying
      your incoming mail before it's forwarded.
    </Typography>
    <Typography variant="h2" className={classes.h2}>
      Why Use a Proxy Email?
    </Typography>
    <Typography className={classes.p}>
      To prevent spam, keep your email off of "people search" websites, thwart
      hackers and spammers when database breaches occur, easily transfer mail
      when you update primary email addresses, filter out mail before it ever
      reaches your inbox, and the list goes on.
    </Typography>
    <Typography variant="h2" className={classes.h2}>
      Bring Your Own Domains
    </Typography>
    <Typography className={classes.p}>
      As many of them as you want. Configure a few easy DNS records and create
      proxy emails for your own domain.
    </Typography>
    <Typography variant="h2" className={classes.h2}>
      Open Source
    </Typography>
    <Typography className={classes.p}>
      Don't trust us with your emails?{' '}
      <a href="https://github.com/Xyfir/Ptorx" className={classes.a}>
        Our code is completely open source for you to view.
      </a>{' '}
      You can host your own server or contribute to our codebase and make {NAME}{' '}
      better.
    </Typography>

    <footer className={classes.footer}>
      <a href={`${DOCS_URL}/terms-of-service.md`} className={classes.a}>
        Terms of Service
      </a>
      {' — '}
      <a href={`${DOCS_URL}/privacy-policy.md`} className={classes.a}>
        Privacy Policy
      </a>
    </footer>
  </div>
);

export const Info = withStyles(styles)(_Info);
