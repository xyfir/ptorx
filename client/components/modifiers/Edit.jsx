import request from 'superagent';
import React from 'react';

// Action creators
import { editModifier } from 'actions/creators/modifiers';

// Constants
import { URL } from 'constants/config';
import { modifierTypes } from 'constants/types';

export default class UpdateModifier extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      type: 0, id: location.hash.split('/')[2], loading: true,
      useRegex: false
    };

    request
      .get('../api/modifiers/' + this.state.id)
      .end((err, res) => {
        if (err || res.body.err) {
          swal('Error', 'Could not load data', 'error');
        }
        else {
          delete res.body.error;
          res.body.data = res.body.data.substr(0, 1) == '{'
            ? JSON.parse(res.body.data) : res.body.data;
          
          this.props.dispatch(editModifier(
            Object.assign({}, this.props.data.modifiers.find(mod =>
              mod.id == this.state.id
            ), res)
          ));

          this.setState({
            loading: false, type: this.props.data.modifiers.find(mod =>
              mod.id == this.state.id
            ).type
          });
        }
      });
  }

  onChangeType() {
    this.setState({ type: +this.refs.type.value });
  }

  onUpdate() {
    let data = {
      type: +this.refs.type.value, name: this.refs.name.value,
      description: this.refs.description.value
    },
    data2;

    switch (data.type) {
      case 1:
        data2 = { key: this.refs.key.value };
        break;

      case 2:
        data2 = '';
        break;

      case 3:
        data2 = {
          regex: +this.refs.regex.checked, flags: (
            this.refs.regexFlags
              ? this.refs.regexFlags.value : ''
          ), value: this.refs.find.value,
          with: this.refs.replace.value
        };
        break;

      case 4:
        data2 = { subject: this.refs.subject.value };
        break;

      case 5:
        data2 = {
          value: this.refs.tag.value,
          prepend: +this.refs.prepend.checked
        };
        break;
    }

    request
      .put('../api/modifiers/' + this.state.id)
      .send(Object.assign({}, data, data2))
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', res.body.message, 'error');
        }
        else {
          data.id = this.state.id;
          data.data = data2;
          this.props.dispatch(editModifier(
            Object.assign({}, this.props.data.modifiers.find(
              mod => mod.id == this.state.id
            ), data)
          ));

          location.hash = 'modifiers/list';
          swal('Success', `Modifier '${data.name}' updated`, 'success');
        }
      });
  }

  render() {
    if (this.state.loading) return <div />;
    
    const mod = this.props.data.modifiers
      .find(mod => mod.id == this.state.id);
    
    const form = (() => {
      switch (this.state.type) {
        case 1:
          return (
            <div>
              <label>Encryption Key</label>
              <span className='input-description'>
                Email text and HTML content will be encrypted with this key using AES-256.
              </span>
              <input type='text' ref='key' defaultValue={mod.data} />
            </div>
          );

        case 2:
          return (
            <p>
              HTML will be stripped from all emails leaving plain text.
            </p>
          );

        case 3:
          return (
            <div>
              <label>Find</label>
              <span className='input-description'>
                The value to be replaced.
              </span>
              <input type='text' ref='find' defaultValue={mod.data.value} />
              
              <label>Replace</label>
              <span className='input-description'>
                The value which replaces 'Find'.
              </span>
              <input type='text' ref='replace' defaultValue={mod.data.with} />
              
              <label><input
                ref='regex'
                type='checkbox'
                onChange={() => this.setState({ useRegex: !this.useRegex })}
                defaultChecked={mod.data.regex}
              />Use Regular Expression</label>

              {mod.data.regex || this.state.useRegex ? (
                <div>
                  <label>Regular Expression Flags</label>
                  <input
                    defaultValue={mod.data.flags}
                    type='text'
                    ref='regexFlags'
                  />
                </div>
              ) : (
                <div />
              )}
            </div>
          );

        case 4:
          return (
            <div>
              <label>Subject</label>
              <span className='input-description'>
                The text to replace an email's subject with.
              </span>
              <input
                type='text'
                ref='subject'
                defaultValue={mod.data}
              />
            </div>
          );

        case 5:
          return (
            <div>
              <label>Subject Tag</label>
              <span className='input-description'>
                The value to append or prepend to an email's subject.
              </span>
              <input
                type='text'
                ref='tag'
                defaultValue={mod.data.value}
              />
              <label><input
                type='checkbox'
                ref='prepend'
                defaultChecked={mod.data.prepend}
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
              <select ref='add' defaultValue={mod.data.add}>
                <option value='subject'>Subject</option>
                <option value='from'>Sender Address</option>
                <option value='domain'>Sender Domain</option>
              </select>

              <label>Separator</label>
              <span className='input-description'>
                Separates variable #1 and #2.
              </span>
              <input
                ref='separator'
                type='text'
                defaultValue={mod.data.separator}
              />

              <label>To (Variable #2)</label>
              <select ref='to' defaultValue={mod.data.to}>
                <option value='subject'>Subject</option>
                <option value='body-plain'>Email Body (Text)</option>
                <option value='body-html'>Email Body (HTML)</option>
              </select>
            </div>
          );
      }
    })();
    
    return (
      <div className='modifier-update'>
        <label>Modifier Type</label>
        <select
          ref='type'
          onChange={() => this.onChangeType()}
          defaultValue={mod.type}
        >{
          Object.keys(modifierTypes).map(k =>
            <option value={k}>{modifierTypes[k]}</option>
          )
        }</select>
        
        <label>Name</label>
        <span className='input-description'>
          Give your modifier a name to find it easier.
        </span>
        <input type='text' ref='name' defaultValue={mod.name} />
        
        <label>Description</label>
        <span className='input-description'>
          Describe your modifier to find it easier.
        </span>
        <input
          type='text'
          ref='description'
          defaultValue={mod.description}
        />
        
        <hr />
        
        {form}
        
        <hr />
        
        <button className='btn-primary' onClick={() => this.onUpdate()}>
          Update Modifier
        </button>
        
        <hr />
        
        <h3>Linked To</h3>
        <p>
          Below are emails that are currently utilizing this modifier.
        </p>
        <div className='linked-emails'>{
          mod.linkedTo.map(email =>
            <a href={`#emails/edit/${email.id}`}>{email.address}</a>
          )
        }</div>
      </div>
    );
  }

}