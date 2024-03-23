import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import pool from '../../imports/api/dbConection.js';
import { JsonRoutes } from 'meteor/simple:json-routes';
const axios = require('axios').default;
const { Builder, By, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

Meteor.methods({
    'getZoho': function () {
        const s = 'SELECT * FROM clientZoho'
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

    'getZohoFromId': function ( data ) {
        const s = 'SELECT * FROM clientZoho WHERE id=' + data.id
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

    'getZohoFromCustomerId': function ( data ) {
        const s = 'SELECT * FROM clientZoho WHERE customer_id=' + data.id
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

    'addZoho': function ({ dbName, accName, connName, lastRanDate, runCycle, nextRunDate, enabled }) {
        console.log('add Zoho')
        return new Promise((resolve, reject) => {
            const addQuery = "INSERT INTO `coreedit`.`clientZoho` (`db_name`, `acc_name`, `conn_name`, `last_ran_date`, `last_ran_date`, `next_run_date`, `enabled`) VALUES ('" + dbName + "' , '" + accName + "', '" + connName + "', '" + lastRanDate + "', '" + runCycle + "', '" + nextRunDate + "', '" + enabled + "');";
            pool.query(addQuery, (err, re, fe) => {
                if (err) console.log(err)
                else {
                    console.log('new connection add success!')
                    resolve('success')
                }
            })
        })
    },

    'reomoveZoho': function ( {id} ) {
        const query = "SELECT * FROM clientZoho WHERE id = '" + id + "'"
        return new Promise((resolve, reject) => {
            pool.query(query, (error, results, fields) => {
                if (error) reject(error)
                else {
                    if (results.length != 0) {
                        const removeQuery = "DELETE FROM `coreedit`.`clientZoho` WHERE (`id` = '" + id + "');";
                        pool.query(removeQuery, (err, re, fe) => {
                            if (err) console.log(err)
                            else {
                                console.log('One Zoho remove success!')
                                resolve('success')
                            }
                        })
                    }
                    else resolve('Oooooops... Can\'t remove this Zoho.')
                }
            })
        })
    },

    'updateZoho': function ({id, company_name, consumer_key, consumer_secret, admin_user_name, admin_user_password, base_api_url, access_token, access_token_secret, synch_page_size, sales_type, customer_identified_by, product_name, print_name_to_short_description, enabled }) {
        const query = "SELECT * FROM clientZoho WHERE id = '" + id + "'"
        return new Promise((resolve, reject) => {
            pool.query(query, (error, results, fields) => {
                if (error) reject(error)
                else {
                    if (results.length != 0) {
                        let _enabled = enabled ? 1 : 0;
                        let _print_name_to_short_description = print_name_to_short_description ? 1 : 0;
                        const updateQuery = "UPDATE `coreedit`.`clientZoho` SET company_name='" + company_name + "', consumer_key='" + consumer_key + "', consumer_secret='" + consumer_secret + "', admin_user_name='" + admin_user_name + "', admin_user_password='" + admin_user_password + "', base_api_url='" + base_api_url + "', access_token='" + access_token + "', access_token_secret='" + access_token_secret + "', synch_page_size='" + synch_page_size + "', sales_type='" + sales_type + "', customer_identified_by='" + customer_identified_by + "', product_name='" + product_name + "', print_name_to_short_description='" + _print_name_to_short_description + "', enabled='" + _enabled + "'WHERE id=" + id
                        pool.query(updateQuery, (err, re, fe) => {
                            if (err) console.log(err)
                            else {
                                console.log('Zoho Update success!')
                                resolve('success')
                            }
                        })
                    }
                    else resolve('Ooooooooooooooooooopps ! ! !')
                }
            })
        })
    },
    
    'getZohoAccessToken': async function (url, username, password) {
      
      try {

        // Create a new WebDriver instance
        const options = new chrome.Options();
        options.addArguments('--headless');
    
        // Create a new WebDriver instance with headless mode enabled
        const driver = await new Builder()
          .forBrowser('chrome')
          .setChromeOptions(options)
          .build();
        // Navigate to the website
        await driver.get(url);
    
        try {
            const usernameInput = await driver.findElement(By.id('login_id'));
            await usernameInput.sendKeys(username);
            await new Promise((resolve) => setTimeout(resolve, 5000));
          } catch (error) {}
      
        try {
        const nextButton = await driver.findElement(By.id('nextbtn'));
        await nextButton.click();
        await new Promise((resolve) => setTimeout(resolve, 15000));
        } catch (error) {}

        const signurl = await driver.getCurrentUrl();
        const parsedUrl = new URL(signurl);
        var datacenter = parsedUrl.hostname.split('.')[3];
        if (!datacenter) {
          datacenter = parsedUrl.hostname.split('.')[2];
        } else {
          datacenter = parsedUrl.hostname.split('.')[2] + "." + datacenter
        }

        console.log("Datacenter:", datacenter);

        try {
        const passwordInput = await driver.findElement(By.id('password'));
        await passwordInput.sendKeys(password);
        const loginButton = await driver.findElement(By.id('nextbtn'));
        await loginButton.click();
        await new Promise((resolve) => setTimeout(resolve, 10000));
        } catch (error) {}

        try {
          const continueButton = await driver.findElement(By.className('continue_button'));
          await continueButton.click();
          await new Promise((resolve) => setTimeout(resolve, 15000));
        } catch (error) {}
  
        try {
          const continueButton = await driver.findElement(By.className('continue_button'));
          await continueButton.click();
          await new Promise((resolve) => setTimeout(resolve, 15000));
        } catch (error) {}
  
        try {
        const laterButton = await driver.findElement(By.className('remind_me_later'));
        await laterButton.click();
        await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (error) {}
    
        try {
        const acceptButton = await driver.findElement(By.className('btn'));
        await acceptButton.click();
        await new Promise((resolve) => setTimeout(resolve, 10000));
        } catch (error) {}
      
    
        // Get the current URL, which should contain the RedirectURL
        const currentURL = await driver.getCurrentUrl();
    
        // Extract the token ID from the URL string
        const regex = /access_token=([^&]+)/;
        const match = currentURL.match(regex);
        const tokenID = match ? match[1] : null;
        console.log("TokenID:", tokenID)
        // Close the browser
        await driver.quit();

        const response = {
          token: tokenID,
          datacenter: datacenter
        }
    
        return response;
      } catch (error) {
        // Handle any errors that occur during the automation process
        console.error(error);
        throw new Error('An error occurred');
      }
    },

    'getAlldatafromZoho': async function (module, accessToken, datacenter = 'com') {
      try {
        let allProducts = [];
        let nextPage = 1;
        const perPage = 200; // Number of products to fetch per page
  
        // Continue fetching pages until there are no more products
        while (true) {
          // Make a GET request to fetch products for the current page
          const response = await axios.get(`https://www.zohoapis.${datacenter}/crm/v2/${module}?page=${nextPage}&per_page=${perPage}`, {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`, // Replace accessToken with your actual access token
            },
          });
  
          // Extract products from the response and append to the list
          allProducts = allProducts.concat(response.data.data);
  
          // Check if there are more pages
          if (response.data.info.more_records) {
            nextPage++; // Move to the next page
          } else {
            break; // No more pages, exit the loop
          }
        }
  
        // Return all fetched products
        return allProducts;
        
      } catch (error) {
        console.error('Error fetching products:', error.response.data);
        throw new Meteor.Error('api-error', 'Error fetching products');
      }
    },

    'getDatafromZohoByDate': async function (reqData) {
      try {
        const response = await axios.get(`https://www.zohoapis.${reqData.datacenter}/crm/v6/${reqData.data.module}/search?criteria=(Modified_Time:greater_than:${reqData.data.lstTime})`, {
          headers: {
            Authorization: `Zoho-oauthtoken ${reqData.auth}`,
            "Content-Type": "application/json",
          },
        });
        
        return response.data;

      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'getZohoCurrentUser': async function (reqData) {
      try {
        const response = await axios.get(`https://www.zohoapis.${reqData.datacenter}/crm/v2/users?type=CurrentUser`, {
          headers: {
            Authorization: `Zoho-oauthtoken ${reqData.auth}`,
            "Content-Type": "application/json",
          },
        });

        return response.data;

      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'updateZohoCustomers': async function(reqData) {
      try {
        const response = await axios.post(`https://www.zohoapis.${reqData.datacenter}/crm/v2/Contacts/upsert`,
          {
            data: reqData.data,
          }, {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
        });

        return response.data;

      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }

    },

    'getzohoDatasforLatest': async function(reqData) {
      try {
        const response = await axios.get(`https://www.zohoapis.${reqData.datacenter}/crm/v2/${reqData.data.module}/search?criteria=Modified_Time.after:${reqData.data.lastRanDate}`, {
          headers: {
            Authorization: `Zoho-oauthtoken ${reqData.auth}`,
            "Content-Type": "application/json",
          },
        });

        return response.data;

      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'getZohoCustomers': async function (reqData) {
      try {
        const response = await axios.get(`https://www.zohoapis.${reqData.datacenter}/crm/v2/Contacts`, {
          headers: {
            Authorization: `Zoho-oauthtoken ${reqData.auth}`,
            "Content-Type": "application/json",
          },
        });

        return response.data;

      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'updateZohoAccounts': async function (reqData) {
      try {
        const response = await axios.post(
          `https://www.zohoapis.${reqData.datacenter}/crm/v2/Accounts/upsert`,
          {
            data: reqData.data,
          }, {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
          }
        );

        return response.data;

      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'getZohoAccount': async function (reqData) {
      const accountName = reqData.Account_Name;
      try {
        const response = await axios.get(
          `https://www.zohoapis.${reqData.datacenter}/crm/v2/Accounts/search?criteria=Account_Name:equals:${accountName}`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log(response);
        return response.data;
      } catch (error) {
        console.log(error)
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'addZohoAccounts': async function (reqData) {
      try {
        const response = await axios.post(
          `https://www.zohoapis.${reqData.datacenter}/crm/v2/Accounts`,
          {
            data: reqData.data
          },
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
          }
        );
          console.log(response);
        return response.data;

      } catch (error) {
        
        console.log(error)
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'addZohoProduct': async function (reqData) {
      try {
        const response = await axios.post(
          `https://www.zohoapis.${reqData.datacenter}/crm/v2/Products`,
          {
            data: reqData.data,
          },
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
          }
        );
          console.log(response)
        return response.data;

      } catch (error) {
        
        console.log(error)
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'getZohoProduct': async function (reqData) {
      try {
        const productName = reqData.productName;
        const response = await axios.get(
          `https://www.zohoapis.${reqData.datacenter}/crm/v2/Products/search?criteria=Product_Name:equals:${productName}`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
          }
        ); 
        console.log(response)
        return response.data;
      } catch (error) {
        console.log(error)
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'getZohoProductByID': async function (reqData) {
      try {
        const productID = reqData.productID;
        const response = await axios.get(
          `https://www.zohoapis.${reqData.datacenter}/crm/v2/Products/search?criteria=id:equals:${productID}`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
          }
        ); 
        console.log(response)
        return response.data;
      } catch (error) {
        console.log(error)
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'updateZohoProducts': async function (reqData) {
      try {
        const response = await axios.post(
          `https://www.zohoapis.${reqData.datacenter}/crm/v2/Products/upsert`,
          {
            data: reqData.data,
          }, {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response)
        return response.data;
      } catch (error) {
        
        console.log(error)
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'getZohoOrders': async function (reqData) {
      try {
        const response = await axios.get(
          `https://www.zohoapis.${reqData.datacenter}/crm/v2/Sales_Orders`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'updateZohoOrders': async function (reqData) {
      try {
        const response = await axios.post(
          `https://www.zohoapis.${reqData.datacenter}/crm/v2/Sales_Orders/upsert`,
          {
            data: reqData.data,
          }, {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'getZohoQuotes': async function (reqData) {
      try {
        const response = await axios.get(`https://www.zohoapis.${reqData.datacenter}/crm/v2/Quotes`, {
          headers: {
            Authorization: `Zoho-oauthtoken ${reqData.auth}`,
            "Content-Type": "application/json",
          },
        });
        return response.data;
      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'updateZohoQuotes': async function (reqData) {
      try {
        const response = await axios.post(`https://www.zohoapis.${reqData.datacenter}/crm/v2/Quotes/upsert`,
          {
            data: reqData.data,
          }, {
            headers: {
              Authorization: `Zoho-oauthtoken ${reqData.auth}`,
              "Content-Type": "application/json",
            },
        });
        console.log(response)
        return response.data;
      } catch (error) {
        
        console.log(error)
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'checkFieldExistence': async function (reqData) {
      console.log(reqData.auth)
      try {
        const response = await axios.get(`https://www.zohoapis.${reqData.datacenter}/crm/v2/settings/fields?module=${reqData.module}`, {
          headers: {
            Authorization: `Zoho-oauthtoken ${reqData.auth}`,
            "Content-Type": "application/json",
          },
        });
        const fieldNames = response.data.fields.map(field => field.api_name);
        const fieldnameExists = fieldNames.includes(reqData.fieldName);
        return fieldnameExists;
      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }
    },

    'addcustomFields': async function (reqData) {
      try {
        const response = await axios.post(`https://www.zohoapis.${reqData.datacenter}/crm/v2/settings/fields?module=${reqData.module}`, reqData.data, {
          headers: {
            Authorization: `Zoho-oauthtoken ${reqData.auth}`,
            "Content-Type": "application/json",
          },
        });
        return response.data;
      } catch (error) {
        throw new Meteor.Error("api-error", error.response.data);
      }  
    },
});