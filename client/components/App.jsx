import React from "react";
import { render } from "react-dom";

// Redux store / reducers
import { createStore } from "redux";
import reducers from "../reducers/";

// Components
import Modifiers from "./modifiers/";
import Account from "./account/";
import Filters from "./filters/";
import Emails from "./emails/";

// Modules
import setState from "../lib/set-state";
import ajax from "../lib/ajax";

// Constants
import { INITIALIZE_STATE } from "../actions/types/";
import { URL, XACC } from "../constants/config";

let store = createStore(reducers);

class App extends React.Component {

    constructor(props) {
        super(props);

        store.subscribe(() => {
            this.setState(store.getState());
        });

        if (location.href.indexOf("http://localhost") == 0) {
            store.subscribe(() => {
                console.log(store.getState());
            });
        }

        const initialize = () => {
            let state = {
                modifiers: [], filters: [], account: {
                    emails: [], subscription: 0
                },
                emails: [], view: ""
            };

            ajax({
                url: URL + "api/account", success: (res) => {
                    state.account = res;
                    
                    this.state = state;

                    // Push initial state to store
                    store.dispatch({
                        type: INITIALIZE_STATE, state
                    });

                    // Set state based on current url hash
                    setState(store);
                    
                    // Update state according to url hash
                    window.onhashchange = () => setState(store);
                }
            })            
        };

        // Attempt to login using XID/AUTH or skip to initialize()
        if (location.href.indexOf("xid=") > -1 && location.href.indexOf("auth=") > -1) {
            // Login using XID/AUTH_TOKEN
            let xid = location.href.substring(
                location.href.lastIndexOf("?xid=") + 5,
                location.href.lastIndexOf("&auth")
            );
            let auth = location.href.substring(
                location.href.lastIndexOf("&auth=") + 6
            );
            
            ajax({
                url: URL + "api/account/login",
                method: "POST",
                data: { xid, auth },
                success: (res) => {
                    if (res.error ) {
                        location.href = XACC + "login/14";
                    }
                    else {
                        initialize();
                        history.pushState({}, '', URL + "panel/");
                    }
                }
            });
        }
        else {
            initialize();
        }        
    }

    render() {
        let view;

        switch (this.state.view.split('/')[0]) {
            case "MODIFIERS":
                view = <Modifiers data={this.state} dispatch={store.dispatch} />; break;
            case "ACCOUNT":
                view = <Account data={this.state} dispatch={store.dispatch} />; break;
            case "FILTERS":
                view = <Filters data={this.state} dispatch={store.dispatch} />; break;
            case "EMAILS":
                view = <Emails data={this.state} dispatch={store.dispatch} />;
        }
        
        return (
            <div className="ptorx">
                <nav className="nav-bar">
                    <a href="#account">Account</a>
                    <a href="#emails/list">Emails</a>
                    <a href="#filters/list">Filters</a>
                    <a href="#modifiers/list">Modifiers</a>
                </nav>
                {view}
            </div>                
        );
    }

}

render(<App />, document.getElementById("content"));