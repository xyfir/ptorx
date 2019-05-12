import * as IMAGES from 'constants/images';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { Link } from 'react-router-dom';
import {
  ListSubheader,
  ListItemText,
  createStyles,
  ButtonBase,
  Typography,
  WithStyles,
  withStyles,
  ListItem,
  Button,
  Paper,
  Theme,
  List
} from '@material-ui/core';

const phonegap = /source~phonegap/.test(localStorage.r);
const REPO_URL = 'https://github.com/Xyfir/ptorx';
const DOCS_URL = `${REPO_URL}/blob/docs`;

const styles = (theme: Theme) =>
  createStyles({
    downloadButtonWrapper: {
      '&:hover': {
        border: `solid ${theme.palette.primary.main} 0.1em`
      },
      border: 'solid transparent 0.1em',
      margin: '1em',
      width: '9em'
    },
    downloadButtonCTA: {
      fontWeight: 'bold',
      color: theme.palette.secondary.main
    },
    downloadButtons: {
      justifyContent: 'center',
      flexWrap: 'wrap',
      display: 'flex'
    },
    downloadButton: {
      flexDirection: 'column',
      display: 'flex',
      padding: '1em'
    },
    headerContent: {
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      display: 'flex',
      width: '100%'
    },
    platformImage: {
      height: '5em',
      width: '5em'
    },
    footerSection: {
      minWidth: '12em',
      padding: '2em',
      flex: 1
    },
    sectionImage: {
      height: '15em',
      width: '15em'
    },
    xyfirNetwork: {
      marginBottom: '2em',
      fontWeight: 'bold',
      textAlign: 'center',
      width: '100%'
    },
    pricingP: {
      lineHeight: '125%',
      textAlign: 'center',
      fontSize: '110%'
    },
    getPtorx: {
      textAlign: 'center',
      padding: '2em'
    },
    subtitle: {
      marginBottom: '2em',
      fontWeight: 'bold',
      fontSize: '120%',
      color: theme.palette.secondary.main
    },
    content: {
      maxWidth: '40em'
    },
    pricing: {
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2em',
      display: 'flex'
    },
    section: {
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      padding: '2em',
      display: 'flex'
    },
    footer: {
      justifyContent: 'center',
      fontFamily: '"Roboto"',
      flexWrap: 'wrap',
      display: 'flex'
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
    tiers: {
      justifyContent: 'center',
      flexWrap: 'wrap',
      display: 'flex'
    },
    tier: {
      minWidth: '9em',
      margin: '1em',
      flex: '1'
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
    h3: {
      marginBottom: '0.2em',
      fontSize: '150%'
    },
    ul: {
      lineHeight: '2em',
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    ol: {
      fontFamily: '"Roboto"',
      fontSize: '110%',
      color: theme.palette.text.primary
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

const CTAButton = ({ classes, user }: InfoProps) =>
  user ? (
    <Link to="/app" className={classes.a}>
      <Button variant="contained" color="primary" size="large">
        Launch App
      </Button>
    </Link>
  ) : (
    <Button
      variant="contained"
      color="primary"
      href={process.enve.ACCOWNT_WEB_URL}
      size="large"
    >
      Login / Register
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

        <CTAButton classes={classes} user={user} />
      </div>
    </header>

    <section className={classes.section}>
      <img src={IMAGES.FORWARD_MAIL} className={classes.sectionImage} />
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

    {phonegap ? null : (
      <section className={classes.getPtorx}>
        <Typography variant="h2" className={classes.h2}>
          Get Ptorx
        </Typography>
        <Typography className={classes.p}>
          It's available for free on all your devices.
        </Typography>

        <div className={classes.downloadButtons}>
          <Paper elevation={1} className={classes.downloadButtonWrapper}>
            <ButtonBase
              href="/app"
              className={classes.downloadButton}
              focusRipple
            >
              <img src={IMAGES.WWW} className={classes.platformImage} />
              <Typography>Web</Typography>
              <Typography className={classes.downloadButtonCTA}>
                Launch App
              </Typography>
            </ButtonBase>
          </Paper>

          <Paper elevation={1} className={classes.downloadButtonWrapper}>
            <ButtonBase
              href="https://itunes.apple.com/us/app/id1161180537"
              className={classes.downloadButton}
              focusRipple
            >
              <img src={IMAGES.APPLE} className={classes.platformImage} />
              <Typography>iPhone/iPad</Typography>
              <Typography className={classes.downloadButtonCTA}>
                Get App
              </Typography>
            </ButtonBase>
          </Paper>

          <Paper elevation={1} className={classes.downloadButtonWrapper}>
            <ButtonBase
              href="https://play.google.com/store/apps/details?id=com.xyfir.ptorx"
              className={classes.downloadButton}
              focusRipple
            >
              <img src={IMAGES.ANDROID} className={classes.platformImage} />
              <Typography>Android</Typography>
              <Typography className={classes.downloadButtonCTA}>
                Get App
              </Typography>
            </ButtonBase>
          </Paper>

          <Paper elevation={1} className={classes.downloadButtonWrapper}>
            <ButtonBase
              href="https://chrome.google.com/webstore/detail/jjhgjgpgkbnlihngkfnkafaidoggljge"
              className={classes.downloadButton}
              focusRipple
            >
              <img src={IMAGES.CHROME} className={classes.platformImage} />
              <Typography>Chrome</Typography>
              <Typography className={classes.downloadButtonCTA}>
                Get Extension
              </Typography>
            </ButtonBase>
          </Paper>

          <Paper elevation={1} className={classes.downloadButtonWrapper}>
            <ButtonBase
              href="https://addons.mozilla.org/en-US/firefox/addon/email-aliases-by-ptorx"
              className={classes.downloadButton}
              focusRipple
            >
              <img src={IMAGES.FIREFOX} className={classes.platformImage} />
              <Typography>Firefox</Typography>
              <Typography className={classes.downloadButtonCTA}>
                Get Extension
              </Typography>
            </ButtonBase>
          </Paper>
        </div>
      </section>
    )}

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
      <img src={IMAGES.KEYBOARD} className={classes.sectionImage} />
    </section>

    <section className={classes.section}>
      <img src={IMAGES.MAGNIFYING_GLASS} className={classes.sectionImage} />
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
      <img src={IMAGES.DOMINOES} className={classes.sectionImage} />
    </section>

    <section className={classes.section}>
      <img src={IMAGES.BROKEN_CHAIN} className={classes.sectionImage} />
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
      <CTAButton classes={classes} user={user} />
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
      <img src={IMAGES.SPY} className={classes.sectionImage} />
    </section>

    <section className={classes.section}>
      <img src={IMAGES.PTERODACTYL} className={classes.sectionImage} />
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
      <img src={IMAGES.WWW} className={classes.sectionImage} />
    </section>

    <section className={classes.pricing}>
      <Typography variant="h2" className={classes.h2}>
        Pricing
      </Typography>
      <Typography className={classes.pricingP}>
        Sending or receiving mail costs 1 credit. Accounts are refilled monthly
        based on their tier. Paid accounts also unlock new abilities.
      </Typography>

      <div className={classes.tiers}>
        <Paper elevation={1} className={classes.tier}>
          <List subheader={<ListSubheader disableSticky>Basic</ListSubheader>}>
            <ListItem>
              <ListItemText
                primary="Free!"
                secondary="Account topped up to 200 credits per month"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Some limitations"
                secondary="Cannot save, send, or reply to mail, etc"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper elevation={1} className={classes.tier}>
          <List
            subheader={
              <ListSubheader color="primary" disableSticky>
                Premium
              </ListSubheader>
            }
          >
            <ListItem>
              <ListItemText
                primary="$1.50 monthly, $15 yearly (USD)"
                secondary="Account topped up to 200 credits per month"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="No Limitations"
                secondary="Save, send, reply to mail, and more"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper elevation={1} className={classes.tier}>
          <List
            subheader={
              <ListSubheader color="primary" disableSticky>
                Ultimate
              </ListSubheader>
            }
          >
            <ListItem>
              <ListItemText
                primary="$5 monthly, $50 yearly (USD)"
                secondary="Account topped up to 10,000 credits per month"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="No Limitations"
                secondary="Save, send, reply to mail, and more"
              />
            </ListItem>
          </List>
        </Paper>
      </div>

      <Typography>
        Need more than 10K per month? Send us an email:{' '}
        <a href="mailto:contact@xyfir.com" className={classes.a}>
          contact@xyfir.com
        </a>
        .
      </Typography>
    </section>

    <section className={classes.section}>
      <img src={IMAGES.CODE} className={classes.sectionImage} />
      <div className={classes.content}>
        <Typography variant="h2" className={classes.h2}>
          100% open source
        </Typography>
        <Typography className={classes.p}>
          Don't trust us with your emails?{' '}
          <a href={REPO_URL} className={classes.a}>
            Our code is completely open source for you to view.
          </a>{' '}
          You can even host your own server or contribute to our codebase to
          make Ptorx better.
        </Typography>
      </div>
    </section>

    <footer className={classes.footer}>
      <div className={classes.footerSection}>
        <Typography variant="h3" className={classes.h3}>
          Community and support
        </Typography>
        <Typography>Contact us or other members of the community.</Typography>
        <ul className={classes.ul}>
          <li>
            <a href="mailto:contact@xyfir.com" className={classes.a}>
              Send us an email
            </a>
          </li>
          <li>
            <a href="https://twitter.com/PtorxMail" className={classes.a}>
              Twitter
            </a>
          </li>
          <li>
            <a href="https://discord.gg/3T2gztb" className={classes.a}>
              Discord
            </a>
          </li>
          <li>
            <a href={REPO_URL} className={classes.a}>
              Github
            </a>
          </li>
        </ul>
      </div>

      <div className={classes.footerSection}>
        <Typography variant="h3" className={classes.h3}>
          Resources
        </Typography>
        <Typography>Learn about how Ptorx works.</Typography>
        <ul className={classes.ul}>
          <li>
            <a href={`${DOCS_URL}/terms-of-service.md`} className={classes.a}>
              Terms of Service
            </a>
          </li>
          <li>
            <a href={`${DOCS_URL}/privacy-policy.md`} className={classes.a}>
              Privacy Policy
            </a>
          </li>
          <li>
            <a href={`${DOCS_URL}/self-host.md`} className={classes.a}>
              Self-hosting
            </a>
          </li>
          <li>
            <a href={`${DOCS_URL}/help.md`} className={classes.a}>
              Help Docs
            </a>
          </li>
        </ul>
      </div>

      <div className={classes.footerSection}>
        <Typography variant="h3" className={classes.h3}>
          Spread the word
        </Typography>
        <Typography>
          Everyone deserves privacy. Tell a friend, and help us sustain.
        </Typography>
        <ul className={classes.ul}>
          <li>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                'Send and receive mail anonymously with @PtorxMail. https://ptorx.com'
              )}`}
              className={classes.a}
            >
              Share on Twitter
            </a>
          </li>
          <li>
            <a href={REPO_URL} className={classes.a}>
              Star on Github
            </a>
          </li>
          <li>
            <a
              href="https://alternativeto.net/software/ptorx/"
              className={classes.a}
            >
              Like on AlternativeTo
            </a>
          </li>
        </ul>
      </div>

      <Typography className={classes.xyfirNetwork}>
        Ptorx is part of the{' '}
        <a href="https://www.xyfir.com" className={classes.a}>
          Xyfir Network
        </a>
      </Typography>
    </footer>
  </div>
);

export const Info = withStyles(styles)(_Info);
