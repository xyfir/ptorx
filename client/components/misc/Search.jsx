import React from 'react';

// react-md
import TextField from 'react-md/lib/TextFields';
import Paper from 'react-md/lib/Papers';

// Constants
import { filterTypes, modifierTypes } from 'constants/types';

export default class Search extends React.Component {
  
  constructor(props) {
    super(props);
  }
  
  onSearch() {
    this.props.onSearch({
      query: this.refs.search.getField().value,
      type: this.refs.type ? +this.refs.type.value : 0
    });
  }
  
  render() {
    const types = this.props.type == 'filter'
      ? filterTypes : this.props.type == 'modifier'
      ? modifierTypes : null;
    
    return (
      <Paper zDepth={1} className='search'>
        <TextField
          block paddedBlock
          id='search-box'
          ref='search'
          type='search'
          onChange={e => this.onSearch()}
          placeholder='Search'
        />
        
        {types ? (
          <select ref='type' onChange={() => this.onSearch()}>{
            [0].concat(Object.keys(types)).map(k =>
              <option value={k}>{types[k] || 'All Types'}</option>
            )
          }</select>
        ) : <div />}
      </Paper>
    );
  }
  
}