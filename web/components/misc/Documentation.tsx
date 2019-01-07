import { parseQuery } from 'lib/parse-query-string';
import * as marked from 'marked';
import * as React from 'react';
import { api } from 'lib/api';

export class Documentation extends React.Component {
  constructor(props) {
    super(props);

    this.state = { content: '', loading: true };
  }

  componentDidMount() {
    api
      .get(
        `https://api.github.com/repos/Xyfir/Documentation/contents/` +
          `ptorx/${this.props.file.split('?')[0]}.md`
      )
      .then(res => this.setState({ content: res.data.content }));
  }

  componentDidUpdate() {
    if (!this.state.loading) return;

    this.setState({ loading: false });

    const { section } = parseQuery(location.hash);

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
