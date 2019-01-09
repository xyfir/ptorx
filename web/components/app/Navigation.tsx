import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  MenuButton,
  Subheader,
  ListItem,
  FontIcon,
  Toolbar,
  Divider,
  Drawer,
  Button
} from 'react-md';

export class AppNavigation extends React.Component {
  constructor(props) {
    super(props);

    this.state = { drawer: false };
  }

  /**
   * Delete access token and redirect to logout.
   */
  onLogout() {
    delete localStorage.accessToken;
    location.href = '/api/6/account/logout';
  }

  /** @return {JSX.Element[]} */
  _renderDrawerNavItems() {
    const { App } = this.props;

    return [
      <Link to="/app/emails/list">
        <ListItem leftIcon={<FontIcon>email</FontIcon>} primaryText="Emails" />
      </Link>,
      <Link to="/app/filters/list">
        <ListItem
          leftIcon={<FontIcon>filter_list</FontIcon>}
          primaryText="Filters"
        />
      </Link>,
      <Link to="/app/modifiers/list">
        <ListItem
          leftIcon={<FontIcon>code</FontIcon>}
          primaryText="Modifiers"
        />
      </Link>,
      <Link to="/app/domains/list">
        <ListItem
          leftIcon={<FontIcon>domain</FontIcon>}
          primaryText="Domains"
        />
      </Link>,

      <Divider />,

      <ListItem
        leftIcon={<FontIcon>account_box</FontIcon>}
        primaryText="My Account"
        nestedItems={[
          <Link to="/app/account/settings">
            <ListItem
              leftIcon={<FontIcon>settings</FontIcon>}
              primaryText="Settings"
            />
          </Link>,
          App.state.account.affiliate ? (
            <Link to="/affiliate">
              <ListItem
                leftIcon={<FontIcon>attach_money</FontIcon>}
                primaryText="Affiliate"
              />
            </Link>
          ) : (
            <a />
          ),
          <Link to="/app/account/primary-emails">
            <ListItem
              leftIcon={<FontIcon>email</FontIcon>}
              primaryText="Primary Emails"
            />
          </Link>,
          <ListItem
            onClick={() => this.onLogout()}
            leftIcon={<FontIcon>close</FontIcon>}
            primaryText="Logout"
          />
        ]}
      />,

      <ListItem
        leftIcon={<FontIcon>info</FontIcon>}
        primaryText="Documentation"
        nestedItems={[
          <Link to="/app/docs/help">
            <ListItem leftIcon={<FontIcon>help</FontIcon>} primaryText="Help" />
          </Link>,
          <Link to="/app/docs/privacy">
            <ListItem
              leftIcon={<FontIcon>security</FontIcon>}
              primaryText="Privacy Policy"
            />
          </Link>,
          <Link to="/app/docs/tos">
            <ListItem
              leftIcon={<FontIcon>gavel</FontIcon>}
              primaryText="Terms of Service"
            />
          </Link>
        ]}
      />,

      <Divider />,

      <Subheader primaryText={`${App.state.account.credits} credits`} />,
      <Link to="/app/account/credits/purchase">
        <ListItem
          leftIcon={<FontIcon>credit_card</FontIcon>}
          primaryText="Purchase Credits"
        />
      </Link>,
      <Link to="/app/account/credits/earn">
        <ListItem
          leftIcon={<FontIcon>money_off</FontIcon>}
          primaryText="Earn Credits"
        />
      </Link>
    ];
  }

  render() {
    const { App } = this.props;

    return (
      <React.Fragment>
        <Toolbar
          colored
          fixed
          actions={[
            <Button
              to="/app/quick-search"
              icon
              iconChildren="search"
              component={Link}
            />,
            <MenuButton
              icon
              id="menu--create-item"
              menuItems={[
                <Subheader primaryText="Create a new:" />,
                !App.state.account.emails.length ? (
                  <a />
                ) : (
                  <Link to="/app/emails/create?instant=1">
                    <ListItem
                      leftIcon={<FontIcon>email</FontIcon>}
                      primaryText="Email (Instant)"
                    />
                  </Link>
                ),
                <Link to="/app/emails/create">
                  <ListItem
                    leftIcon={<FontIcon>email</FontIcon>}
                    primaryText="Email (Custom)"
                  />
                </Link>,
                <Link to="/app/filters/create">
                  <ListItem
                    leftIcon={<FontIcon>filter_list</FontIcon>}
                    primaryText="Filter"
                  />
                </Link>,
                <Link to="/app/modifiers/create">
                  <ListItem
                    leftIcon={<FontIcon>code</FontIcon>}
                    primaryText="Modifier"
                  />
                </Link>,
                <Link to="/app/domains/create">
                  <ListItem
                    leftIcon={<FontIcon>domain</FontIcon>}
                    primaryText="Domain"
                  />
                </Link>
              ]}
              iconChildren="add"
            />
          ]}
          title="Ptorx"
          nav={
            <Button
              icon
              iconChildren="menu"
              onClick={() => this.setState({ drawer: true })}
            />
          }
        />

        <Drawer
          onVisibilityChange={v => this.setState({ drawer: v })}
          autoclose={true}
          navItems={this._renderDrawerNavItems()}
          visible={this.state.drawer}
          header={
            <Toolbar
              colored
              nav={
                <Button
                  icon
                  onClick={() => this.setState({ drawer: false })}
                  iconChildren="arrow_back"
                />
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />
      </React.Fragment>
    );
  }
}
