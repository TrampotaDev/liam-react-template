import { useCallback, useRef } from 'react';
/* eslint-disable no-lone-blocks */
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { buildDataKeyFromParams, getData, callApi, mapParamsAndQueryToUrl } from './helpers';
import { apiCallsMap, storeRef } from './store';

{/*
  This function can be called with a list of resources in a component to expose data and its load status

  Argument: 
    resourcesList = [{
      name: String,
      parameters: {
        path: [{
          String: String
        }],
        query: [{
          String: String
        }]
      },
      forceFetch: Boolean,
    }]

  Returns:
    {
      isLoading: Boolean,
      data: [{
        status: String['unloaded', 'loading', 'idle'],
        data: Any,
        set: Function, // sets the store with passed value
        refetch: Function, // forces refetch
        unload: Function // unloads resource
      }]
    }
*/}

export const useData = (resourcesList) => {

  const ref = useRef({
    resourcesFetched: resourcesList.reduce((prev, curr) => {
      let key = curr.name;
      if (curr.parameters) {
        key = `${key}-${buildDataKeyFromParams(curr.parameters.path, curr.parameters.query)}`;
      }
      return { ...prev, [key]: false }
    }, { [resourcesList[0].parameters ? `${resourcesList[0].name}-${buildDataKeyFromParams(resourcesList[0].parameters.path, resourcesList[0].parameters.query)}` : resourcesList[0].name] : false}),
    resourcesLastParams: resourcesList.map(resource => {
      if (resource.parameters) {
        return `${resource.name}-${buildDataKeyFromParams(resource.parameters.path, resource.parameters.query)}`
      }
      return resource.name
    })
  });

  const dispatch = useDispatch();
  const data = useSelector(
    state => {
      const data = [];
      resourcesList.forEach(resource => {
        if (resource.parameters) {
          let key = buildDataKeyFromParams(resource.parameters.path, resource.parameters.query);
          const resourceNameWithKey = `${resource.name}-${key}`;
          let output;
          if (state[resource.name].paramData && state[resource.name].paramData[key]) {
            output = state[resource.name].paramData[key]
          } else {
            output = { status: 'unloaded', data: null }
          }
          resource.key = resourceNameWithKey;
          data.push(output);
        } else {
          resource.key = resource.name;
          let output = state[resource.name];
          data.push(output);
        }
      });
      return data;
    },
    shallowEqual
  );

  const output = {
    isLoading: false,
  };

  resourcesList.forEach((resource, index) => {
    const dataItem = data[index];
    if (dataItem.status === 'unloaded' || 
       (resource.forceFetch === true && !ref.current.resourcesFetched[resource.key]) ||
       (resource.forceFetch === true && ref.current.resourcesLastParams[index] !== resource.key)
    ) {
      output.isLoading = true;
      ref.current.resourcesFetched[resource.key] = true;
      getData(resource, dispatch);
    }
    data[index].unload = () => {
      dispatch({
        type: `SET_${resource.name}_UNLOADED`,
        parameters: resource.parameters,
      });
    }
    data[index].refetch = () => {
      dispatch({
        type: `SET_${resource.name}_LOADING`,
        parameters: resource.parameters,
      });
      getData(resource, dispatch);
    }
    data[index].set = (payload) => {
      dispatch({
        type: `SET_${resource.name}`,
        parameters: resource.parameters,
        payload,
      });
    }
    if (dataItem.status === 'loading') {
      output.isLoading = true;
    }
    ref.current.resourcesLastParams[index] = resource.key;
  });

  output.data = Object.values(data);

  return output;
}

{/*
  This function can be called with a list of resources in a component to expose update functions

  Arguments:
    resource = {
      name: String,
      parameters: {
        path: [{
          String: String
        }],
        query: [{
          String: String
        }]
      },
    }
    dependencies = [Any]

  Returns:
    ({
      updateFn: (currentReduxData, dataReturnedFromAPI) => ...,
      requestConfig: {
        url: String,
        method: String,
        body: Object,
        headers: Object
      },
      optimistic: Boolean, // whether to immediately update redux or not using updateFn
      refetch: Boolean, // whether to refetch resource with GET
      unloadResources: [{
        name: String,
        parameters: {
          path: [Object],
          query: [Object],
      }] // to unload any resources
    }) => {
      ...
    }
*/}

export const useUpdate = (resource, dependencies) => {
  return useCallback(async ({ 
      updateFn,
      requestConfig,
      optimistic,
      refetch,
      unloadResources= [] 
    }) => {
      const storeResource = storeRef.store.getState()[resource.name];
      const fallbackData = JSON.parse(JSON.stringify({ ...storeResource }));
      try {
        let key = resource.parameters && buildDataKeyFromParams(resource.parameters.path, resource.parameters.query);
        if (optimistic || (!requestConfig && !refetch)) {
          const updatedData = key ? updateFn(storeResource.paramData[key]) : updateFn(storeResource.data);
          storeRef.store.dispatch({
            type: `SET_${resource.name}`,
            payload: updatedData,
            parameters: resource.parameters,
          });
        } else {
          storeRef.store.dispatch({
            type: `SET_${resource.name}_LOADING`,
            parameters: resource.parameters,
          });
        }
        if (requestConfig) {
          const { data } = await callApi({ url: requestConfig.url || mapParamsAndQueryToUrl(apiCallsMap[resource.name], resource.parameters.path, resource.parameters.query), method: requestConfig.method, data: requestConfig.body, headers: requestConfig.headers });
          if (!refetch) {
            let updatedData = key ? updateFn(storeResource.paramData[key], data) : updateFn(storeResource.data, data);
            storeRef.store.dispatch({
              type: `SET_${resource.name}`,
              payload: updatedData,
              parameters: resource.parameters,
            });
          }
        } if (refetch) {
          storeRef.store.dispatch({
            type: `SET_${resource.name}_UNLOADED`,
            parameters: resource.parameters,
          });
        }
        console.log('unload:', unloadResources);
        unloadResources.forEach(resource => {
          storeRef.store.dispatch({
            type: `SET_${resource.name}_UNLOADED`,
            parameters: resource.parameters,
          });
        });
        return {
          success: true,
        }
      } catch(e) {
        storeRef.store.dispatch({
          type: `SET_${resource.name}`,
          payload: fallbackData.data,
        });
        return {
          success: false,
          error: e,
        }
      }
    }, dependencies)
  }