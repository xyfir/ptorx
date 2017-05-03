import request from 'superagent';
import React from 'react';

// Action creators
import { loadModifiers, deleteModifier } from 'actions/creators/modifiers';
import { loadEmails } from 'actions/creators/emails';

// Constants
import { modifierTypes } from 'constants/types';

// Modules
import findMatches from 'lib/find-matching';

// Components
import Search from 'components/misc/Search';

export default class ModifierList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      search: { query: '', type: 0 }
    };
    
    this.onSearch = this.onSearch.bind(this);
    if (props.data.modifiers.length == 0) {
      request
        .get('../api/modifiers')
        .end((err, res) =>
          this.props.dispatch(loadModifiers(res.body.modifiers))
        );
    }
  }

  onSearch(search) {
    this.setState({ search });
  }

  onDeleteModifier(id) {
    swal({
      title: 'Are you sure?',
      text: 'This modifier will be removed from any emails it is linked to.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!'
    }, () => {
      request
        .delete('../api/modifiers/' + id)
        .end((err, res) => {
          if (err || res.body.error) {
            swal('Error', 'Could not delete modifier', 'error');
          }
          else {
            this.props.dispatch(deleteModifier(id));

            const emails = this.props.data.emails.slice();

            // Remove any instances of modifier where linked to emails
            emails.forEach((email, i) => {
              email.modifiers = email.modifiers.filter(mod => mod.id != id);
              emails[i] = email;
            });
            this.props.dispatch(loadEmails(emails));
          }
        });
    });
  }

  render() {
    return (
      <div className='modifiers'>
        <button
          onClick={() => location.hash = '#modifiers/create'}
          className='btn-primary'
        >Create a Modifier</button>
        
        <Search onSearch={this.onSearch} type='modifier' />
        
        <div className='list'>{
          findMatches(
            this.props.data.modifiers, this.state.search
          ).filter(
            mod => !mod.global
          ).map(mod => {
            return (
              <div className='modifier'>
                <span className='type'>{
                  modifierTypes[mod.type]
                }</span>
                <span className='name'>
                  <a href={`#modifiers/edit/${mod.id}`}>
                    {mod.name}
                  </a>
                </span>
                
                <span className='description'>{
                  mod.description
                }</span>

                <div className='controls'>
                  <a
                    className='icon-edit'
                    href={`#modifiers/edit/${mod.id}`}
                  >Edit</a>
                  <a
                    className='icon-trash'
                    onClick={() => this.onDeleteModifier(mod.id)}
                  >Delete</a>
                </div>
              </div>
            );
          })
        }</div>
      </div>
    );
  }

}