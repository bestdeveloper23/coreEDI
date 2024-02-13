import { Meteor } from 'meteor/meteor';
import pool from '../../imports/api/dbConection.js';


Meteor.methods({
  // 'getMagentoFromId': function ( data ) {
  //   const s = 'SELECT * FROM clientmagento WHERE id=' + data.id
  //   return new Promise((resolve, reject) => {
  //     pool.query(s, (error, results, fields) => {
  //       if (error) {
  //         reject(error)
  //       } else {
  //         resolve(results)
  //       }
  //     });
  //   });
  // },
  // 'getTrueERPFromId': function ( data ) {
  //   const s = 'SELECT * FROM clienttrueerp WHERE id=' + data.id
  //   return new Promise((resolve, reject) => {
  //     pool.query(s, (error, results, fields) => {
  //       if (error) {
  //         reject(error)
  //       } else {
  //         resolve(results)
  //       }
  //     });
  //   });
  // },
  'getAmazonFromId': function ( data ) {
    const s = 'SELECT * FROM clientamazon WHERE id=' + data.id
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
  'getColesFromId': function ( data ) {
    const s = 'SELECT * FROM clientcoles WHERE id=' + data.id
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
  'getPaychexFromId': function ( data ) {
    const s = 'SELECT * FROM clientpaychex WHERE id=' + data.id
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
  'getRoute4MeFromId': function ( data ) {
    const s = 'SELECT * FROM clientroute4me WHERE id=' + data.id
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
  'getSageAccountingFromId': function ( data ) {
    const s = 'SELECT * FROM clientsageaccounting WHERE id=' + data.id
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
  'getXeroFromId': function ( data ) {
    const s = 'SELECT * FROM clientxero WHERE id=' + data.id
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
  // 'getWooCommerceFromId': function ( data ) {
  //   const s = 'SELECT * FROM clientwoocommerce WHERE id=' + data.id
  //   return new Promise((resolve, reject) => {
  //     pool.query(s, (error, results, fields) => {
  //       if (error) {
  //         reject(error)
  //       } else {
  //         resolve(results)
  //       }
  //     });
  //   });
  // },
});
