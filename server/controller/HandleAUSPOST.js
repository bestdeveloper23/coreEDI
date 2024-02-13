import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import pool from '../../imports/api/dbConection.js';

Meteor.methods({
    'checkAUSPOSTConnection': function (connectionURL, accountNumber, userAutorization) {
        return new Promise((resolve, reject) => {
          return HTTP.call('GET', `${connectionURL}/shipping/v1/accounts/${accountNumber}`, {
            headers: {
              'Authorization': userAutorization,
              'Content-Type': 'application/json',
              'account-number': accountNumber
            },
          }, (error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
        });
    },
    'checkAUSPOSTConnItem': function (connectionURL, accountNumber, userAutorization, jsonData) {
        return new Promise((resolve, reject) => {
          return HTTP.call('POST', `${connectionURL}/shipping/v1/prices/items`, {
            headers: {
              'Authorization': userAutorization,
              'Content-Type': 'application/json',
              'account-number': accountNumber,
              'Content-Length': Infinity
            },
            data: jsonData,
          }, (error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
        });
    },
    'checkAUSPOSTshipments': function (connectionURL, accountNumber, userAutorization, jsonData) {
        return new Promise((resolve, reject) => {
          return HTTP.call('POST', `${connectionURL}/shipping/v1/shipments`, {
            headers: {
              'Authorization': userAutorization,
              'Content-Type': 'application/json',
              'account-number': accountNumber,
              'Content-Length': Infinity
            },
            data: jsonData,
          }, (error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
        });
    },
});
