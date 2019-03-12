import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import {
  createStyles,
  Typography,
  WithStyles,
  withStyles,
  Button,
  Paper,
  Theme
} from '@material-ui/core';
// @ts-ignore
import icon from 'icon.png';

const styles = (theme: Theme) =>
  createStyles({
    iconPaper: {
      marginBottom: '1.5em',
      marginRight: '1em',
      height: '5em',
      width: '5em'
    },
    buttons: {
      marginBottom: '1.5em'
    },
    header: {
      alignItems: 'center',
      flexWrap: 'wrap',
      display: 'flex'
    },
    footer: {
      fontFamily: '"Roboto"'
    },
    icon: {
      borderRadius: '4px',
      height: '100%',
      width: '100%'
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
      marginBottom: '0.2em',
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
    <header className={classes.header}>
      <Paper elevation={2} className={classes.iconPaper}>
        <img
          src={icon}
          alt="The Ptorx Pterodactyl logo"
          className={classes.icon}
        />
      </Paper>
      <div>
        <Typography variant="h1" className={classes.h1}>
          Send and Receive Mail Anonymously
        </Typography>
        <Typography className={classes.p}>
          Protect your privacy, strengthen your security, and take control of
          your emails with {process.enve.NAME}.
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
              href={`${process.enve.ACCOWNT_API_URL}/login/logout`}
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className={classes.buttons}>
            <Button
              variant="contained"
              color="primary"
              href={process.enve.ACCOWNT_WEB_URL}
            >
              Login
            </Button>
            <span className={classes.or}>or</span>
            <Button
              variant="contained"
              color="secondary"
              href={process.enve.ACCOWNT_WEB_URL}
            >
              Register
            </Button>
          </div>
        )}
      </div>
    </header>

    <Typography variant="h2" className={classes.h2}>
      How It Works
    </Typography>
    <ol className={classes.ol}>
      <li>Create a proxy email</li>
      <li>Tell us where to forward incoming mail to</li>
      <li>View mail sent to your proxy email in your preferred email app</li>
      <li>Reply to mail and it'll show as being sent from your proxy email</li>
    </ol>

    <Typography variant="h2" className={classes.h2}>
      What's a Proxy Email?
    </Typography>
    <Typography className={classes.p}>
      Proxy emails act as a middleman between your real email addresses and the
      rest of the world.
    </Typography>
    <Typography className={classes.p}>
      They're like an email alias or a forwarding address: any mail sent to one
      is redirected to the email addresses you configure. They also allow for
      advanced features like filtering and modifying your incoming mail before
      it gets forwarded.
    </Typography>

    <Typography variant="h2" className={classes.h2}>
      Why Use Ptorx?
    </Typography>
    <Typography className={classes.p}>
      Strengthening your privacy and security is as simple as generating a new
      proxy email for each website you create an account on, and for each person
      you email. Keeping your addresses separate and unique for each use-case is
      an important part of staying protected when a site you use suffers a
      database breach, when an app you use sells your data, when spammer gets
      ahold of your email, or when a snoop starts trying to piece together your
      online activity.
    </Typography>
    <Typography className={classes.p}>
      Ptorx makes managing all those unique emails a breeze, and it works easily
      with whatever your current email setup is. Gmail? AOL? Your own
      installation of Roundcube? Whatever it is, we'll forward incoming mail to
      your real address so you can continue using the tools you're familiar
      with. You can even reply to received mail anonymously from your proxy
      emails right within your preferred mailbox provider.
    </Typography>

    <Typography variant="h2" className={classes.h2}>
      Use Your Domain
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
      You can host your own server or contribute to our codebase and make{' '}
      {process.enve.NAME} better.
    </Typography>

    <footer className={classes.footer}>
      <a
        href={`${process.enve.DOCS_URL}/terms-of-service.md`}
        className={classes.a}
      >
        Terms of Service
      </a>
      {' — '}
      <a
        href={`${process.enve.DOCS_URL}/privacy-policy.md`}
        className={classes.a}
      >
        Privacy Policy
      </a>
      {' — '}
      <a href={`${process.enve.DOCS_URL}/self-host.md`} className={classes.a}>
        Self-hosting
      </a>
      {' — '}
      <a href={`${process.enve.DOCS_URL}/help.md`} className={classes.a}>
        Help Docs
      </a>
    </footer>
  </div>
);

export const Info = withStyles(styles)(_Info);
