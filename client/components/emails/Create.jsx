import React from "react";

// Components
import LinkModifier from "../../components/modifiers/Link";
import LinkFilter from "../../components/filters/Link";

// Action creators
import { addEmail } from "../../actions/creators/emails";

// Constants
import { URL } from "../../constants/config";
import { filterTypes, modifierTypes } from "../../constants/types";

// Modules
import ajax from "../../lib/ajax";

export default class CreateEmail extends React.Component {

    constructor(props) {
        super(props);

        this.onCreate = this.onCreate.bind(this);

        this.state = {
            filters: [], modifiers: [], showAdvanced: false
        };
    }
    
    onToggleShowAdvanced() {
        if (this.state.showAdvanced) {
            swal({
                title: "Are you sure?",
                text: "Any values set in 'Advanced Settings' will be lost.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Continue",
                closeOnConfirm: false
            }, () => {
                this.setState({ showAdvanced: false });
            });
        }
        else {
            this.setState({ showAdvanced: true });
        }
    }

    onRemoveModifier(id) {
        this.setState({
            modifiers: this.state.modifiers.filter(mod => { return mod.id != id; })
        });
    }

    onRemoveFilter(id) {
        this.setState({
            filters: this.state.filters.filter(f => { return f.id != id; })
        });
    }

    onAddModifier(id) {
        this.setState({
            modifiers: this.state.modifiers.concat([
                this.props.data.modifiers.find(m => { return m.id == id; })
            ])
        });
    }

    onAddFilter(id) {
        this.setState({
            filters: this.state.filters.concat([
                this.props.data.filters.find(f => { return f.id == id; })
            ])
        });
    }

    onCreate() {
        let data = {
            name: this.refs.name.value, description: this.refs.description.value
        };

        ajax({
            url: URL + "api/emails", method: "POST", data,
            success: (res) => {
                if (res.error) {
                    swal("Error", res.message, "error");
                }
                else {
                    // Add to state.emails
                    data.id = res.id;
                    this.props.dispatch(addEmail(data));

                    location.hash = "emails/list";
                    swal("Success", `Email '${data.name}' created`, "success");
                }
            }
        });
    }

    render() {
        const isPremium = this.props.data.account.subscription > Date.now();
        
        return (
            <div className="email-create">
                <label>Name</label>
                <span className="input-description">Give your email a name to find it easier.</span>
                <input type="text" ref="name" />
                
                <label>Description</label>
                <span className="input-description">Describe your email a name to find it easier.</span>
                <input type="text" ref="description" />
                
                <hr />
                
                { // Ptorx Address
                    isPremium
                    ? (
                        <div>
                            <label>Address</label>
                            <span className="input-description">Customize your Ptorx address or leave it blank for a randomly generated address.</span>
                            <input type="text" ref="address" />
                        </div>
                    ) : (
                        <div />
                    )
                }
                
                <label>Redirect To</label>
                <span className="input-description">This is your real email that messages sent to your Ptorx address will be redirected to.</span>
                <select ref="to">{
                    this.props.data.account.emails.map(email => {
                        return <option value={email.id}>{email.address}</option>;
                    })
                }</select>
                
                <hr />
                
                { // Advanced Settings (filters, modifiers, ...)
                    this.state.showAdvanced
                    ? (
                        <div className="advanced-settings">
                            <a onClick={this.onToggleShowAdvanced}>Hide Advanced Settings</a>
                            
                            <label>Spam Filter</label>
                            <span className="input-description">By default we block any messages that are marked as spam. Disable this only if you believe legitimate messages are being blocked by the spam filter.</span>
                            <input type="checkbox" ref="spamFilter" defaultChecked={true} />Enable
                            
                            { // Save Mail, No To Address
                                isPremium
                                ? (
                                    <div>
                                        <label>Save Mail</label>
                                        <span className="input-description">Any emails that are sent to this address will be temporarily stored for 3 days. You can then access the messages by viewing the <em>Messages</em> section when viewing this email's info. <strong>Note:</strong> This is required if you want to reply to emails.</span>
                                        <input type="checkbox" ref="saveMail" />Enable
                                        
                                        <label>No 'To' Address</label>
                                        <span className="input-description">Enabling this will allow you to avoid having emails sent to your Ptorx address redirected to your real email. This will act like the <em>Save Mail</em> feature just without the emails being redirected.</span>
                                        <input type="checkbox" ref="noToAddress" />Enable
                                    </div>
                                ) : (
                                    <div />
                                )
                            }

                            <h3>Filters</h3>
                            <p>Create or select filters for your new email to use.</p>
                            <div className="linked-filters">{
                                this.state.filters.map(filter => {
                                    return (
                                        <div className="filter">
                                            <span className="type">{filterTypes[filter.type]}</span>
                                            <span className="name">{filter.name}</span>
                                            <span
                                                className="icon-trash"
                                                title="Remove Filter"
                                                onClick={this.onRemoveFilter.bind(this, filter.id) }
                                            />
                                            <hr />
                                            <span className="description">{filter.description}</span>
                                        </div>
                                    );
                                })
                            }</div>

                            <LinkFilter data={this.props.data} onAdd={this.onAddFilter} />

                            <hr />

                            <h3>Modifiers</h3>
                            <p>
                                Create or select modifiers for your new email to use.
                                <br />
                                <strong>Note:</strong> The order in which the modifiers are listed are the order in which they are applied to emails.
                            </p>
                            <div className="linked-modifiers">{
                                this.state.modifiers.map(mod => {
                                    return (
                                        <div className="filter">
                                            <span className="type">{modifierTypes[mod.type]}</span>
                                            <span className="name">{mod.name}</span>
                                            <span
                                                className="icon-trash"
                                                title="Remove Filter"
                                                onClick={this.onRemoveModifier.bind(this, mod.id) }
                                            />
                                            <hr />
                                            <span className="description">{mod.description}</span>
                                        </div>
                                    );
                                })
                            }</div>

                            <LinkModifier data={this.props.data} onAdd={this.onAddModifier} />
                        </div>
                    ) : (
                        <a onClick={this.onToggleShowAdvanced}>Show Advanced Settings</a>
                    )
                }
                
                <hr />
                
                <button className="btn-primary" onClick={this.onCreate}>Create Email</button>
            </div>
        );
    }

}