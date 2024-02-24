import { Meteor, fetch } from "meteor/meteor";
import moment from "moment";
import CronSetting from "./Currency/CronSetting";
// import FxApi from "./Currency/FxApi";
let FutureTasks = new Meteor.Collection("cron-jobs");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

Meteor.startup(() => {
  const currentDate = new Date();

  _checkAUSPOstCOnnection();

  // /**
  //  * We first need to find saved crons
  //  */
  // FutureTasks.find().forEach(function (setting) {

  //   // then we compare the dates,
  //   if (setting.startAt < currentDate) {
  //     // we came to the day when we have to add the cron job to start starting from now
  //     Meteor.call("addCurrencyCron", setting);
  //   } else {
  //     // we havent came to the execution date, so we'll be scheduling it again
  //     Meteor.call("scheduleCron", setting);
  //   }
  // });
  // SyncedCron.start();



  /**
   * step 1 : We need to get the list of schedules
   * The future stasks
   */
  let futureCrons = FutureTasks.find() || [];



  /**
   * Step 2 : We need to check if their date is reached
   * if reached then run add the cron
   * else do nohing
   */

  futureCrons.forEach((setting) => {
    // then we compare the dates,
    if (setting.startAt < currentDate) {
      // we came to the day when we have to add the cron job to start starting from now
      setting.isFuture = false;
      Meteor.call("pullRecordCron", setting);
    } else {
      // we havent came to the execution date, so we'll be scheduling it again
      Meteor.call("scheduleCron", setting);
    }
  });

  /**
   * Step 3: Start
   */
  SyncedCron.start();
});

