import React from "react";

// Action creators
import { editModifier } from "../../actions/creators/modifiers";

// Constants
import { URL } from "../../constants/config";
import { modifierTypes } from "../../constants/types";

// Modules
import ajax from "../../lib/ajax";

export default class UpdateModifier extends React.Component {

    constructor(props) {
        super(props);

        this.onChangeType = this.onChangeType.bind(this);
        this.onUpdate = this.onUpdate.bind(this);

        this.state = {
            type: 0, id: location.hash.split('/')[2], loading: true
        };

        ajax({
            url: URL + "api/modifiers/" + this.state.id, success: (res) => {
                if (err) {
                    swal("Error", "Could not load data", "error");
                }
                else {
                    delete res.error;
                    this.props.dispatch(editModifier(
                        Object.assign({}, this.props.data.modifiers.find(mod => {
                            return mod.id == this.state.id;
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
            description: this.refs.description.value
        }, data2;

        switch (data.type) {
            case 1:
                data2 = { key: this.refs.key.value }; break;

            case 2:
                data2 = ""; break;

            case 3:
                data2 = {
                    value: this.refs.find.value, with: this.refs.replace.value,
                    regex: +this.refs.regex.checked
                }; break;

            case 4:
                data2 = this.refs.subject.value; break;

            case 5:
                data2 = {
                    value: this.refs.tag.value, prepend: +this.refs.prepend.checked
                }; break;
        }

        ajax({
            url: URL + "api/modifiers" + this.state.id, method: "PUT",
            data: Object.assign({}, data, data2), success: (res) => {
                if (res.error) {
                    swal("Error", "Could not update modifier", "error");
                }
                else {
                    data.id = this.state.id;
                    data.data = data2;
                    this.props.dispatch(editModifier(data));

                    location.hash = "modifiers/list";
                    swal("Success", `Modifier '${data.name}' updated`, "success");
                }
            }
        });
    }

    render() {
        if (this.state.loading) return <div />;
        
        const mod = this.props.data.modifiers.find(mod => { return mod.id == this.state.id; });
        
        let form;
        switch (this.state.type) {
            case 1:
                form = (
                    <div>
                        <label>Encryption Key</label>
                        <span className="input-description">Email text and HTML content will be encrypted with this key using AES-256.</span>
                        <input type="text" ref="key" defaultValue={mod.data} />
                    </div>
                ); break;

            case 2:
                form = (
                    <p>HTML will be stripped from all emails leaving plain text.</p>
                ); break;

            case 3:
                form = (
                    <div>
                        <label>Find</label>
                        <span className="input-description">The value to be replaced.</span>
                        <input type="text" ref="find" defaultValue={mod.data.value} />
                        <label>Replace</label>
                        <span className="input-description">The value which replaces 'Find'.</span>
                        <input type="text" ref="replace" defaultValue={mod.data.with} />
                        <input type="checkbox" ref="regex" defaultChecked={mod.data.regex} />Use Regular Expression
                    </div>
                ); break;

            case 4:
                form = (
                    <div>
                        <label>Subject</label>
                        <span className="input-description">The text to replace an email's subject with.</span>
                        <input type="text" ref="subject" defaultValue={mod.data} />
                    </div>
                ); break;

            case 5:
                form = (
                    <div>
                        <label>Subject Tag</label>
                        <span className="input-description">The value to append or prepend to an email's subject.</span>
                        <input type="text" ref="tag" defaultValue={mod.data.value} />
                        <input type="checkbox" ref="prepend" defaultChecked={mod.data.prepend} />Prepend Tag
                    </div>
                ); break;
        }
        
        return (
            <div className="modifier-update">
                <label>Modifier Type</label>
                <select ref="type" onChange={this.onChangeType} defaultValue={mod.type}>{
                    Object.keys(modifierTypes).map(k => {
                        return <option value={k}>{modifierTypes[k]}</option>;
                    })
                }</select>
                <label>Name</label>
                <span className="input-description">Give your modifier a name to find it easier.</span>
                <input type="text" ref="name" defaultValue={mod.name} />
                <label>Description</label>
                <span className="input-description">Describe your modifier a name to find it easier.</span>
                <input type="text" ref="description" defaultValue={mod.description} />
                <hr />
                {form}
                <hr />
                <button className="btn-primary" onClick={this.onUpdate}>Update Modifier</button>
                <hr />
                <h3>Linked To</h3>
                <p>Below are emails that are currently utilizing this modifier.</p>
                <div className="linked-emails">{
                    mod.linkedTo.map(email => {
                        return <a href={`emails/edit/${email.id}`}>{email.address}</a>;
                    })
                }</div>
            </div>
        );
    }

}