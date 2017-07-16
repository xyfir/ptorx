import request from 'superagent';
import marked from 'marked';
import React from 'react';

// Components
import DynamicIframe from './DynamicIframe';

export default class HelpDocs extends React.Component {
  
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    request
      .get(
        'https://api.github.com/repos/Xyfir/Documentation/contents/' +
        'ptorx/help.md'
      )
      .end((err, res) => {
        this.refs.frame.refs.frame.contentDocument.head.innerHTML =
          `<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet" type="text/css">
          <link rel='stylesheet' href='../static/css/style.css'>`;

        // Convert markdown to html
        this.refs.frame.refs.frame.contentDocument.body.innerHTML =
          `<div class='help-docs markdown'>${
            marked(window.atob(res.body.content), { santize: true })
          }</div>`;
      });
  }

  render() {
    return <DynamicIframe ref='frame' className='documentation' />
  }

}