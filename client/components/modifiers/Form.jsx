import PropTypes from 'prop-types';
import React from 'react';

// Constants
import { creatableModifierTypes } from 'constants/types';

// react-md
import SelectField from 'react-md/lib/SelectFields';
import TextField from 'react-md/lib/TextFields';
import Checkbox from 'react-md/lib/SelectionControls/Checkbox';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

export default class ModifierForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = { type: this.props.modifier.type, useRegex: false };
  }

  onSubmit() {
    const modifier = {
      type: this.state.type,
      name: this.refs.name.getField().value,
      description: this.refs.description.getField().value
    };
    let data;

    switch (modifier.type) {
      case 3:
        data = {
          regex: this.state.useRegex,
          value: this.refs.find.getField().value,
          with: this.refs.replace.getField().value,
          flags: this.refs.regexFlags
            ? this.refs.regexFlags.getField().value : ''
        };
        break;

      case 4:
        data = { subject: this.refs.subject.getField().value };
        break;

      case 5:
        data = {
          value: this.refs.tag.getField().value,
          prepend: window['checkbox--prepend'].checked
        };
        break;
      
      case 6:
        data = {
          to: this.refs.to.state.value,
          add: this.refs.add.state.value,
          prepend: window['checkbox--prepend'].checked,
          separator: this.refs.separator.getField().value
        };
        break;
      
      case 8:
        data = {
          value: this.refs.value.getField().value,
          target: this.refs.target.state.value
        };
        break;
    }

    this.props.onSubmit(modifier, data);
  }

  render() {
    const mod = this.props.modifier;
    
    const form = (() => {
      switch (this.state.type) {
        case 2: return (
          <Paper zDepth={1} component='section'>
            HTML will be stripped from all emails leaving plain text.
          </Paper>
        );

        case 3: return (
          <Paper
            zDepth={1}
            component='section'
            className='find-and-replace section flex'
          >
            <TextField
              id='text--find'
              ref='find'
              type='text'
              label='Find'
              helpText='The value to be replaced'
              className='md-cell'
              defaultValue={mod.data.value}
            />

            <TextField
              id='text--replace'
              ref='replace'
              type='text'
              label='Replace'
              helpText='The value which replaces "Find"'
              className='md-cell'
              defaultValue={mod.data.with}
            />
            
            <Checkbox
              id='checkbox--regex'
              label='Regular Expression'
              onChange={c => this.setState({ useRegex: c })}
              defaultChecked={mod.data.regex}
            />

            {mod.data.regex || this.state.useRegex ? (
              <TextField
                id='text--flags'
                ref='regexFlags'
                type='text'
                label='Regular Expression Flags'
                helpText='Single-character regex flags'
                className='md-cell'
                defaultValue={mod.data.flags}
              />
            ) : null}
          </Paper>
        );

        case 4: return (
          <Paper
            zDepth={1}
            component='section'
            className='subject-replace section flex'
          >
            <TextField
              id='text--subject'
              ref='subject'
              type='text'
              label='Subject'
              helpText='The text to replace an email subject with'
              className='md-cell'
              defaultValue={mod.data}
            />
          </Paper>
        );

        case 5: return (
          <Paper
            zDepth={1}
            component='section'
            className='subject-tag section flex'
          >
            <TextField
              id='text--subject-tag'
              ref='tag'
              type='text'
              label='Subject Tag'
              helpText='The value to append or prepend to an email subject'
              className='md-cell'
              defaultValue={mod.data.value}
            />
            
            <Checkbox
              id='checkbox--prepend'
              label='Prepend Tag'
              defaultChecked={mod.data.prepend}
            />
          </Paper>
        );
        
        case 6: return (
          <Paper
            zDepth={1}
            component='section'
            className='concatenate section flex'
          >
            <SelectField
              id='select--var-1'
              ref='add'
              label='Add (Variable #1)'
              helpText={
                'Variable #1\'s content is added to the end of variable ' +
                '#2\'s content'
              }
              position={SelectField.Positions.BELOW}
              className='md-cell'
              menuItems={[
                { value: 'from', label: 'Sender' },
                { value: 'subject', label: 'Subject' },
                { value: 'senderName', label: 'Sender Name' },
                { value: 'domain', label: 'Sender Domain' },
                { value: 'sender', label: 'Sender Address' }
              ]}
              defaultValue={mod.data.add}
            />

            <TextField
              id='text--separator'
              ref='separator'
              type='text'
              label='Separator'
              helpText='Separates variable #1 and #2'
              className='md-cell'
              defaultValue={mod.data.separator}
            />

            <Checkbox
              id='checkbox--prepend'
              label='Prepend'
              defaultChecked={!!mod.data.prepend}
            />

            <SelectField
              id='select--var-2'
              ref='to'
              label='To (Variable #2)'
              position={SelectField.Positions.ABOVE}
              className='md-cell'
              menuItems={[
                { value: 'subject', label: 'Subject' },
                { value: 'body-html', label: 'Email Body (HTML)' },
                { value: 'body-plain', label: 'Email Body (Text)' }
              ]}
              defaultValue={mod.data.to}
            />
          </Paper>
        );

        case 8: return (
          <Paper
            zDepth={1}
            component='section'
            className='builder section flex'
          >
            <SelectField
              id='select--target'
              ref='target'
              label='Target'
              helpText='The field to build the value for'
              position={SelectField.Positions.BELOW}
              className='md-cell'
              menuItems={[
                { value: 'subject', label: 'Subject' },
                { value: 'body-html', label: 'Email Body (HTML)' },
                { value: 'body-plain', label: 'Email Body (Text)' }
              ]}
              defaultValue={mod.data.target}
            />

            <TextField
              id='text--value'
              ref='value'
              rows={2}
              type='text'
              label='Value'
              helpText='Sets the value of the target field; see help docs'
              className='md-cell'
              defaultValue={mod.data.value}
            />
          </Paper>
        );
      }
    })();
    
    return (
      <div className='modifier-form'>
        <Paper zDepth={1} component='section' className='section flex'>
          <SelectField
            id='select--type'
            label='Modifier Type'
            value={this.state.type}
            onChange={type => this.setState({ type })}
            position={SelectField.Positions.BELOW}
            className='md-cell'
            menuItems={
              Object.keys(creatableModifierTypes).map(k =>
                Object({ label: creatableModifierTypes[k], value: +k })
              )
            }
          />
          
          <TextField
            id='text--name'
            ref='name'
            type='text'
            label='Name'
            className='md-cell'
            defaultValue={mod.name}
          />
          
          <TextField
            id='text--description'
            ref='description'
            type='text'
            label='Description'
            className='md-cell'
            defaultValue={mod.description}
          />

          <Button
            raised primary
            onClick={() => this.onSubmit()}
            label='Submit'
          />
        </Paper>
        
        {form}
        
        {mod.linkedTo.length ? (
          <Paper zDepth={1} className='linked-emails section flex'>
            <h3>Linked To</h3>
            <p>
              Below are emails that are currently utilizing this modifier.
            </p>
            
            <div className='linked-emails'>{
              mod.linkedTo.map(email =>
                <a key={email.id} href={`#emails/edit/${email.id}`}>{
                  email.address
                }</a>
              )
            }</div>
          </Paper>
        ) : null}
      </div>
    );
  }

}

ModifierForm.propTypes = {
  modifier: PropTypes.objectOf({
    data: PropTypes.any,
    type: PropTypes.number,
    name: PropTypes.string,
    linkedTo: PropTypes.arrayOf(
      PropTypes.objectOf({
        id: PropTypes.number, address: PropTypes.string
      })
    ),
    description: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired
};

ModifierForm.defaultProps = {
  modifier: {
    type: 0, data: '', name: '', linkedTo: [], description: ''
  }
};