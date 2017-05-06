import PropTypes from 'prop-types';
import React from 'react';

// Components
import Search from 'components/misc/Search';
import Create from './Create';

// Constants
import { modifierTypes } from 'constants/types';

// Modules
import findMatches from 'lib/find-matching';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import List from 'react-md/lib/Lists/List';

export default class LinkModifier extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      view: 'search', search: { query: '', type: 0 }
    };
  }

  render() {
    return (
      <div className='link-modifier'>
        {this.state.view == 'search' ? (
          <a onClick={() => this.setState({ view: 'create' })}>
            Create New Modifier
          </a>
        ) : (
          <a onClick={() => this.setState({ view: 'search' })}>
            Find Existing Modifier
          </a>
        )}
        
        {this.state.view == 'search' ? (
          <div>
            <Search
              onSearch={v => this.setState({ search: v })}
              type='modifier'
            />

            <List
              className='modifiers-list section md-paper md-paper--1'
            >{
              findMatches(
                this.props.data.modifiers, this.state.search, this.props.ignore
              ).map(m =>
                <ListItem
                  threeLines
                  key={m.id}
                  onClick={() => this.props.onAdd(m.id)}
                  className='modifier'
                  primaryText={m.name}
                  secondaryText={modifierTypes[m.type] + '\n' + m.description}
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

LinkModifier.propTypes = {
  data: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
  ignore: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatch: PropTypes.func.isRequired
};