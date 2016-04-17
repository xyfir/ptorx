import React from "react";

// Components
import Search from "../misc/Search";
import Create from "./Create";

// Constants
import { filterTypes } from "../../constants/types";

// Modules
import findMatches from "../../lib/find-matching";

export default class LinkFilter extends React.Component {

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
            <div className="link-filter">
                {
                    this.state.view == "search"
                    ? <a onClick={this.onChangeView.bind(this, "create")}>Switch to 'Create New Filter' Mode</a>
                    : <a onClick={this.onChangeView.bind(this, "search")}>Switch to 'Find Existing Filter' Mode</a>
                }
                {
                    this.state.view == "search"
                    ? (
                        <div>
                            <Search onSearch={this.onSearch} type="filter" />
                            <div className="list">{
                                findMatches(this.props.data.filters, this.state.search).map(f => {
                                    return (
                                        <div className="filter">
                                            <span className="type">{filterTypes[f.type]}</span>
                                            <span className="name"><a onClick={this.onAdd.bind(this, f.id)}>
                                                {f.name}
                                            </a></span>
                                            <span className="description">{f.description}</span>
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