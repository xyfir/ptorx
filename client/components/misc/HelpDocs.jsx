import request from 'superagent';
import marked from 'marked';
import React from 'react';

// Components
import DynamicIframe from './DynamicIframe';

// react-md
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';

export default class HelpDocs extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = { show: false };
  }

  componentDidUpdate() {
    if (this.state.show) {
      request
        .get(
          'https://api.github.com/repos/Xyfir/Documentation/contents/' +
          'ptorx/help.md'
        )
        .end((err, res) => {
          console.log('this', this);
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
  }

  render() {
    if (this.state.show) {
      return (
        <Dialog
          fullPage
          id='button-script-editor-dialog'
          visible={true}
          className='help-documents'
        >
          <Button
            floating fixed secondary
            tooltipPosition='top'
            fixedPosition='bl'
            tooltipLabel='Close help documents'
            onClick={() => this.setState({ show: false })}
          >close</Button>
          
          <DynamicIframe ref='frame' className='documentation' />
        </Dialog>
      );
    }
    else {
      return (
        <Button
          floating fixed secondary
          tooltipPosition='top'
          fixedPosition='bl'
          tooltipLabel='Help Documents'
          onClick={() => this.setState({ show: true })}
        >info</Button>
      );
    }
  }

}