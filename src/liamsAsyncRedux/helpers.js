import axios from 'axios';

import { apiCallsMap } from './store';

const mapParamsToUrl = (baseUrl, params) => {
  let mappedUrl = baseUrl;

  for (const paramName in params) {
    if (params.hasOwnProperty(paramName)) {
      mappedUrl = mappedUrl.replace(`:${paramName}`, params[paramName]);
    }
  }

  return mappedUrl;
}

const mapQueryParamsToUrl = (baseUrl, queryParams) => {
  const urlSearchParams = new URLSearchParams(queryParams);
  const queryString = urlSearchParams.toString();

  if (queryString) {
    baseUrl += `?${queryString}`;
  }

  return baseUrl;
}

function objectToString(obj) {
  const sortedKeys = Object.keys(obj).sort();
  const keyValuePairs = sortedKeys.map(key => `${key}=${obj[key]}`);
  return keyValuePairs.join('-');
}

function objectsToString(obj1, obj2) {
  const str1 = objectToString(obj1);
  const str2 = objectToString(obj2);
  return `${str1}?${str2}`;
}

const client = axios.create({
  withCredentials: true,
});

export const mapParamsAndQueryToUrl = (baseUrl, params = {}, queryParams = {}) => {
  let mappedUrl = mapParamsToUrl(baseUrl, params);
  mappedUrl = mapQueryParamsToUrl(mappedUrl, queryParams);
  return mappedUrl;
}

export const buildDataKeyFromParams = (pathParams = {}, queryParams = {}) => {
  return objectsToString(pathParams, queryParams);
}

export const callApi = ({ url, headers, method, data, params={query: null, path: null} }) => client({ url: mapParamsAndQueryToUrl(url, params.path, params.query), method: method, data, headers });

export const getData = async (resource, dispatch) => {
  const { data } = await callApi({ url: apiCallsMap[resource.name], method: 'GET', params: resource.parameters });
  dispatch({
    type: `SET_${resource.name}`,
    payload: data,
    parameters: resource.parameters,
  });
  return;
};