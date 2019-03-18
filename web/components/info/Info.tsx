import * as IMAGES from 'constants/images';
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
    headerContent: {
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      display: 'flex',
      width: '100%'
    },
    header: {
      backgroundSize: 'cover',
      background: `url(${IMAGES.HERO}) center center no-repeat`,
      alignItems: 'center',
      minHeight: '80vh',
      flexWrap: 'wrap',
      display: 'flex',
      padding: '2em'
    },
    subtitle: {
      marginBottom: '2em',
      fontWeight: 'bold',
      fontSize: '120%'
    },
    content: {
      maxWidth: '40em'
    },
    section: {
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      padding: '2em',
      display: 'flex'
    },
    footer: {
      fontFamily: '"Roboto"',
      textAlign: 'center',
      padding: '2em'
    },
    image: {
      height: '15em',
      width: '15em'
    },
    icon: {
      borderRadius: '4px',
      height: '100%',
      width: '100%'
    },
    h1: {
      fontWeight: 'bold',
      fontSize: '250%',
      color: theme.palette.primary.main
    },
    h2: {
      marginBottom: '0.2em',
      fontWeight: 'bold',
      fontSize: '180%',
      color: theme.palette.secondary.main
    },
    ol: {
      fontFamily: '"Roboto"',
      fontSize: '110%'
    },
    p: {
      fontSize: '110%',
      lineHeight: '125%'
    },
    a: {
      textDecoration: 'none',
      color: theme.palette.primary.main
    }
  });

interface InfoProps extends WithStyles<typeof styles> {
  user?: Ptorx.User;
}

const CTAButton = ({ loggedIn }: { loggedIn: boolean }) =>
  loggedIn ? (
    <Button variant="contained" color="primary" size="large" href="/app">
      Launch App
    </Button>
  ) : (
    <Button
      variant="contained"
      color="primary"
      href={process.enve.ACCOWNT_WEB_URL}
      size="large"
    >
      Get it now for free
    </Button>
  );

const _Info = ({ classes, user }: InfoProps) => (
  <div>
    <header className={classes.header}>
      <div className={classes.headerContent}>
        <Typography variant="h1" className={classes.h1}>
          Send and receive mail without using your real email address
        </Typography>
        <Typography className={classes.subtitle}>
          Anonymously forward and send mail with email forwarding and aliases
          through Ptorx.
        </Typography>

        <CTAButton loggedIn={!!user} />
      </div>
    </header>

    <section className={classes.section}>
      <img src={IMAGES.FORWARD_MAIL} className={classes.image} />
      <div className={classes.content}>
        <Typography variant="h2" className={classes.h2}>
          Stop sharing your real email, keep your current inbox
        </Typography>
        <Typography className={classes.p}>
          Create unique email address aliases that are linked to your real
          emails. You'll still send and receive mail with their apps as usual.
        </Typography>
      </div>
    </section>

    <section className={classes.section}>
      <div className={classes.content}>
        <Typography variant="h2" className={classes.h2}>
          No more typing in your email address
        </Typography>
        <Typography className={classes.p}>
          Quickly generate an email address alias whenever needed from your
          browser or mobile device.
        </Typography>
      </div>
      <img src={IMAGES.KEYBOARD} className={classes.image} />
    </section>

    <section className={classes.section}>
      <img src={IMAGES.MAGNIFYING_GLASS} className={classes.image} />
      <div className={classes.content}>
        <Typography variant="h2" className={classes.h2}>
          Easily manage all of your email aliases
        </Typography>
        <Typography className={classes.p}>
          Ptorx will keep track of all your aliases in a single, easily
          searchable place, accessible from all of your devices.
        </Typography>
      </div>
    </section>

    <section className={classes.section}>
      <div className={classes.content}>
        <Typography variant="h2" className={classes.h2}>
          Avoid the security breach domino effect
        </Typography>
        <Typography className={classes.p}>
          If a site you use is compromised, just disable, delete, or regenerate
          the alias associated with that site.
        </Typography>
      </div>
      <img src={IMAGES.DOMINOES} className={classes.image} />
    </section>

    <section className={classes.section}>
      <img src={IMAGES.BROKEN_CHAIN} className={classes.image} />
      <div className={classes.content}>
        <Typography variant="h2" className={classes.h2}>
          Keep your accounts separate
        </Typography>
        <Typography className={classes.p}>
          Whether sold to third-parties or stolen by hackers, too often your
          private information becomes publicly available on people search
          websites or the dark web.
        </Typography>
      </div>
    </section>

    <section className={classes.section}>
      <Typography variant="h2" className={classes.h2}>
        How does it work?
      </Typography>
      <ol className={classes.ol}>
        <li>Create a contact or site-specific alias through Ptorx</li>
        <li>Mail sent to your alias is forwarded to your preferred inbox</li>
        <li>Reply to mail and it'll show as being sent from your alias</li>
      </ol>
    </section>

    <section className={classes.section}>
      <CTAButton loggedIn={!!user} />
    </section>

    <section className={classes.section}>
      <div className={classes.content}>
        <Typography variant="h2" className={classes.h2}>
          What's an email alias?
        </Typography>
        <Typography className={classes.p}>
          An email alias acts as a middleman between your real email addresses
          and the rest of the world. Any mail sent to an alias is forwarded to
          the email addresses you configure. They also allow for advanced
          features like filtering and modifying your mail.
        </Typography>
      </div>
      <img src={IMAGES.SPY} className={classes.image} />
    </section>

    <section className={classes.section}>
      <img src={IMAGES.PTERODACTYL} className={classes.image} />
      <div className={classes.content}>
        <Typography variant="h2" className={classes.h2}>
          Why use Ptorx?
        </Typography>
        <Typography className={classes.p}>
          Strengthening your privacy and security is as simple as generating a
          new alias for each website you create an account on, and for each
          person you email. Keeping your addresses separate and unique for each
          use-case is an important part of staying protected when a site you use
          suffers a database breach, when an app you use sells your data, when a
          spammer gets ahold of your email, or when a snoop starts trying to
          piece together your online activity.
        </Typography>
      </div>
    </section>

    <section className={classes.section}>
      <div className={classes.content}>
        <Typography variant="h2" className={classes.h2}>
          Use your own domain
        </Typography>
        <Typography className={classes.p}>
          As many of them as you want. Configure a few easy DNS records and
          create aliases and forwarding addresses for your own domain.
        </Typography>
      </div>
      <img src={IMAGES.WWW} className={classes.image} />
    </section>

    <section className={classes.section}>
      <img src={IMAGES.CODE} className={classes.image} />
      <div className={classes.content}>
        <Typography variant="h2" className={classes.h2}>
          100% open source
        </Typography>
        <Typography className={classes.p}>
          Don't trust us with your emails?{' '}
          <a href="https://github.com/Xyfir/ptorx" className={classes.a}>
            Our code is completely open source for you to view.
          </a>{' '}
          You can even host your own server or contribute to our codebase to
          make Ptorx better.
        </Typography>
      </div>
    </section>

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
      {' — '}
      <a href="https://www.xyfir.com" className={classes.a}>
        Part of the Xyfir Network
      </a>
    </footer>
  </div>
);

export const Info = withStyles(styles)(_Info);
