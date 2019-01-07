import request from 'superagent';
import marked from 'marked';
import React from 'react';

// Modules
import query from 'lib/parse-query-string';

export default class Documentation extends React.Component {
  constructor(props) {
    super(props);

    this.state = { content: '', loading: true };
  }

  componentDidMount() {
    request
      .get(
        `https://api.github.com/repos/Xyfir/Documentation/contents/` +
          `ptorx/${this.props.file.split('?')[0]}.md`
      )
      .end((err, res) => this.setState({ content: res.body.content }));
  }

  componentDidUpdate() {
    if (!this.state.loading) return;

    this.setState({ loading: false });

    const { section } = query(location.hash);

    if (section) {
      // Doesn't work without delay. No idea why
      setTimeout(() => document.getElementById(section).scrollIntoView(), 250);
    }
  }

  render() {
    return (
      <div
        className="documentation help markdown"
        dangerouslySetInnerHTML={{
          __html: marked(window.atob(this.state.content), { santize: true })
        }}
      />
    );
  }
}