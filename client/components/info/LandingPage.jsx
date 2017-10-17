import React from 'react';

// Constants
import pages from 'constants/landing-pages';

// react-md
import Button from 'react-md/lib/Buttons/Button';

// Components
import HowItWorks from 'components/info/HowItWorks';

export default ({page}) => (
  <div className={'landing-page ' + page}>
    <header>
      <h2>{pages[page].title}</h2>

      <p>{pages[page].description}</p>

      <HowItWorks />
    </header>

    <section className='free-trial'>
      <Button
        raised secondary
        className='start-trial'
        onClick={() => location.href =
          'https://accounts.xyfir.com/app/#/register/13'
        }
      >Try Free</Button>

      <p>All that's needed to start your 14 day free trial is a valid email to create a Xyfir Account. No payment info required.</p>
    </section>

    <section className='more-info'>
      <p>If you decide to purchase a subscription and experience Ptorx in its entirety, we offer a <strong>risk-free, 30 day money-back guarantee</strong> on all purchases.</p>

      <p><strong>Ptorx has lots of features</strong>, and is used for much more than just {pages[page].featuresMessage}. Check our <strong><a href='features'>features list</a></strong> to learn about all we can do!</p>

      <p><strong>Confused? Have questions?</strong> Browse through our <strong><a href='docs'>Help Docs</a></strong> or <strong><a href='https://xyfir.com/#/contact'>send us your question</a></strong> and we'll get back to you as soon as we can.</p>
    </section>
  </div>
);