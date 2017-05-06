import PropTypes from 'prop-types';
import React from 'react';

// Components
import Search from 'components/misc/Search';
import Create from './Create';

// Constants
import { filterTypes } from 'constants/types';

// Modules
import findMatches from 'lib/find-matching';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import List from 'react-md/lib/Lists/List';

export default class LinkFilter extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      view: 'search', search: { query: '', type: 0 }
    };
  }

  render() {
    return (
      <div className='link-filter'>
        {this.state.view == 'search' ? (
          <a onClick={() => this.setState({ view: 'create' })}>
            Create New Filter
          </a>
        ) : (
          <a onClick={() => this.setState({ view: 'search' })}>
            Find Existing Filter
          </a>
        )}
        
        {this.state.view == 'search' ? (
          <div>
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
        ) : (
          <Create
            data={this.props.data}
            dispatch={this.props.dispatch}
            onCreate={this.onAdd}
          />
        )}
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