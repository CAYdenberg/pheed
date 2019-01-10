import update from 'immutability-helper'
import {wrapReducer} from './reduxHelpers'

import {loadPostsByFeed, upsert} from '../db'
import Posts from '../db/Posts'
import {constants as newFeedConstants} from './newFeed'

const constants = {
  SET_VIEW: 'POSTS/SET_VIEW',
  POPULATE: 'POSTS/POPULATE',
  POPULATE_OK: 'POSTS/POPULATE_OK',
  POPULATE_ERR: 'POSTS/POPULATE_ERR',
  LOAD: 'POSTS/LOAD',
  LOAD_OK: 'POSTS/LOAD_OK',
  LOAD_ERR: 'POSTS/LOAD_ERR'
}
const c = constants

export const actions = {
  setView: (page) =>
    ({type: c.SET_VIEW, page}),

  populate: (data, feedId) => {
    const docs = Posts(data, feedId)
    return {
      type: c.POPULATE,
      docs,
      view: {type: 'feed', id: feedId},
      pouch: upsert(docs),
      response: actions.populateOk,
      error: actions.populateErr
    }
  },

  populateOk: (res) => {
    return {type: c.POPULATE_OK, res}
  },

  populateErr: (status) => {
    return {type: c.POPULATE_ERR, status}
  },

  loadByFeed: (id) => {
    return {
      type: c.LOAD,
      pouch: loadPostsByFeed(id),
      view: {type: 'feed', id},
      response: actions.loadOk,
      error: actions.loadErr
    }
  },

  loadOk: posts => {
    return {type: c.LOAD_OK, posts}
  },

  loadErr: (status, err) => {
    console.log(err)
    return {type: c.LOAD_ERR, status}
  }
}

export const reducer = wrapReducer({
  loadState: 0,
  view: null,
  posts: []
}, (initialState, action) => {
  switch (action.type) {
    case c.SET_VIEW: {
      return update(initialState, {
        view: {$set: {type: 'page', id: action.page}}
      })
    }

    case c.POPULATE: {
      return update(initialState, {
        posts: {$set: action.docs},
        loadState: {$set: 2},
        view: {$set: action.view}
      })
    }

    case c.POPULATE_OK: {
      return update(initialState, {
        posts: {$map: (post, i) => ({
          ...post,
          _rev: action.res[i].rev
        })}
      })
    }

    case c.LOAD: {
      return update(initialState, {
        loadState: {$set: 1},
        view: {$set: action.view}
      })
    }

    case c.LOAD_OK: {
      return update(initialState, {
        loadState: {$set: 2},
        posts: {$set: action.posts}
      })
    }

    case newFeedConstants.NEW_FEED_RES: {
      return update(initialState, {
        view: {$set: {type: 'newFeed'}}
      })
    }
  }
})
