import { Meteor } from 'meteor/meteor';
import pool from '../../imports/api/dbConection.js';
const axios = require('axios');
import { HTTP } from 'meteor/http';

Meteor.methods({
    'getMagento': function () {
        const s = 'SELECT * FROM clientmagento'
        return new Promise((resolve, reject) => {
            pool.query(s, (error, results, fields) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            });
        });
    },

    'getMagentoFromId': function ( data ) {
        const s = 'SELECT * FROM clientmagento WHERE id=' + data.id
        return new Promise((resolve, reject) => {
            pool.query(s, (error, results, fields) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            });
        });
    },

    'getMagentoFromCustomerId': function ( data ) {
        const s = 'SELECT * FROM clientmagento WHERE customer_id=' + data.id
        return new Promise((resolve, reject) => {
            pool.query(s, (error, results, fields) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            });
        });
    },

    'addMagento': function ({ dbName, accName, connName, lastRanDate, runCycle, nextRunDate, enabled }) {
        console.log('add Connection')
        return new Promise((resolve, reject) => {
            const addQuery = "INSERT INTO `coreedit`.`clientmagento` (`db_name`, `acc_name`, `conn_name`, `last_ran_date`, `last_ran_date`, `next_run_date`, `enabled`) VALUES ('" + dbName + "' , '" + accName + "', '" + connName + "', '" + lastRanDate + "', '" + runCycle + "', '" + nextRunDate + "', '" + enabled + "');";
            pool.query(addQuery, (err, re, fe) => {
                if (err) console.log(err)
                else {
                    console.log('new connection add success!')
                    resolve('success')
                }
            })
        })
    },

    'reomoveMagento': function ( {id} ) {
        const query = "SELECT * FROM clientmagento WHERE id = '" + id + "'"
        return new Promise((resolve, reject) => {
            pool.query(query, (error, results, fields) => {
                if (error) reject(error)
                else {
                    if (results.length != 0) {
                        const removeQuery = "DELETE FROM `coreedit`.`clientmagento` WHERE (`id` = '" + id + "');";
                        pool.query(removeQuery, (err, re, fe) => {
                            if (err) console.log(err)
                            else {
                                console.log('One connection remove success!')
                                resolve('success')
                            }
                        })
                    }
                    else resolve('Oooooops... Can\'t remove this connection.')
                }
            })
        })
    },

    'updateMagento': function ({id, company_name, consumer_key, consumer_secret, admin_user_name, admin_user_password, base_api_url, access_token, access_token_secret, synch_page_size, sales_type, customer_identified_by, product_name, print_name_to_short_description, enabled }) {
        const query = "SELECT * FROM clientmagento WHERE id = '" + id + "'"
        return new Promise((resolve, reject) => {
            pool.query(query, (error, results, fields) => {
                if (error) reject(error)
                else {
                    if (results.length != 0) {
                        let _enabled = enabled ? 1 : 0;
                        let _print_name_to_short_description = print_name_to_short_description ? 1 : 0;
                        const updateQuery = "UPDATE `coreedit`.`clientmagento` SET company_name='" + company_name + "', consumer_key='" + consumer_key + "', consumer_secret='" + consumer_secret + "', admin_user_name='" + admin_user_name + "', admin_user_password='" + admin_user_password + "', base_api_url='" + base_api_url + "', access_token='" + access_token + "', access_token_secret='" + access_token_secret + "', synch_page_size='" + synch_page_size + "', sales_type='" + sales_type + "', customer_identified_by='" + customer_identified_by + "', product_name='" + product_name + "', print_name_to_short_description='" + _print_name_to_short_description + "', enabled='" + _enabled + "'WHERE id=" + id
                        pool.query(updateQuery, (err, re, fe) => {
                            if (err) console.log(err)
                            else {
                                console.log('Magento Update success!')
                                resolve('success')
                            }
                        })
                    }
                    else resolve('Ooooooooooooooooooopps ! ! !')
                }
            })
        })
    },

    'getMagentoAdminToken': function (reqData) {
        try {
          const response = HTTP.post(`${reqData.url}/rest/V1/integration/admin/token`, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Credentials': 'true'
            },
            data: {
              username: reqData.username,
              password: reqData.password,
            },
          });
    
          return response.data;
        } catch (error) {
          throw new Meteor.Error("api-error", error.response.data);
        }
      },
    
      'addOrUpdateMagentoCustomer': function (url, accessToken, customerData) {
        try {
          const response = HTTP.post(`${url}/rest/V1/customers`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            data: customerData,
          });
    
          return response.data;
        } catch (error) {
          throw new Meteor.Error("api-error", error.response.data.message);
        }
      },
    
      'addOrUpdateMagentoProduct': function (url, accessToken, productData) {
        try {
          const response = HTTP.post(`${url}/rest/V1/products`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            data: productData,
          });
    
          return response.data;
        } catch (error) {
          throw new Meteor.Error("api-error", error.response.data.message);
        }
      },
    
      'findMagentoCustomerByEmail': function (url, email, accessToken) {
        try {
          const response = HTTP.get(`${url}/rest/V1/customers/search?searchCriteria[filter_groups][0][filters][0][field]=email&searchCriteria[filter_groups][0][filters][0][value]=${email}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
          });
    
          return response?.data?.items[0];
        } catch (error) {
          throw new Meteor.Error("api-error", error.response.data.message);
        }
      },
    
      'updateMagentoCustomer': function (url, customerId, customerData, accessToken) {
        try {
          const response = HTTP.put(`${url}/rest/V1/customers/${customerId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            data: customerData,
          });
    
          return response.data;
        } catch (error) {
          throw new Meteor.Error("api-error", error.response.data.message);
        }
      },

      'getMagentoUpdatedCustomers': function (url, accessToken, lastSyncTime) {
        console.log(url, accessToken, lastSyncTime);
        try {
          const response = HTTP.get(`${url}/rest/V1/customers/search?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lastSyncTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
          });
    
          return response.data;
        } catch (error) {
          throw new Meteor.Error("api-error", error.response.data.message);
        }
      },

      'getMagentoUpdatedInvoices': function (url, accessToken, lastSyncTime) {
        try {
          const response = HTTP.get(`${url}/rest/V1/invoices?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lastSyncTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
          });
    
          return response.data;
        } catch (error) {
          throw new Meteor.Error("api-error", error.response.data.message);
        }
      },
});
