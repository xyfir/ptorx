import React from "react";

// Components
import LinkModifier from "components/modifiers/Link";
import LinkFilter from "components/filters/Link";

// Action creators
import { loadModifiers } from "actions/creators/modifiers";
import { loadFilters } from "actions/creators/filters";
import { editEmail } from "actions/creators/emails";

// Constants
import { URL } from "constants/config";
import { filterTypes, modifierTypes } from "constants/types";

// Modules
import request from "lib/request";

export default class UpdateEmail extends React.Component {

    constructor(props) {
        super(props);

        this.onAddModifier = this.onAddModifier.bind(this);
        this.onAddFilter = this.onAddFilter.bind(this);
        this.onUpdate = this.onUpdate.bind(this);

        this.state = {
            id: location.hash.split('/')[2], loading: true,
            filters: [], modifiers: []
        };

        const email = this.props.data.emails.find(e => e.id == this.state.id);

        if (email === undefined) {
            location.href = "#emails/list";
        }
        
        request({
            url: URL + "api/emails/" + this.state.id, success: (res) => {
                if (res.err) {
                    swal("Error", "Could not load data", "error");
                    return;
                }
                
                delete res.error;
                this.props.dispatch(editEmail(
                    Object.assign({}, email, res)
                ));

                this.setState({
                    loading: false, filters: res.filters,
                    modifiers: res.modifiers
                });
                
                // Load modifiers / filters if needed
                if (!this.props.data.filters.length) {
                    request({
                        url: URL + "api/filters", success: (filters) => {     
                            this.props.dispatch(
                                loadFilters(filters.filters)
                            );
                        }
                    });
                }
                if (!this.props.data.modifiers.length) {
                    request({
                        url: URL + "api/modifiers", success: (modifiers) => {
                            this.props.dispatch(
                                loadModifiers(modifiers.modifiers)
                            );
                        }
                    });
                }
            }
        });
    }

    onMoveModifierDown(id) {
        let mods = this.state.modifiers.slice(0);
        const i = mods.findIndex(m => m.id == id);

        // Swap indexes with next sibling
        // Ensure modifier is not last in array
        if (i != -1 && i != mods.length - 1) {
            const a = Object.assign({}, mods[i]);
            const b = Object.assign({}, mods[i + 1]);

            mods[i] = b, mods[i + 1] = a;

            this.setState({ modifiers: mods }); 
        }
    }

    onMoveModifierUp(id) {
        let mods = this.state.modifiers.slice(0);
        const i = mods.findIndex(m => m.id == id);

        // Swap indexes with previous sibling
        // Ensure modifier is not first in array
        if (i > 0) {
            const a = Object.assign({}, mods[i]);
            const b = Object.assign({}, mods[i - 1]);

            mods[i] = b, mods[i - 1] = a;

            this.setState({ modifiers: mods }); 
        }
    }

    onRemoveModifier(id) {
        this.setState({
            modifiers: this.state.modifiers.filter(mod => mod.id != id)
        });
    }

    onRemoveFilter(id) {
        this.setState({
            filters: this.state.filters.filter(f => f.id != id)
        });
    }

    onAddModifier(id) {
        if (this.state.modifiers.find(m => {
            return m.id == id;
        }) !== undefined) return;
        
        this.setState({
            modifiers: this.state.modifiers.concat([
                this.props.data.modifiers.find(m => m.id == id)
            ])
        });
    }

    onAddFilter(id) {
        if (this.state.filters.find(f => {
            return f.id == id;
        }) !== undefined) return;
        
        this.setState({
            filters: this.state.filters.concat([
                this.props.data.filters.find(f => f.id == id)
            ])
        });
    }

    onUpdate() {
        let data = {
            to: this.props.data.account.emails.find(e =>
                e.address == this.refs.to.value
            ).id,
            name: this.refs.name.value,
            saveMail: +this.refs.saveMail.checked,
            description: this.refs.description.value,
            filters: this.state.filters.map(f => f.id),
            noToAddress: +this.refs.noToAddress.checked,
            noSpamFilter: +(!this.refs.spamFilter.checked),
            modifiers: this.state.modifiers.map(m => m.id)
        };

        request({
            url: URL + "api/emails/" + this.state.id, method: "PUT", data,
            success: (res) => {
                if (res.error) {
                    swal("Error", res.message, "error");
                }
                else {
                    // data.to (id) -> data.toEmail (address)
                    data.toEmail = this.props.data.account.emails.find(e =>
                        e.id == data.to
                    ).address; delete data.to;
                    
                    // Set address
                    if (data.noToAddress) {
                        data.address = "";
                    }
                    else {
                        data.address = this.props.data.emails.find(e =>
                            e.id == this.state.id
                        ).address;
                    }
                    delete data.noToAddress;
                    
                    // data.modifiers|filters from id array -> object array
                    data.modifiers = data.modifiers.map(m =>
                        this.props.data.modifiers.find(mod => m == mod.id)
                    );
                    data.filters = data.filters.map(f =>
                        this.props.data.filters.find(filter => f == filter.id)
                    );
                    
                    data.id = this.state.id;
                    
                    this.props.dispatch(editEmail(data));

                    location.hash = "emails/list";
                    swal("Success", `Email '${data.name}' updated`, "success");
                }
            }
        });
    }

