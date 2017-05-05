import request from 'superagent';
import React from 'react';

// Action creators
import { loadEmails, deleteEmail } from 'actions/creators/emails';

// Constants
import { URL } from 'constants/config';

// Modules
import findMatches from 'lib/find-matching';

// Components
import Search from 'components/misc/Search';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import Paper from 'react-md/lib/Papers';
import List from 'react-md/lib/Lists/List';

export default class EmailList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: 0, search: { query: '', type: 0 }
    };
  }

  componentWillMount() {
    if (this.props.data.emails.length == 0) {
      request
        .get('../api/emails')
        .end((err, res) =>
          !err && this.props.dispatch(loadEmails(res.body.emails))
        );
    }
  }

  /**
   * Load 'CreateEmail' view with email's values loaded in.
   */
  onDuplicate() {
    location.hash = '#emails/create?duplicate=' + this.state.selected;
  }

  /**
   * Opens confirmation dialogue and allows user to delete a proxy email.
   */
  onDelete() {
    const id = this.state.selected;
    this.setState({ selected: 0 });

    swal({
      title: 'Are you sure?',
      text: 'You will no longer receive emails sent to this address. \
        You will not be able to recreate this address.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!'
    }, () =>
      request
        .delete('../api/emails/' + id)
        .end((err, res) => {
          if (err || res.body.error)
            swal('Error', 'Could not delete email', 'error');
          else
            this.props.dispatch(deleteEmail(id));
        })
    );
  }

  /**
   * Open the 'EditEmail' view.
   */
  onEdit() {
    location.hash = '#emails/edit/' + this.state.selected;
  }

  /**
   * Copies the proxy email's address to the clipboard.
   */
  onCopy() {
    const email = this.props.data.emails.find(
      e => e.id == this.state.selected
    ).address;

    const el = document.createElement('input');
    el.type = 'text', el.value = email;
    document.body.appendChild(el);
    
    el.select();
    document.execCommand('copy');
    el.remove();

    this.setState({ selected: 0 });
  }

  render() {
    return (
      <div className='emails'>
        <Button
          floating fixed primary
          tooltipPosition='left'
          tooltipLabel='Create new proxy email'
          onClick={() => location.hash = '#emails/create'}
        >add</Button>
        
        <Search
          onSearch={v => this.setState({ search: v })}
          type='email'
        />

        <Paper zDepth={1}>
        <List className='proxy-emails-list'>{
          findMatches(
            this.props.data.emails, this.state.search
          ).map(email =>
            <ListItem
              threeLines
              key={email.id}
              onClick={() => this.setState({ selected: email.id })}
              className='email'
              primaryText={email.name}
              secondaryText={email.address + '\n' + email.description}
            />
          )
        }</List>
        </Paper>

        <Dialog
          id='selected-email'
          title={
            !this.state.selected ? '' : this.props.data.emails.find(
              e => e.id == this.state.selected
            ).address
          }
          onHide={() => this.setState({ selected: 0 })}
          visible={!!this.state.selected}
        >
          <List>
            <ListItem
              primaryText='Edit'
              onClick={() => this.onEdit()}
            />
            <ListItem
              primaryText='Copy to clipboard'
              onClick={() => this.onCopy()}
            />
            <ListItem
              primaryText='Create duplicate'
              onClick={() => this.onDuplicate()}
            />
            <ListItem
              primaryText='Delete'
              onClick={() => this.onDelete()}
            />
          </List>
        </Dialog>
      </div>
    );
  }

}