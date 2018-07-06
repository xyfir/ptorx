import request from 'superagent';
import React from 'react';
import copy from 'copyr';
import swal from 'sweetalert';

// Action creators
import { addDomain } from 'actions/domains';

// react-md
import TableColumn from 'react-md/lib/DataTables/TableColumn';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import DataTable from 'react-md/lib/DataTables/DataTable';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TextField from 'react-md/lib/TextFields';
import TableRow from 'react-md/lib/DataTables/TableRow';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

export default class AddDomain extends React.Component {
  constructor(props) {
    super(props);

    (this.views = {
      ADD: 'add',
      VERIFY_DOMAIN: 'verify',
      REQUEST_ACCESS: 'request'
    }),
      (this.state = {
        view: this.views.ADD,
        requestKey: '',
        domainId: 0,
        domainKey: {},
        domain: ''
      });
  }

  onAdd() {
    const domain = this.refs.domain.value;

    request
      .post('/api/domains')
      .send({ domain })
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', res.body.message, 'error');
        } else if (res.body.requestKey) {
          this.setState({
            view: this.views.REQUEST_ACCESS,
            requestKey: res.body.requestKey
          });
        } else if (res.body.domainId) {
          this.setState({
            view: this.views.VERIFY_DOMAIN,
            domain,
            domainId: res.body.domainId,
            domainKey: res.body.domainKey
          });
          this.props.dispatch(
            addDomain({
              id: res.body.domainId,
              domain,
              isCreator: true
            })
          );
        }
      });
  }

  render() {
    switch (this.state.view) {
      case this.views.ADD:
        return (
          <Paper
            zDepth={1}
            component="section"
            className="add-domain section flex"
          >
            <TextField
              id="text--domain"
              ref="domain"
              type="text"
              label="Domain Name"
              className="domain-name"
            />

            <Button
              primary
              raised
              iconChildren="add"
              onClick={() => this.onAdd()}
            >
              Add
            </Button>
          </Paper>
        );

      case this.views.REQUEST_ACCESS:
        return (
          <Paper
            zDepth={1}
            component="section"
            className="request-domain-access section flex"
          >
            <p>
              This domain has already been added to Ptorx's database and it may
              or may not be verified. You must request access from the user who
              first added this domain to Ptorx.
            </p>
            <p>
              Send the original creator the request key listed below. They will
              be able to grant you access to this domain with your request key
              key.
            </p>

            <div className="request-key">
              <TextField
                id="text--request-key"
                type="text"
                label="Request Key"
                value={this.state.requestKey}
              />
              <Button
                primary
                icon
                iconChildren="content_copy"
                onClick={() => copy(this.state.requestKey)}
              />
            </div>
          </Paper>
        );

      case this.views.VERIFY_DOMAIN:
        return (
          <Paper
            zDepth={1}
            component="section"
            className="verify-domain section flex"
          >
            <p>
              In order to complete setup, you must verify ownership of the
              provided domain by setting a few DNS records.
            </p>
            <p>
              See Ptorx's Help Docs for a full explanation regarding this setup
              process.
            </p>

            <DataTable plain>
              <TableHeader>
                <TableRow>
                  <TableColumn>Type</TableColumn>
                  <TableColumn>Hostname</TableColumn>
                  <TableColumn>Value</TableColumn>
                </TableRow>
              </TableHeader>

              <TableBody>
                <TableRow>
                  <TableColumn>TXT</TableColumn>
                  <TableColumn>{this.state.domain}</TableColumn>
                  <TableColumn>v=spf1 include:mailgun.org ~all</TableColumn>
                </TableRow>

                <TableRow>
                  <TableColumn>TXT</TableColumn>
                  <TableColumn>{this.state.domainKey.name}</TableColumn>
                  <TableColumn>
                    <a onClick={() => copy(this.state.domainKey.value)}>
                      Copy to clipboard
                    </a>
                  </TableColumn>
                </TableRow>

                <TableRow>
                  <TableColumn>CNAME</TableColumn>
                  <TableColumn>email.{this.state.domain}</TableColumn>
                  <TableColumn>mailgun.org</TableColumn>
                </TableRow>
              </TableBody>
            </DataTable>

            <br />

            <DataTable plain>
              <TableHeader>
                <TableRow>
                  <TableColumn>Type</TableColumn>
                  <TableColumn>Priority</TableColumn>
                  <TableColumn>Value</TableColumn>
                </TableRow>
              </TableHeader>

              <TableBody>
                <TableRow>
                  <TableColumn>MX</TableColumn>
                  <TableColumn>10</TableColumn>
                  <TableColumn>mxa.mailgun.org</TableColumn>
                </TableRow>

                <TableRow>
                  <TableColumn>MX</TableColumn>
                  <TableColumn>10</TableColumn>
                  <TableColumn>mxb.mailgun.org</TableColumn>
                </TableRow>
              </TableBody>
            </DataTable>

            <p>
              Once these records are set, click the button below to view your
              domain's status on Ptorx and to check if the records are valid.
            </p>

            <Button
              primary
              raised
              onClick={() =>
                (location.hash = '#/domains/' + this.state.domainId)
              }
            >
              View Domain
            </Button>
          </Paper>
        );
    }
  }
}
