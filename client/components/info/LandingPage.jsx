import React from 'react';

// Constants
import pages from 'constants/landing-pages';

// react-md
import Button from 'react-md/lib/Buttons/Button';

// Components
import HowItWorks from 'components/info/HowItWorks';
import PwnCheck from 'components/info/PwnCheck';

export default class LandingPage extends React.Component {
  constructor(props) {
    super(props);

    document.title = pages[props.page].title + ' - Ptorx';
  }

  render() {
    const { page, pwnCheck } = this.props;

    return (
      <div className={'landing-page ' + page}>
        <header>
          <h2>{pages[page].title}</h2>

          <p>{pages[page].description}</p>

          <HowItWorks />
        </header>

        <section className="try-for-free">
          <Button
            raised
            secondary
            className="try-free"
            onClick={() =>
              (location.href = 'https://accounts.xyfir.com/app/#/register/13')
            }
          >
            Sign Up
          </Button>

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
            more than just {pages[page].featuresMessage}. Check our
            <strong>
              <a href="features"> features list </a>
            </strong>
            to learn about all we can do!
          </p>

          <p>
            <strong>Confused? Have questions?</strong> Browse through our
            <strong>
              <a href="docs"> Help Docs </a>
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
