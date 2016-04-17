import React from "react";

// Action creators
import {
    loadModifiers, deleteModifier
} from "../../actions/creators/modifiers";
import { loadEmails } from "../../actions/creators/emails";

// Constants
import { URL } from "../../constants/config";
import { modifierTypes } from "../../constants/types";

// Modules
import ajax from "../../lib/ajax";
import findMatches from "../../lib/find-matching";

// Components
import Search from "../misc/Search";

export default class ModifierList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            search: { query: "", type: 0 }
        };
        
        this.onSearch = this.onSearch.bind(this);

        if (props.data.modifiers.length == 0) {
            ajax({
                url: URL + "api/modifiers", success: (res) => {
                    this.props.dispatch(loadModifiers(res.modifiers));
                }
            });
        }
    }

    onSearch(search) {
        this.setState({ search });
    }

    onDeleteModifier(id) {
        swal({
            title: "Are you sure?",
            text: "This modifier will be removed from any emails it is linked to.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!"
        }, () => {
            ajax({
                url: URL + "api/modifiers/" + id,
                method: "DELETE", success: (res) => {
                    if (res.error) {
                        swal("Error", "Could not delete modifier", "error");
                    }
                    else {
                        this.props.dispatch(deleteModifier(id));

                        let emails = this.props.data.emails;

                        // Remove any instances of modifier where linked to emails
                        emails.forEach((email, i) => {
                            email.modifiers = email.modifiers.filter(mod => { return mod.id != id; });
                            emails[i] = email;
                        });
                        this.props.dispatch(loadEmails(emails));
                    }
                }
            });
        });
    }

    render() {
        return (
            <div className="modifiers">
                <a href="#modifiers/create" className="btn btn-primary">Create a Modifier</a>
                <hr />
                <Search onSearch={this.onSearch} type="modifier" />
                <hr />
                <div className="list">{
                    findMatches(this.props.data.modifiers, this.state.search).map(mod => {
                        return (
                            <div className="modifier">
                                <span className="type">{modifierTypes[mod.type]}</span>
                                <span className="name"><a href={`#modifiers/edit/${mod.id}`}>
                                    {mod.name}
                                </a></span>
                                <span
                                    className="icon-trash"
                                    title="Delete Modifier"
                                    onClick={this.onDeleteModifier.bind(this, mod.id) }
                                />
                                <span className="description">{mod.description}</span>
                            </div>
                        );
                    })
                }</div>
            </div>
        );
    }

}