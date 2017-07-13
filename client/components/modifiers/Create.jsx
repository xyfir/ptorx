import request from 'superagent';
import React from 'react';

// Action creators
import { addModifier } from 'actions/creators/modifiers';

// Constants
import { URL } from 'constants/config';
import { creatableModifierTypes } from 'constants/types';

export default class CreateModifier extends React.Component {

  constructor(props) {
    super(props);

    this.state = { type: 0, useRegex: false };
  }

  onChangeType() {
    this.setState({ type: +this.refs.type.value });
  }

  onCreate() {
    let data = {
      type: +this.refs.type.value, name: this.refs.name.value,
      description: this.refs.description.value
    },
    data2 = {};

    switch (data.type) {
      case 3:
        data2 = {
          regex: +this.refs.regex.checked, value: this.refs.find.value,
          with: this.refs.replace.value, flags: (
            this.refs.regexFlags
              ? this.refs.regexFlags.value : ''
          )
        };
        break;

      case 4:
        data2 = { subject: this.refs.subject.value };
        break;

      case 5:
        data2 = {
          value: this.refs.tag.value, prepend: +this.refs.prepend.checked
        };
        break;
      
      case 6:
        data2 = {
          add: this.refs.add.value, to: this.refs.to.value,
          separator: this.refs.separator.value
        };
        break;
    }

    request
      .post('../api/modifiers')
      .send(Object.assign({}, data, data2))
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', res.body.message, 'error');
        }
        else {
          // Add to state.modifiers
          data.id = res.body.id;
          data.data = data2;
          this.props.dispatch(addModifier(data));

          if (this.props.onCreate) {
            this.props.onCreate(res.body.id);
          }
          else {
            location.hash = 'modifiers/list';
            swal('Success', `Modifier '${data.name}' created`, 'success');
          }
        }
      });
  }

  

  render() {
    const form = (() => {
      switch (this.state.type) {
        case 2:
          return (
            <p>
              HTML will be stripped from all emails leaving plain text.
            </p>
          );

        case 3:
          return (
            <div className='replace'>
              <label>Find</label>
              <span className='input-description'>
                The value to be replaced.
              </span>
              <input type='text' ref='find' />

              <label>Replace</label>
              <span className='input-description'>
                The value which replaces 'Find'.
              </span>

              <input type='text' ref='replace' />
              
              <label><input
                ref='regex'
                type='checkbox'
                onChange={() =>
                  this.setState({ useRegex: !this.state.useRegex })
                }
              />Use Regular Expression</label>

              {this.state.useRegex ? (
                <div>
                  <label>Regular Expression Flags</label>
                  <input type='text' ref='regexFlags' />
                </div>
              ) : (
                <div />
              )}
            </div>
          );

        case 4:
          return (
            <div className='subject'>
              <label>Subject</label>
              <span className='input-description'>
                The text to replace an email's subject with.
              </span>
              <input type='text' ref='subject' />
            </div>
          );

        case 5:
          return (
            <div className='tag'>
              <label>Subject Tag</label>
              <span className='input-description'>
                The value to append or prepend to an email's subject.
              </span>
              <input type='text' ref='tag' />
              <label><input
                type='checkbox'
                ref='prepend'
                defaultChecked={true}
              />Prepend Tag</label>
            </div>
          );

        case 6:
          return (
            <div className='concatenate'>
              <label>Add (Variable #1)</label>
              <span className='input-description'>
                Variable #1's content is added to the end of variable #2's content.
              </span>
              <select ref='add'>
                <option value='from'>Sender Address</option>
                <option value='subject'>Subject</option>
                <option value='domain'>Sender Domain</option>
              </select>

              <label>Separator</label>
              <span className='input-description'>
                Separates variable #1 and #2.
              </span>
              <input type='text' ref='separator' defaultValue=' - ' />

              <label>To (Variable #2)</label>
              <select ref='to'>
                <option value='subject'>Subject</option>
                <option value='body-plain'>Email Body (Text)</option>
                <option value='body-html'>Email Body (HTML)</option>
              </select>
            </div>
          );
      }
    })();
    
    return (
      <div className='modifier-create'>
        <label>Modifier Type</label>
        <select ref='type' onChange={() => this.onChangeType()}>{
          [0].concat(Object.keys(creatableModifierTypes)).map(k =>
            <option value={k}>{
              creatableModifierTypes[k] || 'Modifier Type'
            }</option>
          )
        }</select>
        <label>Name</label>
        <span className='input-description'>
          Give your modifier a name to find it easier.
        </span>
        <input type='text' ref='name' />
        
        <label>Description</label>
        <span className='input-description'>
          Describe your modifier to find it easier.
        </span>
        <input type='text' ref='description' />
        
        {form}
        
        {this.props.onCreate ? <span /> : <hr />}
        
        <button className='btn-primary' onClick={() => this.onCreate()}>
          Create Modifier
        </button>
      </div>
    );
  }

}