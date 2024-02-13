import {BaseService} from './base-service.js';
export class CoreService extends BaseService {
    static getCurrentDatabase() {
        var erpGet = erpDb();
        return erpGet.ERPDatabase;
    }
}