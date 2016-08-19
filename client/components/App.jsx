import React from "react";
import { render } from "react-dom";

// Redux store / reducers
import { createStore } from "redux";
import reducers from "reducers/index";

// Components
import Modifiers from "./modifiers/Index";
import Account from "./account/Index";
import Filters from "./filters/Index";
import Emails from "./emails/Index";

// Modules
import parseHashQuery from "lib/parse-hash-query";
import setState from "lib/set-state";
import request from "lib/request";

// Constants
import { CREATE_REDIRECT_EMAIL } from "constants/views";
import { URL, XACC, LOG_STATE } from "constants/config";
import { INITIALIZE_STATE } from "actions/types/index";

let store = createStore(reducers);

class App extends React.Component {

    constructor(props) {
        super(props);

        store.subscribe(() => {
            this.setState(store.getState());
        });

        if (LOG_STATE) {
            store.subscribe(() => {
                console.log(store.getState());
            });
        }

        const initialize = () => {
            let state = {
                modifiers: [], filters: [], account: {
                    emails: [], subscription: 0
                },
                emails: [], view: CREATE_REDIRECT_EMAIL
            };

            request({
                url: URL + "api/account", success: (res) => {
                    if (!res.loggedIn) {
                        location.href = XACC + "app/#/login/13";
                    }
                    else {
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
                }
            })            
        };

        const q = parseHashQuery();

        // Attempt to login using XID/AUTH or skip to initialize()
        if (q.xid && q.auth) {
            request({
                url: URL + "api/account/login",
                method: "POST", data: q,
                success: (res) => {
                    if (res.error) {
                        location.href = XACC + "app/#/login/13";
                    }
                    else {
                        initialize();
                        location.hash = location.hash.split('?')[0];
                    }
                }
            });
        }
        else {
            initialize();
        }
    }

    render() {
        if (!this.state) return <div />;
        
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