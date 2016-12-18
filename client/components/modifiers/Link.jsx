import React from "react";

// Components
import Search from "components/misc/Search";
import Create from "./Create";

// Constants
import { modifierTypes } from "constants/types";

// Modules
import findMatches from "lib/find-matching";

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
    
    onSearch(search) {
        this.setState({ search });
    }
    
    onAdd(id) {
        this.props.onAdd(id);
    }

    render() {
        return (
            <div className="link-modifier">
                {this.state.view == "search" ? (
                    <a onClick={() => this.onChangeView("create")}>
                        Switch to 'Create New Modifier' Mode
                    </a>
                ) : (
                    <a onClick={() => this.onChangeView("search")}>
                        Switch to 'Find Existing Modifier' Mode
                    </a>
                )}
                
                {this.state.view == "search" ? (
                    <div>
                        <Search onSearch={this.onSearch} type="modifier" />
                        <div className="list">{
                            findMatches(
                                this.props.data.modifiers, this.state.search
                            ).map(m =>
                                <div className="modifier">
                                    <span className="type">{
                                        modifierTypes[m.type]
                                    }</span>
                                    <span className="name">
                                        <a onClick={() => this.onAdd(m.id)}>
                                            {m.name}
                                        </a>
                                    </span>
                                    <span className="description">{
                                        m.description
                                    }</span>
                                </div>
                            )
                        }</div>
                    </div>
                ) : (
                    <Create
                        data={this.props.data}
                        dispatch={this.props.dispatch}
                        onCreate={this.onAdd}
                    />
                )}
            </div>
        );
    }

}