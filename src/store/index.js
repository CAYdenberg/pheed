import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import middleware from './middleware';
import { getInitialState } from './shape';
import reducer from './reducer';
import tasks from './tasks';
import config from '../config';
import { timelineActions } from './actions';

const store = createStore(
  reducer,
  getInitialState(),
  composeWithDevTools(middleware)
);

let currentState = getInitialState();
store.subscribe(() => {
  let previousState = currentState;
  currentState = store.getState();

  tasks.forEach(task => {
    if (task[0](currentState, previousState)) store.dispatch(task[1]);
  });
});

// setInterval(() => {
//   store.dispatch(timelineActions.debouncedCheckFeeds());
// }, config.FEED_CHECK_INTERVAL);

window.store = store;
export default store;
