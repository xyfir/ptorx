import React from 'react';

// Constants
import sections from 'constants/info-sections';

// react-md
import Button from 'react-md/lib/Buttons/Button';

// Components
import HowItWorks from 'components/info/HowItWorks';

export default ({section}) => (
  <div className={'landing-page ' + section}>
    <header>
      <h2>{sections[section].title}</h2>

      <p>{sections[section].description}</p>

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
      <p>If you decide to purchase a subscription and experience Ptorx in its entirety, we offer a risk-free 30 day money-back guarantee on all purchases.</p>

      <p>Ptorx has lots of features, and is used for much more than just {sections[section].featuresMessage}. Check our <a href='features'>features list</a> to learn about all we can do!</p>

      <p>Confused? Have questions? Browse through our <a href='docs'>Help Docs</a> or <a href='https://xyfir.com/#/contact'>send us your question</a> and we'll get back to you as soon as we can.</p>
    </section>
  </div>
);