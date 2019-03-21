import { RouteComponentProps } from 'react-router';
import { ReactGithubGist } from 'react-github-gist';
import * as React from 'react';

export const Docs = ({ match }: RouteComponentProps) => (
  <ReactGithubGist
    file={`${(match.params as { file: string }).file}.md`}
    gist="MrXyfir/d925ca17c9047a47a65810107dc121d0"
  />
);
