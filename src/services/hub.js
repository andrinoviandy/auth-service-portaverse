/**
 * Hub service
 *
 *  Accommodate api calls as main communication between services (servers)
 */

const axios = require("axios").default;

class Hub {
  constructor() {
    this.url = {
      USER_AUTH_SERVICES: process.env.USER_AUTH_SERVICES,
      EMPLOYEE_SERVICES: process.env.EMPLOYEE_SERVICES,
      REPO_SERVICES: process.env.REPO_SERVICES,
      GROUP_SERVICES: process.env.GROUP_SERVICES,
      BADGE_SERVICES: process.env.BADGE_SERVICES,
      SKILL_SERVICES: process.env.SKILL_SERVICES,
      KMAP_SERVICES: process.env.KMAP_SERVICES,
      COMMUNITY_SERVICES: process.env.COMMUNITY_SERVICES,
      SOCIAL_MEDIA_SERVICES: process.env.SOCIAL_MEDIA_SERVICES,
      GAMIFICATION_SERVICES: process.env.GAMIFICATION_SERVICES,
      NOTIFICATION_SERVICES: process.env.NOTIFICATION_SERVICES,
    };
    this.axios = axios;
    this.server = process.env.SERVER;
  }

  /**
   * Call api that require kms token
   *
   * @param target String => SKILL_SERVICES, SOCIAL_MEDIA_SERVICES, USER_SERVICES, EMPLOYEE_SERVICES
   * @param url String => /kmap
   * @param method String => get, post, put, delete
   * @param data Object
   * @param query String => key=value&key=value
   * @return AXIOS Promise
   */
  request({ target, _url, method, data = null, headers, query = null }) {
    let url = this.url[target] + _url;
    if (query) {
      url += `?${query}`;
    }

    if (headers["kms-authorization"]) {
      headers["kms-authorization"] = `Bearer ${headers["kms-authorization"]}`;
    }

    return this.axios({
      headers: {
        ...headers,
      },
      method: method,
      url: url,
      data: data,
    });
  }

  /**
   * Call test api
   *
   * @param header object
   * @param url String => /kmap
   * @param method String => get, post, put, delete
   * @param data Object
   * @param query String => key=value&key=value
   * @return AXIOS Promise
   */
  testRequest({ header, _url, method, data = null, query = null }) {
    let url = this.url[this.server] + _url;
    if (query) {
      url += `?${query}`;
    }

    const headers = { ...header };
    if (header?.authorization) {
      headers.authorization = `Bearer ${header.authorization}`;
    }
    if (header && header["kms-authorization"]) {
      headers["kms-authorization"] = `Bearer ${header["kms-authorization"]}`;
    }

    return this.axios({
      headers: {
        ...headers,
      },
      method: method,
      url: url,
      data: data,
    });
  }

  /**
   * Call api to other service
   *
   * @param target String => NEST, KMS, TMS, LMS
   * @param url String => /kmap
   * @param method String => get, post, put, delete
   * @param data Object
   * @param query String => key=value&key=value
   * @return AXIOS Promise
   */
  requestAsServer({
    target,
    _url,
    method,
    data = null,
    headers,
    query = null,
  }) {
    let url = this.url[target] + _url;
    if (query) {
      url += `?${query}`;
    }
    return this.axios({
      headers: {
        ...headers,
        "api-key": process.env.API_KEY,
      },
      method: method,
      url: url,
      data: data,
    });
  }
}

const serviceList = {
  USER_AUTH_SERVICES: "USER_AUTH_SERVICES",
  EMPLOYEE_SERVICES: "EMPLOYEE_SERVICES",
  REPO_SERVICES: "REPO_SERVICES",
  KMAP_SERVICES: "KMAP_SERVICES",
  COMMUNITY_SERVICES: "COMMUNITY_SERVICES",
  SOCIAL_MEDIA_SERVICES: "SOCIAL_MEDIA_SERVICES",
  GAMIFICATION_SERVICES: "GAMIFICATION_SERVICES",
  NOTIFICATION_SERVICES: "NOTIFICATION_SERVICES",
  SMARTPLAN_SERVICES: "SMARTPLAN_SERVICES",
  PELINDO_TRAVEL_SERVICES: "PELINDO_TRAVEL_SERVICES",
};

class HubBase {
  constructor(target, endpoints, headers) {
    this.service = (() => {
      const serviceMap = {};
      Object.keys(serviceList).forEach((service) => {
        Object.assign(serviceMap, { [service]: process.env[service] });
      });
      return serviceMap;
    })();
    this.target = this.service?.[target];
    this.endpoints = endpoints;
    this.axios = axios;
    this.server = process.env.SERVER;
    this.headers = headers;
  }

  /**
   * Call api to internal service
   *
   * @param target String => serviceList
   * @param url String => /kmap
   * @param method String => get, post, put, delete
   * @param data Object
   * @param query String => key=value&key=value
   * @return AXIOS Promise
   */
  requestTo({
    endpoint,
    method,
    data = null,
    params = null,
    headers,
    configs,
  }) {
    const url = this.target + (this.endpoints?.[endpoint]?.value || endpoint);

    return this.axios({
      method,
      url: url,
      data: data,
      params,
      ...configs,
      headers: {
        ...this.headers,
        ...headers,
        ...configs?.headers,
        ...(process.env.API_KEY
          ? { "api-key": process.env.API_KEY }
          : {}) /** communication into internal services (check on middleware role as SERVICE role_code) */,
      },
    });
  }

  requestPost(data) {
    return this.requestTo({
      ...data,
      method: "POST",
    });
  }

  async requestGet(data) {
    const response = await this.requestTo({
      ...data,
      method: "GET",
    });

    return response?.data?.data;
  }
}

module.exports = new Hub();
module.exports.HubBase = HubBase;
module.exports.serviceList = serviceList;
