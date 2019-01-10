import * as React from 'react';
import * as copy from 'copyr';
import * as swal from 'sweetalert';
import { Link } from 'react-router-dom';
import { api } from 'lib/api';
import {
  TableColumn,
  TableHeader,
  DataTable,
  TableBody,
  TextField,
  TableRow,
  Button,
  Paper
} from 'react-md';

export class AddDomain extends React.Component {
  constructor(props) {
    super(props);

    this.views = {
      ADD: 'add',
      VERIFY_DOMAIN: 'verify',
      REQUEST_ACCESS: 'request'
    };
    this.state = {
      view: this.views.ADD,
      requestKey: '',
      domainId: 0,
      domainKey: {},
      domain: ''
    };
  }

  onAdd() {
    const domain = this.refs.domain.value;

    api
      .post('/domains', { domain })
      .then(res => {
        if (res.data.requestKey) {
          this.setState({
            view: this.views.REQUEST_ACCESS,
            requestKey: res.data.requestKey
          });
        } else if (res.data.domainId) {
          this.setState({
            view: this.views.VERIFY_DOMAIN,
            domain,
            domainId: res.data.domainId,
            domainKey: res.data.domainKey
          });
          // ** addDomain({
          //   id: res.data.domainId,
          //   domain,
          //   isCreator: true
          // })
        }
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
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
                  <TableColumn>
                    email.
                    {this.state.domain}
                  </TableColumn>
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

            <Link to={`/app/domains/view/${this.state.domainId}`}>
              <Button primary raised>
                View Domain
              </Button>
            </Link>
          </Paper>
        );
    }
  }
}
