import { MenuButton, TextField, Subheader, ListItem, Paper } from 'react-md';
import * as React from 'react';

// Constants
import { filterTypes, modifierTypes } from 'constants/types';

// Modules
import query from 'lib/parse-query-string';

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = { select: 0 };
  }

  componentDidMount() {
    this._search.focus();

    const { q } = query(location.hash);

    if (q) this.props.onSearch({ query: q, type: this.state.select });
  }

  onSearch() {
    this.props.onSearch({
      query: this._search.value,
      type: this.state.select
    });
  }

  onSelect(select) {
    this.setState({ select }, () => this.onSearch());
  }

  render() {
    const types =
      this.props.type == 'filter'
        ? filterTypes
        : this.props.type == 'modifier'
          ? modifierTypes
          : null;
    const { q } = query(location.hash);

    return (
      <Paper zDepth={1} className="search section flex">
        <TextField
          block
          paddedBlock
          id="search-box"
          ref={i => (this._search = i)}
          type="search"
          onChange={e => this.onSearch()}
          placeholder="Search"
          defaultValue={q}
        />

        {types ? (
          <MenuButton
            icon
            id="menu--create-item"
            menuItems={[<Subheader primaryText="Search by:" />].concat(
              Object.keys(types).map(k => (
                <ListItem
                  onClick={() => this.onSelect(k)}
                  primaryText={types[k]}
                />
              ))
            )}
            iconChildren="more_vert"
          />
        ) : null}
      </Paper>
    );
  }
}