async function _getRecords(cronSetting, cb = (error, result) => { }) {

  let selConnectionId = cronSetting.selConnectionId;
  let lstUpdateTime = new Date();
  let tempConnection;
  let tempResponse;
  let text = "";
  let token;
  let connectionType;
  let tempConnectionSoftware;
  let tempAccount;

  const fetchProduct = (lstUpdateTime, token, selConnectionId, text) => {
    let productCount, tempResponse;
    let product_url = `${tempConnectionSoftware.base_api_url}/rest/all/V1/products/?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`;
    HTTP.call('GET', product_url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }, (error, response) => {
      if (error) {
        console.error('Error:', error);
      } else {
        productCount = response.data.total_count;
        tempResponse = response.data.items;
        // Process the response data here
        // templateObject.transNote.set(JSON.stringify(response.data.items));
        if (!productCount) {
          text += `There are No Products to Receive\n`;
          console.log(text);
          fetchOrder(lstUpdateTime, token, selConnectionId, text);
        } else {
          if (productCount == 1)
            text += `${productCount} Product Successfully Received from Magento\n`;
          else
            text += `${productCount} Products Successfully Received from Magento\n`;
        }

        // console.log(text);

        let jsonData;

        // console.log("jsonData: ", jsonData);
        for (let i = 0; i < productCount; i++) {
          jsonData = {
            "type": "TProductWeb",
            "fields":
            {
              "ProductType": "INV",
              "ProductName": tempResponse[i].name,
              "PurchaseDescription": tempResponse[i].name,
              "SalesDescription": tempResponse[i].name,
              "AssetAccount": "Inventory Asset",
              "CogsAccount": "Cost of Goods Sold",
              "IncomeAccount": "Sales",
              "BuyQty1": tempResponse[i].UOMQtySold,
              "BuyQty1Cost": parseFloat(tempResponse[i].price),
              "BuyQty2": tempResponse[i].UOMQtySold,
              "BuyQty2Cost": parseFloat(tempResponse[i].price),
              "BuyQty3": tempResponse[i].UOMQtySold,
              "BuyQty3Cost": parseFloat(tempResponse[i].price),
              "SellQty1": tempResponse[i].UOMQtySold,
              "SellQty1Price": parseFloat(tempResponse[i].price),
              "SellQty2": tempResponse[i].UOMQtySold,
              "SellQty2Price": parseFloat(tempResponse[i].price),
              "SellQty3": tempResponse[i].UOMQtySold,
              "SellQty3Price": parseFloat(tempResponse[i].price),
              "TaxCodePurchase": "NCG",
              "TaxCodeSales": "GST",
              "UOMPurchases": "Units",
              "UOMSales": "Units"
            }
          }

          HTTP.call('POST', `${tempAccount.base_url}/TProductWeb`, {
            headers: {
              'Username': `${tempAccount.user_name}`,
              'Password': `${tempAccount.password}`,
              'Database': `${tempAccount.database}`,
            },
            data: jsonData
          }, (error, response) => {
            if (error)
              console.error('Error:', error);
            else {
              text += `1 Product Successfully Added to TrueERP with ID Number ${response.data.fields.ID}\n`
              console.log(text);
            }
            if (i == productCount - 1)
              fetchOrder(lstUpdateTime, token, selConnectionId, text);
          });
        }
      }
    });
  }

  const fetchOrder = (lstUpdateTime, token, selConnectionId, text) => {
    let itemCount = 0, tempResponse, tempConnection;
    let order_url = `${tempConnectionSoftware.base_api_url}/rest/V1/orders?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`;
    HTTP.call('GET', order_url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }, (error, response) => {
      if (error) {
        console.error('Error:', error);
      } else {
        itemCount = response.data.total_count;
        tempResponse = response.data.items;
        // Process the response data here
        // templateObject.transNote.set(JSON.stringify(response.data.items));
        if (!itemCount) {
          text += `There are No Sales Orders to Receive\n`;
          console.log(text);
          cb(null, response);
        } else {
          if (itemCount == 1)
            text += `${itemCount} Sales Order Successfully Received from Magento\n`;
          else
            text += `${itemCount} Sales Orders Successfully Received from Magento\n`;
        }

        // console.log(text);

        let jsonData;

        // console.log("jsonData: ", jsonData);
        for (let i = 0; i < itemCount; i++) {
          jsonData = {
            "type": "TSalesOrder",
            "fields":
            {
              "GLAccountName": "Accounts Receivable",
              "CustomerName": tempResponse[i].customer_firstname + ' ' + tempResponse[i].customer_lastname,
              "TermsName": "COD",
              "SaleClassName": "Default",
              "SaleDate": tempResponse[i].created_at,
              "Comments": `${tempResponse[i].status_histories.length ? tempResponse[i].status_histories[0].comment : ""}`,
              "TotalAmount": tempResponse[i].base_subtotal,
              "TotalAmountInc": tempResponse[i].base_total_due
            }
          }
          jsonData.fields.ShipToDesc = `${tempResponse[i].extension_attributes.shipping_assignments[0].shipping.address.street[0]}\r\n${tempResponse[i].extension_attributes.shipping_assignments[0].shipping.address.city}\r\n${tempResponse[i].extension_attributes.shipping_assignments[0].shipping.address.country_id}`;
          let lineItems = [];
          for (let j = 0; j < tempResponse[i].items.length; j++) {
            let tempItems = {
              "type": "TSalesOrderLine",
              "fields":
              {
                "ProductName": tempResponse[i].items[j].name,
                "UnitOfMeasure": "Units",
                "UOMQtySold": tempResponse[i].items[j].qty_ordered ? tempResponse[i].items[j].qty_ordered : 0,
                "LinePrice": tempResponse[i].items[j].base_row_total ? tempResponse[i].items[j].base_row_total : 0,
                "LinePriceInc": tempResponse[i].items[j].original_price ? tempResponse[i].items[j].original_price : 0,
                "TotalLineAmount": tempResponse[i].items[j].price ? tempResponse[i].items[j].price : 0,
                "TotalLineAmountInc": tempResponse[i].items[j].price_incl_tax ? tempResponse[i].items[j].price_incl_tax : 0
              }
            }
            lineItems.push(tempItems);
          }
          jsonData.fields.Lines = lineItems;
          console.log(tempAccount);

          HTTP.call('POST', `${tempAccount.base_url}/TSalesOrder`, {
            headers: {
              'Username': `${tempAccount.user_name}`,
              'Password': `${tempAccount.password}`,
              'Database': `${tempAccount.database}`,
            },
            data: jsonData
          }, (error, response) => {
            if (error)
              console.error('Error:', error);
            else {
              text += `1 Sales Order Successfully Added to TrueERP with ID Number ${response.data.fields.ID}\n`
              console.log(text);
            }
            if (i == itemCount - 1) {
              cb(null, response);
            }
          });
        }
      }
    });
  }

  const fetchWooProduct = (lstUpdateTime, tempAccount, base_url, key, secret, selConnectionId, text) => {
    let productCount, tempResponse;
    let product_url = `${base_url}/wc-api/v3/products?filter[limit] =-1`;
    HTTP.call('GET', product_url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64'),
      },
    }, (error, response) => {
      if (error) {
        console.error('Error:', error);
      } else {
        const filteredProducts = response.data.products.filter(product => {
          const updatedDate = new Date(product.updated_at);
          const last = new Date(lstUpdateTime)
          return updatedDate > last;
        });
        productCount = filteredProducts.length;
        tempResponse = filteredProducts;
        // Process the response data here
        // templateObject.transNote.set(JSON.stringify(response.data.items));
        if (!productCount) {
          text += `There are No Products to Receive\n`;
          console.log(text);
          fetchWooOrder(lstUpdateTime, tempAccount, base_url, key, secret, selConnectionId, text);
        } else {
          if (productCount == 1)
            text += `${productCount} Product Successfully Received from WooCommerce\n`;
          else
            text += `${productCount} Products Successfully Received from WooCommerce\n`;
        }

        // console.log(text);

        let jsonData;

        for (let i = 0; i < productCount; i++) {
          jsonData = {
            "type": "TProductWeb",
            "fields":
            {
              "ProductType": "INV",
              "ProductName": tempResponse[i].title,
              "PurchaseDescription": tempResponse[i].description,
              "SalesDescription": tempResponse[i].short_description,
              "AssetAccount": "Inventory Asset",
              "CogsAccount": "Cost of Goods Sold",
              "IncomeAccount": "Sales",
              "BuyQty1": 1,
              "BuyQty1Cost": parseFloat(tempResponse[i].price),
              "BuyQty2": 1,
              "BuyQty2Cost": parseFloat(tempResponse[i].price),
              "BuyQty3": 1,
              "BuyQty3Cost": parseFloat(tempResponse[i].price),
              "SellQty1": 1,
              "SellQty1Price": parseFloat(tempResponse[i].price),
              "SellQty2": 1,
              "SellQty2Price": parseFloat(tempResponse[i].price),
              "SellQty3": 1,
              "SellQty3Price": parseFloat(tempResponse[i].price),
              "TaxCodePurchase": "NCG",
              "TaxCodeSales": "GST",
              "UOMPurchases": "Units",
              "UOMSales": "Units"
            }
          }

          HTTP.call('POST', `${tempAccount.base_url}/TProductWeb`, {
            headers: {
              'Username': `${tempAccount.user_name}`,
              'Password': `${tempAccount.password}`,
              'Database': `${tempAccount.database}`,
            },
            data: jsonData
          }, (error, response) => {
            if (i == productCount - 1)
              fetchWooOrder(lstUpdateTime, tempAccount, base_url, key, secret, selConnectionId, text);
            if (error)
              console.error('Error:', error);
            else {
              text += `1 Product Successfully Added to TrueERP with ID Number ${response.data.fields.ID}\n`
              console.log(text);
            }
          });
        }
      }
    });
  }

  const fetchWooOrder = (lstUpdateTime, tempAccount, base_url, key, secret, selConnectionId, text) => {
    let itemCount = 0, tempResponse, tempConnection;
    let order_url = `${base_url}/wc-api/v3/orders?filter[limit] =-1`;
    HTTP.call('GET', order_url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64'),
      },
    }, (error, response) => {
      if (error) {
        console.error('Error:', error);
      } else {
        const filteredOrders = response.data.orders.filter(order => {
          const updatedDate = new Date(order.updated_at);
          const last = new Date(`${lstUpdateTime}Z`)
          return updatedDate > last;
        });
        itemCount = filteredOrders.length;
        tempResponse = filteredOrders;
        // Process the response data here
        // templateObject.transNote.set(JSON.stringify(response.data.items));
        if (!itemCount) {
          text += `There are No Sales Orders to Receive\n`;
          console.log(text);
          cb(null, response);
        } else {
          if (itemCount == 1)
            text += `${itemCount} Sales Order Successfully Received from WooCommerce\n`;
          else
            text += `${itemCount} Sales Orders Successfully Received from WooCommerce\n`;
        }

        // console.log(text);

        let jsonData;

        for (let i = 0; i < itemCount; i++) {
          jsonData = {
            "type": "TSalesOrder",
            "fields":
            {
              "GLAccountName": "Accounts Receivable",
              "CustomerName": tempResponse[i].billing_address.first_name + ' ' + tempResponse[i].billing_address.last_name,
              "TermsName": "COD",
              "SaleClassName": "Default",
              "SaleDate": tempResponse[i].created_at,
              "Comments": tempResponse[i].note,
              "TotalAmount": parseFloat(tempResponse[i].total),
              "TotalAmountInc": parseFloat(tempResponse[i].subtotal)
            }
          }
          let lineItems = [];
          for (let j = 0; j < tempResponse[i].line_items.length; j++) {
            let tempItems = {
              "type": "TSalesOrderLine",
              "fields":
              {
                "ProductName": tempResponse[i].line_items[j].name.split(' - ')[0],
                "UnitOfMeasure": "Units",
                "UOMQtySold": parseFloat(tempResponse[i].line_items[j].quantity),
                "LinePrice": parseFloat(tempResponse[i].line_items[j].subtotal),
                "LinePriceInc": parseFloat(tempResponse[i].line_items[j].total),
                "TotalLineAmount": parseFloat(tempResponse[i].line_items[j].subtotal),
                "TotalLineAmountInc": parseFloat(tempResponse[i].line_items[j].total)
              }
            }
            lineItems.push(tempItems);
          }
          jsonData.fields.Lines = lineItems;

          HTTP.call('POST', `${tempAccount.base_url}/TSalesOrder`, {
            headers: {
              'Username': `${tempAccount.user_name}`,
              'Password': `${tempAccount.password}`,
              'Database': `${tempAccount.database}`,
            },
            data: jsonData
          }, (error, response) => {
            if (error)
              console.error('Error:', error);
            else {
              text += `1 Sales Order Successfully Added to TrueERP with ID Number ${response.data.fields.ID}\n`
              console.log(text);
            }
            if (i == itemCount - 1) {
              cb(null, response);
            }
          });
        }
      }
    });
  }

  Meteor.call('getConnectionFromId', { id: selConnectionId }, (err, result) => {
    if (err)
      console.log(err);
    else {
      lstUpdateTime = moment(result[0].last_ran_date).format("YYYY-MM-DD HH:mm:ss");
      tempConnection = result[0];
      let tempDate = new Date();
      let dateString =
        tempDate.getUTCFullYear() + "/" +
        ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) + "/" +
        ("0" + tempDate.getUTCDate()).slice(-2) + " " +
        ("0" + tempDate.getUTCHours()).slice(-2) + ":" +
        ("0" + tempDate.getUTCMinutes()).slice(-2) + ":" +
        ("0" + tempDate.getUTCSeconds()).slice(-2);
      let args = { selConnectionId, dateString };
      Meteor.call('updateLastRanDate', args, (err, result) => {
        if (err)
          console.log(err);
        else
          console.log('fetching succeed!');
      })
      Meteor.call('getSoftwareFromId', { id: tempConnection.connection_id }, (err, result) => {
        if (err)
          console.log(err);
        else {
          connectionType = result[0].name.toLowerCase();
          if (connectionType == "magento") {
            Meteor.call('getMagentoFromId', { id: tempConnection.customer_id }, (err, result) => {
              if (err)
                console.log(err);
              else {
                tempConnectionSoftware = result[0];
                try {
                  HTTP.call('POST', `${tempConnectionSoftware.base_api_url}/rest/V1/integration/admin/token`, {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    data: {
                      'username': `${tempConnectionSoftware.admin_user_name}`,
                      'password': `${tempConnectionSoftware.admin_user_password}`
                    }
                  }, (error, response) => {
                    if (error)
                      cb(error, null);
                    else {
                      let customer_url = `${tempConnectionSoftware.base_api_url}/rest/all/V1/customers/search?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`;
                      token = response.data;
                      let customerCount;
                      HTTP.call('GET', customer_url, {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      }, (error, response) => {
                        if (error) {
                          console.error('Error:', error);
                        } else {
                          customerCount = response.data.total_count;
                          tempResponse = response.data.items;
                          // Process the response data here
                          // templateObject.transNote.set(JSON.stringify(response.data.items));
                          if (!customerCount) {
                            text += `There are No Customers to Receive\n`;
                            fetchProduct(lstUpdateTime, token, selConnectionId, text);
                            console.log(text);
                          } else {
                            if (customerCount == 1)
                              text += `${customerCount} Customer Successfully Received from Magento\n`;
                            else
                              text += `${customerCount} Customers Successfully Received from Magento\n`;
                          }

                          console.log(text);

                          Meteor.call('getSoftwareFromId', { id: tempConnection.account_id }, (err, result) => {
                            if (err)
                              console.log(err);
                            else {
                              Meteor.call(`get${result[0].name}FromId`, { id: tempConnection.customer_id }, (err, result) => {
                                if (err)
                                  console.log(err);
                                else {
                                  tempAccount = result[0];
                                  let jsonData;

                                  // console.log("jsonData: ", jsonData);
                                  for (let i = 0; i < customerCount; i++) {
                                    jsonData = {
                                      "type": "TCustomer",
                                      "fields":
                                      {
                                        "ClientTypeName": "Default",
                                        "SourceName": "Radio"
                                      }
                                    }
                                    jsonData.fields.ClientName = tempResponse[i].firstname + ' ' + tempResponse[i].lastname || "";
                                    jsonData.fields.Title = tempResponse[i].gender == 1 ? "Mrs" : "Mr" || "";
                                    jsonData.fields.FirstName = tempResponse[i].firstname || "";
                                    jsonData.fields.LastName = tempResponse[i].lastname || "";
                                    jsonData.fields.Email = tempResponse[i].email || "";

                                    HTTP.call('POST', `${tempAccount.base_url}/TCustomer`, {
                                      headers: {
                                        'Username': `${tempAccount.user_name}`,
                                        'Password': `${tempAccount.password}`,
                                        'Database': `${tempAccount.database}`,
                                      },
                                      data: jsonData
                                    }, (error, response) => {
                                      if (error)
                                        console.error('Error:', error);
                                      else {
                                        text += `1 Customer Successfully Added to TrueERP with ID Number ${response.data.fields.ID}\n`
                                        console.log(text);
                                      }
                                      if (i == customerCount - 1) {
                                        fetchProduct(lstUpdateTime, token, selConnectionId, text);
                                      }
                                    });
                                  }
                                }
                              })
                            }
                          })
                        }
                      });
                    }
                  })
                } catch (error) {
                  cb(error, null);
                }
              }
            })
          }
          else if (connectionType == 'woocommerce') {

            Meteor.call('getWooCommerceFromId', { id: tempConnection.customer_id }, (err, result) => {
              if (err)
                console.log(err);
              else {
                let customerCount;
                tempConnectionSoftware = result[0];

                Meteor.call('getSoftwareFromId', { id: tempConnection.account_id }, (err, result) => {
                  if (err)
                    console.log(err);
                  else {
                    Meteor.call(`get${result[0].name}FromId`, { id: tempConnection.customer_id }, (err, result) => {
                      if (err)
                        console.log(err);
                      else {
                        tempAccount = result[0];
                        HTTP.call('GET', `${tempConnectionSoftware.base_url}/wc-api/v3/customers?filter[limit] =-1`, {
                          headers: {
                            'Authorization': 'Basic ' + Buffer.from(`${tempConnectionSoftware.key}:${tempConnectionSoftware.secret}`).toString('base64'),
                          },
                        }, (error, response) => {
                          if (error) {
                            console.log('Basic ' + Buffer.from(`${tempConnectionSoftware.key}:${tempConnectionSoftware.secret}`).toString('base64'))
                            console.log("error: ", error);
                            cb(error, null);
                          } else {
                            const filteredCustomers = response.data.customers.filter(customer => {
                              const updatedDate = new Date(customer.last_update);
                              const last = new Date(lstUpdateTime)
                              return updatedDate > last;
                            });
                            customerCount = filteredCustomers.length;
                            tempResponse = filteredCustomers;
                            // Process the response data here
                            // templateObject.transNote.set(JSON.stringify(response.data.items));
                            if (!customerCount) {
                              text += `There are No Customers to Receive\n`;
                              fetchWooProduct(lstUpdateTime, tempAccount, tempConnectionSoftware.base_url, tempConnectionSoftware.key, tempConnectionSoftware.secret, selConnectionId, text);
                              console.log(text);
                            } else {
                              if (customerCount == 1)
                                text += `${customerCount} Customer Successfully Received from WooCommerce\n`;
                              else
                                text += `${customerCount} Customers Successfully Received from WooCommerce\n`;
                            }

                            // console.log(text);

                            Meteor.call('getSoftwareFromId', { id: tempConnection.account_id }, (err, result) => {
                              if (err)
                                console.log(err);
                              else {
                                Meteor.call(`get${result[0].name}FromId`, { id: tempConnection.customer_id }, (err, result) => {
                                  if (err)
                                    console.log(err);
                                  else {
                                    tempAccount = result[0];
                                    let jsonData;

                                    for (let i = 0; i < customerCount; i++) {
                                      jsonData = {
                                        "type": "TCustomer",
                                        "fields":
                                        {
                                          "ClientTypeName": "Default",
                                          "SourceName": "Radio"
                                        }
                                      }
                                      jsonData.fields.ClientName = tempResponse[i].first_name + ' ' + tempResponse[i].last_name;
                                      jsonData.fields.FirstName = tempResponse[i].first_name;
                                      jsonData.fields.LastName = tempResponse[i].last_name;
                                      jsonData.fields.Street = tempResponse[i].billing_address.address_1;
                                      jsonData.fields.Street2 = tempResponse[i].billing_address.address_2;
                                      jsonData.fields.Postcode = tempResponse[i].billing_address.postcode;
                                      jsonData.fields.State = tempResponse[i].billing_address.state;
                                      jsonData.fields.Country = tempResponse[i].billing_address.country;
                                      jsonData.fields.Phone = tempResponse[i].billing_address.phone;
                                      jsonData.fields.Email = tempResponse[i].email;

                                      HTTP.call('POST', `${tempAccount.base_url}/TCustomer`, {
                                        headers: {
                                          'Username': `${tempAccount.user_name}`,
                                          'Password': `${tempAccount.password}`,
                                          'Database': `${tempAccount.database}`,
                                        },
                                        data: jsonData
                                      }, (error, response) => {
                                        if (i == customerCount - 1) {
                                          fetchWooProduct(lstUpdateTime, tempAccount, tempConnectionSoftware.base_url, tempConnectionSoftware.key, tempConnectionSoftware.secret, selConnectionId, text);
                                        }
                                        if (error)
                                          console.error('Error:', error);
                                        else {
                                          text += `1 Customer Successfully Added to TrueERP with ID Number ${response.data.fields.ID}\n`
                                          console.log(text);
                                        }
                                      });
                                    }
                                  }
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                })
              }
            })

          }
        }
      })
    }
  })

}

async function _updateRecords() {

}

async function _checkAUSPOstCOnnection() {

}
function buildParser(cronSetting, parser) {

  let cronStartDate = moment(cronSetting.startAt).subtract(1, 'days');
  //let cronStartDate = cronSetting.startAt;
  if (cronSetting.isProcessed == 1) {
    let parseTime = moment(cronStartDate).format('h:mm a');
    let parseDay = moment(cronStartDate).format('Do');
    let parseMonth = moment(cronStartDate).format('MMMM');
    let parseYear = moment(cronStartDate).format('YYYY');
    if (cronSetting.exceptionType) {
      return parser.text(`every ${cronSetting.every} mins`);
    }
    return parser.text(`at ${parseTime} every ${parseDay} day of ${parseMonth} in ${parseYear}`);
  } else {
    if (cronSetting.type == 'Daily') {
      if (cronSetting.exceptionType) {
        let parseHour = moment(cronSetting.exceptionDate).format('HH');
        let parseMinute = moment(cronStartDate.exceptionDate).format('mm');
        return parser.cron(`*/${cronSetting.every} * * * *`);
      }
      if (parseInt(cronSetting.every) == 1) {
        let parseTime = moment(cronStartDate).format('h:mm a');
        let parseDays = cronSetting.days.reduce((text, value, i, array) => text + (i < array.length - 1 ? ', ' : ' and ') + value);
        return parser.text(`at ${parseTime} on ${parseDays}`);
      } else {
        let parseHour = moment(cronStartDate).format('HH');
        let parseMinute = moment(cronStartDate).format('mm');
        return parser.cron(`${parseMinute} ${parseHour} */${cronSetting.every} * *`);
      }
    } else if (cronSetting.type == 'Weekly') {
      let parseTime = moment(cronStartDate).format('h:mm a');
      return parser.text(`every ${cronSetting.every} week on ${cronSetting.days} at ${parseTime}`)
    } else if (cronSetting.type == 'Monthly') {
      return parser.text(`${cronSetting.toParse}`);
    } else if (cronSetting.type == 'Minutely') {
      let parseHour = moment(cronStartDate).format('HH');
      let parseMinute = moment(cronStartDate).format('mm');
      return parser.cron(`${parseMinute}/${cronSetting.every} ${parseHour} * * *`);
    } else if (cronSetting.type == 'OneTime') {
      let parseTime = moment(cronStartDate).format('h:mm a');
      let parseDay = moment(cronStartDate).format('Do');
      let parseMonth = moment(cronStartDate).format('MMMM');
      let parseYear = moment(cronStartDate).format('YYYY');
      return parser.text(`at ${parseTime} every ${parseDay} day of ${parseMonth} in ${parseYear}`);
    }
  }
}



Meteor.methods({
  /**
   * This functions is going to run when the cron is running
   * @param {*} cronSetting
   */
  runCron: async (cronSetting) => {
    try {
      let tempDate = new Date();
      let dateString =
        tempDate.getUTCFullYear() + "/" +
        ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) + "/" +
        ("0" + tempDate.getUTCDate()).slice(-2) + " " +
        ("0" + tempDate.getUTCHours()).slice(-2) + ":" +
        ("0" + tempDate.getUTCMinutes()).slice(-2) + ":" +
        ("0" + tempDate.getUTCSeconds()).slice(-2);
      let wrappedGetRecords = Meteor.wrapAsync(_getRecords);
      wrappedGetRecords(cronSetting);
      let nextDate = SyncedCron.nextScheduledAtDate(`record-get-cron_${cronSetting.id}_${cronSetting.selConnectionId}`);
      let nextString =
        tempDate.getUTCFullYear() + "/" +
        ("0" + (nextDate.getUTCMonth() + 1)).slice(-2) + "/" +
        ("0" + nextDate.getUTCDate()).slice(-2) + " " +
        ("0" + nextDate.getUTCHours()).slice(-2) + ":" +
        ("0" + nextDate.getUTCMinutes()).slice(-2) + ":" +
        ("0" + nextDate.getUTCSeconds()).slice(-2);
      Meteor.call('updateFrequency', { id: cronSetting.selConnectionId, last_ran_date: dateString, next_run_date: nextString }, (err, result) => {
        if (err)
          console.log(err);
      })
      // console.log('response: ', response);
      // if (response.data) {
      //   Meteor.wrapAsync(_updateRecords)();
      // }
    } catch (error) {
    }

  },
  /**
   * This function will just add the cron job
   *
   * @param {Object} cronSetting
   * @returns
   */
  pullRecordCron: (cronSetting) => {
    // if(cronSetting.isFuture == true) {
    //   FutureTasks.insert(cronSetting);
    //   return true;
    // }

    const cronId = `record-get-cron_${cronSetting.id}_${cronSetting.selConnectionId}`;
    SyncedCron.remove(cronId);

    let run_cycle = "Custom";
    console.log(cronSetting.exceptionType)
    if (cronSetting.exceptionType) {
      if (cronSetting.every > 1)
        run_cycle = `${cronSetting.every} Mins`;
      else
        run_cycle = `${cronSetting.every} Min`;
    } else {
      if (cronSetting.type == 'Daily') {
        if (cronSetting.every > 1)
          run_cycle = `${cronSetting.every} Days`;
        else
          run_cycle = `${cronSetting.every} Day`;
      }
    }
    Meteor.call('updateCycle', { id: cronSetting.selConnectionId, run_cycle: run_cycle }, (err, result) => {
      if (err) console.log(err);
    })


    try {
      return SyncedCron.add({
        name: cronId,
        schedule: function (parser) {
          //  const parsed = parser.recur().on(cronSetting.dayInNumbers).dayOfWeek()
          // .and().every(15).minute().startingOn(14);

          //  const parsed = parser.text('at 5:00 am every 10th day of September in 2022');
          //  const parsed = parser.text('every 4th week');
          // return parser.text('every 10th day at 08:00 am on monday');
          // return parser.text('every 4 weeks on Wednesday at 08:00 am')
          // return parser.cron(`5 8 * * 4/Sun`);
          const parsed = buildParser(cronSetting, parser);
          // const parsed = parser.text('at 5:00 am and every 10th day on Friday')
          return parsed;

        },
        job: () => {
          if (cronSetting.isProcessed == 1 && cronSetting.type != 'OneTime') {
            cronSetting.isProcessed = 0;
            Meteor.call("runCron", cronSetting, function (error, results) {
              if (error)
                console.log(error);
              else {
                Meteor.call("pullRecordCron", cronSetting);
              }
            });
          } else {
            Meteor.call("runCron", cronSetting, function (error, results) {
            });
          }
        },
      });
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err);
    }
  },
  /**
   * This function will shcedule the cron job if the date is different from today (future date)
   *
   * @param {Object} cronSetting
   */
  scheduleCron: (cronSetting) => {
    FutureTasks.insert(cronSetting);
  },
});
