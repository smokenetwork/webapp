/* eslint react/display-name: 0 */
/* eslint space-before-function-paren:0 */
// https://github.com/eslint/eslint/issues/4442
import Iso from 'iso';
import React from 'react';
import {render} from 'react-dom';
import {renderToString} from 'react-dom/server';
import {applyRouterMiddleware, browserHistory, match, Router, RouterContext} from 'react-router';
import {Provider} from 'react-redux';
import RootRoute from '../app/RootRoute';
import {applyMiddleware, compose, createStore} from 'redux';
import {useScroll} from 'react-router-scroll';
import createSagaMiddleware from 'redux-saga';
import {syncHistoryWithStore} from 'react-router-redux';
import rootReducer from '../app/redux/RootReducer';
import {fetchDataWatches} from '../app/redux/FetchDataSaga';
import {sharedWatches} from '../app/redux/SagaShared';
import {userWatches} from '../app/redux/UserSaga';
import {authWatches} from '../app/redux/AuthSaga';
import {transactionWatches} from '../app/redux/TransactionSaga';
import PollDataSaga from '../app/redux/PollDataSaga';
import {component as NotFound} from '../app/components/pages/NotFound';
import extractMeta from '../app/utils/ExtractMeta';
import Translator from '../app/Translator';
import {notificationsArrayToMap} from '../app/utils/Notifications';
import {routeRegex} from '../app/ResolveRoute';
import {contentStats} from '../app/utils/StateFunctions'
import {postHelper} from '../utils/PostHelperFactory'
import {api} from '@smokenetwork/smoke-js';
//import {filterState} from '../utils/ContentFilter';
import {call, put} from "redux-saga/effects";
import GlobalReducer from "../app/redux/GlobalReducer";
const fetch = require('node-fetch');

const sagaMiddleware = createSagaMiddleware(
  ...userWatches, // keep first to remove keys early when a page change happens
  ...fetchDataWatches,
  ...sharedWatches,
  ...authWatches,
  ...transactionWatches
);

let middleware;

if (process.env.BROWSER && process.env.NODE_ENV === 'development') {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  middleware = composeEnhancers(
    applyMiddleware(sagaMiddleware)
  );
} else {
  middleware = applyMiddleware(sagaMiddleware);
}

const runRouter = (location, routes) => {
  return new Promise((resolve) =>
    match({routes, location}, (...args) => resolve(args)));
};

const onRouterError = (error) => {
  console.error('onRouterError', error);
};

