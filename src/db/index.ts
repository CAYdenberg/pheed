import * as PouchDB from 'pouchdb'; // tslint:disable:no-unused-vars
import { Store } from 'redux';
import * as selectors from '../store/selectors';
import { SavedFeed, JsonFeed, SavedPost, OFDocumentType } from '../types';
import { createFeed, generateId } from './factory';

type Database = PouchDB.Database;

export const getFeeds = () => (db: PouchDB.Database, store: Store) => {
  let query: Promise<SavedFeed[]>;

  if (selectors.isFirstLoad(store.getState())) {
    const feed = createFeed('internal://about/about.json', {
      title: 'About OpenFeed',
    });
    query = db.put(feed).then(({ rev }) => {
      return [{ ...feed, _rev: rev }];
    });
  } else {
    query = db
      .find({
        selector: {
          type: { $eq: OFDocumentType.Feed },
        },
      })
      .then(res => res.docs as SavedFeed[]);
  }

  return query;
};

export const putFeed = (url: string, jsonFeed: JsonFeed) => (
  db: PouchDB.Database
) => {
  const feed = createFeed(url, jsonFeed);

  return db.put(feed).then(({ rev }) => {
    return { ...feed, _rev: rev };
  });
};

export const deleteFeed = (feed: SavedFeed) => (db: Database) => {
  if (!feed._rev) return;
  return db.remove(feed._id, feed._rev);
};

export const getPosts = () => (db: PouchDB.Database) => {
  return db
    .find({
      selector: {
        type: { $eq: OFDocumentType.ExternalPost },
      },
    })
    .then(res => res.docs as SavedPost[]);
};

export const savePost = (post: SavedPost) => (db: Database) => {
  return db.put(post).catch(err => {
    if (err.status === 409) {
      return Promise.resolve();
    }
  });
};

export const unsavePost = (id: string) => (db: Database) => {
  const _id = generateId(OFDocumentType.ExternalPost, id);
  return db
    .get(_id)
    .then(({ _rev }) => db.remove(_id, _rev))
    .catch(err => {
      if (err.status === 404) {
        return Promise.resolve();
      }
    });
};

// the following line hacks around TypeScript thinking we are not "using"
// PouchDB in this file
export const uselessDatabaseDoNotUse = PouchDB;
