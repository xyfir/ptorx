import React from "react";

// Constants
import { filterTypes, modifierTypes } from "../../constants/types";

export default class Search extends React.Component {
    
    constructor(props) {
        super(props);
        
        this.onSearch = this.onSearch.bind(this);
    }
    
    onSearch() {
        this.props.onSearch({
            query: this.refs.search.value,
            type: this.refs.type ? +this.refs.type.value : 0
        });
    }
    
    render() {
        let types;
        if (this.props.type == "filter")
            types = filterTypes;
        else if (this.props.type == "modifier")
            types = modifierTypes;
        
        return (
            <div className="search">
                <input
                    type="text"
                    ref="search"
                    onChange={this.onSearch}
                    placeholder="Search"
                />
                {
                    types !== undefined
                    ? (
                        <select ref="type" onChange={this.onSearch}>{
                            [0].concat(Object.keys(types)).map(k => {
                                return (
                                    <option value={k}>{types[k] || "All Types"}</option>
                                );
                            })
                        }</select>
                    ) : <div />
                }
            </div>
        )
    }
    
}