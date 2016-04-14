import React from "react";

// Action creators
import { editFilter } from "../../actions/creators/filters";

// Constants
import { URL } from "../../constants/config";
import { filterTypes } from "../../constants/types";

// Modules
import ajax from "../../lib/ajax";

export default class UpdateFilter extends React.Component {

    constructor(props) {
        super(props);

        this._updateEmails = this._updateEmails.bind(this);
        this.onChangeType = this.onChangeType.bind(this);
        this.onUpdate = this.onUpdate.bind(this);

        this.state = {
            type: 0, id: location.hash.split('/')[2], loading: true
        };
        
        ajax({
            url: URL + "api/filters/" + this.state.id, success: (res) => {
                if (res.err) {
                    swal("Error", "Could not load data", "error");
                }
                else {
                    delete res.error;
                    
                    this.props.dispatch(editFilter(
                        Object.assign({}, this.props.data.filters.find(filter => {
                            return filter.id == this.state.id;
                        }), res)
                    ));

                    this.setState({
                        loading: false, type: this.props.data.filters.find(filter => {
                            return filter.id == this.state.id;
                        }).type
                    });
                }
            }
        });
    }

    onChangeType() {
        this.setState({ type: +this.refs.type.value });
    }

    onUpdate() {
        let data = {
            type: +this.refs.type.value, name: this.refs.name.value,
            description: this.refs.description.value, find: "",
            acceptOnMatch: +this.refs.acceptOnMatch.checked,
            useRegex: +this.refs.regex.checked
        };

        // Only header filters have different values than others
        if (data.type == 6)
            data.find = this.refs.headerName.value + ":::" + this.refs.headerValue.value;
        else
            data.find = this.refs.find.value;

        ajax({
            url: URL + "api/filters/" + this.state.id, method: "PUT",
            data, success: (res) => {
                if (res.error) {
                    swal("Error", res.message, "error");
                }
                else {
                    data.id = this.state.id;
                    this.props.dispatch(editFilter(
                        Object.assign({}, this.props.data.filters.find(f => {
                            return f.id == this.state.id;
                        }), data)
                    ));

                    location.hash = "filters/list";
                    swal("Success", `Filter '${data.name}' updated`, "success");
                    
                    // Filter was linked to emails that we must now trigger updates on
                    if (res.update !== undefined)
                        this._updateEmails(this.state.id, this.props.data.emails, res.update);
                }
            }
        });
    }

    _updateEmails(id, emails, update, index = 0) {
        if (update[index] === undefined) return;

        // Get email object
        let email = emails.find((e) => { return e.id == update[index]; });

        // All emails need to be loaded
        if (email === undefined) {
            ajax({
                url: URL + "api/emails", success: (res) => {
                    this._updateEmails(id, res.emails, update, index);
                }
            });
        }
        // Full email data needs to be loaded
        else if (email.toEmail === undefined) {
            ajax({
                url: URL + "api/emails/" + email.id, success: (res) => {
                    email = Object.assign(email, res);

                    emails.forEach((e, i) => {
                        if (e.id == email.id)
                            emails[i] = email;
                    });

                    this._updateEmails(id, emails, update, index);
                }
            });
        }
        // Update email
        else {
            const filters = email.filters.map(f => {
                return f.id;
            }).join(',');
            const modifiers = email.modifiers.map(mod => {
                return mod.id;
            }).join(',');
            
            ajax({
                url: URL + "api/emails/" + email.id, method: "PUT",
                data: {
                    name: email.name, description: email.description, to: mail.toEmail,
                    saveMail: +email.saveMail, noSpamFilter: +(!email.spamFilter),
                    filters, modifiers, noToAddress: +(email.address == '')
                }, success: (res) => {
                    this._updateEmails(id, emails, update, index + 1);
                }
            });
        }
    }

    render() {
        if (this.state.loading) return <div />;
        
        const filter = this.props.data.filters.find(f => { return f.id == this.state.id; });
        
        let form;
        if (this.state.type == 6) {
            const find = filter.find.split(":::");
            form = (
                <div>
                    <label>Header Name</label>
                    <span className="input-description">The header to look for.</span>
                    <input type="text" ref="headerName" defaultValue={find[0]} />
                    <label>Header Value</label>
                    <span className="input-description">The value in the header's value to look for.</span>
                    <input type="text" ref="headerValue" defaultValue={find[1]} />
                </div>
            );
        }
        else {
            form = (
                <div>
                    <label>Find</label>
                    <span className="input-description">The filter's find value that we look for in an email.</span>
                    <input type="text" ref="find" defaultValue={filter.find} />
                </div>
            );
        }
        
        return (
            <div className="filter-update">
                <label>Filter Type</label>
                <select ref="type" onChange={this.onChangeType} defaultValue={filter.type}>{
                    Object.keys(filterTypes).map(k => {
                        return <option value={k}>{filterTypes[k]}</option>;
                    })
                }</select>
                
                <label>Name</label>
                <span className="input-description">Give your filter a name to find it easier.</span>
                <input type="text" ref="name" defaultValue={filter.name} />
                <label>Description</label>
                <span className="input-description">Describe your filter to find it easier.</span>
                <input type="text" ref="description" defaultValue={filter.description} />
                
                <label>On Match Action</label>
                <span className="input-description">This is the action taken when an email message matches your filter. If <strong>Accept on Match</strong> is <em>enabled</em>, the message must match the filter <strong>and</strong> any other accept on match filters. If it is <em>disabled</em> and a message matches, it acts as a <strong>Reject on Match</strong> filter meaning that any messages that match this filter will be ignored.</span>
                <input type="checkbox" ref="acceptOnMatch" defaultChecked={filter.acceptOnMatch} />Accept on Match
                
                {form}
                
                <input type="checkbox" ref="regex" defaultChecked={filter.regex} />Use Regular Expression
                
                <hr />
                
                <button className="btn-primary" onClick={this.onUpdate}>Update Filter</button>
                
                <hr />
                
                <h3>Linked To</h3>
                <p>Below are emails that are currently utilizing this filter.</p>
                <div className="linked-emails">{
                    filter.linkedTo.map(email => {
                        return <a href={`#emails/edit/${email.id}`}>{email.address}</a>;
                    })
                }</div>
            </div>
        );
    }

}