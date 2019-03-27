/* eslint-disable no-underscore-dangle */
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import persistState from 'redux-localstorage';
import topLevelReducer, { initialState } from './reducers';
// TODO - define middleware

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore() {
  return createStore(
    topLevelReducer,
    initialState,
    composeEnhancers(
      // TODO - import middleware before the thunk
      applyMiddleware(thunk),
      persistState(),
    ),
  );
}
