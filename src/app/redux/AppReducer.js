import {Map, OrderedMap} from 'immutable';
import tt from 'counterpart';

const defaultState = Map({
  requests: {},
  loading: false,
  error: '',
  location: {},
  notifications: null,
  ignoredLoadingRequestCount: 0,
  user_preferences: Map({
    locale: null,
    nsfwPref: 'warn',
    theme: 'light',
    blogmode: false,
    currency: 'USD'
  })
});

export default function reducer(state = defaultState, action) {
  if (action.type === '@@router/LOCATION_CHANGE') {
    return state.set('location', {pathname: action.payload.pathname});
  }
  if (action.type === 'SMOKE_API_ERROR') {
    return state.set('error', action.error).set('loading', false);
  }
  let res = state;
  if (action.type === 'FETCH_DATA_BEGIN') {
    res = state.set('loading', true);
  }
  if (action.type === 'FETCH_DATA_END') {
    res = state.set('loading', false);
  }
  if (action.type === 'SET_USER_PREFERENCES') {
    res = res.set('user_preferences', Map(action.payload));
  }
  if (action.type === 'TOGGLE_NIGHTMODE') {
    res = res.setIn(['user_preferences', 'nightmode'], !res.getIn(['user_preferences', 'nightmode']));
  }
  if (action.type === 'TOGGLE_BLOGMODE') {
    res = res.setIn(['user_preferences', 'blogmode'], !res.getIn(['user_preferences', 'blogmode']));
  }
  return res;
}