async function universalRender({location, initial_state, offchain, ErrorPage, tarantool, userPreferences}) {
  let error, redirect, renderProps;
  try {
    [error, redirect, renderProps] = await runRouter(location, RootRoute);
  } catch (e) {
    console.error('Routing error:', e.toString(), location);
    return {
      title: 'Routing error - Smoke',
      statusCode: 500,
      body: renderToString(ErrorPage ? <ErrorPage/> : <span>Routing error</span>)
    };
  }
  if (error || !renderProps) {
    // debug('error')('Router error', error);
    return {
      title: 'Page Not Found - Smoke',
      statusCode: 404,
      body: renderToString(<NotFound/>)
    };
  }

  if (process.env.BROWSER) {
    const store = createStore(rootReducer, initial_state, middleware);
    sagaMiddleware.run(PollDataSaga).done
      .then(() => console.log('PollDataSaga is finished'))
      .catch(err => console.log('PollDataSaga is finished with error', err));

    const history = syncHistoryWithStore(browserHistory, store);

    const scroll = useScroll();

    if (process.env.NODE_ENV === 'production') {
      console.log('%c%s', 'color: red; background: yellow; font-size: 24px;', 'WARNING!');
      console.log('%c%s', 'color: black; font-size: 16px;', 'This is a developer console, you must read and understand anything you paste or type here or you could compromise your account and your private keys.');
    }
    return render(
      <Provider store={store}>
        <Translator>
          <Router
            routes={RootRoute}
            history={history}
            onError={onRouterError}
            render={applyRouterMiddleware(scroll)}/>
        </Translator>
      </Provider>,
      document.getElementById('content')
    );
  }

  // below is only executed on the server
  let server_store, onchain;
  try {
    let url = location === '/' ? 'trending' : location;
    // Replace /curation-rewards and /author-rewards with /transfers for UserProfile
    // to resolve data correctly
    if (url.indexOf('/curation-rewards') !== -1) url = url.replace(/\/curation-rewards$/, '/transfers');
    if (url.indexOf('/author-rewards') !== -1) url = url.replace(/\/author-rewards$/, '/transfers');

    onchain = await api.getStateAsync(url);
    onchain.post_reward_fund = await api.getRewardFundAsync("post");

    if (Object.getOwnPropertyNames(onchain.accounts).length === 0 && (url.match(routeRegex.UserProfile1) || url.match(routeRegex.UserProfile3))) { // protect for invalid account
      return {
        title: 'User Not Found - Smoke',
        statusCode: 404,
        body: renderToString(<NotFound/>)
      };
    }

    // https://github.com/smokenetwork/webapp/issues/40
    //onchain = filterState(onchain);

    // If we are not loading a post, truncate state data to bring response size down.
    if (!url.match(routeRegex.Post)) {
      for (var key in onchain.content) {
        //onchain.content[key]['body'] = onchain.content[key]['body'].substring(0, 1024) // TODO: can be removed. will be handled by steemd
        // Count some stats then remove voting data. But keep current user's votes. (#1040)
        onchain.content[key]['stats'] = contentStats(onchain.content[key])
        onchain.content[key]['active_votes'] = onchain.content[key]['active_votes'].filter(vote => vote.voter === offchain.account)
      }
    }

    if (!url.match(routeRegex.PostsIndex) && !url.match(routeRegex.UserProfile1) && !url.match(routeRegex.UserProfile2) && url.match(routeRegex.PostNoCategory)) {
      const params = url.substr(2, url.length - 1).split("/");
      let content = await api.getContentAsync(params[0], params[1]);
      // content = filterContent(content);
      if (content.author && content.permlink) { // valid short post url
        onchain.content[url.substr(2, url.length - 1)] = content;
      } else { // protect on invalid user pages (i.e /user/transferss)
        return {
          title: 'Page Not Found - Smoke',
          statusCode: 404,
          body: renderToString(<NotFound/>)
        };
      }
    }

    if (url === '/sponsors') {
      const sponsor_result = await fetch('https://api.smoke.io/sponsorapi/list');
      const sponsor_json = await sponsor_result.json();
      onchain.sponsors = sponsor_json;
    }

    offchain.server_location = location;
    server_store = createStore(rootReducer, {global: onchain, offchain});
    server_store.dispatch({type: '@@router/LOCATION_CHANGE', payload: {pathname: location}});
    server_store.dispatch({type: 'SET_USER_PREFERENCES', payload: userPreferences});
    // if (offchain.account) {
    //     try {
    //         const notifications = await tarantool.select('notifications', 0, 1, 0, 'eq', offchain.account);
    //         server_store.dispatch({type: 'UPDATE_NOTIFICOUNTERS', payload: notificationsArrayToMap(notifications)});
    //     } catch(e) {
    //         console.warn('WARNING! cannot retrieve notifications from tarantool in universalRender:', e.message);
    //     }
    // }
  } catch (e) {
    // Ensure 404 page when username not found
    if (location.match(routeRegex.UserProfile1)) {
      console.error('User/not found: ', location);
      return {
        title: 'Page Not Found - Smoke',
        statusCode: 404,
        body: renderToString(<NotFound/>)
      };
      // Ensure error page on state exception
    } else {
      const msg = (e.toString && e.toString()) || e.message || e;
      const stack_trace = e.stack || '[no stack]';
      console.error('State/store error: ', msg, stack_trace);
      return {
        title: 'Server error - Smoke',
        statusCode: 500,
        body: renderToString(<ErrorPage/>)
      };
    }
  }

  let app, status, meta;
  try {
    app = renderToString(
      <Provider store={server_store}>
        <Translator>
          <RouterContext {...renderProps} />
        </Translator>
      </Provider>
    );
    meta = extractMeta(onchain, renderProps.params);
    status = 200;
  } catch (re) {
    console.error('Rendering error: ', re, re.stack);
    app = renderToString(<ErrorPage/>);
    status = 500;
  }

  return {
    title: 'Smoke',
    titleBase: 'Smoke - ',
    meta,
    statusCode: status,
    body: Iso.render(app, server_store.getState())
  };
}

export default universalRender;
