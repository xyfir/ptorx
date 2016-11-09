import React from "react";
import { render } from "react-dom";

// Redux store / reducers
import { createStore } from "redux";
import reducers from "reducers/index";

// Components
import DynamicStyles from "./misc/DynamicStyles";
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
import { URL, XACC, LOG_STATE, ENVIRONMENT } from "constants/config";
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
            // Access token is generated upon a successful login
            // Used to create new session without forcing login each time
            const token = localStorage.getItem("access_token") || "";

            // Access token is required
            if (!token && ENVIRONMENT != "dev") {
                location.href = XACC + "app/#/login/13";
            }

            let state = {
                modifiers: [], filters: [], account: {
                    emails: [], subscription: 0
                },
                emails: [], view: CREATE_REDIRECT_EMAIL
            };

            request({url: URL + "api/account?token=" + token, success: (res) => {
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
            }});            
        };

        const q = parseHashQuery();

        // PhoneGap app opens to ptorx.com/panel/#?phonegap=1
        if (q.phonegap) {
            localStorage.setItem("isPhoneGap", "true");
            initialize();
            location.hash = "";
        }
        // Attempt to login using XID/AUTH or skip to initialize()
        else if (q.xid && q.auth) {
            q.affiliate = localStorage.getItem("affiliate") || "";
            q.referral = localStorage.getItem("referral") || "";
            
            request({
                url: URL + "api/account/login",
                method: "POST", data: q,
                success: (res) => {
                    if (res.error) {
                        location.href = XACC + "app/#/login/13";
                    }
                    else {
                        localStorage.setItem("access_token", res.accessToken);
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
                <DynamicStyles />
            </div>                
        );
    }

}

render(<App />, document.getElementById("content"));