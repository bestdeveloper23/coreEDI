import { Meteor } from 'meteor/meteor';
import pool from '../../imports/api/dbConection.js';


Meteor.methods({
  'getCustomers': function () {
    const s = 'SELECT * FROM customers'
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

  'getCustomerFromId': function ( data ) {
    const s = 'SELECT * FROM customers WHERE id=' + data.id
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

  'addCustomer': function ({ companyName, email, firstName, middleName, lastName, phone, mobile, fax, skypeID, website }) {
    console.log('add Customer')
    const query = "SELECT * FROM customers WHERE email = '" + email + "'"
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results, fields) => {
        if (error) reject(error)
        else {
          if (results.length == 0) {
            const addquery = "INSERT INTO `coreedit`.`customers` (`globalRef`, `name`, `email`, `country`, `address`, `phone`, `note`, `Mobile`, `citySubhurb`, `state`, `zipcode`, `accountNo`, `customerType`, `disCount`, `termName`, `firstName`, `middleName`, `lastName`, `companyName`, `fax`, `skypeID`, `website`) VALUES ('','" + companyName + "' , '" + email + "', '', '', '" + phone + "', '', '" + mobile + "', '', '', '', '0', '', '', '" + firstName + ' ' + middleName + ' ' + lastName + "', '" + firstName + "', '" + middleName + "', '" + lastName + "', '" + companyName + "', '" + fax + "', '" + skypeID + "', '" + website + "');";
            pool.query(addquery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                console.log('new user add success!')
                resolve('success')
              }
            })
          }
          else resolve('email used')
        }
      })
    })
  },

  'reomoveCustomer': function ( {id} ) {
    const query = "SELECT * FROM customers WHERE id = '" + id + "'"
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results, fields) => {
        if (error) reject(error)
        else {
          if (results.length != 0) {
            const removequery = "DELETE FROM `coreedit`.`customers` WHERE (`id` = '" + id + "');";
            pool.query(removequery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                console.log('new user remove success!')
                resolve('success')
              }
            })
          }
          else resolve('Oooooops... Can\'t remove this customer.')
        }
      })
    })
  },

  'updateCustomer': function ({id, companyName, email, firstName, middleName, lastName, phone, mobile, fax, skypeID, website }) {
    console.log('add Customer')
    const query = "SELECT * FROM customers WHERE id = '" + id + "'"
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results, fields) => {
        if (error) reject(error)
        else {
          if (results.length != 0) {
            const updatequery = "UPDATE `coreedit`.`customers` SET name='" + companyName + "', email='" + email + "', firstName='" + firstName + "', middlename='" + middleName + "', lastName='" + lastName + "', phone='" + phone + "', Mobile='" + mobile + "', fax = '" + fax + "', skypeID='" + skypeID + "', website='"+ website +"' WHERE id=" + id
            pool.query(updatequery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                console.log('Customer Update success!')
                resolve('success')
              }
            })
          }
          else resolve('Ooooooooooooooooooopps ! ! !')
        }
      })
    })
  },
});
