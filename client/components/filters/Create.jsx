import React from "react";

// Action creators
import { addFilter } from "../../actions/creators/filters";

// Constants
import { URL } from "../../constants/config";
import { filterTypes } from "../../constants/types";

// Modules
import ajax from "../../lib/ajax";

export default class CreateFilter extends React.Component {

    constructor(props) {
        super(props);

        this.onChangeType = this.onChangeType.bind(this);
        this.onCreate = this.onCreate.bind(this);

        this.state = { type: 0 };
    }

    onChangeType() {
        this.setState({ type: +this.refs.type.value });
    }

    onCreate() {
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
            url: URL + "api/filters", method: "POST", data,
            success: (res) => {
                if (res.error) {
                    swal("Error", res.message, "error");
                }
                else {
                    // Add to state.filters
                    data.id = res.id;
                    this.props.dispatch(addFilter(data));

                    if (this.props.onCreate) {
                        this.props.onCreate(res.id);
                    }
                    else {
                        location.hash = "filters/list";
                        swal("Success", `Filter '${data.name}' created`, "success");
                    }
                }
            }
        });
    }

    render() {
        let form;
        if (this.state.type == 6) {
            form = (
                <div>
                    <label>Header Name</label>
                    <span className="input-description">The header to look for.</span>
                    <input type="text" ref="headerName" />
                    <label>Header Value</label>
                    <span className="input-description">The value in the header's value to look for.</span>
                    <input type="text" ref="headerValue" />
                </div>
            );
        }
        else {
            form = (
                <div>
                    <label>Find</label>
                    <span className="input-description">The filter's find value that we look for in an email.</span>
                    <input type="text" ref="find" />
                </div>
            );
        }
        
        return (
            <div className="filter-create">
                <label>Filter Type</label>
                <select ref="type" onChange={this.onChangeType}>{
                    Object.keys(filterTypes).map(k => {
                        return <option value={k}>{filterTypes[k]}</option>;
                    })
                }</select>
                <label>Name</label>
                <span className="input-description">Give your filter a name to find it easier.</span>
                <input type="text" ref="name" />
                <label>Description</label>
                <span className="input-description">Describe your filter a name to find it easier.</span>
                <input type="text" ref="description" />
                <input type="checkbox" ref="regex" />Use Regular Expression
                <label>On Match Action</label>
                <span className="input-description">This is the action taken when an email message matches your filter. If <strong>Accept on Match</strong> is <em>enabled</em>, the message must match the filter <strong>and</strong> any other accept on match filters. If it is <em>disabled</em> and a message matches, it acts as a <strong>Reject on Match</strong> filter meaning that any messages that match this filter will be ignored.</span>
                <input type="checkbox" ref="acceptOnMatch" />Accept on Match
                <hr />
                {form}
                <hr />
                <button className="btn-primary" onClick={this.onCreate}>Create Filter</button>
            </div>
        );
    }

}