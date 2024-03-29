import { _ERP_BASE_API, _IPADDRESS, _PORT } from "../../erpconnection";

export default class ApiService {
  constructor() {
    this.erpGet = erpDb();
    this.ERPObjects = ERPObjects();
  }

  /**
   * @param {string} endpoint my-endpoint
   * @returns {URL}
   */
  static getBaseUrl({ endpoint = null, isUrl = true }) {
    let _url = `${_IPADDRESS}:${_PORT}/${_ERP_BASE_API}/`;
    if (endpoint != null) {
      _url = `${_IPADDRESS}:${_PORT}/${_ERP_BASE_API}/${endpoint}`;
    }

    if (isUrl == true) return _url;
    return _url;
  }

  /**
   *
   * @returns {HeadersInit}
   */
  static getHeaders() {
    let headers = {
      database: erpDb().ERPDatabase,
      username: erpDb().ERPUsername,
      password: erpDb().ERPPassword,
    };
    return headers;
  }

  /**
   *
   * @returns {HeadersInit}
   */
  static getPostHeaders() {
    let postHeaders = {
      database: erpDb().ERPDatabase,
      username: erpDb().ERPUsername,
      password: erpDb().ERPPassword,
    };

    return postHeaders;
  }
}
