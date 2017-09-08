import request from 'superagent';
import marked from 'marked';
import React from 'react';

// Modules
import query from 'lib/parse-hash-query';

// Components
import DynamicIframe from './DynamicIframe';

export default class HelpDocs extends React.Component {
  
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {contentDocument: doc} = this.refs.frame.refs.frame;

    request
      .get(
        'https://api.github.com/repos/Xyfir/Documentation/contents/' +
        'ptorx/help.md'
      )
      .end((err, res) => {
        doc.head.innerHTML =
          `<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet" type="text/css">
          <link rel='stylesheet' href='../static/css/style.css'>`,

        // Convert markdown to html
        doc.body.innerHTML =
          `<div class='help-docs markdown'>${
            marked(window.atob(res.body.content), { santize: true })
          }</div>`;

        const {section} = query();

        if (section) {
          // Doesn't work without delay. No idea why
          setTimeout(() => doc.getElementById(section).scrollIntoView(), 250);
        }
      });
  }

  render() {
    return <DynamicIframe ref='frame' className='documentation' />
  }

}