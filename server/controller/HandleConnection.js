import { Meteor } from 'meteor/meteor';
import pool from '../../imports/api/dbConection.js';


Meteor.methods({
  'getConnections': function () {
    const s = 'SELECT\n' +
        '    c.id,\n' +
        '    c.customer_id,\n' +
        '    c.db_name,\n' +
        '    s1.name AS account_name,\n' +
        '    s2.name AS connection_name,\n' +
        '    c.last_ran_date,\n' +
        '    c.run_cycle,\n' +
        '    c.next_run_date,\n' +
        '    c.enabled\n' +
        'FROM\n' +
        '    connections c\n' +
        'JOIN\n' +
        '    softwares s1 ON c.account_id = s1.id\n' +
        'JOIN\n' +
        '    softwares s2 ON c.connection_id = s2.id;\n'
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

  'getConnectionFromId': function ( data ) {
    const s = 'SELECT * FROM connections WHERE id=' + data.id
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

  'getConnectionFromCustomerId': function ( data ) {
    const s = 'SELECT\n' +
        '    c.id,\n' +
        '    c.customer_id,\n' +
        '    c.db_name,\n' +
        '    s1.name AS account_name,\n' +
        '    s2.name AS connection_name,\n' +
        '    c.last_ran_date,\n' +
        '    c.run_cycle,\n' +
        '    c.next_run_date,\n' +
        '    c.enabled\n' +
        'FROM\n' +
        '    connections c\n' +
        'JOIN\n' +
        '    softwares s1 ON c.account_id = s1.id\n' +
        'JOIN\n' +
        '    softwares s2 ON c.connection_id = s2.id\n' +
        'WHERE c.customer_id=' + data.id
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

  'getConnectionSoftwareFromId': function ( data ) {
    const s = 'SELECT\n' +
        '    s1.name AS account_name,\n' +
        '    s2.name AS connection_name\n' +
        'FROM\n' +
        '    connections c\n' +
        'JOIN\n' +
        '    softwares s1 ON c.account_id = s1.id\n' +
        'JOIN\n' +
        '    softwares s2 ON c.connection_id = s2.id\n' +
        'WHERE\n' +
        '    c.id = ' + data.id;
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

  'addConnection': function ({ dbName, accName, connName, lastRanDate, runCycle, nextRunDate, enabled }) {
    return new Promise((resolve, reject) => {
        const addQuery = "INSERT INTO `coreedit`.`connections` (`db_name`, `acc_name`, `conn_name`, `last_ran_date`, `last_ran_date`, `next_run_date`, `enabled`) VALUES ('" + dbName + "' , '" + accName + "', '" + connName + "', '" + lastRanDate + "', '" + runCycle + "', '" + nextRunDate + "', '" + enabled + "');";
        pool.query(addQuery, (err, re, fe) => {
          if (err) console.log(err)
          else {
            console.log('new connection add success!')
            resolve('success')
          }
        })
    })
  },

  'reomoveConnection': function ( {id} ) {
    const query = "SELECT * FROM connections WHERE id = '" + id + "'"
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results, fields) => {
        if (error) reject(error)
        else {
          if (results.length != 0) {
            const removeQuery = "DELETE FROM `coreedit`.`connections` WHERE (`id` = '" + id + "');";
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

  'updateConnection': function ({id, customer_id, db_name, account_id, connection_id, last_ran_date, run_cycle, next_run_date, enabled }) {
    console.log('add Connection')
    const query = "SELECT * FROM connections WHERE id = '" + id + "'"
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results, fields) => {
        if (error) reject(error)
        else {
          if (results.length != 0) {
            const updateQuery = "UPDATE `coreedit`.`connections` SET customer_id='" + customer_id + "', db_name='" + db_name + "', account_id='" + account_id + "', connection_id='" + connection_id + "', last_ran_date='" + last_ran_date + "', enabled='" + enabled + "', next_run_date='" + next_run_date + "', run_cycle='" + run_cycle + "'WHERE id=" + id
            pool.query(updateQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                console.log('Connection Update success!')
                resolve('success')
              }
            })
          }
          else resolve('Ooooooooooooooooooopps ! ! !')
        }
      })
    })
  },

  'updateLastRanDate': function ({id, last_ran_date }) {
    const query = "SELECT * FROM connections WHERE id = '" + id + "'"
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results, fields) => {
        if (error) reject(error)
        else {
          if (results.length != 0) {
            const updateQuery = "UPDATE `coreedit`.`connections` SET last_ran_date='" + last_ran_date + "' WHERE id=" + id
            pool.query(updateQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                console.log('Connection Update success!')
                resolve('success')
              }
            })
          }
          else resolve('Ooooooooooooooooooopps ! ! !')
        }
      })
    })
  },

  'updateFrequency': function ({id, last_ran_date, next_run_date }) {
    const query = "SELECT * FROM connections WHERE id = '" + id + "'"
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results, fields) => {
        if (error) reject(error)
        else {
          if (results.length != 0) {
            const updateQuery = "UPDATE `coreedit`.`connections` SET last_ran_date='" + last_ran_date + "', next_run_date='" + next_run_date + "' WHERE id=" + id
            pool.query(updateQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                console.log('Connection Update success!')
                resolve('success')
              }
            })
          }
          else resolve('Ooooooooooooooooooopps ! ! !')
        }
      })
    })
  },

  'updateCycle': function ({id, run_cycle }) {
    const query = "SELECT * FROM connections WHERE id = '" + id + "'"
    return new Promise((resolve, reject) => {
      pool.query(query, (error, results, fields) => {
        if (error) reject(error)
        else {
          if (results.length != 0) {
            const updateQuery = "UPDATE `coreedit`.`connections` SET run_cycle='" + run_cycle + "' WHERE id=" + id
            pool.query(updateQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                console.log('Connection Update success!')
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
