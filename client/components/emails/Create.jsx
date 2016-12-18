import React from "react";

// Components
import LinkModifier from "components/modifiers/Link";
import LinkFilter from "components/filters/Link";

// Action creators
import { loadModifiers } from "actions/creators/modifiers";
import { loadFilters } from "actions/creators/filters";
import { addEmail } from "actions/creators/emails";

// Constants
import { RECAPTCHA_KEY } from "constants/config";
import { filterTypes, modifierTypes } from "constants/types";

// Modules
import parseQuery from "lib/parse-hash-query";
import request from "lib/request";

export default class CreateEmail extends React.Component {

    constructor(props) {
        super(props);

        this.onToggleShowAdvanced = this.onToggleShowAdvanced.bind(this);
        this.onAddModifier = this.onAddModifier.bind(this);
        this.onAddFilter = this.onAddFilter.bind(this);
        this.onCreate = this.onCreate.bind(this);

        this.state = {
            filters: [], modifiers: [], showAdvanced: false, loading: true
        };

        if (this.props.data.account.trial) {
            // Load recaptcha
            let element = document.createElement("script");
            element.src = "https://www.google.com/recaptcha/api.js";
            element.type = "text/javascript";
            document.body.appendChild(element);
        }
    }

    componentWillMount() {
        // Load modifiers / filters if needed
        if (!this.props.data.modifiers.length) {
            request("../api/modifiers", (modifiers) => {
                this.props.dispatch(loadModifiers(modifiers.modifiers));
            });
        }
        if (!this.props.data.filters.length) {
            request("../api/filters", (filters) => {
                this.props.dispatch(loadFilters(filters.filters));
            });
        }

        const q = parseQuery();

        // Load data from email with id q.copy
        if (q.copy) {
            const email = this.props.data.emails.find(
                e => e.id == q.copy
            );

            if (!email) return;

            request("../api/emails/" + q.copy, (res) => {
                if (!res.err) {
                    this.setState(Object.assign(
                        {}, email, res, { showAdvanced: true, loading: false }
                    ));
                }
            });
        }
        else {
            this.setState({ loading: false });
        }
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
                closeOnConfirm: true
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
        if (this.state.filters.find(f => f.id == id)) return;
        
        this.setState({
            filters: this.state.filters.concat([
                this.props.data.filters.find(f => f.id == id)
            ])
        });
    }

    onCreate() {
        const data = {
            to: 0,
            name: this.refs.name.value,
            address: this.refs.address.value,
            saveMail: +false,
            noToAddress: +false,
            noSpamFilter: +false,
            description: this.refs.description.value,
            modifiers: this.state.modifiers.map(m => m.id),
            filters: this.state.filters.map(f => f.id)
        };
        
        if (!this.state.showAdvanced || !this.refs.noToAddress.checked)
            data.to = +this.refs.to.value;
        
        if (this.state.showAdvanced) {
            data.noSpamFilter = +(!this.refs.spamFilter.checked);
            data.noToAddress = +this.refs.noToAddress.checked;
            data.saveMail = +this.refs.saveMail.checked;
        }

        if (this.props.data.account.trial) {
            data.recaptcha = grecaptcha.getResponse();

            if (!data.recaptcha) {
                swal("Error", "You must complete the captcha", "error");
                return;
            }
        }

        request({
            url: "../api/emails", method: "POST", data
        }, (res) => {
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
        });
    }

    render() {
        if (this.state.loading) return <div />;

        const email = this.state;
        
        return (
            <div className="email-create">
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
                
                <label>Address</label>
                <span className="input-description">
                    Customize your Ptorx address or leave it blank for a randomly generated address.
                </span>
                <input
                    type="text"
                    ref="address"
                    placeholder="user@ptorx.com"
                />
                
                <label>Redirect To</label>
                <span className="input-description">
                    This is your real email that messages sent to your Ptorx address will be redirected to.
                </span>
                <select ref="to" defaultValue={email.toEmail}>{
                    this.props.data.account.emails.map(e =>
                        <option value={e.id}>{e.address}</option>
                    )
                }</select>
                
                <hr />
                
                {this.state.showAdvanced ? (
                    <div className="advanced-settings">
                        <a onClick={this.onToggleShowAdvanced}>
                            Hide Advanced Settings
                        </a>
                        
                        <label>Spam Filter</label>
                        <span className="input-description">
                            By default we block any messages that are marked as spam. Disable this only if you believe legitimate messages are being blocked by the spam filter.
                        </span>
                        <input
                            type="checkbox"
                            ref="spamFilter"
                            defaultChecked={
                                email.name ? email.spamFilter : true
                            }
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
                            defaultChecked={
                                email.name ? email.saveMail : false
                            }
                        />Enable
                        
                        <label>No 'To' Address</label>
                        <span className="input-description">
                            Enabling this will allow you to avoid having emails sent to your Ptorx address redirected to your real email. This will act like the <em>Save Mail</em> feature just without the emails being redirected.
                        </span>
                        <input
                            type="checkbox"
                            ref="noToAddress"
                            defaultChecked={
                                email.name ? email.noToAddress : false
                            }
                        />Enable

                        <hr />

                        <h3>Filters</h3>
                        <p>Create or select filters for your new email to use.</p>
                        <div className="linked-filters">{
                            this.state.filters.map(filter =>
                                <div className="filter">
                                    <span className="type">{
                                        filterTypes[filter.type]
                                    }</span>
                                    <span className="name">{
                                        filter.name
                                    }</span>
                                    <span
                                        className="icon-trash"
                                        title="Remove Filter"
                                        onClick={
                                            this.onRemoveFilter
                                                .bind(this, filter.id)
                                        }
                                    />
                                    <span className="description">{
                                        filter.description
                                    }</span>
                                </div>
                            )
                        }</div>

                        <LinkFilter
                            data={this.props.data}
                            onAdd={this.onAddFilter}
                        />

                        <hr />

                        <h3>Modifiers</h3>
                        <p>
                            Create or select modifiers for your new email to use.
                            <br />
                            <strong>Note:</strong> The order in which the modifiers are listed are the order in which they are applied to emails.
                        </p>
                        <div className="linked-modifiers">{
                            this.state.modifiers.map(mod =>
                                <div className="modifier">
                                    <span className="type">{
                                        modifierTypes[mod.type]
                                    }</span>
                                    <span className="name">{
                                        mod.name
                                    }</span>
                                    <span
                                        className="icon-trash"
                                        title="Remove Modifier"
                                        onClick={
                                            this.onRemoveModifier
                                                .bind(this, mod.id)
                                        }
                                    />
                                    <span className="description">{
                                        mod.description
                                    }</span>
                                </div>
                            )
                        }</div>

                        <LinkModifier
                            data={this.props.data}
                            onAdd={this.onAddModifier}
                        />
                    </div>
                ) : (
                    <a onClick={this.onToggleShowAdvanced}>
                        Show Advanced Settings
                    </a>
                )}
                
                <hr />

                {this.props.data.account.trial ? (
                    <div className="recaptcha-wrapper">
                        <div
                            className="g-recaptcha"
                            data-sitekey={RECAPTCHA_KEY}
                        />
                    </div>
                ) : (
                    <div />    
                )}
                
                <button className="btn-primary" onClick={this.onCreate}>
                    Create Email
                </button>
            </div>
        );
    }

}