import React from 'react';

// react-md
import SelectField from 'react-md/lib/SelectFields';
import TextField from 'react-md/lib/TextFields';
import Paper from 'react-md/lib/Papers';

// Constants
import { filterTypes, modifierTypes } from 'constants/types';

export default class Search extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = { select: 0 }
  }
  
  onSearch() {
    this.props.onSearch({
      query: this.refs.search.getField().value,
      type: this.state.select
    });
  }

  onSelect(select) {
    this.setState({ select }, () => this.onSearch());
  }
  
  render() {
    const types = this.props.type == 'filter'
      ? filterTypes : this.props.type == 'modifier'
      ? modifierTypes : null;
    
    return (
      <Paper zDepth={1} className='search section'>
        <TextField
          block paddedBlock
          id='search-box'
          ref='search'
          type='search'
          onChange={e => this.onSearch()}
          placeholder='Search'
        />

        {types ? (
          <SelectField
            id='select-search-type'
            onChange={v => this.onSelect(v)}
            position={SelectField.Positions.BELOW}
            className='md-cell'
            menuItems={
              Object.keys(types).map(k =>
                Object({ label: types[k], value: k })
              )
            }
            placeholder='Type'
          />
        ) : null}
      </Paper>
    );
  }
  
}