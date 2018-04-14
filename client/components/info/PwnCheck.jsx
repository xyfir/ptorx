import { TextField, Button, FontIcon } from 'react-md';
import request from 'superagent';
import React from 'react';

export default class PwnCheck extends React.Component {
  constructor(props) {
    super(props);

    (this.i = {}),
      (this.state = { step: 1, breaches: [], email: '', isPtorx: false });
  }

  onCheckEmail() {
    const email = this.i.email.value;

    if (email.length < 4 || email.indexOf('@') == -1)
      return (this.i.email.getField().value = '');

    this.setState({ email });

    // ** Check if name + domain is a Ptorx email

    request
      .get('https://haveibeenpwned.com/api/v2/breachedaccount/' + email)
      .query({
        includeUnverified: true
      })
      .end((err, res) => {
        if (err) this.setState({ step: 2 });
        else this.setState({ step: 2, breaches: res.body });
      });
  }

  render() {
    if (this.state.step == 1)
      return (
        <section className="pwn-check step-1">
          <h2>Is your email putting your privacy and security at risk?</h2>

          <TextField
            id="email--email"
            ref={i => (this.i.email = i)}
            type="email"
            leftIcon={<FontIcon>email</FontIcon>}
            className="md-cell"
            placeholder="Enter your email address"
          />
          <Button
            raised
            primary
            className="check-my-email"
            onClick={() => this.onCheckEmail()}
          >
            Check My Email
          </Button>
        </section>
      );
    else if (this.state.breaches.length)
      return (
        <section className="pwn-check step-2a">
          <h2>
            Your email was found in ~{this.state.breaches.length} <u>known</u>{' '}
            database breaches!
          </h2>
          <span className="source">
            source:{' '}
            <a href="https://haveibeenpwned.com" target="_blank">
              have i been pwned?
            </a>
          </span>

          <Button
            raised
            primary
            iconChildren="verified_user"
            className="protect-my-emails"
            onClick={() =>
              (location.href =
                'https://accounts.xyfir.com/app/#/register/13' +
                '?email=' +
                this.state.email)
            }
          >
            Protect My Emails
          </Button>

          <ul className="breaches">
            {this.state.breaches.map(breach => (
              <li className="breach" key={breach.Name}>
                <span className="title">{breach.Title}: </span>
                <span
                  className="description"
                  dangerouslySetInnerHTML={{ __html: breach.Description }}
                />
              </li>
            ))}
          </ul>

          <h2>What does this mean for me?</h2>

          <p>
            It means your email address, and potentially other sensitive or
            personally identifiable information has been leaked from what should
            have been a secure database, and ended up in the hands of hackers,
            spammers, and all other kinds of malicious internet users. This
            information being public decreases your security and privacy while
            increasing the amount of spam you receive and the risk of having
            your other accounts compromised or becoming the target of phishing
            attempts.
          </p>

          <h2>How could Ptorx have protected me?</h2>

          <p>
            Assuming you used Ptorx as recommended, by using a unique proxy
            email address for every site and contact, Ptorx would have protected
            you in multiple ways:
          </p>
          <p>
            The most important thing is that Ptorx would protect you from losing
            multiple accounts when an account on a single site is compromised.
            This is because when hackers gain access to a database on one site,
            they usually try to use the information they stole to gain access to
            accounts on other sites where a user has the same email and possibly
            other sensitive information set as well. By using a different proxy
            email everywhere, it is much harder for a hacker to link an account
            on one site to an account on another. Additionally, proxy emails
            protect your real email address from potentially being compromised
            which would cause all of your accounts linked to that email to be
            lost.
          </p>
          <p>
            Another way Ptorx would have protected you is by allowing you to
            stop unwanted mail. When hackers gain access to a database, they
            probably will end up using that email list to send spam, viruses, or
            phishing emails. Ptorx allows you to either filter out that mail,
            more clearly determine where mail is actually coming from, or delete
            a proxy email to stop any incoming mail before it reaches your real
            email address.
          </p>
          <p>
            Ptorx also protects your privacy by preventing people from finding
            out what websites you have accounts on if they know your email
            address. Ptorx can also help prevent your real email addresses from
            ending up in 'people search' websites.
          </p>

          <Button
            raised
            primary
            iconChildren="verified_user"
            className="protect-my-emails"
            onClick={() =>
              (location.href =
                'https://accounts.xyfir.com/app/#/register/13' +
                '?email=' +
                this.state.email)
            }
          >
            Protect My Emails
          </Button>
        </section>
      );
    else
      return (
        <section className="pwn-check step-2b">
          <h2>Your email may be at risk!</h2>

          <p>
            Every so often a website will be the victim of an attack that leaves
            all or part of its database in the hands of hackers, spammers, and
            all other types of malicious internet users. If you were a member of
            that site, your privacy just decreased, and you're now much more
            likely to become a target for further account compromises, phishing
            attempts, spam, and potentially something worse.
          </p>

          <p>
            Make sure that on the day when your email inevitably ends up in the
            hands of someone who shouldn't have it, that your privacy, security,
            and peace of mind won't be in jeopardy.
          </p>

          <h2>How can Ptorx protect me?</h2>

          <p>
            Assuming you use Ptorx as recommended, by using a unique proxy email
            address for every site and contact, Ptorx can protect you in
            multiple ways:
          </p>
          <p>
            The most important thing is that Ptorx protects you from losing
            multiple accounts when an account on a single site is compromised.
            This is because when hackers gain access to a database or account on
            one site, they usually try to use the information they stole to gain
            access to accounts on other sites where a user has the same email
            and possibly other sensitive information set as well. By using a
            different proxy email everywhere, it is much harder for a hacker to
            link an account on one site to an account on another. Additionally,
            proxy emails protect your real email address from potentially being
            compromised which would cause all of your accounts linked to that
            email to be lost.
          </p>
          <p>
            Another way Ptorx can protect you is by allowing you to stop
            unwanted mail. When hackers gain access to a database, they probably
            will end up using that email list to send spam, viruses, or phishing
            emails. Ptorx allows you to either filter out that mail, more
            clearly determine where mail is actually coming from, or delete a
            proxy email to stop any incoming mail to that address before it
            reaches your real email address.
          </p>
          <p>
            Ptorx also protects your privacy by preventing people from finding
            out what websites you have accounts on if they know your email
            address. Ptorx can also help prevent your real email addresses from
            ending up in 'people search' websites.
          </p>

          <Button
            raised
            primary
            iconChildren="verified_user"
            className="protect-my-emails"
            onClick={() =>
              (location.href =
                'https://accounts.xyfir.com/app/#/register/13' +
                '?email=' +
                this.state.email)
            }
          >
            Protect My Emails
          </Button>
        </section>
      );
  }
}
