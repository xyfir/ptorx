import { LANDING_PAGES } from 'constants/landing-pages';
import { HowItWorks } from 'components/info/HowItWorks';
import { PwnCheck } from 'components/info/PwnCheck';
import { Button } from 'react-md';
import * as React from 'react';
import { Link } from 'react-router-dom';

export class LandingPage extends React.Component {
  constructor(props) {
    super(props);

    document.title = LANDING_PAGES[props.page].title + ' - Ptorx';
  }

  render() {
    const { page, pwnCheck } = this.props;

    return (
      <div className={'landing-page ' + page}>
        <header>
          <h2>{LANDING_PAGES[page].title}</h2>

          <p>{LANDING_PAGES[page].description}</p>

          <HowItWorks />
        </header>

        <section className="try-for-free">
          <a href="https://accounts.xyfir.com/register/service/13">
            <Button raised secondary className="try-free">
              Sign Up
            </Button>
          </a>

          <p>
            All that's needed to use Ptorx for free is a valid email to create a
            Xyfir Account. Have your first proxy email ready in the next 3
            minutes.
          </p>
        </section>

        {pwnCheck ? <PwnCheck /> : null}

        <section className="more-info">
          <p>
            <strong>Ptorx has lots of features</strong>, and is used for much
            more than just {LANDING_PAGES[page].featuresMessage}. Check our
            <strong>
              <Link to="/features"> features list </Link>
            </strong>
            to learn about all we can do!
          </p>

          <p>
            <strong>Confused? Have questions?</strong> Browse through our
            <strong>
              <Link to="/docs"> Help Docs </Link>
            </strong>
            or
            <strong>
              <a href="https://www.xyfir.com/contact">
                {' '}
                send us your question{' '}
              </a>
            </strong>
            and we'll get back to you as soon as we can.
          </p>
        </section>
      </div>
    );
  }
}
