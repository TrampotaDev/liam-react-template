import { combineReducers, createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";

import axios from "axios";
/* eslint-disable no-lone-blocks */
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import storage from "redux-persist/lib/storage";

let storeRef;

{
  /*
  This library is intended to entirely eliminate the need to write boiler plate redux code as well as hooks for subscribing to and updating redux stored data

  createLiamAsyncStore creates a redux stores with each resource in the resources arguement
  becoming its own reducer with a corresponding status [idle, loading], api methods, and data
  See ../resources.js for an example argument
  See ../index.js for createLiamAsyncStore being invoked


  This library also enables to persist the state using redux-persist. We just need to pass property persisted:true inside required resource in resources array.

  useUpdate and useData expose hooks (each component can specify which resources to subscribe to) to read and update data
  Only subscribed to data changes will trigger re-renders
  useData also provides an isLoading flag for asynchronous data

  This App provides a simple working example with a todo list
*/
}

export const createLiamAsyncStore = resources => {
  const reducers = {};
  const whitelist = [];
  const blacklist = [];
  resources.forEach(resource => {
    resource.persisted
      ? whitelist.push(resource.name)
      : blacklist.push(resource.name);
    const apiCalls = {};
    resource.methods?.forEach(method => {
      apiCalls[method] = data =>
        client({ url: resource.url, method: method, data });
    });

    let initialState = {
      status: resource.methods?.includes("GET") ? "unloaded" : "idle",
      data: null,
      apiCalls,
    };
    reducers[resource.name] = (state = initialState, action) => {
      switch (action.type) {
        case `SET_${resource.name}`:
          return {
            ...state,
            status: "idle",
            data: action.payload,
          };
        default:
          return state;
      }
    };
  });
  const rootReducer = combineReducers({ ...reducers });

  const persistConfig = {
    key: "root",
    storage: storage,
    whitelist,
    blacklist,
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);

  const store = createStore(
    persistedReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
  storeRef = store;
  let persistor = persistStore(store);
  return { store, persistor };
};

{
  /*
  This function can be called with a list of resources in a component to expose update functions
*/
}

export const useUpdate = resourceList => {
  const output = {};
  resourceList.forEach(resource => {
    output[
      `update${resource.name.charAt(0).toUpperCase() + resource.name.slice(1)}`
    ] = async (updateFn, body) => {
      const storeResource = storeRef.getState()[resource.name];
      const updatedData = updateFn(storeResource.data);
      if (storeResource.apiCalls["PUT"]) {
        await storeResource.apiCalls["PUT"](body);
      }
      storeRef.dispatch({
        type: `SET_${resource.name}`,
        payload: updatedData,
      });
    };
  });
  return output;
};

const client = axios.create({
  withCredentials: true,
});

const getData = async (resource, dispatch) => {
  const { data } = await resource?.apiCalls?.GET();
  dispatch({
    type: `SET_${resource.name}`,
    payload: data,
  });
};

{
  /*
  This function can be called with a list of resources in a component to expose data and its load status
*/
}

export const useData = resourcesList => {
  const dispatch = useDispatch();
  const data = useSelector(state => {
    const data = {};
    resourcesList.forEach(
      resource => (data[resource.name] = state[resource.name])
    );
    return data;
  }, shallowEqual);

  for (let property in data) {
    const resource = data[property];
    if (resource.status === "unloaded") {
      getData({ ...resource, name: property }, dispatch);
    }
  }

  const output = {
    isLoading: false,
    data,
  };

  for (let property in data) {
    const resource = data[property];
    if (resource.status === "loading" || resource.status === "unloaded") {
      output.isLoading = true;
    }
  }

  return output;
};
