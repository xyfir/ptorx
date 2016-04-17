import React from "react";

// Action creators
import {
    loadFilters, deleteFilter
} from "../../actions/creators/filters";
import { loadEmails } from "../../actions/creators/emails";

// Constants
import { filterTypes } from "../../constants/types";
import { URL } from "../../constants/config";

// Modules
import ajax from "../../lib/ajax";
import findMatches from "../../lib/find-matching";

// Components
import Search from "../misc/Search";

export default class FilterList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            search: { query: "", type: 0 }
        };
        
        this.onSearch = this.onSearch.bind(this);

        if (props.data.filters.length == 0) {
            ajax({
                url: URL + "api/filters", success: (res) => {
                    this.props.dispatch(loadFilters(res.filters));
                }
            });
        }

        this._updateEmails = this._updateEmails.bind(this);
    }
    
    onSearch(search) {
        this.setState({ search });
    }

    onDeleteFilter(id) {
        swal({
            title: "Are you sure?",
            text: "This filter will be removed from any emails it is linked to.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!"
        }, () => {
            ajax({
                url: URL + "api/filters/" + id,
                method: "DELETE", success: (res) => {
                    if (res.error) {
                        swal("Error", "Could not delete filter", "error");
                    }
                    else {
                        this.props.dispatch(deleteFilter(id));

                        // Filter was linked to emails that we must now trigger updates on
                        if (res.update !== undefined)
                            this._updateEmails(id, this.props.data.emails, res.update);
                    }
                }
            });
        });
    }

    _updateEmails(id, emails, update, index = 0) {
        // Remove filter from email.filters for all linked filters
        if (update[index] === undefined) {
            update.forEach(e => {
                emails.forEach((email, i) => {
                    if (e == email.id) {
                        emails[i].filters = email.filters.filter(f => {
                            return f.id != id;
                        });
                    }
                });
            });
            this.props.dispatch(loadEmails(emails));
            return;
        }

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
            const filters = email.filters.filter(filter => {
                return filter.id != id;
            }).map(filter => {
                return filter.id;
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
        return (
            <div className="filters">
                <a href="#filters/create" className="btn btn-primary">Create a Filter</a>
                <hr />
                <Search onSearch={this.onSearch} type="filter" />
                <hr />
                <div className="list">{
                    findMatches(this.props.data.filters, this.state.search).map(filter => {
                        return (
                            <div className="filter">
                                <span className="type">{filterTypes[filter.type]}</span>
                                <span className="name"><a href={`#filters/edit/${filter.id}`}>
                                    {filter.name}
                                </a></span>
                                <span
                                    className="icon-trash"
                                    title="Delete Filter"
                                    onClick={this.onDeleteFilter.bind(this, filter.id) }
                                />
                                <span className="description">{filter.description}</span>
                            </div>
                        );
                    })
                }</div>
            </div>
        );
    }

}