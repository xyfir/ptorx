import { ListItem, List } from 'react-md';
import PropTypes from 'prop-types';
import React from 'react';

// Components
import Search from 'components/misc/Search';

// Constants
import { modifierTypes } from 'constants/types';

// Modules
import findMatches from 'lib/find-matching';

export default class LinkModifier extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      search: { query: '', type: 0 }
    };
  }

  render() {
    return (
      <div className='link-modifier'>
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
    );
  }

}

LinkModifier.propTypes = {
  data: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
  ignore: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatch: PropTypes.func.isRequired
};