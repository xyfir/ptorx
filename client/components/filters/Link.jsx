import { List, ListItem } from 'react-md';
import PropTypes from 'prop-types';
import React from 'react';

// Components
import Search from 'components/misc/Search';

// Constants
import { filterTypes } from 'constants/types';

// Modules
import findMatches from 'lib/find-matching';

export default class LinkFilter extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      search: { query: '', type: 0 }
    };
  }

  render() {
    return (
      <div className='link-filter'>
        <Search
          onSearch={v => this.setState({ search: v })}
          type='filter'
        />

        <List
          className='filters-list section md-paper md-paper--1'
        >{
          findMatches(
            this.props.data.filters, this.state.search, this.props.ignore
          ).map(f =>
            <ListItem
              threeLines
              key={f.id}
              onClick={() => this.props.onAdd(f.id)}
              className='filter'
              primaryText={f.name}
              secondaryText={filterTypes[f.type] + '\n' + f.description}
            />
          )
        }</List>
      </div>
    );
  }

}

LinkFilter.propTypes = {
  data: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
  ignore: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatch: PropTypes.func.isRequired
};