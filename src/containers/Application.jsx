import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Helmet } from 'react-helmet';

import { Link, Router, Route, Redirect, Switch } from 'react-router-dom';

import localforage from 'localforage';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import Sweetalert from 'sweetalert';

import GA from 'lib/GoogleAnalytics';

import { history } from '../lib/helpers';

import config from '../configuration';

// views
import Profile from '../components/views/Profile';
import EditProfile from '../components/views/EditProfile';

import ViewMilestone from '../components/views/ViewMilestone';
import EditDAC from '../components/views/EditDAC';
import ViewDAC from '../components/views/ViewDAC';
import Donations from '../components/views/Donations';
import Delegations from '../components/views/Delegations';
import MyDACs from '../components/views/MyDACs';
import MyCampaigns from '../components/views/MyCampaigns';
import MyMilestones from '../components/views/MyMilestones';
import NotFound from '../components/views/NotFound';
import Explore from '../components/views/Explore';
import Campaigns from '../components/views/Campaigns';
import DACs from '../components/views/DACs';
import TermsAndConditions from '../components/views/TermsAndConditions';
import PrivacyPolicy from '../components/views/PrivacyPolicy';

import EditCampaign from '../components/views/EditCampaign';
import ViewCampaign from '../components/views/ViewCampaign';
import EditMilestone from '../components/views/EditMilestone';

// components
import MainMenu from '../components/MainMenu';
import Loader from '../components/Loader';
import ErrorBoundary from '../components/ErrorBoundary';

// context providers
import UserProvider, { Consumer as UserConsumer } from '../contextProviders/UserProvider';
import ConversionRateProvider from '../contextProviders/ConversionRateProvider';
import Web3Provider, { Consumer as Web3Consumer } from '../contextProviders/Web3Provider';
import WhiteListProvider, {
  Consumer as WhiteListConsumer,
} from '../contextProviders/WhiteListProvider';

import '../lib/validators';

/* global document */
/**
 * Here we hack to make stuff globally available
 */
// Make sweet alert global
React.swal = Sweetalert;

// Construct a dom node to be used as content for sweet alert
React.swal.msg = reactNode => {
  const wrapper = document.createElement('span');
  ReactDOM.render(reactNode, wrapper);
  return wrapper.firstChild;
};

// make toast globally available
React.toast = toast;

/**
 * This container holds the application and its routes.
 * It is also responsible for loading application persistent data.
 * As long as this component is mounted, the data will be persistent,
 * if passed as props to children.
 * -> moved to data to UserProvider
 */
class Application extends Component {
  constructor() {
    super();

    localforage.config({
      name: 'dapp',
    });

    this.state = {
      web3Loading: true,
      userLoading: true,
      whiteListLoading: true,
    };

    this.web3Loaded = this.web3Loaded.bind(this);
    this.userLoaded = this.userLoaded.bind(this);
    this.whiteListLoaded = this.whiteListLoaded.bind(this);
  }

  web3Loaded() {
    this.setState({ web3Loading: false });
  }

  whiteListLoaded() {
    this.setState({ whiteListLoading: false });
  }

  userLoaded() {
    this.setState({ userLoading: false });
  }

