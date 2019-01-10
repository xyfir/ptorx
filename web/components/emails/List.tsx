import { DialogContainer, ListItem, FontIcon, Button, List } from 'react-md';
import { RouteComponentProps, Link } from 'react-router-dom';
import { LocalPagination } from 'components/common/Pagination';
import { findMatching } from 'lib/find-matching';
import { Search } from 'components/common/Search';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import * as swal from 'sweetalert';
import * as copy from 'copyr';
import { api } from 'lib/api';

interface EmailListState {
  proxyEmails: Ptorx.ProxyEmailList;
  selected: number;
  search: {
    query: string;
    type: number;
  };
  page: number;
}

export class EmailList extends React.Component<
  RouteComponentProps,
  EmailListState
> {
  state: EmailListState = {
    proxyEmails: [],
    selected: 0,
    search: { query: '', type: 0 },
    page: 1
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.load();
  }

  onDuplicate() {
    this.props.history.push(
      `/app/emails/create?duplicate=${this.state.selected}`
    );
  }

  async onDelete() {
    this.setState({ selected: 0 });

    const confirm = await swal({
      buttons: true,
      title: 'Are you sure?',
      text:
        'You will no longer receive mail sent to this address. You will not be able to recreate this address.',
      icon: 'warning'
    });
    if (!confirm) return;

    await api
      .delete(`/emails/${this.state.selected}`)
      .then(() => this.load())
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onEdit() {
    this.props.history.push(`/app/emails/edit/${this.state.selected}`);
  }

  onCopy() {
    const { proxyEmails, selected } = this.state;
    const { address } = proxyEmails.find(e => e.id == selected);
    copy(address);
    this.setState({ selected: 0 });
  }

  async load() {
    const res = await api.get('/emails');
    this.setState({ proxyEmails: res.data.emails });
  }

  render() {
    const { proxyEmails, selected, search, page } = this.state;

    return (
      <div className="emails">
        <Link to="/app/emails/create">
          <Button
            floating
            fixed
            primary
            tooltipPosition="left"
            tooltipLabel="Create new proxy email"
            iconChildren="add"
          />
        </Link>

        <Search onSearch={v => this.setState({ search: v })} type="email" />

        <List className="proxy-emails-list section md-paper md-paper--1">
          {findMatching(proxyEmails, search)
            .splice((page - 1) * 25, 25)
            .map(email => (
              <ListItem
                threeLines
                key={email.id}
                onClick={() => this.setState({ selected: email.id })}
                className="email"
                primaryText={email.name}
                secondaryText={email.address + '\n' + email.description}
              />
            ))}
        </List>

        <LocalPagination
          itemsPerPage={25}
          onGoTo={p => this.setState({ page: p })}
          items={proxyEmails.length}
          page={page}
        />

        <DialogContainer
          id="selected-email"
          title={
            !selected ? '' : proxyEmails.find(e => e.id == selected).address
          }
          onHide={() => this.setState({ selected: 0 })}
          visible={!!selected}
        >
          <List>
            <ListItem
              primaryText="Edit"
              leftIcon={<FontIcon>edit</FontIcon>}
              onClick={() => this.onEdit()}
            />
            <ListItem
              primaryText="Copy to clipboard"
              leftIcon={<FontIcon>content_copy</FontIcon>}
              onClick={() => this.onCopy()}
            />
            <ListItem
              primaryText="Create duplicate"
              leftIcon={<FontIcon>control_point_duplicate</FontIcon>}
              onClick={() => this.onDuplicate()}
            />
            <ListItem
              primaryText="Delete"
              leftIcon={<FontIcon>delete</FontIcon>}
              onClick={() => this.onDelete()}
            />
          </List>
        </DialogContainer>
      </div>
    );
  }
}
