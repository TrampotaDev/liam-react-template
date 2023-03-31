import { combineReducers, createStore } from 'redux';
/* eslint-disable no-lone-blocks */
import { buildDataKeyFromParams } from './helpers';

export const storeRef = {};

export const apiCallsMap = {}

{/*
  This library is intended to entirely eliminate the need to write boiler plate redux code as well as hooks for subscribing to and updating redux stored data

  createLiamAsyncStore creates a redux stores with each resource in the resources arguement
  becoming its own reducer with a corresponding status [idle, loading], api methods, and data
  See ../resources.js for an example argument
  See ../index.js for createLiamAsyncStore being invoked

  useUpdate and useData expose hooks (each component can specify which resources to subscribe to) to read and update data
  Only subscribed to data changes will trigger re-renders
  useData also provides an isLoading flag for asynchronous data

  This App provides a simple working example with posts
*/}

export const createLiamAsyncStore = (resources) => {
  const reducers = {};
  resources.forEach(resource => {
    apiCallsMap[resource.name] = resource.url;
    let initialState = {
      status: resource.default || !resource.url ? 'idle' : 'unloaded',
      name: resource.name,
      data: resource.default || null,
      paramData: {},
    };
    reducers[resource.name] = (state = initialState, action) => {
      switch (action.type) {
        case `SET_${resource.name}`:
          console.log('set:', resource.name, action);
          if (action.parameters) {
            const paramsKey = buildDataKeyFromParams(action.parameters.path, action.parameters.query);
            const newState = { ...state };
            newState.paramData[paramsKey] = {
              status: 'idle',
              data: action.payload
            }
            return newState;
          } else {
            return {
              ...state,
              status: 'idle',
              data: action.payload,
            };
          }
        case `SET_${resource.name}_LOADING`:
          if (action.parameters) {
            const paramsKey = buildDataKeyFromParams(action.parameters.path, action.parameters.query);
            const newState = { ...state };
            newState.paramData[paramsKey] = {
              ...newState.paramData[paramsKey],
              status: 'loading',
            }
            return newState;
          }
          return {
            ...state,
            status: 'loading'
          }
        case `SET_${resource.name}_UNLOADED`:
          console.log('unload:', action);
          if (action.parameters) {
            const paramsKey = buildDataKeyFromParams(action.parameters.path, action.parameters.query);
            const newState = { ...state };
            newState.paramData[paramsKey] = {
              ...newState.paramData[paramsKey],
              status: 'unloaded',
            }
            return newState;
          }
          return {
            ...state,
            paramData: {},
            status: 'unloaded'
          }
        default:
          return state;
      };
    };
  });
  const rootReducer = combineReducers({ ...reducers });
  const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
  storeRef.store = store;
  return store;
}