  render() {
    const { web3Loading, userLoading, whiteListLoading } = this.state;
    return (
      <ErrorBoundary>
        {/* Header stuff goes here */}
        {config.analytics.useHotjar && window.location.origin.includes('beta') && (
          <Helmet>
            <script>{`
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:944408,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `}</script>
          </Helmet>
        )}
        <WhiteListProvider onLoaded={this.whiteListLoaded}>
          <WhiteListConsumer>
            {({ state: { fiatWhitelist } }) => (
              <div>
                {whiteListLoading && <Loader className="fixed" />}
                {!whiteListLoading && (
                  <Web3Provider onLoaded={this.web3Loaded}>
                    <Web3Consumer>
                      {({ state: { account, balance, isCorrectNetwork } }) => (
                        <div>
                          {web3Loading && <Loader className="fixed" />}
                          {!web3Loading && (
                            <ConversionRateProvider fiatWhitelist={fiatWhitelist}>
                              <UserProvider account={account} onLoaded={this.userLoaded}>
                                <UserConsumer>
                                  {({ state: { currentUser, hasError } }) => (
                                    <Router history={history}>
                                      <div>
                                        {GA.init() && <GA.RouteTracker />}

                                        {userLoading && <Loader className="fixed" />}

                                        {!userLoading && !hasError && (
                                          <div>
                                            <MainMenu />

                                            <Switch>
                                              {/* Routes are defined here. Persistent data is set as props on components
                                NOTE order matters, wrong order breaks routes!
                            */}
                                              <Route
                                                exact
                                                path="/termsandconditions"
                                                render={props => <TermsAndConditions {...props} />}
                                              />
                                              <Route
                                                exact
                                                path="/privacypolicy"
                                                render={props => <PrivacyPolicy {...props} />}
                                              />
                                              <Route
                                                exact
                                                path="/dacs/new"
                                                render={props => (
                                                  <EditDAC
                                                    isNew
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    isCorrectNetwork={isCorrectNetwork}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/dacs/:id"
                                                render={props => (
                                                  <ViewDAC
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/dacs/:id/edit"
                                                render={props => (
                                                  <EditDAC
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    isCorrectNetwork={isCorrectNetwork}
                                                    {...props}
                                                  />
                                                )}
                                              />

                                              <Route
                                                exact
                                                path="/campaigns/new"
                                                render={props => (
                                                  <EditCampaign
                                                    isNew
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    isCorrectNetwork={isCorrectNetwork}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/campaigns/:id"
                                                render={props => (
                                                  <ViewCampaign
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/campaigns/:id/edit"
                                                render={props => (
                                                  <EditCampaign
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    isCorrectNetwork={isCorrectNetwork}
                                                    {...props}
                                                  />
                                                )}
                                              />

                                              <Route
                                                exact
                                                path="/campaigns/:id/milestones/new"
                                                render={props => (
                                                  <EditMilestone
                                                    isNew
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    isCorrectNetwork={isCorrectNetwork}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/campaigns/:id/milestones/propose"
                                                render={props => (
                                                  <EditMilestone
                                                    isNew
                                                    isProposed
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    isCorrectNetwork={isCorrectNetwork}
                                                    balance={balance}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/campaigns/:id/milestones/:milestoneId"
                                                render={props => (
                                                  <ViewMilestone
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/campaigns/:id/milestones/:milestoneId/edit"
                                                render={props => (
                                                  <EditMilestone
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    isCorrectNetwork={isCorrectNetwork}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/campaigns/:id/milestones"
                                                render={({ match }) => (
                                                  <Redirect to={`/campaigns/${match.params.id}`} />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/milestones/:milestoneId/edit"
                                                render={props => (
                                                  <EditMilestone
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    isCorrectNetwork={isCorrectNetwork}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/milestones/:milestoneId/edit/proposed"
                                                render={props => (
                                                  <EditMilestone
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    isCorrectNetwork={isCorrectNetwork}
                                                    isProposed
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/donations"
                                                render={props => (
                                                  <Donations
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/delegations"
                                                render={props => (
                                                  <Delegations
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/my-dacs"
                                                render={props => (
                                                  <MyDACs
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/my-campaigns"
                                                render={props => (
                                                  <MyCampaigns
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/my-milestones"
                                                render={props => (
                                                  <MyMilestones
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/profile"
                                                render={props => (
                                                  <EditProfile
                                                    key={currentUser ? currentUser.id : 0}
                                                    currentUser={currentUser}
                                                    balance={balance}
                                                    isCorrectNetwork={isCorrectNetwork}
                                                    {...props}
                                                  />
                                                )}
                                              />
                                              <Route
                                                exact
                                                path="/profile/:userAddress"
                                                render={props => <Profile {...props} />}
                                              />

                                              <Route
                                                exact
                                                path="/"
                                                render={props => <Explore {...props} />}
                                              />
                                              <Route
                                                exact
                                                path="/campaigns"
                                                render={props => <Campaigns {...props} />}
                                              />
                                              <Route
                                                exact
                                                path="/dacs"
                                                render={props => <DACs {...props} />}
                                              />

                                              <Route component={NotFound} />
                                            </Switch>

                                            <div
                                              style={{
                                                marginTop: '5px',
                                                marginBottom: '5px',
                                                height: '1px',
                                                width: '100%',
                                                borderTop: '1px solid gray',
                                              }}
                                            />
                                            <footer
                                              className="page-footer"
                                              style={{ padding: '.5rem' }}
                                            >
                                              <small>
                                                <ul
                                                  style={{
                                                    display: 'flex',
                                                    listStyle: 'none',
                                                    position: 'absolute',
                                                    left: '50%',
                                                    transform: 'translatex(-50%)',
                                                  }}
                                                >
                                                  <li style={{ marginRight: '2.4rem' }}>
                                                    <Link to="/termsandconditions">
                                                      Terms and Conditions
                                                    </Link>
                                                  </li>
                                                  <li style={{ marginRight: '2.4rem' }}>
                                                    <Link to="/privacypolicy">Privacy Policy</Link>
                                                  </li>
                                                </ul>
                                              </small>
                                            </footer>
                                          </div>
                                        )}

                                        {!userLoading && hasError && (
                                          <center>
                                            <h2>Oops, something went wrong...</h2>
                                            <p>
                                              The B4H dapp could not load for some reason. Please
                                              try again...
                                            </p>
                                          </center>
                                        )}

                                        <ToastContainer
                                          position="top-right"
                                          type="default"
                                          autoClose={5000}
                                          hideProgressBar
                                          newestOnTop={false}
                                          closeOnClick
                                          pauseOnHover
                                        />
                                      </div>
                                    </Router>
                                  )}
                                </UserConsumer>
                              </UserProvider>
                            </ConversionRateProvider>
                          )}
                        </div>
                      )}
                    </Web3Consumer>
                  </Web3Provider>
                )}
              </div>
            )}
          </WhiteListConsumer>
        </WhiteListProvider>
      </ErrorBoundary>
    );
  }
}

export default Application;