    render() {
        if (this.state.loading) return <div />;
        
        const email = this.props.data.emails.find(e => { return e.id == this.state.id; });
        
        return (
            <div className="email-update">
                <nav className="navbar-sub">
                    <a href={`#emails/messages/${this.state.id}/send`}>
                        Send Message
                    </a>
                    <a href={`#emails/messages/${this.state.id}/list`}>
                        Messages
                    </a>
                </nav>
            
                <span className="address">{email.address}</span>
            
                <hr />
            
                <label>Name</label>
                <span className="input-description">
                    Give your email a name to find it easier.
                </span>
                <input type="text" ref="name" defaultValue={email.name} />
                
                <label>Description</label>
                <span className="input-description">
                    Describe your email to find it easier.
                </span>
                <input
                    type="text"
                    ref="description"
                    defaultValue={email.description}
                />
                
                <hr />
                
                <label>Redirect To</label>
                <span className="input-description">
                    This is your real email that messages sent to your Ptorx address will be redirected to.
                </span>
                <select ref="to" defaultValue={email.toEmail}>{
                    this.props.data.account.emails.map(e => {
                        return (
                            <option value={e.address}>{e.address}</option>
                        );
                    })
                }</select>
                
                <hr />
                
                <label>Spam Filter</label>
                <span className="input-description">
                    By default we block any messages that are marked as spam. Disable this only if you believe legitimate messages are being blocked by the spam filter.
                </span>
                <input
                    type="checkbox"
                    ref="spamFilter"
                    defaultChecked={email.spamFilter}
                />Enable
                
                <label>Save Mail</label>
                <span className="input-description">
                        Any emails that are sent to this address will be temporarily stored for 3 days. You can then access the messages by viewing the 'Messages' section when viewing this email's info.
                        <br />
                        'Rejected' emails that don't match your filters will also be saved in a separate section for only rejected emails. If you have 'Spam Filter' enabled, messages detected as spam will <em>not</em> be stored at all.
                        <br />
                        This option is required if you want to reply to emails.
                    </span>
                <input
                    type="checkbox"
                    ref="saveMail"
                    defaultChecked={email.saveMail}
                />Enable
                
                <label>No 'To' Address</label>
                <span className="input-description">
                    Enabling this will allow you to avoid having emails sent to your Ptorx address redirected to your real email. This will act like the <em>Save Mail</em> feature just without the emails being redirected.
                </span>
                <input
                    type="checkbox"
                    ref="noToAddress"
                    defaultChecked={email.address == ''}
                />Enable

                <hr />

                <h3>Filters</h3>
                <p>Create or select filters for your email to use.</p>
                <div className="linked-filters">{
                    this.state.filters.map(filter => {
                        return (
                            <div className="filter">
                                <span className="type">{
                                    filterTypes[filter.type]
                                }</span>
                                <span className="name">{filter.name}</span>
                                <span
                                    className="icon-trash"
                                    title="Remove Filter"
                                    onClick={() => this.onRemoveFilter(filter.id)}
                                />
                                <span className="description">{
                                    filter.description
                                }</span>
                            </div>
                        );
                    })
                }</div>

                <LinkFilter data={this.props.data} onAdd={this.onAddFilter} />

                <hr />

                <h3>Modifiers</h3>
                <p>
                    Create or select modifiers for your email to use.
                    <br />
                    <strong>Note:</strong> The order in which the modifiers are listed are the order in which they are applied to emails.
                </p>
                <div className="linked-modifiers">{
                    this.state.modifiers.map(mod => {
                        return (
                            <div className="modifier">
                                <span className="type">{
                                    modifierTypes[mod.type]
                                }</span>
                                <span className="name">{mod.name}</span>
                                <span className="description">{
                                    mod.description
                                }</span>
                                <div className="controls">
                                    <a
                                        className="icon-trash"
                                        onClick={
                                            () => this.onRemoveModifier(mod.id)
                                        }
                                    >Remove</a>

                                    <a
                                        className="icon-arrow-up"
                                        onClick={() => {
                                            this.onMoveModifierUp(mod.id);
                                        }}
                                        title="Change modifier order"
                                    >Up</a>
                                    <a
                                        className="icon-arrow-down"
                                        onClick={() => {
                                            this.onMoveModifierDown(mod.id);
                                        }}
                                        title="Change modifier order"
                                    >Down</a>
                                </div>
                            </div>
                        );
                    })
                }</div>

                <LinkModifier data={this.props.data} onAdd={this.onAddModifier} />
                
                <hr />
                
                <button className="btn-primary" onClick={this.onUpdate}>
                    Update Email
                </button>
            </div>
        );
    }

}