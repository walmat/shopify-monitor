/* eslint-disable no-underscore-dangle */
/* eslint-disable no-case-declarations */
import shortId from 'shortid';
import { initialStates } from '@monitor/structures';

import { SITES_ACTIONS } from '../../actions';
import { siteReducer } from './siteReducer';

let _num = 1;

function _getIndex(siteList) {
  // if the tasksList is empty, reset the numbering
  if (siteList.length === 0) {
    _num = 1;
  }

  // assign new index
  let newIndex = _num;

  // check if generate id already exists
  const idCheck = t => t.index === newIndex;
  while (siteList.some(idCheck)) {
    _num += 1;
    newIndex = _num;
  }

  return newIndex;
}

export default function siteListReducer(state = initialStates.siteListState, action) {
  let nextState = JSON.parse(JSON.stringify(state));

  switch (action.type) {
    case SITES_ACTIONS.ADD: {
      // Check for valid payload structure
      if (action.errors || !action.response || (action.response && !action.response.site)) {
        break;
      }

      // perform a deep copy of given task
      const newSite = JSON.parse(JSON.stringify(action.response.site));

      // copy over edits
      newSite.edits = {
        ...newSite.edits,
        profile: newSite.profile,
        product: newSite.product,
        sizes: newSite.sizes,
        site: newSite.site,
        username: newSite.username,
        password: newSite.password,
      };

      // add new task
      newSite.id = shortId.generate();
      newSite.index = _getIndex(nextState);
      nextState.push(newSite);
      break;
    }
    case SITES_ACTIONS.REMOVE: {
      // Check for valid payload structure
      if (!action.response) {
        break;
      }

      const { site } = action.response;
      let siteId = -1;
      // Check if we are removing all tasks or just a single task
      if (site || site === null) {
        siteId = site && site.id;
      }

      // filter out task from list now
      nextState = nextState.filter(s => s.id !== (siteId || s.id));

      // Check if we have adjusted the array and need to recalculate ids
      if (nextState.length !== state.length && nextState.length !== 0) {
        // adjust the id of each following task to shift down one when a task is deleted
        for (let i = site.index - 1; i < nextState.length; i += 1) {
          _num = nextState[i].index;
          nextState[i].index -= 1;
        }
      }
      break;
    }
    case SITES_ACTIONS.UPDATE: {
      // Check if payload has correct structure or any errors
      if (action.errors || !action.response || !action.response.id || !action.response.site) {
        break;
      }
      const updateId = action.response.id;
      const updateSite = JSON.parse(JSON.stringify(action.response.site));

      // Check for the task to update
      const foundSite = nextState.find(s => s.id === updateId);
      if (!foundSite) {
        break;
      }

      // find the index of the out of date task
      const idxToUpdate = nextState.indexOf(foundSite);

      // Check if current task has been setup properly
      if (updateSite.edits) {
        // Set it up properly
        updateSite.profile = updateSite.edits.profile || updateSite.profile;
        updateSite.product = updateSite.edits.product || updateSite.product;
        updateSite.site = updateSite.edits.site || updateSite.site;
        updateSite.sizes = updateSite.edits.sizes || updateSite.sizes;
        updateSite.username = updateSite.edits.username || updateSite.username;
        updateSite.password = updateSite.edits.password || updateSite.password;
      }
      // copy over to edits
      updateSite.edits = {
        ...updateSite.edits,
        profile: updateSite.profile,
        product: updateSite.product,
        sizes: updateSite.sizes,
        site: updateSite.site,
        username: updateSite.username,
        password: updateSite.password,
        errors: {
          profile: null,
          product: null,
          sizes: null,
          site: null,
          username: null,
          password: null,
        },
      };

      // Update the task
      nextState[idxToUpdate] = updateSite;
      break;
    }
    case SITES_ACTIONS.STATUS: {
      if (!action.response.id || !action.response.message) {
        break;
      }
      const site = nextState.find(s => s.id === action.response.id);
      if (site) {
        site.output = action.response.message;
      }
      break;
    }
    case SITES_ACTIONS.EDIT: {
      // check if id is given (we only change the state on a non-null id)
      if (action.id === null) {
        break;
      }

      // find the element with the given id
      const found = nextState.find(s => s.id === action.id);
      if (found === undefined) {
        break;
      }

      // find the index of the old object
      const idx = nextState.indexOf(found);

      // Reduce the found task using our task reducer
      nextState[idx] = siteReducer(found, action);
      break;
    }
    case SITES_ACTIONS.START: {
      if (!action.response || (action.response && !action.response.site)) {
        break;
      }

      const found = nextState.find(t => t.id === action.response.site.id);
      if (found === undefined) {
        break;
      }
      const idx = nextState.indexOf(found);

      // do nothing if the task is already running..
      if (nextState[idx].status === 'running') {
        break;
      } else {
        nextState[idx].status = 'running';
        nextState[idx].output = 'Starting task!';
      }
      break;
    }
    case SITES_ACTIONS.STOP: {
      if (!action.response || (action.response && !action.response.site)) {
        break;
      }

      const found = nextState.find(t => t.id === action.response.site.id);
      if (found === undefined) {
        break;
      }
      const idx = nextState.indexOf(found);

      // do nothing if the status is already stopped or idle
      if (nextState[idx].status === 'stopped' || nextState[idx].status === 'idle') {
        break;
      } else {
        nextState[idx].status = 'stopped';
        nextState[idx].output = 'Stopping task...';
      }
      break;
    }
    case SITES_ACTIONS.ERROR: {
      // TODO: Handle error
      console.error(`Error trying to perform: ${action.action}! Reason: ${action.error}`);
      break;
    }
    default:
      break;
  }

  return nextState;
}
