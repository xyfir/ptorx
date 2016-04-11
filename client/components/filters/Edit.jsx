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

        this.onChangeType = this.onChangeType.bind(this);
        this.onUpdate = this.onUpdate.bind(this);

        this.state = {
            type: 0, id: location.hash.split('/')[2], loading: true
        };
        
        ajax({
            url: URL + "api/filters/" + this.state.id, success: (res) => {
                if (err) {
                    swal("Error", "Could not load data", "error");
                }
                else {
                    delete res.error;
                    this.props.dispatch(editFilter(
                        Object.assign({}, this.props.data.filters.find(filter => {
                            return filter.id == this.state.id;
                        }), res)
                    ));

                    this.setState({ loading: false });
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
            url: URL + "api/filters" + this.state.id, method: "PUT",
            data, success: (res) => {
                if (res.error) {
                    swal("Error", "Could not update filter", "error");
                }
                else {
                    data.id = this.state.id;
                    this.props.dispatch(editFilter(data));

                    location.hash = "filters/list";
                    swal("Success", `Filter '${data.name}' updated`, "success");
                }
            }
        });
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
                <span className="input-description">Describe your filter a name to find it easier.</span>
                <input type="text" ref="description" defaultValue={filter.description} />
                <input type="checkbox" ref="regex" defaultChecked={filter.regex} />Use Regular Expression
                <label>On Match Action</label>
                <span className="input-description">This is the action taken when an email message matches your filter. If <strong>Accept on Match</strong> is <em>enabled</em>, the message must match the filter <strong>and</strong> any other accept on match filters. If it is <em>disabled</em> and a message matches, it acts as a <strong>Reject on Match</strong> filter meaning that any messages that match this filter will be ignored.</span>
                <input type="checkbox" ref="acceptOnMatch" defaultChecked={filter.acceptOnMatch} />Accept on Match
                <hr />
                {form}
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