import React from "react";

// Components
import Create from "./Create";

// Constants
import { modifierTypes } from "../../constants/types";

// Modules
import findMatches from "../../lib/find-matching";

export default class LinkModifier extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            view: "search", search: { query: "", type: 0 }
        };
        
        this.onSearch = this.onSearch.bind(this);
        this.onAdd = this.onAdd.bind(this);
    }
    
    onChangeView(view) {
        this.setState({ view });
    }
    
    onSearch() {
        this.setState({ search: {
            query: this.refs.search.value, type: +this.refs.type.value
        }});
    }
    
    onAdd(id) {
        this.props.onAdd(id);
    }

    render() {
        return (
            <div className="link-modifier">
                {
                    this.state.view == "search"
                    ? <a onClick={this.onChangeView.bind(this, "create")}>Switch to 'Create New Modifier' Mode</a>
                    : <a onClick={this.onChangeView.bind(this, "search")}>Switch to 'Find Existing Modifier' Mode</a>
                }
                {
                    this.state.view == "search"
                    ? (
                        <div>
                            <input
                                type="text"
                                ref="search"
                                onChange={this.onSearch}
                                placeholder="Search"
                            />
                            <select ref="type" onChange={this.onSearch}>{
                                [0].concat(Object.keys(modifierTypes)).map(k => {
                                    return (
                                        <option value={k}>{modifierTypes[k] || "All Types"}</option>
                                    );
                                })
                            }</select>
                            <div className="list">{
                                findMatches(this.props.data.modifiers, this.state.search).map(m => {
                                    return (
                                        <div className="modifier">
                                            <span className="type">{modifierTypes[m.type]}</span>
                                            <span className="name"><a onClick={this.onAdd.bind(this, m.id)}>
                                                {m.name}
                                            </a></span>
                                            <span className="description">{m.description}</span>
                                        </div>
                                    );
                                })
                            }</div>
                        </div>
                    ) : (
                        <Create
                            data={this.props.data}
                            dispatch={this.props.dispatch}
                            onCreate={this.onAdd}
                        />
                    )
                }
            </div>
        );
    }

}