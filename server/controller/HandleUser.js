import { Meteor } from 'meteor/meteor';
import pool from '../../imports/api/dbConection.js';


Meteor.methods({
    'getUser': function () {
      const s = 'SELECT * FROM users'
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

    'signIn': function ({ username, userpassword }) {
      const query = "SELECT * FROM users WHERE email = '" + username + "'"
      return new Promise((resolve, reject) => {
        pool.query(query, (error, results, fields) => {
          if (error) reject(error)
          else {
            if (results.length == 0) resolve('Incorrect Email address')
            else resolve(results[0].password == userpassword ? 'success' : 'passsword is incorrect!')
          }
        })
      })
    },

    'signUp': function ({ username, useremail, userpassword }) {
      console.log('signUp')
      const query = "SELECT * FROM users WHERE email = '" + useremail + "'"
      return new Promise((resolve, reject) => {
        pool.query(query, (error, results, fields) => {
          console.log(error, results)
          if (error) reject(error)
          else {
            if (results.length == 0) {
              const addquery = "INSERT INTO users (username, password, email, companyid ) VALUES ('" + username + "', '" + userpassword + "', '" + useremail + "'," + 1 + ")";
              pool.query(addquery, (err, re, fe) => {
                if (err) console.log(err)
                else {
                  console.log('new user add success!')
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
