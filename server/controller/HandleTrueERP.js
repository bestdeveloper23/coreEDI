import { Meteor } from 'meteor/meteor';
import pool from '../../imports/api/dbConection.js';


Meteor.methods({
    'getTrueERP': function () {
        const s = 'SELECT * FROM clienttrueerp'
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

    'getTrueERPFromId': function ( data ) {
        const s = 'SELECT * FROM clienttrueerp WHERE id=' + data.id
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

    'getTrueERPFromCustomerId': function ( data ) {
        const s = 'SELECT * FROM clienttrueerp WHERE customer_id=' + data.id
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

    'addTrueERP': function ({ dbName, accName, connName, lastRanDate, runCycle, nextRunDate, enabled }) {
        console.log('add Connection')
        return new Promise((resolve, reject) => {
            const addQuery = "INSERT INTO `coreedit`.`clienttrueerp` (`db_name`, `acc_name`, `conn_name`, `last_ran_date`, `last_ran_date`, `next_run_date`, `enabled`) VALUES ('" + dbName + "' , '" + accName + "', '" + connName + "', '" + lastRanDate + "', '" + runCycle + "', '" + nextRunDate + "', '" + enabled + "');";
            pool.query(addQuery, (err, re, fe) => {
                if (err) console.log(err)
                else {
                    console.log('new connection add success!')
                    resolve('success')
                }
            })
        })
    },

    'reomoveTrueERP': function ( {id} ) {
        const query = "SELECT * FROM clienttrueerp WHERE id = '" + id + "'"
        return new Promise((resolve, reject) => {
            pool.query(query, (error, results, fields) => {
                if (error) reject(error)
                else {
                    if (results.length != 0) {
                        const removeQuery = "DELETE FROM `coreedit`.`clienttrueerp` WHERE (`id` = '" + id + "');";
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

    'updateTrueERP': function ({id, user_name, password, database, base_url, enabled }) {
        console.log('called!!!');
        console.log(id, user_name, password, database, base_url, enabled);
        const query = "SELECT * FROM clienttrueerp WHERE id = '" + id + "'"
        return new Promise((resolve, reject) => {
            pool.query(query, (error, results, fields) => {
                if (error) reject(error)
                else {
                    if (results.length != 0) {
                        let _enabled = enabled ? 1 : 0;
                        const updateQuery = "UPDATE `coreedit`.`clienttrueerp` SET user_name='" + user_name + "', password='" + password + "', `database`='" + database + "', base_url='" + base_url + "', enabled='" + _enabled + "' WHERE id=" + id
                        pool.query(updateQuery, (err, re, fe) => {
                            if (err) console.log(err)
                            else {
                                console.log('TrueERP Update success!')
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
