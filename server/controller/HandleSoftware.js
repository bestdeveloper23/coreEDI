import { Meteor } from 'meteor/meteor';
import pool from '../../imports/api/dbConection.js';


Meteor.methods({
    'getSoftware': function () {
        const s = 'SELECT * FROM connections'
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

    'getSoftwareFromId': function ( data ) {
        const s = 'SELECT * FROM softwares WHERE id=' + data.id
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

    'getSoftwareFromCustomerId': function ( data ) {
        const s = 'SELECT * FROM connections WHERE customer_id=' + data.id
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

    'addSoftware': function ({ dbName, accName, connName, lastRanDate, runCycle, nextRunDate, enabled }) {
        console.log('add Connection')
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

    'reomoveSoftware': function ( {id} ) {
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

    'updateSoftware': function ({id, dbName, accId, connId, lastRanDate, runCycle, nextRunDate, enabled }) {
        console.log('add Connection')
        const query = "SELECT * FROM connections WHERE id = '" + id + "'"
        return new Promise((resolve, reject) => {
            pool.query(query, (error, results, fields) => {
                if (error) reject(error)
                else {
                    if (results.length != 0) {
                        const updateQuery = "UPDATE `coreedit`.`connections` SET db_name='" + dbName + "', account_id='" + accId + "', connection_id='" + connId + "', last_ran_date='" + lastRanDate + "', run_cycle='" + runCycle + "', next_run_date='" + nextRunDate + "', enabled='" + enabled + "'WHERE id=" + id
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
