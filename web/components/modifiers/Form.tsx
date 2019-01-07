import { SelectField, TextField, Checkbox, Button, Paper } from 'react-md';
import { creatableModifierTypes } from 'constants/types';
import * as React from 'react';

export class ModifierForm extends React.Component {
  static defaultProps = {
    modifier: {
      type: 0,
      data: '',
      name: '',
      linkedTo: [],
      description: ''
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      type: this.props.modifier.type,
      useRegex: false
    };
  }

  onSubmit() {
    const modifier = {
      type: this.state.type,
      name: this._name.value,
      description: this._description.value
    };
    let data;

    switch (modifier.type) {
      case 3:
        data = {
          regex: this.state.useRegex,
          value: this._find.value,
          with: this._replace.value,
          flags: this._regexFlags ? this._regexFlags.value : ''
        };
        break;

      case 4:
        data = { subject: this._subject.value };
        break;

      case 5:
        data = {
          value: this._tag.value,
          prepend: window['checkbox--prepend'].checked
        };
        break;

      case 6:
        data = {
          to: this._to.state.value,
          add: this._add.state.value,
          prepend: window['checkbox--prepend'].checked,
          separator: this._separator.value
        };
        break;

      case 8:
        data = {
          value: this._value.value,
          target: this._target.state.value
        };
        break;
    }

    this.props.onSubmit(modifier, data);
  }

  render() {
    const mod = this.props.modifier;

    const form = (() => {
      switch (this.state.type) {
        case 2:
          return (
            <Paper zDepth={1} component="section">
              HTML will be stripped from all emails leaving plain text.
            </Paper>
          );

        case 3:
          return (
            <Paper
              zDepth={1}
              component="section"
              className="find-and-replace section flex"
            >
              <TextField
                id="text--find"
                ref={i => (this._find = i)}
                type="text"
                label="Find"
                helpText="The value to be replaced"
                defaultValue={mod.data.value}
              />

              <TextField
                id="text--replace"
                ref={i => (this._replace = i)}
                type="text"
                label="Replace"
                helpText='The value which replaces "Find"'
                defaultValue={mod.data.with}
              />

              <Checkbox
                id="checkbox--regex"
                label="Regular Expression"
                onChange={c => this.setState({ useRegex: c })}
                defaultChecked={mod.data.regex}
              />

              {mod.data.regex || this.state.useRegex ? (
                <TextField
                  id="text--flags"
                  ref={i => (this._regexFlags = i)}
                  type="text"
                  label="Regular Expression Flags"
                  helpText="Single-character regex flags"
                  defaultValue={mod.data.flags}
                />
              ) : null}
            </Paper>
          );

        case 4:
          return (
            <Paper
              zDepth={1}
              component="section"
              className="subject-replace section flex"
            >
              <TextField
                id="text--subject"
                ref={i => (this._subject = i)}
                type="text"
                label="Subject"
                helpText="The text to replace an email subject with"
                defaultValue={mod.data}
              />
            </Paper>
          );

        case 5:
          return (
            <Paper
              zDepth={1}
              component="section"
              className="subject-tag section flex"
            >
              <TextField
                id="text--subject-tag"
                ref={i => (this._tag = i)}
                type="text"
                label="Subject Tag"
                helpText="The value to append or prepend to an email subject"
                defaultValue={mod.data.value}
              />

              <Checkbox
                id="checkbox--prepend"
                label="Prepend Tag"
                defaultChecked={mod.data.prepend}
              />
            </Paper>
          );

        case 6:
          return (
            <Paper
              zDepth={1}
              component="section"
              className="concatenate section flex"
            >
              <SelectField
                id="select--var-1"
                ref={i => (this._add = i)}
                label="Add"
                helpText={
                  `The value of "Add" is added to the end of "To" or vice ` +
                  `versa if "Prepend"`
                }
                position={SelectField.Positions.BELOW}
                className="md-full-width"
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
                id="text--separator"
                ref={i => (this._separator = i)}
                type="text"
                label="Separator"
                helpText='Separates "Add" and "To"'
                defaultValue={mod.data.separator}
              />

              <Checkbox
                id="checkbox--prepend"
                label="Prepend"
                defaultChecked={!!mod.data.prepend}
              />

              <SelectField
                id="select--var-2"
                ref={i => (this._to = i)}
                label="To"
                position={SelectField.Positions.ABOVE}
                className="md-full-width"
                menuItems={[
                  { value: 'subject', label: 'Subject' },
                  { value: 'body-html', label: 'Email Body (HTML)' },
                  { value: 'body-plain', label: 'Email Body (Text)' }
                ]}
                defaultValue={mod.data.to}
              />
            </Paper>
          );

        case 8:
          return (
            <Paper
              zDepth={1}
              component="section"
              className="builder section flex"
            >
              <SelectField
                id="select--target"
                ref={i => (this._target = i)}
                label="Target"
                helpText="The field to build the value for"
                position={SelectField.Positions.BELOW}
                className="md-full-width"
                menuItems={[
                  { value: 'subject', label: 'Subject' },
                  { value: 'body-html', label: 'Email Body (HTML)' },
                  { value: 'body-plain', label: 'Email Body (Text)' }
                ]}
                defaultValue={mod.data.target}
              />

              <TextField
                id="text--value"
                ref={i => (this._value = i)}
                rows={2}
                type="text"
                label="Value"
                helpText="Sets the value of the target field; see help docs"
                defaultValue={mod.data.value}
              />
            </Paper>
          );
      }
    })();

    return (
      <div className="modifier-form">
        <Paper zDepth={1} component="section" className="section flex">
          <SelectField
            id="select--type"
            label="Modifier Type"
            value={this.state.type}
            onChange={type => this.setState({ type })}
            position={SelectField.Positions.BELOW}
            className="md-full-width"
            menuItems={Object.keys(creatableModifierTypes).map(k =>
              Object({ label: creatableModifierTypes[k], value: +k })
            )}
          />

          <TextField
            id="text--name"
            ref={i => (this._name = i)}
            type="text"
            label="Name"
            defaultValue={mod.name}
          />

          <TextField
            id="text--description"
            ref={i => (this._description = i)}
            type="text"
            label="Description"
            defaultValue={mod.description}
          />
        </Paper>

        {form}

        {mod.linkedTo.length ? (
          <Paper zDepth={1} className="linked-emails section flex">
            <h3>Linked To</h3>
            <p>Below are emails that are currently utilizing this modifier.</p>

            <div className="linked-emails">
              {mod.linkedTo.map(email => (
                <a key={email.id} href={`#/emails/edit/${email.id}`}>
                  {email.address}
                </a>
              ))}
            </div>
          </Paper>
        ) : null}

        <section className="controls">
          <Button raised primary onClick={() => this.onSubmit()}>
            Submit
          </Button>
        </section>
      </div>
    );
  }
}
