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
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

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
              return JsonRoutes.sendResult(res, {
                code: '500',
                data: error
              });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

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
              return JsonRoutes.sendResult(res, {
                code: '500',
                data: error
              });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      })
    })
  })

  JsonRoutes.add('post', '/api/getAccSoftt', function (req, res) {
    jsonParser(req, res, () => {
      
      const query = `SELECT * FROM clienttrueerp WHERE id = ${req.body.id}`;
      pool.query(query, function (error, results) {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
      pool.query(query, function (error, results) {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
        }
        return JsonRoutes.sendResult(res, {
          data: results
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/transactions', function (req, res) {
    jsonParser(req, res, () => {
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
                    GROUP BY
                        t.id, s1.name, s2.name, t.date;`
      pool.query(query, function (error, results) {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
        '    count\n' +
        'FROM\n' +
        '    transactions_detail\n' +
        'WHERE\n' +
        `    transaction_id = ${req.body.id};\n`
      pool.query(query, function (error, results) {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
      data.order_num + "', products='" + data.products + "', products_num='" + data.product_num + "', uploaded_num='" + data.upload_num + 
      "', downloaded_num='" + data.downloaded_num + "', connection_id='" + data.connection_id + "'";
      pool.query(insertQuery, function (error, results) {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
        }
        return JsonRoutes.sendResult(res, {
          data: results.insertId
        });
      });
    });
  });

  JsonRoutes.add('post', '/api/inserttransactionDetails', function (req, res) {
    jsonParser(req, res, () => {
      let transaction_details = req.body['transaction_details'];
      let transactionId = req.body['transactionId'];
      let detail_string = "";
      let count = 0;
      for(let i = 0; i< transaction_details.length; i++){
        let transaction_detail = transaction_details[i]
        detail_string = transaction_detail['detail_string']
        count = transaction_detail['count']
        const insertQuery = "INSERT INTO `transactions_detail` SET transaction_id='" + transactionId + "', detail_string='" + detail_string + "', count='" +count + "'";
        pool.query(insertQuery, function (error, results) {
          if (error) {
            return JsonRoutes.sendResult(res, {
              code: '500',
              data: error
            });
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
        '    s3.termName AS customer_name,\n' +
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
        }
        else {
          if (results.length != 0) {
            let _enabled = data.enabled ? 1 : 0;
            let _print_name_to_short_description = data.print_name_to_short_description ? 1 : 0;
            const updateQuery = "UPDATE `clientmagento` SET company_name='" + data.company_name + "', consumer_key='" + data.consumer_key + "', consumer_secret='" + data.consumer_secret + "', admin_user_name='" + data.admin_user_name + "', admin_user_password='" + data.admin_user_password + "', base_api_url='" + data.base_api_url + "', access_token='" + data.access_token + "', access_token_secret='" + data.access_token_secret + "', synch_page_size='" + data.synch_page_size + "', sales_type='" + data.sales_type + "', customer_identified_by='" + data.customer_identified_by + "', product_name='" + data.product_name + "', print_name_to_short_description='" + _print_name_to_short_description + "', enabled='" + _enabled + "'WHERE id=" + data.id
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
            const insertQuery = "INSERT INTO `clientmagento` SET id='" + data.id + "',company_name='" + data.company_name + "', consumer_key='" + data.consumer_key + "', consumer_secret='" + data.consumer_secret + "', admin_user_name='" + data.admin_user_name + "', admin_user_password='" + data.admin_user_password + "', base_api_url='" + data.base_api_url + "', access_token='" + data.access_token + "', access_token_secret='" + data.access_token_secret + "', synch_page_size='" + data.synch_page_size + "', sales_type='" + data.sales_type + "', customer_identified_by='" + data.customer_identified_by + "', product_name='" + data.product_name + "', print_name_to_short_description='" + _print_name_to_short_description + "', enabled='" + _enabled + "'"
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
      const query = "SELECT * FROM clientZoho WHERE id = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: "500",
            data: error,
          });
        } else {
          if (results.length != 0) {
            let _enabled = data.enabled ? 1 : 0;
            const updateQuery =
              "UPDATE `clientZoho` SET client_id='" +
              data.client_id +
              "', client_secret='" +
              data.client_secret + 
              "', redirect_uri='" + 
              data.redirect_uri +
              "', print_name_to_short_description='" + 
              data.print_name_to_short_description +
              "', customer_identified_by='" + 
              data.customer_identified_by +
              "', access_token='" + 
              data.access_token +
              "', enabled='" + 
              _enabled + 
              "'WHERE id=" +
              data.id;
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
            const insertQuery =
              "INSERT INTO `clientZoho` SET id='" +
              data.id +
              "',client_id='" +
              data.client_id +
              "', client_secret='" +
              data.client_secret +
              "', redirect_uri='" + 
              data.redirect_uri +
              "', print_name_to_short_description='" + 
              data.print_name_to_short_description +
              "', customer_identified_by='" + 
              data.customer_identified_by +
              "', access_token='" + 
              data.access_token +
              "', enabled='" +
              _enabled +
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

  JsonRoutes.add('post', '/api/updateWooCommerce', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = "SELECT * FROM clientwoocommerce WHERE id = '" + data.id + "'"
      pool.query(query, (error, results, fields) => {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
        }
        else {
          if (results.length != 0) {
            let _enabled = data.enabled ? 1 : 0;
            const updateQuery = `UPDATE \`coreedit\`.\`clientwoocommerce\` SET \`key\` = '${data.email}', \`secret\` = '${data.password}', \`base_url\` = '${data.url}', \`enabled\` = '${_enabled}'`;

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
            const insertQuery = `INSERT INTO \`clientwoocommerce\` SET \`id\` = '${data.id}',SET \`key\` = '${data.email}', \`secret\` = '${data.password}', \`base_url\` = '${data.url}', \`enabled\` = '${_enabled}'`;

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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
      console.log(query);
      pool.query(query, (error, results, fields) => {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
        }
        else {
          if (results.length != 0) {
            let _enabled = data.enabled ? 1 : 0;
            const updateQuery = "UPDATE `clienttrueerp` SET user_name='" + data.user_name + "', password='" + data.password + "', `database`='" + data.database + "', base_url='" + data.base_url + "', enabled='" + _enabled + "' WHERE id=" + data.id
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
            const insertQuery = "INSERT INTO clienttrueerp (`id`, `user_name`, `password`, `database`, `base_url`, `enabled`, `customer_type`, `invoice_template`) VALUES ('" + data.id + "','" + data.user_name + "', '" + data.password + "', '" + data.database + "', '" + data.base_url + "', '" + _enabled + "', 0, 0);";
            console.log(insertQuery);
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
            return JsonRoutes.sendResult(res, {
              code: '500',
              data: 'Ooooooooooooooooooopps ! ! !'
            });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
            return JsonRoutes.sendResult(res, {
              code: '500',
              data: 'Ooooooooooooooooooopps ! ! !'
            });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
            return JsonRoutes.sendResult(res, {
              code: '500',
              data: 'Ooooooooooooooooooopps ! ! !'
            });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
            return JsonRoutes.sendResult(res, {
              code: '500',
              data: 'Ooooooooooooooooooopps ! ! !'
            });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
            return JsonRoutes.sendResult(res, {
              code: '500',
              data: 'Ooooooooooooooooooopps ! ! !'
            });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
      console.log(data)
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
      await axios(data)
        .then((result) => {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
          console.log(result)
          data = result.data;
          JsonRoutes.sendResult(res, {
            data: data
          });
        })
        .catch((error) => {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
          console.log("err", error)
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
        })
    })
  })

  JsonRoutes.add('post', '/api/products', function (req, res) {
    jsonParser(req, res, () => {
      const data = req.body;
      const query = 'SELECT * FROM products';

      pool.query(query, function (error, results) {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
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
        'Access-Control-Allow-Origin': 'http://localhost:3500',  // Update with your client's URL
        'Access-Control-Allow-Credentials': 'true'
      },
      url: req.body.url + '/rest/V1/integration/admin/token',
      data: JSON.stringify({ username: req.body.username, password: req.body.password }),
      withCredentials: true
      // timeout: 5000
    })
      .then((result) => {
        console.log(result);
        adminToken = result.data;
        JsonRoutes.sendResult(res, {
          data: adminToken
        });
      })
      .catch((error) => {
        console.log("err", error)
        return JsonRoutes.sendResult(res, {
          code: '500',
          data: error
        });
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
        return JsonRoutes.sendResult(res, {
          code: '500',
          data: error
        })
      })
  })

  JsonRoutes.add('POST', '/api/getTCustomer', async function (req, res) {
    await axios({
      method: 'GET',
      url: req.body.url,
      headers: req.body.headers
    })
      .then((result) => {
        console.log(result)
        return JsonRoutes.sendResult(res, {
          code: '200',
          data: result.data
        })
      })
      .catch((error) => {
        console.log(error)
        return JsonRoutes.sendResult(res, {
          code: '500',
          data: error
        })
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
        return JsonRoutes.sendResult(res, {
          code: '500',
          data: error
        })
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
        return JsonRoutes.sendResult(res, {
          code: '500',
          data: error
        });
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
        console.log(result);
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
        return JsonRoutes.sendResult(res, {
          code: '500',
          data: error.response.data
        });
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
        return JsonRoutes.sendResult(res, {
          code: '500',
          data: error
        })
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
        return JsonRoutes.sendResult(res, {
          code: '500',
          data: error
        });
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
        return JsonRoutes.sendResult(res, {
          code: '500',
          data: error
        });
      }
      return JsonRoutes.sendResult(res, {
        data: results
      });
    });
  });

  JsonRoutes.add('GET', '/api/getLastRanDate', function (req, res) {
    jsonParser(req, res, () => {

      const query = "SELECT * FROM connections WHERE id = '" + req.query.id + "'";

      pool.query(query, (error, results, fields) => {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: 500,
            data: error
          })
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
      const updateQuery = "UPDATE connections SET last_ran_date='" + data.last_ran_date + "' WHERE id=" + data.id
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
      const query = "SELECT * FROM connections WHERE id = '" + data.id + "'";
      pool.query(query, (error, results, fields) => {
        if (error) {
          return JsonRoutes.sendResult(res, {
            code: '500',
            data: error
          });
        }
        else {
          if (results.length == 0){
            let _enabled = data.enabled ? 1 : 0;
            const addquery = "INSERT INTO connections (`customer_id`, `db_name`, `account_id`, `connection_id`, `run_cycle`, `enabled`) VALUES ('" + data.customer_id + "', '" + data.db_name + "', '" + data.account_id + "', '" + data.connection_id + "', 1 , '" + _enabled + "');";
            console.log(addquery);
            pool.query(addquery, (err, re, fe) => {
              if (err) console.log(err)
              else {
                return JsonRoutes.sendResult(res, {
                  data: 'success'
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
            console.log(updateQuery);
            pool.query(updateQuery, (err, re, fe) => {
              if (err) {
                console.log(err);
                return JsonRoutes.sendResult(res, {
                  code: 500,
                  data: "Error occurred while updating data in the database",
                });
              } else {
                return JsonRoutes.sendResult(res, {
                  data: "success",
                });
              }
            });
          }
        }
      })
    });
  });

  JsonRoutes.add("POST", "/api/updateTrueERP2", async function (req, res) {
    const reqData = req.body;
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
    })
      .then((result) => {
        JsonRoutes.sendResult(res, {
          data: result.data,
        });
      })
      .catch((error) => {
        return JsonRoutes.sendResult(res, {
          code: "500",
          data: error,
        });
      });
  });
})

export default pool;
