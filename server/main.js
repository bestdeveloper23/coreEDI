import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import pool from '../imports/api/dbConection.js';
import { config } from '../config/config.js';

require('./method.js');

Meteor.startup(() => {
  const query = "SELECT * FROM users WHERE username='" + config.SUPER_USERNAME + "'"
  pool.query(query, (e, r, f) => {
    if (e) console.log('error', e)
    else {
      if (r.length == 0) {
        const addquery = "INSERT INTO users (no, username, password, email, companyid ) VALUES (1,'" + config.SUPER_USERNAME + "', '" + config.SUPER_PASSWORD + "', '" + config.SUPER_USEREMAIL + "'," + config.SUPER_COMPANYID + ")";
        // pool.query(addquery, (err, re, fe) => {
        //   if (err) console.log(err)
        //   else console.log('admin add success!')
        // })
      }
      else console.log('admin already registered. Let\'s enjoy!')
    }
  })
});
