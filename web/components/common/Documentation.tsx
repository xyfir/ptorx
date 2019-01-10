import * as marked from 'marked';
import * as React from 'react';
import { api } from 'lib/api';

export class Documentation extends React.Component<
  { file: string },
  { content: string }
> {
  constructor(props) {
    super(props);
    this.state = { content: '' };
  }

  componentDidMount() {
    api
      .get(
        `https://api.github.com/repos/Xyfir/Documentation/contents/` +
          `ptorx/${this.props.file.split('?')[0]}.md`
      )
      .then(res => this.setState({ content: res.data.content }));
  }

  render() {
    return (
      <div
        className="documentation help markdown"
        dangerouslySetInnerHTML={{
          __html: marked(window.atob(this.state.content), { sanitize: true })
        }}
      />
    );
  }
}
