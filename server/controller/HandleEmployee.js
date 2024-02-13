import { Meteor } from 'meteor/meteor';
import pool from '../../imports/api/dbConection.js';


Meteor.methods({
  'getEmployees': function () {
    const s = 'SELECT * FROM employees'
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

  'getEmployeesFromId': function ({ id }) {
    const s = "SELECT * FROM employees WHERE no='" + id + "'"
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

  'addEmployee': function (data) {
    console.log('add Employees  ===========================')
    const { employeeName, email, title, middleName, lastName, phone, mobile, suffix, fax, skypeID, firstName, gender } = data;
    const query1 = "SELECT * FROM employees WHERE employeeEmail = '" + email + "'";
    return new Promise((resolve, reject) => {
      pool.query(query1, (error, results, fields) => {
        console.log(results)
        if (error) reject(error)
        else {
          if (results.length == 0) {
            const addquery = "INSERT INTO `coreedit`.`employees` (`employeeName`, `employeeEmail`, `title`, `firstName`, `middleName`, `lastName`, `suffix`, `phone`, `mobile`, `fax`, `skypeId`, `gender`) VALUES ('" + employeeName + "', '" + email + "', '" + title + "', '" + firstName + "', '" + middleName + "', '" + lastName + "', '" + suffix + "', '" + phone + "', '" + mobile + "', '" + fax + "', '" + skypeID + "', '" + gender + "');";
            pool.query(addquery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                console.log('new employee add success!')
                resolve('success')
              }
            })
          }
          else resolve('Email address already used.')
        }
      })
    })
  },

  'reomoveEmployee': function ({ id }) {
    const query = "SELECT * FROM employees WHERE no = '" + id + "'"
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results, fields) => {
        if (error) reject(error)
        else {
          if (results.length != 0) {
            const removequery = "DELETE FROM `coreedit`.`employees` WHERE (`no` = '" + id + "');";
            pool.query(removequery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                console.log('new employee remove success!')
                resolve('success')
              }
            })
          }
          else resolve('Oooooops... Can\'t remove this customer.')
        }
      })
    })
  },

  'updateEmployee': function ({ id, employeeName, email, title, middleName, lastName, phone, mobile, suffix, fax, skypeID, firstName, gender }) {
    const query = "SELECT * FROM employees WHERE no = '" + id + "'"
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results, fields) => {
        if (error) reject(error)
        else {
          if (results.length != 0) {
            const updatequery = "UPDATE `coreedit`.`employees` SET employeeName='" + employeeName + "', employeeEmail='" + email + "', title='" + title + "', firstName='" + firstName + "', middleName='" + middleName + "', lastName='" + lastName + "', suffix='" + suffix + "', phone='" + phone + "', mobile='" + mobile + "', fax='" + fax + "', skypeId='" + skypeID + "', gender='" + gender + "' WHERE no='"+ id +"'";
            pool.query(updatequery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                console.log('new employee update   success!')
                resolve('success')
              }
            })
          }
          else resolve('Email address already used.')
        }
      })
    })
  }
});
