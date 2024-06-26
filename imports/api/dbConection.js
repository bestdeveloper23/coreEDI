// @ts-nocheck

import mysql from 'mysql';
import { config } from '../../config/config';
import { JsonRoutes } from 'meteor/simple:json-routes';
import bodyParser from 'body-parser';
var fs = require('fs');
var FormData = require('form-data');
const axios = require('axios').default;

// const pool = createPool({
//   host: config.host,
//   user: config.user,
//   password: config.password,
//   database: config.database,
//   charset: config.charset // Required for MySQL 8
// });

const jsonParser = bodyParser.json();

var db_config = {
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
};

var pool;

function handleDisconnect() {
  pool = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.

  pool.connect(function (err) {              // The server is either down
    if (err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  pool.on('error', function (err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {
      console.log(err);                                     // connnection idle timeout (the wait_timeout                                  // server variable configures this)
    }
  });
}

handleDisconnect();

function handleError(error, res) { //Handle All Errors From here
  if (error) {
    console.log(error);
    // JsonRoutes.sendResult(res, {
    //   code: '500',
    //   data: error
    // });
  }
};

Meteor.startup(() => {
  JsonRoutes.add('post', '/api/admin/verify/email', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM users WHERE email = '" + data.email + "'"
      pool.query(query, function (error, results) {
        if (results.length == 0) {
          const query2 = "SELECT * FROM customers WHERE logon_name = '" + data.email + "'"
          pool.query(query2, function (error, result) {
            if (error) {
              handleError(error, res);
            }
            return JsonRoutes.sendResult(res, {
              data: {
                result: result,
                super: false
              }
            })
          })
        }
        else return JsonRoutes.sendResult(res, {
          data: {
            result: results,
            super: true
          }
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/admin/signup', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM users WHERE email = '" + data.useremail + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          if (results.length == 0) {
            const addquery = "INSERT INTO users (username, password, email, companyid ) VALUES ('" + data.username + "', '" + data.userpassword + "', '" + data.useremail + "'," + 1 + ")";
            pool.query(addquery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            return JsonRoutes.sendResult(res, {
              data: 'Email address already used.'
            });
          }
        }
      })
    });
  });

  JsonRoutes.add('post', '/api/customers', function (req, res) {
    jsonParser(req, res, () => {
      const query = 'SELECT * FROM customers'
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/customersByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM customers WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/transfertypesByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM transfer_types WHERE connection_id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/identifiertypesByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM identifier WHERE connection_id=' + data.id||0
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });
/*
/*
  JsonRoutes.add('post', '/api/updatetransfertypes', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      for(let i = 0; i< data.length; i++){
        let transfer_type = data[i]
        let id = transfer_type.id
        let status = 0
        if(transfer_type.checked == true)
          status = 1
          const query = "UPDATE transfer_types SET status = '" + status + "'WHERE id = '" + id+ "'"
          pool.query(query, (error, results, fields) => {
            if (error) {
              handleError(error, res);
            }
          });
      }
      return JsonRoutes.sendResult(res, {
        data: 'success'
      });
    });
  });
*/

JsonRoutes.add('post', '/api/updatetransfertypes', function (req, res) {
  jsonParser(req, res, () => {
    const data = req.body;
    for(let i = 0; i< data.length; i++){
      let transfer_type = data[i];
      let id = transfer_type.id;
      let status = 0;
      let connectionID = transfer_type.connection_id;
      let tabID = transfer_type.tab_id;
      let transferType = transfer_type.transfer_type;
      if(transfer_type.checked == true){
        status = 1
      };
      const querySelect = "SELECT * FROM transfer_types WHERE id = '"+ id+ "'";
      pool.query(querySelect, (error, resultSelect, fields) => {
        if (error) {
          handleError(error, res);
        }else {
          if (resultSelect.length != 0) {//Update Data
            const query = "UPDATE transfer_types SET status = '" + status + "' WHERE id = '" + id+ "'"
            pool.query(query, (error, results, fields) => {
              if (error) {
                handleError(error, res);
              }
            });
          }else{
            //Insert NEW
           const queryInsert = `INSERT IGNORE INTO transfer_types (transfer_type, status, connection_id, tab_id) VALUES ('${transferType}', '${status}', '${connectionID}', '${tabID}')`;
           pool.query(queryInsert, (error, results, fields) => {
             if (error) {
               handleError(error, res);
             }
           });
          }
        }
      });

    }
    return JsonRoutes.sendResult(res, {
      data: 'success'
    });
  });
});

  JsonRoutes.add('post', '/api/employees', function (req, res) {
    jsonParser(req, res, () => {
      const query = 'SELECT * FROM employees'
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('get', '/api/getAccSoft', function (req, res) {
    jsonParser(req, res, () => {
      const query = `SELECT * FROM clienttrueerp`;
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      })
    })
  })

  JsonRoutes.add('post', '/api/getAccSoftt', function (req, res) {
    console.log(req)
    jsonParser(req, res, () => {

      const query = `SELECT * FROM clienttrueerp WHERE id = ${req.body.id}`;
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      })
    })
  })

  JsonRoutes.add('post', '/api/connections', function (req, res) {
    jsonParser(req, res, () => {
      const query = 'SELECT\n' +
        '    c.id,\n' +
        '    c.customer_id,\n' +
        '    c.db_name,\n' +
        '    s1.name AS account_name,\n' +
        '    s2.name AS connection_name,\n' +
        '    s3.name AS customer_name,\n' +
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
        'JOIN\n' +
        '    customers s3 ON c.customer_id = s3.id;\n'
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/transactions', function (req, res) {
    jsonParser(req, res, () => {
      let customerId = parseInt(req.body.id);
      const query = `SELECT
                        t.id,
                        s1.name AS accounting_soft_name,
                        s2.name AS connection_soft_name,
                        t.date,
                        t.order_num,
                        t.uploaded_num,
                        t.downloaded_num
                    FROM
                        transactions t
                    JOIN
                        softwares s1 ON t.accounting_soft = s1.id
                    JOIN
                        softwares s2 ON t.connection_soft = s2.id
                    JOIN
                        connections c ON t.connection_id = c.id
                    WHERE
                        c.customer_id = ${customerId}
                    GROUP BY
                        t.id, s1.name, s2.name, t.date;`
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/transactions-detail', function (req, res) {
    jsonParser(req, res, () => {
      const query = 'SELECT\n' +
        '    transaction_id,\n' +
        '    detail_string,\n' +
        '    count,\n' +
        '    date\n' +
        'FROM\n' +
        '    transactions_detail\n' +
        'WHERE\n' +
        `    transaction_id = ${req.body.id};\n`
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/getfirst-transactions-detail', function (req, res) {
    jsonParser(req, res, () => {
      const query = `SELECT
                          t.id
                      FROM
                          transactions t
                      JOIN
                          softwares s1 ON t.accounting_soft = s1.id
                      JOIN
                          softwares s2 ON t.connection_soft = s2.id
                      JOIN
                          connections c ON t.connection_id = c.id
                      WHERE
                          c.customer_id = ${req.body.id}
                      GROUP BY
                          t.id, s1.name, s2.name, t.date
                      ORDER BY
                          t.date DESC
                      LIMIT 1;`
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });
  JsonRoutes.add('post', '/api/inserttransaction', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const insertQuery = "INSERT INTO `transactions` SET accounting_soft='" + data.accounting_soft + "', connection_soft='" + data.connection_soft + "', date='" + data.date + "', order_num='" +
      data.order_num + "', products='" + data.products + "', products_num='" + data.products_num + "', uploaded_num='" + data.uploaded_num +"', downloaded_num='" + data.downloaded_num + "', connection_id='" + data.connection_id + "'";
      pool.query(insertQuery, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results.insertId
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/addtransaction', function (req, res) {
    jsonParser(req, res, () => {
      const id = req.body.id;
      const data = req.body.transaction_data;
      const insertQuery = "UPDATE transactions SET order_num='" +
      data.order_num + "', products='" + data.products + "', products_num='" + data.products_num + "', uploaded_num='" + data.uploaded_num +
      "', downloaded_num='" + data.downloaded_num + "' WHERE id = " + id + ";";
      pool.query(insertQuery, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results.insertId
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/transactionByDate', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const insertQuery = "SELECT * FROM transactions WHERE date='" + data.date + "';";
      pool.query(insertQuery, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results[0] || "No Result"
        });
      });
    });
  });
  JsonRoutes.add('post', '/api/inserttransactionDetails', function (req, res) {
    jsonParser(req, res, () => {
      let transaction_details = req.body['transaction_details'];
      let transactionId = req.body['transactionId'];
      let detail_string = "";
      let date = req.body['date'];
      let count = 0;
      for(let i = 0; i< transaction_details.length; i++){
        let transaction_detail = transaction_details[i]
        detail_string = transaction_detail['detail_string']
        count = transaction_detail['count']
        const insertQuery = "INSERT INTO `transactions_detail` SET transaction_id='" + transactionId + "', detail_string='" + detail_string + "', count='" + count + "', date='" + date + "'";
        pool.query(insertQuery, function (error, results) {
          if (error) {
            handleError(error, res);
          }
        });
      }
      return JsonRoutes.sendResult(res, {
        data: 'Success'
      });
    });
  });

  JsonRoutes.add('post', '/api/connectionsByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      // const query = 'SELECT * FROM connections WHERE id=' + data.id;
      const query = 'SELECT\n' +
        '    c.id,\n' +
        '    c.customer_id,\n' +
        '    c.db_name,\n' +
        '    s1.name AS account_name,\n' +
        '    s1.id AS account_id,\n' +
        '    s2.name AS connection_name,\n' +
        '    s2.id AS connection_id,\n' +
        '    s3.name AS customer_name,\n' +
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
        'JOIN\n' +
        '    customers s3 ON c.customer_id = s3.id\n' +
        'WHERE c.id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/connectionsByCustomerID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT\n' +
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
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/connectionsSoftwareByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT\n' +
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
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/employeesByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM employees WHERE no='" + data.id + "'"
      pool.query(query, function (error, results) {
        if (error) {
        handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/TrueERPByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM clienttrueerp WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/MagentoByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM clientmagento WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/AustraliaPOSTByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM clientaustraliapost WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/WooCommerceByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM clientwoocommerce WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/ZohoByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM clientzoho WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/XeroByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM clientxero WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/AmazonByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM clientamazon WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/Route4MeByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM clientroute4me WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/XeroSageAccounting', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM clientsageaccounting WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/updateMagento', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM clientmagento WHERE id = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }else {
          if (results.length != 0) {
            let _enabled = data.enabled ? 1 : 0;
            let _print_name_to_short_description = data.print_name_to_short_description ? 1 : 0;
            let _transfer_type_customers = data.transfer_type_customers ? 1 : 0;
            let _transfer_type_products = data.transfer_type_products ? 1 : 0;
            let _transfer_type_options = data.transfer_type_options ? 1 : 0;
            let _transfer_type_qty = data.transfer_type_qty ? 1 : 0;
            let _transfer_type_pictures = data.transfer_type_pictures ? 1 : 0;
            const updateQuery =
              "UPDATE `clientmagento` SET company_name='" +
              data.company_name +
              "', consumer_key='" +
              data.consumer_key +
              "', consumer_secret='" +
              data.consumer_secret +
              "', admin_user_name='" +
              data.admin_user_name +
              "', admin_user_password='" +
              data.admin_user_password +
              "', base_api_url='" +
              data.base_api_url +
              "', access_token='" +
              data.access_token +
              "', access_token_secret='" +
              data.access_token_secret +
              "', synch_page_size='" +
              data.synch_page_size +
              "', sales_type='" +
              data.sales_type +
              "', customer_identified_by='" +
              data.customer_identified_by +
              "', product_name='" +
              data.product_name +
              "', print_name_to_short_description='" +
              _print_name_to_short_description +
              "', enabled='" +
              _enabled +
              "', transfer_type_customers='" +
              _transfer_type_customers +
              "', transfer_type_products='" +
              _transfer_type_products +
              "', transfer_type_options='" +
              _transfer_type_options +
              "', transfer_type_qty='" +
              _transfer_type_qty +
              "', transfer_type_pictures='" +
              _transfer_type_pictures +
              "'WHERE id=" +
              data.id;
            pool.query(updateQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            let _enabled = data.enabled ? 1 : 0;
            let _print_name_to_short_description = data.print_name_to_short_description ? 1 : 0;
            const insertQuery =
              "INSERT INTO `clientmagento` SET id='" +
              data.id +
              "',company_name='" +
              data.company_name +
              "', consumer_key='" +
              data.consumer_key +
              "', consumer_secret='" +
              data.consumer_secret +
              "', admin_user_name='" +
              data.admin_user_name +
              "', admin_user_password='" +
              data.admin_user_password +
              "', base_api_url='" +
              data.base_api_url +
              "', access_token='" +
              data.access_token +
              "', access_token_secret='" +
              data.access_token_secret +
              "', synch_page_size='" +
              data.synch_page_size +
              "', sales_type='" +
              data.sales_type +
              "', customer_identified_by='" +
              data.customer_identified_by +
              "', product_name='" +
              data.product_name +
              "', print_name_to_short_description='" +
              _print_name_to_short_description +
              "', enabled='" +
              _enabled +
              "', transfer_type_customers='" +
              _transfer_type_customers +
              "', transfer_type_products='" +
              _transfer_type_products +
              "', transfer_type_options='" +
              _transfer_type_options +
              "', transfer_type_qty='" +
              _transfer_type_qty +
              "', transfer_type_pictures='" +
              _transfer_type_pictures +
              "'";
            pool.query(insertQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
        }
      })
    });
  });

  JsonRoutes.add('post', '/api/updateZoho', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM clientzoho WHERE id = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        } else {
          if (results.length != 0) {
            let _enabled = data.enabled ? 1 : 0;
            let _transfer_type_salesorder = data.transfer_type_salesorder ? 1 : 0;
            let _transfer_type_customers = data.transfer_type_customers ? 1 : 0;
            let _transfer_type_products = data.transfer_type_products ? 1 : 0;
            let _transfer_type_quotes = data.transfer_type_quotes ? 1 : 0;

            const updateQuery =
              "UPDATE `clientzoho` SET client_id='" + data.client_id +
              "', client_secret='" + data.client_secret +
              "', redirect_uri='" + data.redirect_uri +
              "', print_name_to_short_description='" + data.print_name_to_short_description +
              "', customer_identified_by='" + data.customer_identified_by +
              "', access_token='" + data.access_token +
              "', refresh_token='" + data.refresh_token +
              "', enabled='" + _enabled +
              "', transfer_type_salesorder='" + _transfer_type_salesorder +
              "', transfer_type_customers='" + _transfer_type_customers +
              "', transfer_type_products='" + _transfer_type_products +
              "', transfer_type_quotes='" + _transfer_type_quotes +
              "', username='" + data.username +
              "', password='" + data.password +
              "'WHERE id=" + data.id;
            pool.query(updateQuery, (err, re, fe) => {
              if (err) {
                console.log(err);
                return JsonRoutes.error(err);
              }
              else {
                return JsonRoutes.sendResult(res, {
                  data: "success",
                });
              }
            });
          } else {
            let _enabled = data.enabled ? 1 : 0;
            let _transfer_type_salesorder = data.transfer_type_salesorder ? 1 : 0;
            let _transfer_type_customers = data.transfer_type_customers ? 1 : 0;
            let _transfer_type_products = data.transfer_type_products ? 1 : 0;
            let _transfer_type_quotes = data.transfer_type_quotes ? 1 : 0;
            const insertQuery =
              "INSERT INTO `clientzoho` SET id='" + data.id +
              "',client_id='" + data.client_id +
              "', client_secret='" + data.client_secret +
              "', redirect_uri='" + data.redirect_uri +
              "', print_name_to_short_description='" + data.print_name_to_short_description +
              "', customer_identified_by='" + data.customer_identified_by +
              "', access_token='" + data.access_token +
              "', refresh_token='" + data.refresh_token +
              "', enabled='" + _enabled +
              "', transfer_type_salesorder='" + _transfer_type_salesorder +
              "', transfer_type_customers='" + _transfer_type_customers +
              "', transfer_type_products='" + _transfer_type_products +
              "', transfer_type_quotes='" + _transfer_type_quotes +
              "', username='" + data.username +
              "', password='" + data.password +
              "'";
            pool.query(insertQuery, (err, re, fe) => {
              if (err) {
                console.log(err);
                return JsonRoutes.error(err);
              }
              else {
                return JsonRoutes.sendResult(res, {
                  data: "success",
                });
              }
            });
          }
        }
      });
    });
  });

  JsonRoutes.add('post', '/api/updateZohoToken', function (req, res) {
    jsonParser(req, res, () => {
            const data = req.body;
            const updateQuery =
              "UPDATE `clientzoho` SET access_token='" + data.access_token + "' WHERE refresh_token='"+ data.refresh_token+"'";
            pool.query(updateQuery, (err, re, fe) => {
              if (err) {
                console.log(err);
                return JsonRoutes.error(err);
              }
              else {
                return JsonRoutes.sendResult(res, {
                  data: "success",
                });
              }
            });
      });
    });

  JsonRoutes.add('post', '/api/updateWooCommerce', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM clientwoocommerce WHERE id = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          console.log(results);
          if (results.length != 0) {
            let _enabled = data.enabled ? 1 : 0;
            const updateQuery = `UPDATE clientwoocommerce SET emailkey = '${data.email}', secret = '${data.password}', base_url = '${data.url}', enabled = '${_enabled}' WHERE id = '${data.id}'`;

            pool.query(updateQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            let _enabled = data.enabled ? 1 : 0;
            const insertQuery = `INSERT INTO clientwoocommerce SET id = '${data.id}', emailkey = '${data.email}', secret = '${data.password}', base_url = '${data.url}', enabled = '${_enabled}' `;

            pool.query(insertQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
        }
      })
    });
  });

  JsonRoutes.add('post', '/api/updateAustpost', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM clientaustraliapost WHERE id = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          if (results.length != 0) {
            let _enabled = data.enabled ? 1 : 0;
            const updateQuery = "UPDATE `clientaustraliapost` SET api_key='" + data.key + "', password='" + data.password + "', reference='" + data.reference + "', email='" + data.email + "', name='" + data.name + "', base_url='" + data.url + "', product='" + data.products + "', account_number='" + data.accountNumber + "', enabled='" + _enabled + "'WHERE id=" + data.id
            pool.query(updateQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            let _enabled = data.enabled ? 1 : 0;
            const insertQuery = "INSERT INTO `clientaustraliapost` SET api_key='" + data.key + "', password='" + data.password + "', reference='" + data.reference + "', email='" + data.email + "', name='" + data.name + "', base_url='" + data.url + "', product='" + data.products + "', account_number='" + data.accountNumber + "', enabled='" + _enabled + "'"
            pool.query(insertQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
        }
      })
    });
  });

  JsonRoutes.add('post', '/api/updateTrueERP', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM clienttrueerp WHERE id = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          if (results.length != 0) {
            let _enabled = data.enabled ? 1 : 0;
            const updateQuery = "UPDATE `clienttrueerp` SET user_name='" + data.user_name +
                                "', password='" + data.password +
                                "', `database`='" + data.database +
                                "', base_url='" + data.base_url +
                                "', invoice_template='" + data.invoice_template +
                                "', customer_type='" + data.customer_type +
                                "', enabled='" + _enabled +
                                "' WHERE id=" + data.id
            pool.query(updateQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            let _enabled = data.enabled ? 1 : 0;
            const insertQuery = "INSERT INTO clienttrueerp (`id`, `user_name`, `password`, `database`, `base_url`, `enabled`, `customer_type`, `invoice_template`) VALUES ('" +
                                data.id + "','" + data.user_name + "', '" + data.password + "', '" + data.database + "', '" + data.base_url + "', '" + _enabled + "', '" + data.customer_type + "', '" + data.invoice_template + "');";
              pool.query(insertQuery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
        }
      })
    });
  });

  JsonRoutes.add('post', '/api/addEmployee', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM employees WHERE employeeEmail = '" + data.email + "'";
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          if (results.length == 0) {
            const addquery = "INSERT INTO `employees` (`employeeName`, `employeeEmail`, `title`, `firstName`, `middleName`, `lastName`, `suffix`, `phone`, `mobile`, `fax`, `skypeId`, `gender`, `note`, `username`, `password`) VALUES ('" + data.employeeName + "', '" + data.email + "', '" + data.title + "', '" + data.firstName + "', '" + data.middleName + "', '" + data.lastName + "', '" + data.suffix + "', '" + data.phone + "', '" + data.mobile + "', '" + data.fax + "', '" + data.skypeID + "', '" + data.gender + "', '" + data.note + "', '" + data.username + "', '" + data.password + "');";
            pool.query(addquery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            // return JsonRoutes.sendResult(res, {
            //   code: '500',
            //   data: 'Ooooooooooooooooooopps ! ! !'
            // });
          }
        }
      })
    });
  });

  JsonRoutes.add('post', '/api/updateEmployee', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM employees WHERE no = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          if (results.length != 0) {
            const updatequery = "UPDATE `employees` SET employeeName='" + data.employeeName + "', employeeEmail='" + data.email + "', title='" + data.title + "', firstName='" + data.firstName + "', middleName='" + data.middleName + "', lastName='" + data.lastName + "', suffix='" + data.suffix + "', phone='" + data.phone + "', mobile='" + data.mobile + "', fax='" + data.fax + "', skypeId='" + data.skypeID + "', gender='" + data.gender + "', note='" + data.note + "', username='" + data.username + "', password='" + data.password + "' WHERE no='" + data.id + "'";
            pool.query(updatequery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            // return JsonRoutes.sendResult(res, {
            //   code: '500',
            //   data: 'Ooooooooooooooooooopps ! ! !'
            // });
          }
        }
      })
    });
  });

  JsonRoutes.add('post', '/api/removeEmployee', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM employees WHERE no = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          if (results.length != 0) {
            const removequery = "DELETE FROM `employees` WHERE (`no` = '" + data.id + "');";
            pool.query(removequery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            // return JsonRoutes.sendResult(res, {
            //   code: '500',
            //   data: 'Ooooooooooooooooooopps ! ! !'
            // });
          }
        }
      })
    });
  });

  // JsonRoutes.add("POST", '/api/addTransaction', async function (req, res) {
  //   jsonParser(rq, res, () => {
  //     const data = req.body;
  //     const query
  //   })
  // })

  JsonRoutes.add('post', '/api/addCustomer', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM customers WHERE email = '" + data.email + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          if (results.length == 0) {
            const addquery = "INSERT INTO `customers` (`globalRef`, `name`, `email`, `country`, `address`, `phone`, `note`, `Mobile`, `citySubhurb`, `state`, `zipcode`, `accountNo`, `customerType`, `disCount`, `termName`, `firstName`, `middleName`, `lastName`, `companyName`, `fax`, `skypeID`, `website`, `logon_name`, `logon_password`) VALUES ('','" + data.companyName + "' , '" + data.email + "', '', '', '" + data.phone + "', '', '" + data.mobile + "', '', '', '', '0', '', '', '" + data.firstName + ' ' + data.middleName + ' ' + data.lastName + "', '" + data.firstName + "', '" + data.middleName + "', '" + data.lastName + "', '" + data.companyName + "', '" + data.fax + "', '" + data.skypeID + "', '" + data.website + "', '" + data.logon_name + "', '" + data.logon_password + "');";
            pool.query(addquery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            return JsonRoutes.sendResult(res, {
              data: 'email used'
            });
          }
        }
      })
    });
  });

  JsonRoutes.add('post', '/api/updateCustomer', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM customers WHERE id = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          if (results.length != 0) {
            const updatequery = "UPDATE `customers` SET" +
              " name='" + data.companyName +
              "', email='" + data.email +
              "', firstName='" + data.firstName +
              "', middlename='" + data.middleName +
              "', lastName='" + data.lastName +
              "', phone='" + data.phone +
              "', Mobile='" + data.mobile +
              "', fax = '" + data.fax +
              "', skypeID='" + data.skypeID +
              "', website='" + data.website +
              "', logon_name='" + data.logon_name +
              "', logon_password='" + data.logon_password +
              "' WHERE id=" + data.id
            pool.query(updatequery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            // return JsonRoutes.sendResult(res, {
            //   code: '500',
            //   data: 'Ooooooooooooooooooopps ! ! !'
            // });
          }
        }
      })
    });
  });

  JsonRoutes.add('post', '/api/removeCustomer', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM customers WHERE id = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          if (results.length != 0) {
            const removequery = "DELETE FROM `customers` WHERE (`id` = '" + data.id + "');";
            pool.query(removequery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
                });
              }
            })
          }
          else {
            // return JsonRoutes.sendResult(res, {
            //   code: '500',
            //   data: 'Ooooooooooooooooooopps ! ! !'
            // });
          }
        }
      })
    });
  });

  JsonRoutes.add('post', '/api/softwareByID', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM softwares WHERE id=' + data.id
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/softwareData', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM softwares WHERE name <>  "TrueERP"';
      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/getInvoiceList', async function (req, res) {
    await jsonParser(req, res, async () => {
      const data = req.body;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
      await axios(data)
        .then((result) => {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
          data = result.data;
          JsonRoutes.sendResult(res, {
            data: data
          });
        })
        .catch((error) => {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
          handleError(error, res);
        })
    });
  });


  JsonRoutes.add('post', '/api/addTCustomer', async function (req, res) {
    jsonParser(req, res, async () => {
      await axios({
        method: 'post',
        url: req.body.Url + '/erpapi/TCustomer',
        headers: {
          Username: req.body.Username,
          Password: req.body.Password,
          Database: req.body.Database
        },
        data: req.body.fields
      })
        .then((result) => {
          JsonRoutes.sendResult(res, {
            data: result.data
          });
        })
        .catch((error) => {
          console.log("err", error)
          handleError(error, res);
        })
    })
  })

  JsonRoutes.add('post', '/api/products', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM products';

      pool.query(query, function (error, results) {
        if (error) {
          handleError(error, res);
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('POST', '/api/magentoAdminToken', async function (req, res) {

    await axios({
      method: 'post',
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
      },
      url: req.body.url + '/rest/V1/integration/admin/token',
      data: JSON.stringify({ username: req.body.username, password: req.body.password }),
      withCredentials: true
      // timeout: 5000
    })
      .then((result) => {
        adminToken = result.data;
        JsonRoutes.sendResult(res, {
          data: adminToken
        });
      })
      .catch((error) => {
        handleError(error, res);
      })
  });

  JsonRoutes.add('POST', 'api/wooCustomers', async function (req, res) {
    await axios({
      method: 'GET',
      url: req.body.url,
      headers: {
        'Authorization': req.body.auth,
        'Content-Type': 'application/json',
      }
    })
      .then((result) => {
        return JsonRoutes.sendResult(res, {
          code: '200',
          data: result.data
        });
      })
      .catch((error) => {
        handleError(error, res);
      })
  })

  JsonRoutes.add('POST', '/api/getTCustomer', async function (req, res) {
    await axios({
      method: 'GET',
      url: req.body.url,
      headers: req.body.headers
    })
      .then((result) => {
        return JsonRoutes.sendResult(res, {
          code: '200',
          data: result.data
        })
      })
      .catch((error) => {
        handleError(error, res);
      })
  })

  JsonRoutes.add('POST', '/api/getMProducts', async function (req, res) {
    await axios({
      method: 'GET',
      url: req.body.url,
      headers: {
        'Authorization': req.body.auth,
        'Content-Type': 'application/json',
      },
    })
      .then((result) => {
        return JsonRoutes.sendResult(res, {
          code: '200',
          data: result.data
        });
      })
      .catch((error) => {
        handleError(error, res);
      })

  })

  JsonRoutes.add('POST', '/api/getMCustomers', async function (req, res) {

    const lstUpdateTime = req.body.lstUpdateTime;

    await axios({
      method: 'GET',
      url: req.body.url + `/rest/all/V1/customers/search?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`,
      headers: {
        'Authorization': req.body.auth,
        'Content-Type': 'application/json',
      },
    })
      .then((result) => {
        return JsonRoutes.sendResult(res, {
          code: '200',
          data: result.data
        });
      })
      .catch((error) => {
        handleError(error, res);
      })
  })

  JsonRoutes.add('POST', '/api/addMCustomers', async function (req, res) {
    await axios({
      method: 'POST',
      url: req.body.url + "/rest/all/V1/customers",
      headers: {
        'Authorization': req.body.auth,
        'Content-Type': 'application/json',
      },
      data: req.body.data
    })
      .then((result) => {
        JsonRoutes.sendResult(res, {
          data: result.data
        });
      })
      .catch((error) => {
        console.log(error);
        return JsonRoutes.sendResult(res, {
          data: 'already exit'
        });
      })
  })


  JsonRoutes.add('POST', '/api/updateMCustomers', async function (req, res) {
    await axios({
      method: 'PUT',
      url: req.body.url + "/rest/V1/customers/" + req.body.customerID,
      headers: {
        'Authorization': req.body.auth,
        'Content-Type': 'application/json',
      },
      data: req.body.data
    })
      .then((result) => {
        JsonRoutes.sendResult(res, {
          data: result.data
        });
      })
      .catch((error) => {
        handleError(error, res);
      })
  })

  JsonRoutes.add('POST', '/api/addMProduct', async function (req, res) {
    await axios({
      method: "POST",
      url: req.body.url + '/rest/default/V1/products',
      headers: {
        'Authorization': req.body.auth,
        'Content-Type': 'application/json',
      },
    })
      .then((result) => {
        JsonRoutes.sendResult(res, {
          code: '200',
          data: result.data
        })
      })
      .catch((error) => {
        handleError(error, res);
      })
  })

  JsonRoutes.add('POST', '/api/getMOrders', async function (req, res) {
    await axios({
      method: 'GET',
      url: req.body.url + "/rest/V1/orders?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=" + req.body.lstUpdateTime + "&searchCriteria[filter_groups][0][filters][0][condition_type]=gt",
      headers: {
        'Authorization': req.body.auth,
        'Content-Type': 'application/json',
      },
    })
      .then((result) => {
        JsonRoutes.sendResult(res, {
          code: '200',
          data: result.data
        });
      })
      .catch((error) => {
        handleError(error, res);
      })
  })

  JsonRoutes.add('GET', '/api/transactions', async function (req, res) {
    const query1 = `SELECT a.id, a.date, a.order_num, a.products_num, a.uploaded_num, a.downloaded_num, b.name as accounting_soft, c.name as connection_soft, d.name as product_name
                  FROM (SELECT * FROM transactions) AS a
                  LEFT JOIN (SELECT * FROM softwares) AS b ON a.accounting_soft = b.id
                  LEFT JOIN (SELECT * FROM softwares) AS c ON a.connection_soft = c.id
                  LEFT JOIN (SELECT * FROM products) AS d ON a.products = d.id`;
    // const query = 'SELECT * FROM transactions';
    pool.query(query1, function (error, results) {
      if (error) {
        handleError(error, res);
      }
      return JsonRoutes.sendResult(res, {
        data: results
      });
    });
  });

  JsonRoutes.add('POST', '/api/AustPost', async function (req, res) {
  jsonParser(req, res, async () => {
    let invoicedID = req.body.InvoiceID ||'';
    let emailID = req.body.EmailID ||'';
    let returnedResponse = `Invoice ${req.body.InvoiceID} Update Successfully`;
    const querySelectCustomerByEmail = `SELECT a.id, b.id, b.password as auspostpassword, b.reference, b.email, b.base_url, b.account_number, b.api_key,
    c.database as erp_databasename, c.base_url as erp_base_url, c.user_name as erp_user_name, c.password as erp_password,
    d.db_name as conndb_name
                  FROM (SELECT * FROM customers WHERE email = '${emailID}') AS a
                  LEFT JOIN (SELECT * FROM clientaustraliapost) AS b ON a.id = b.id
                  LEFT JOIN (SELECT * FROM clienttrueerp) AS c ON a.id = c.id
                  LEFT JOIN (SELECT * FROM connections WHERE db_name = 'AustPOST') AS d ON a.id = d.customer_id`;
           return pool.query(querySelectCustomerByEmail,  async function (error, results) {
            if (error) {
                return "Error: An error occurred during the database query.";
            } else {
              if (results.length > 0) {
              let getInvoiceURL =  `${results[0].erp_base_url}/Tinvoice/${invoicedID}`;
              process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
              await HTTP.call('GET', getInvoiceURL, {
                    headers: {
                        'Username': results[0].erp_user_name,
                        'Password': results[0].erp_password,
                        'Database':results[0].erp_databasename
                    },
                }, async (error, response) => {
                    if(response){
                      let result = response.data;
                      if(response.data != null){
                      //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
                        //if (result?.fields?.IsBackOrder) {
                            // if (result?.fields?.Shipping !== "Aust Post") {
                            //     console.log(`Back Order Invoice from TrueERP Database with InvoiceID : ${result?.fields?.ID} Isn't through Australia POST`);
                            // }else {
                                console.log(`Back Order Invoice from TrueERP Database with InvoiceID : ${result?.fields?.ID}.`);

                                const invoiceDetail = result?.fields

                                const shipPostcode = result?.fields?.ShipPostcode || 7010
                                const invoicePostcode = result?.fields?.InvoicePostcode || 7010

                                const tempInvoiceLines = result?.fields?.Lines;
                                let tempInvoice = invoicedID;

                                for (const tempInvoiceLine of tempInvoiceLines) {

                                    const uomNameProductKey = tempInvoiceLine?.fields?.UOMNameProductKey
                                    const lineTaxCode = tempInvoiceLine?.fields?.LineTaxCode

                                    await HTTP.call('GET', `${results[0].erp_base_url}/TUnitOfMeasure?listtype=detail&select=[KeyValue]="${uomNameProductKey}"`, {
                                          headers: {
                                              'Username': results[0].erp_user_name,
                                              'Password': results[0].erp_password,
                                              'Database':results[0].erp_databasename
                                          },
                                      }, async (error, response) => {
                                        let result = response.data;
                                        const length = result?.tunitofmeasure[0]?.fields?.Length;
                                        const weight = result?.tunitofmeasure[0]?.fields?.Weight;
                                        const width = result?.tunitofmeasure[0]?.fields?.Width;
                                        const height = result?.tunitofmeasure[0]?.fields?.Height;
                                        const multiplier = result?.tunitofmeasure[0]?.fields?.Multiplier ||1;
                                        const starTrackShippingJSON = {
                                        "shipments": [
                                        {
                                        "from": {
                                        "name": invoiceDetail?.ContactName,
                                        "lines": [
                                        invoiceDetail?.InvoiceStreet1||'27/54 Minjungbal Dr',
                                        invoiceDetail?.InvoiceStreet2||'Tweed Heads',
                                        invoiceDetail?.InvoiceStreet3||'South'
                                        ],
                                        "suburb": invoiceDetail?.InvoiceSuburb|| "Tweed Heads South",
                                        "postcode": invoiceDetail?.InvoicePostcode||"2486",
                                        "state": invoiceDetail?.InvoiceState ||"NSW"
                                        },
                                        "to": {
                                        "name": invoiceDetail?.CustomerName,
                                        "lines": [
                                        invoiceDetail?.ShipStreet1||'Shop 8/271',
                                        invoiceDetail?.ShipStreet2||'Collins St',
                                        invoiceDetail?.ShipStreet3
                                        ],
                                        "suburb": invoiceDetail?.ShipSuburb||"Melbourne",
                                        "state": invoiceDetail?.ShipState ||"VIC",
                                        "postcode": invoiceDetail?.ShipPostcode||"3000"
                                        },
                                        "items": [
                                        {
                                        "length": parseInt(length)||1,
                                        "height": height||"20",
                                        "width": width||"15",
                                        "weight": parseFloat(weight)||2,
                                        "packaging_type": "CTN",
                                        "product_id": "FPP"
                                        }
                                        ]
                                        }
                                        ]
                                        };


                                            let baseUrl = results[0].base_url;
                                            let accountNumber = results[0].account_number;
                                            let userAutorization = 'Basic ' + Buffer.from(`${results[0].api_key}:${results[0].auspostpassword}`).toString('base64');
                                            await Meteor.call('checkAUSPOSTshipments', baseUrl, accountNumber, userAutorization, starTrackShippingJSON, async function(error, result) {
                                            if (error) {
                                              //console.log(error);
                                            } else {
                                            const deliverCost = result.data?.shipments[0]?.shipment_summary?.total_cost * multiplier
                                            const trackingNumber = result.data.shipments[0]?.items[0]?.tracking_details?.article_id;
                                            //Update InoiceData
                                            const updateObj = {
                                            "type": "TInvoice",
                                            "fields": {
                                            "ID": invoicedID || 0,
                                            "Shipping": "Aust Post",
                                            "ShippingCost": deliverCost,
                                            "ConNote": trackingNumber
                                            }
                                          };
                                          await HTTP.call('POST', `${results[0].erp_base_url}/Tinvoice`, {
                                              headers: {
                                                  'Username': results[0].erp_user_name,
                                                  'Password': results[0].erp_password,
                                                  'Database':results[0].erp_databasename
                                              },
                                              data: updateObj
                                          }, async (error, response) => {
                                            console.log(response);
                                          });
                                            // Create Bill
                                            let billTotal = (deliverCost * 1.1);

                                            const billObj = {
                                            "type": "TBill",
                                            "fields": {
                                            "SupplierName": "Australia Post 6894736",
                                            "Lines": [
                                            {
                                            "type": "TBillLine",
                                            "fields": {
                                            "AccountName": "Australia Post",
                                            "ProductDescription": "",
                                            "CustomerJob": "",
                                            "LineCost": deliverCost,
                                            "LineTaxCode": "NCG",
                                            "LineClassName": "Default",
                                            "CustomField10": "",
                                            "CustomField9": "",
                                            "CustomerJobID": invoiceDetail?.CustomerID,
                                            }
                                            }
                                            ],
                                            "OrderTo": `${invoiceDetail?.CustomerName}\n${invoiceDetail?.ShipStreet1}\n${invoiceDetail?.ShipStreet2}\n${invoiceDetail?.ShipState} ${invoiceDetail?.InvoicePostcode}\nAustralia`,
                                            "Deleted": false,
                                            "SupplierInvoiceNumber": `${invoicedID}`,
                                            "ConNote": `${trackingNumber}`,
                                            "TermsName": "30 Days",
                                            "Shipping": "Australia Post",
                                            "Comments": "",
                                            "SalesComments": "",
                                            "OrderStatus": "",
                                            "BillTotal": parseFloat(billTotal.toFixed(2)),
                                            "TotalAmountInc": parseFloat(billTotal.toFixed(2))
                                            }
                                          };
                                          await HTTP.call('POST', `${results[0].erp_base_url}/TBill`, {
                                              headers: {
                                                  'Username': results[0].erp_user_name,
                                                  'Password': results[0].erp_password,
                                                  'Database':results[0].erp_databasename
                                              },
                                              data: billObj
                                          }, async (error, response) => {
                                            if(response){
                                            let result = response.data;
                                            if (result?.fields?.ID) {
                                              returnedResponse = {
                                                result:"OK",
                                                msg:`Created a Bill with ID : ${result?.fields?.ID}\n Tracking Number : ${trackingNumber}`
                                              };
                                              const responseData = {
                                               statusCode: res.statusCode,
                                               data: returnedResponse
                                             };

                                             return JsonRoutes.sendResult(res, responseData);
                                            }
                                            }
                                            })
                                            //});
                                            }
                                            });

                                        })
                                }
                          }else{
                            returnedResponse = {
                              result:"Error",
                              msg:response.headers.errormessage
                            };
                            const responseData = {
                             statusCode: res.statusCode,
                             data: returnedResponse
                           };

                           return JsonRoutes.sendResult(res, responseData);
                          }
                    }
                    })

              } else {
                //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
                returnedResponse = {
                  result:"Error",
                  msg:"The connection email does not exist in the CoreEDI setup."
                };
                const responseData = {
                 statusCode: res.statusCode,
                 data: returnedResponse
               };

               return JsonRoutes.sendResult(res, responseData);

                //return "Error: The connection email does not exist in the CoreEDI setup.";
              }
            }

          });


  });
});

  JsonRoutes.add('GET', '/api/getLastRanDate', function (req, res) {
    jsonParser(req, res, () => {

      const query = "SELECT * FROM connections WHERE id = '" + req.query.id + "'";

      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        } else {
          return JsonRoutes.sendResult(res, {
            code: 200,
            data: results
          })
        }
      })
    })
  })

  JsonRoutes.add('post', '/api/updateLastRanDate', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const updateQuery = "UPDATE connections SET last_ran_date='" + data.last_ran_date + "' WHERE id=" + data.id;
      console.log(updateQuery);
      pool.query(updateQuery, (err, re, fe) => {
        if (err) console.log(err)
        return JsonRoutes.sendResult(res, {
          code: 200,
          data: 'success'
        });
      })
    });
  });

  JsonRoutes.add('post', '/api/addConnections', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM connections WHERE customer_id = '" + data.customer_id + "' AND connection_id = '" + data.connection_id + "'";
      pool.query(query, (error, results, fields) => {
        if (error) {
          handleError(error, res);
        }
        else {
          if (results.length == 0){
            let created_Date = new Date("1990-01-01 00:00:01");
            let _enabled = data.enabled ? 1 : 0;
            const addquery = "INSERT INTO connections (`customer_id`, `db_name`, `account_id`, `connection_id`, `last_ran_date`, `run_cycle`, `enabled`) VALUES ('" + data.customer_id + "', '" + data.db_name + "', '" + data.account_id + "', '" + data.connection_id + "', '" + data.last_ran_date + "', 1 , '" + _enabled + "');";
            pool.query(addquery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: "success"
                });
              }
            })
          } else if (results.length > 0) {
            // Update existing record
            let _enabled = data.enabled ? 1 : 0;
            const updateQuery = `UPDATE connections
                                SET run_cycle = 1, enabled = '${_enabled}'
                                WHERE customer_id = '${data.customer_id}'
                                AND db_name = '${data.db_name}'
                                AND account_id = '${data.account_id}'
                                AND connection_id = '${data.connection_id}'`;
            pool.query(updateQuery, (err, re, fe) => {
              if (err) {
                console.log(err);
                return JsonRoutes.sendResult(res, {
                  code: 500,
                  data: "Error occurred while updating data in the database",
                });
              } else {
                return JsonRoutes.sendResult(res, {
                  data: "success"
                });
              }
            });
          }
        }
      })
    });
  });

  JsonRoutes.add("POST", "/api/updateTrueERP2", async function (req, res) {
    jsonParser(req, res, async () => {
    const reqData = req.body;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    await HTTP.call('POST', `${reqData.url}`, {
        headers: {
            'Username': reqData.Username,
            'Password': reqData.Password,
            'Database':reqData.Database
        },
        data: reqData.data,
    }, async (error, response) => {
      if(response){
        JsonRoutes.sendResult(res, {
          data: response,
        });
      }else{
        return JsonRoutes.sendResult(res, {
          code: "500",
          data: error,
        });
      }
    });
    /*
    await axios({
      method: "POST",
      url: `${reqData.url}`,
      headers: {
        Username: reqData.Username,
        Password: reqData.Password,
        Database: reqData.Database,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(reqData.data),
    }).then((result) => {
        JsonRoutes.sendResult(res, {
          data: result.data,
        });
      }).catch((error) => {
        return JsonRoutes.sendResult(res, {
          code: "500",
          data: error,
        });
      });
      */
  });
  })
})

export default pool;
