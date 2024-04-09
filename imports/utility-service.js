import { ReactiveVar } from 'meteor/reactive-var';
import 'jquery/dist/jquery.min';
import 'jQuery.print/jQuery.print.js';
const XLSX = require("xlsx");
const moment = require('moment-timezone');
import { HTTP } from 'meteor/http';
import { error } from 'jquery';
import { indexOf } from 'lodash';

export class UtilityService {
  runNowFunction = async function (customDate, selConnectionId = '', TemplateInstant) {
    TemplateInstant.setLogFunction('');
    var templateObject = TemplateInstant;
    templateObject.setLogFunction('');
    var transNOtes = '';
    // let selConnectionId = templateObject.selConnectionId.get();
    let lstUpdateTime = new Date();
    let tempConnection;
    let tempResponse;
    let text = "";
    let token;
    let connectionType;
    let tempConnectionSoftware;
    let tempAccount;

    let transaction_details = []
    let upload_transaction_count = 0
    let products_num = 0
    let products = []
    let download_transaction_count = 0
    let order_transaction_count = 0

    let postgetTransData = {
          id: selConnectionId
      };

      let ERP_QuotesState = true;
      let ERP_SalesState = true;
      let ERP_ProductsState = true;
      let ERP_CustomerState = true;

      let ZOHO_QuotesState = true;
      let ZOHO_SalesState = true;
      let ZOHO_LeadsState = true;
      let ZOHO_CustomerState = true;

      let Magento2TrueERP_Customers = true;
      let Magento2TrueERP_Invoices = true;

      await fetch('/api/transfertypesByID', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(postgetTransData)
        }).then(response => response.json()).then(async (resultsTransType) => {

          $.each(resultsTransType, async function (i, e) {
                if(e.transfer_type == "ZOHO Quotes" && e.status == 0){
                  ZOHO_QuotesState = false;
                };
                if(e.transfer_type == "ZOHO Sales Orders" && e.status == 0){
                  ZOHO_SalesState = false;
                };

                if(e.transfer_type == "ZOHO Leads to Prospects" && e.status == 0){
                  ZOHO_LeadsState = false;
                };
                if(e.transfer_type == "ZOHO Account to Customers" && e.status == 0){
                  ZOHO_CustomerState = false;
                };
                if(e.transfer_type == "TrueERP Sales Orders" && e.status == 0){
                  ERP_SalesState = false;
                };
                if(e.transfer_type == "TrueERP Customers" && e.status == 0){
                  ERP_CustomerState = false;
                };
                if(e.transfer_type == "TrueERP Products" && e.status == 0){
                  ERP_ProductsState = false;
                };
                if(e.transfer_type == "TrueERP Quotes" && e.status == 0){
                  ERP_QuotesState = false;
                };
                if(e.transfer_type == "Magento Customers" && e.status == 0){
                  Magento2TrueERP_Customers = false;
                };
                if(e.transfer_type == "Magento Invoices" && e.status == 0){
                  Magento2TrueERP_Invoices = false;
                };
          });

        }).catch(error => console.log(error));


    const postData = {
    id: selConnectionId
    };
    fetch('/api/connectionsByID', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
    }).then(response => response.json()).then(async (connectionResult) => {
    lstUpdateTime = moment(connectionResult[0].last_ran_date).tz("Australia/Brisbane").format("YYYY-MM-DD hh:mm:ss");
    //lstUpdateTime = moment(connectionResult[0].last_ran_date).tz("Australia/Brisbane").subtract(1, 'hours').format("YYYY-MM-DD HH:mm:ss");
    // lstUpdateTime = connectionResult[0].last_ran_date !=''? moment(connectionResult[0].last_ran_date).format("YYYY-MM-DD HH:mm:ss"): connectionResult[0].last_ran_date;
    var lstUpdateTimeUTC = moment(connectionResult[0].last_ran_date).tz("Australia/Brisbane").format("YYYY-MM-DDThh:mm:ss");
    var lstUpdateTimeMagento = moment(connectionResult[0].last_ran_date).format("YYYY-MM-DDThh:mm:ss")
    var lstUpdateTimeZoho = moment(connectionResult[0].last_ran_date).tz("Australia/Brisbane").format("YYYY-MM-DDThh:mm:ssZ");

    if (customDate != '') {
    lstUpdateTime = customDate;
    lstUpdateTimeUTC = customDate;
    lstUpdateTimeZoho= moment(customDate).tz("Australia/Brisbane").format("YYYY-MM-DDThh:mm:ssZ");
    }
    tempConnection = connectionResult[0];
    const postData = {
    id: tempConnection.connection_id
    };

    fetch('/api/softwareByID', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(async (result) => {

    connectionType = result[0].name;
    templateObject.connectionType.set(connectionType);

    if (connectionType == "Magento") {

      const postData = {
          id: tempConnection.customer_id,
        };

        fetch("/api/MagentoByID", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        })
          .then((response) => response.json())
          .then(async (result) => {
            tempConnectionSoftware = result[0];
            let postData = {
              id: tempConnection.account_id,
            };
            fetch(`/api/softwareByID`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(postData),
            })
              .then((response) => response.json())
              .then(async (result) => {
                let postData = {
                  id: tempConnection.customer_id,
                };
                fetch(`/api/${result[0].name}ByID`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(postData),
                })
                  .then((response) => response.json())
                  .then(async (result) => {
                    tempAccount = result[0];
                    transNOtes = "";
                    var myHeaders = new Headers();
                    myHeaders.append("Database", `${tempAccount.database}`);
                    myHeaders.append("Username", `${tempAccount.user_name}`);
                    myHeaders.append("Password", `${tempAccount.password}`);

                    // Getting Wocommerce token
                    let url = tempConnectionSoftware.base_api_url;
                    let username = tempConnectionSoftware.admin_user_name;
                    let password = tempConnectionSoftware.admin_user_password;

                    const magentoTokenResponse = await new Promise(
                      (resolve, reject) => {
                        HTTP.call(
                          "POST",
                          "api/magentoAdminToken",
                          {
                            headers: {
                              "Content-Type": "application/json",
                            },
                            data: {
                              url: url,
                              username: username,
                              password: password,
                            },
                          },
                          (error, response) => {
                            if (error) {
                              console.error("Error:", error);
                              reject(error);
                            } else {
                              resolve(response);
                            }
                          }
                        );
                      }
                    );

                    var token = magentoTokenResponse.data;

                    let upload_transaction_count = 0;
                    let download_transaction_count = 0;
                    let transaction_details = [];
                    let products;

                    transNOtes += "Got token for Magento.\n";
                    templateObject.setLogFunction(transNOtes);
                    // Make the second POST request using the obtained token
                    const trueERPResponse = await fetch(`/api/TrueERPByID`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(postData),
                    });

                    const tempResult = await trueERPResponse.json();
                    tempAccount = tempResult[0];

                    // fetchMagentoCustomerJob(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempConnection, tempConnectionSoftware, tempAccount, magentoTokenResponse.data, selConnectionId, transNOtes);

                    transNOtes += `Last Sync Time: ${moment(lstUpdateTimeMagento).format("DD/MM/YYYY HH:mm:ss")}\n`;
                    // transNOtes += `Last Sync Time: 01/01/2024\n`;
                    templateObject.setLogFunction(transNOtes);
                    async function runPerFiveMinutes() {

                      const CustomerState = tempConnectionSoftware.transfer_type_customers;
                      const ProductsState = tempConnectionSoftware.transfer_type_products;;
                      // const ProductsState = jQuery('#erp_products2magento').is(':checked');

                      if ( CustomerState ) {
                      //getting newly added customer from ERP database
                        transNOtes += `----------------------------------------------------------\n`;
                        templateObject.setLogFunction(transNOtes);
                        await fetch(
                          // `${tempAccount.base_url}/TCustomer?listtype=detail&select=[MsTimeStamp]>"${lstUpdateTimeMagento}"`,
                          `${tempAccount.base_url}/TCustomer?Propertylist=Companyname,Street,City,Title,ClientName,Phone,Mobile,Country,Postcode,Email,FirstName,LastName&select=[MsTimeStamp]>"${lstUpdateTimeMagento}"`,
                          {
                            method: "GET",
                            headers: myHeaders,
                            redirect: "follow",
                          }
                        )
                          .then((response) => response.json())
                          .then(async (result) => {
                            const newCustomersFromERP = result.tcustomer;
                            console.log(result)
                            if (newCustomersFromERP.length === 0) {
                              transNOtes += `There is no newly added Customer in TrueERP.\n`;
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              let upload_num = 0;
                              transNOtes += `Found ${newCustomersFromERP.length} newly added customer(s) in TrueERP database.\n`;
                              templateObject.setLogFunction(transNOtes);
                              let newCustomersFromERPCount = 0;

                              for (const newCustomerFromERP of newCustomersFromERP) {

                                transNOtes += `Got ${++newCustomersFromERPCount} Customer data with Id: ${
                                  newCustomerFromERP?.Id
                                } and MsTimeStamp: ${
                                  newCustomerFromERP.MsTimeStamp
                                } from TrueERP.\n`;
                                templateObject.setLogFunction(transNOtes);
                                const bodyToAddMagento = {
                                  email:
                                    newCustomerFromERP?.Email ||
                                    newCustomerFromERP?.FirstName + "@email.com" ||
                                    "",
                                  firstname: newCustomerFromERP?.FirstName,
                                  lastname: newCustomerFromERP?.LastName,
                                  prefix: "TrueERP",
                                  dob: moment().format("YYYY-MM-DD"),

                                };

                                transNOtes += `(Detail) First name: ${bodyToAddMagento?.firstname}, Last name: ${bodyToAddMagento?.lastname}, Email: ${bodyToAddMagento?.email}.\n`;
                                transNOtes += `Adding ${newCustomersFromERPCount} Customer to Magento.\n`;
                                templateObject.setLogFunction(transNOtes);

                                let jsonCustomerData = {
                                  customer: bodyToAddMagento,
                                };

                                try {

                                  const existingCustomer = await new Promise((resolve, reject) => {
                                    Meteor.call('findMagentoCustomerByEmail', url, bodyToAddMagento.email, token, (error, result) => {
                                      if (error) {
                                        reject(error);
                                      } else {
                                        resolve(result);
                                      }
                                    });
                                  });

                                  if (existingCustomer) {
                                    // Customer already exists, update the customer
                                    try {
                                      const customerResult = await new Promise((resolve, reject) => {
                                        Meteor.call("updateMagentoCustomer", url, existingCustomer.id, jsonCustomerData, token, (error, result) => {
                                          if (error) {
                                            reject(error);
                                          } else {
                                            resolve(result);
                                          }
                                        });
                                      });

                                      if (customerResult) {
                                        upload_transaction_count ++;
                                        upload_num ++;
                                        transNOtes += `Successfully updated ${newCustomersFromERPCount} Customer to Magento with ID: ${newCustomerFromERP?.Id}.\n\n`;
                                        templateObject.setLogFunction(transNOtes);
                                      } else {
                                        transNOtes += `[Error] Failed to update customer.\n`;
                                        templateObject.setLogFunction(transNOtes);
                                      }
                                    } catch (error) {
                                      transNOtes += `[Error] ${error}\n`;
                                      templateObject.setLogFunction(transNOtes);
                                      }

                                  } else {
                                    // Customer does not exist, add the new customer
                                    try {
                                      const customerResult = await new Promise((resolve, reject) => {
                                        Meteor.call("addOrUpdateMagentoCustomer", url, token, jsonCustomerData, (error, result) => {
                                          if (error) {
                                            reject(error);
                                          } else {
                                            resolve(result);
                                          }
                                        });
                                      });

                                      if (customerResult) {
                                        upload_transaction_count ++;
                                        upload_num ++;
                                        transNOtes += `Successfully added ${newCustomersFromERPCount} Customer to Magento with ID: ${newCustomerFromERP?.Id}.\n\n`;
                                        templateObject.setLogFunction(transNOtes);
                                      } else {
                                        transNOtes += `[Error] Failed to add customer.\n\n`;
                                        templateObject.setLogFunction(transNOtes);
                                      }
                                    } catch (error) {
                                      transNOtes += `[Error] ${error}\n`;
                                      templateObject.setLogFunction(transNOtes);
                                    }
                                  }
                                } catch (error) {
                                  console.error('Failed to find customer:', error);
                                }

                              }
                              transaction_details.push({
                                detail_string:
                                  "Uploaded Customers from TrueERP to Magento",
                                count: upload_num,
                              });
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                            transNOtes += `There is no newly added Customer in TrueERP.\n`;
                            templateObject.setLogFunction(transNOtes);
                          });
                      }

                      if ( ProductsState ) {

                      //getting newly added products from ERP database
                        transNOtes += `----------------------------------------------------------\n`;
                        templateObject.setLogFunction(transNOtes);
                        await fetch(
                          // `${tempAccount.base_url}/TProduct?listtype=detail&select=[MsTimeStamp]>"${lstUpdateTimeMagento}"&[PublishOnWeb]=true`,
                          `${tempAccount.base_url}/TProduct?PropertyList=ProductName,PRODUCTCODE,ProductDescription,Active,SalesDescription,TotalQtyonOrder,TotalQtyInStock,SellQty1PriceInc,WHOLESALEPRICE&select=[MsTimeStamp]>"${lstUpdateTimeMagento}" AND [PublishOnWeb]=true AND [Active]=true`,
                          {
                            method: "GET",
                            headers: myHeaders,
                            redirect: "follow",
                          }
                        )
                          .then((response) => response.json())
                          .then(async (result) => {
                            console.log(result)
                            const newProductsFromERP = result.tproduct;
                            if (newProductsFromERP.length === 0) {
                              transNOtes += `There is no newly added Product in TrueERP.\n`;
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              let upload_num = 0;
                              transNOtes += `Found ${newProductsFromERP.length} newly added product(s) in TrueERP database.\n`;
                              templateObject.setLogFunction(transNOtes);
                              let newProductsFromERPCount = 0;

                              for (const newProductFromERP of newProductsFromERP) {

                                transNOtes += `Got ${++newProductsFromERPCount} Product data with Id: ${
                                  newProductFromERP?.Id
                                } and MsTimeStamp: ${
                                  newProductFromERP?.MsTimeStamp
                                } from TrueERP.\n`;
                                templateObject.setLogFunction(transNOtes);
                                // const uomSalesName = esult?.fields?.UOMSales
                                const bodyToAddMagento = {
                                  name: newProductFromERP?.ProductName,
                                  sku: newProductFromERP?.SKU || newProductFromERP?.GlobalRef,
                                  price: newProductFromERP?.WHOLESALEPRICE,
                                  attribute_set_id: 4,
                                };
                                transNOtes += `(Detail) Product name: ${bodyToAddMagento?.name}, Price: ${bodyToAddMagento?.price}\n`;
                                transNOtes += `Adding ${newProductsFromERPCount} Product to Magento.\n`;
                                templateObject.setLogFunction(transNOtes);

                                let jsonProductData = {
                                  product: bodyToAddMagento
                                }

                                console.log(token)
                                try {
                                  const productResult = await new Promise((resolve, reject) => {
                                    Meteor.call("addOrUpdateMagentoProduct", url, token, jsonProductData, (error, result) => {
                                      if (error) {
                                        reject(error);
                                      } else {
                                        resolve(result);
                                      }
                                    });
                                  });

                                  if (productResult) {
                                    upload_transaction_count ++;
                                    upload_num ++;
                                    transNOtes += `Successfully added ${newProductsFromERPCount} Product to Magento with ID: ${newProductFromERP?.Id}.\n\n`;
                                    templateObject.setLogFunction(transNOtes);
                                  } else {
                                    transNOtes += `[Error] Failed to add product.\n\n`;
                                    templateObject.setLogFunction(transNOtes);
                                  }
                                } catch (error) {
                                  transNOtes += `[Error] ${error}\n`;
                                  templateObject.setLogFunction(transNOtes);
                                }
                              }

                              transaction_details.push({
                                detail_string:
                                  "Uploaded Products from TrueERP to Magento",
                                count: upload_num,
                              });

                            }
                          })
                          .catch(() => {
                            transNOtes += `There is no newly added product.\n`;
                            templateObject.setLogFunction(transNOtes);
                          });
                        //Getting newly added orders from woocommerce
                        transNOtes += `----------------------------------------------------------\n`;
                        templateObject.setLogFunction(transNOtes);
                      }

                      if ( Magento2TrueERP_Customers ) {
                        //Getting newly added Customers from Magento
                        transNOtes += `----------------------------------------------------------\n`;
                        templateObject.setLogFunction(transNOtes);

                        try {
                          const customers = await new Promise((resolve, reject) => {
                            Meteor.call("getMagentoUpdatedCustomers", url, token, lstUpdateTimeMagento, (error, result) => {
                              if (error) {
                                reject(error);
                              } else {
                                resolve(result);
                              }
                            });
                          });

                          // Process the customers as needed

                          if (customers) {
                            console.log(customers)
                            if (customers.items.length === 0) {
                              transNOtes += `There is no newly added Customer in Magento.\n`;
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              responseCount = customers.items.length;
                              var resultData = customers.items;
                              let formatting =
                                responseCount > 1 ? "Customers" : "Customer";
                              transNOtes +=
                                `Received ` +
                                responseCount +
                                ` ${formatting} from Magento.\n`;

                              transNOtes += `Adding ${formatting} to TrueERP \n`;
                              templateObject.setLogFunction(transNOtes);
                              let download_num = 0;

                              for (let i = 0; i < responseCount; i++) {
                                let tempCount = i % 10;
                                let count = tempCount === 0 ? `${i + 1}st` : tempCount === 1 ? `${i + 1}nd` : tempCount === 2 ? `${i + 1}rd` : `${i + 1}th`;
                                transNOtes += `Adding ${count} Customer to ERP database.\n`;
                                templateObject.setLogFunction(transNOtes);

                                let postData = {};
                                postData.type = "TCustomer";
                                postData.fields = {};
                                postData.fields.Email = resultData[i].email || "";

                                postData.fields.FirstName =
                                  resultData[i].firstname || "";

                                postData.fields.LastName =
                                  resultData[i].lastname || "";

                                const clientName = resultData[i].lastname + " " + resultData[i].firstname;

                                if (!resultData[i].GlobalRef) {
                                  await fetch(`${tempAccount.base_url}/TCustomer?select=[ClientName]="${clientName}"&[Active]=true`,
                                    {
                                      method: "GET",
                                      headers: {
                                        Username: tempAccount.user_name,
                                        Password: tempAccount.password,
                                        Database: tempAccount.database,
                                        "Content-Type": "application/json",
                                      },
                                      redirect: "follow",
                                    }
                                  ).then((response) => response.json()).then(async (result) => {
                                      if (result.tcustomer.length > 0) {
                                        postData.fields.GlobalRef = result?.tcustomer[0]?.GlobalRef;
                                        transNOtes += `Found the Customer as ClientName : ${clientName}\n`;
                                        templateObject.setLogFunction(transNOtes);
                                      } else {
                                        postData.fields.ClientName = clientName;
                                      }
                                    }).catch((err) => {
                                      console.log(err);
                                      postData.fields.ClientName = clientName;
                                    });
                                } else {
                                  postData.fields.GlobalRef = resultData[i].GlobalRef;
                                }

                                await fetch("/api/updateTrueERP2", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    data: postData,
                                    Username: tempAccount.user_name,
                                    Password: tempAccount.password,
                                    Database: tempAccount.database,
                                    url: tempAccount.base_url + "/TCustomer",
                                  }),
                                }).then((response) => response.json()).then(async (result) => {
                                    download_transaction_count += 1;
                                    download_num += 1;
                                    transNOtes += `Customer ${i+1} with ID:${resultData[i].id} transfer Success!\n\n`;
                                    templateObject.setLogFunction(transNOtes);
                                  }).catch((error) => {
                                    console.log(error);
                                    transNOtes += `Customers transfer Failed!\n\n`;
                                    transNOtes += `Failed!!!\n`;
                                    templateObject.setLogFunction(transNOtes);
                                  });
                              }

                              transaction_details.push({
                                detail_string:
                                  "Downloaded Customers from Magento to TrueERP",
                                count: download_num,
                              });
                            }
                          } else {
                            transNOtes += `[Error] Failed to add Customers.\n`;
                            templateObject.setLogFunction(transNOtes);
                          }

                          console.log(customers);
                        } catch (error) {
                          console.error('Failed to get customers:', error);
                        }
                      }

                      if ( Magento2TrueERP_Invoices ) {
                        //Getting newly added Invoices from Magento
                          transNOtes += `-----------------------------------------------------------\n`;
                          templateObject.setLogFunction(transNOtes);
                          
                          try {
                            const invoices = await new Promise((resolve, reject) => {
                              Meteor.call("getMagentoUpdatedInvoices", url, token, lstUpdateTimeMagento, (error, result) => {
                                if (error) {
                                  reject(error);
                                } else {
                                  resolve(result);
                                }
                              });
                            });
                          
                            // Process the invoices as needed
    
                            if (invoices) {
                              if (invoices.items.length === 0) {
                                transNOtes += `There is no newly added Invoice in Magento.\n`;
                                templateObject.setLogFunction(transNOtes);
                              } else {
                                responseCount = invoices.items.length;
                                var resultData = invoices.items;
                                let formatting =
                                  responseCount > 1 ? "Invoices" : "Invoice";
                                transNOtes +=
                                  `Received ` +
                                  responseCount +
                                  ` ${formatting} from Magento.\n`;
      
                                transNOtes += `Adding ${formatting} to TrueERP \n`;
                                templateObject.setLogFunction(transNOtes);
                                let download_num = 0;
      
                                for (let i = 0; i < responseCount; i++) {
                                  let tempCount = i % 10;
                                  let count = tempCount === 0 ? `${i + 1}st` : tempCount === 1 ? `${i + 1}nd` : tempCount === 2 ? `${i + 1}rd` : `${i + 1}th`;
                                  transNOtes += `Adding ${count} Invoice to ERP database.\n`;
                                  templateObject.setLogFunction(transNOtes);
                                  let orderID = resultData[i].order_id;
                                  let OrderData;
                                  console.log(resultData[i]?.order_id)
                                  try {
                                    const orderDetail = await new Promise((resolve, reject) => {
                                      Meteor.call("getMagentoOrderByID", url, token, orderID, (error, result) => {
                                        if (error) {
                                          reject(error);
                                        } else {
                                          resolve(result);
                                        }
                                      });
                                    })
    
                                    if (orderDetail) {
                                      OrderData = orderDetail;
                                      console.log(orderDetail)
                                      let postData = {};
                                      postData.type = "TCustomer";
                                      postData.fields = {};
                                      postData.fields.Email = OrderData.customer_email || "";
          
                                      postData.fields.FirstName =
                                        OrderData.customer_firstname || "";
          
                                      postData.fields.LastName =
                                        OrderData.customer_lastname || "";
          
                                      const clientName = OrderData.customer_lastname + " " + OrderData.customer_firstname;
                                      let clientId;
    
                                      await fetch(
                                        `${tempAccount.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
                                        {
                                          method: "GET",
                                          headers: {
                                            Username: tempAccount.user_name,
                                            Password: tempAccount.password,
                                            Database: tempAccount.database,
                                            "Content-Type": "application/json",
                                          },
                                          redirect: "follow",
                                        }
                                      )
                                        .then((response) => response.json())
                                        .then(async (result) => {
                                          if (result?.tcustomer.length > 0) {
                                            clientId = result?.tcustomer[0]?.Id;
                                            transNOtes += `Found the Customer as ID : ${clientId}\n`;
                                            templateObject.setLogFunction(transNOtes);
                                          } else {
                                            transNOtes += `Not Existing Customer, creating...\n`;
                                            templateObject.setLogFunction(transNOtes);
                                            const tempCustomerDetailtoERP = {
                                              type: "TCustomer",
                                              fields: {
                                                ClientName: clientName || "",
                                                Country:OrderData.billing_address.country_id || "",
                                                State: OrderData.billing_address.region || "",
                                                Street: OrderData.billing_address.street[0] || "",
                                                Postcode: OrderData.billing_address.postcode || "",
                                              },
                                            };
                                            console.log(
                                              tempCustomerDetailtoERP,
                                              "tempCustomer"
                                            );
                                            await fetch(`${tempAccount.base_url}/TCustomer`, {
                                              method: "POST",
                                              headers: {
                                                Username: tempAccount.user_name,
                                                Password: tempAccount.password,
                                                Database: tempAccount.database,
                                                "Content-Type": "application/json",
                                              },
                                              redirect: "follow",
                                              body: JSON.stringify(tempCustomerDetailtoERP),
                                            })
                                              .then((response) => {
                                                console.log(response);
                                                response.json();
                                              })
                                              .then(async (result) => {
                                                clientId = result?.fields?.ID;
                                                transNOtes += `Added a new customer to TrueERP database with ID : ${clientId}.\n`;
                                                templateObject.setLogFunction(transNOtes);
                                              })
                                              .catch((error) =>
                                                console.log("error", error)
                                              );
                                          }
                                        })
                                        .catch(() => {
                                          transNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                          templateObject.setLogFunction(transNOtes);
                                        });
          
                                      //check if the product exists and add if not
                                      const productList = OrderData?.items;
                                      const productIdList = [];
                                      const productQtyList = [];
                                      transNOtes += `There are ${productList.length} products in the items.\n`;
                                      templateObject.setLogFunction(transNOtes);
          
                                      for (const product of productList) {
                                        transNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.name}...\n`;
                                        templateObject.setLogFunction(transNOtes);
                                        await fetch(
                                          `${tempAccount.base_url}/TProduct?select=[ProductName]="${product?.name}"`,
                                          {
                                            method: "GET",
                                            headers: {
                                              Username: tempAccount.user_name,
                                              Password: tempAccount.password,
                                              Database: tempAccount.database,
                                              "Content-Type": "application/json",
                                            },
                                            redirect: "follow",
                                          }
                                        )
                                          .then((response) => response.json())
                                          .then(async (result) => {
                                            if (result?.tproduct.length > 0) {
                                              const productId = result?.tproduct[0]?.Id;
                                              transNOtes += `Found the Product as ID : ${productId}\n`;
                                              templateObject.setLogFunction(transNOtes);
                                              productIdList.push(productId);
                                              productQtyList.push(product?.qty_invoiced);
                                            }
                                            
                                          })
                                          .catch(() => {
                                            transNOtes += `Error while getting Product Id from the TrueERP database.\n`;
                                            templateObject.setLogFunction(transNOtes);
                                          });
                                      }
          
                                      // create a new Qutoes in ERP.
          
                                      const InvoiceItems = [];
          
                                      productIdList.forEach((item, index) => {
                                        InvoiceItems.push({
                                          type: "TInvoiceLine",
                                          fields: {
                                            ProductID: item,
                                            OrderQty: productQtyList[index],
                                          },
                                        });
                                      });
                                      if (InvoiceItems.length === 0) {
                                        continue;
                                      }
                                      const InvoiceData = {
                                        type: "TInvoiceEx",
                                        fields: {
                                          CustomerID: clientId,
                                          Lines: InvoiceItems,
                                          IsBackOrder: true,
                                          Comments: "Invoice Produced in Magento",
                                          ShipCountry: OrderData.billing_address.country_id || "",
                                          ShipState: OrderData.billing_address.region || "",
                                          ShipStreet1: OrderData.billing_address.street[0] || "",
                                          ShipPostcode: OrderData.billing_address.postcode || "",
                                          TotalTax: OrderData.base_tax_amount || 0,
                                          InvoiceState: OrderData.state || "",
                                        },
                                      };
          
                                      if(resultData[i]?.GlobalRef) {
                                        InvoiceData.fields.GlobalRef = resultData[i]?.GlobalRef
                                      }
          
                                      await fetch("/api/updateTrueERP2", {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          data: InvoiceData,
                                          Username: tempAccount.user_name,
                                          Password: tempAccount.password,
                                          Database: tempAccount.database,
                                          url: tempAccount.base_url + "/TInvoiceEx",
                                        }),
                                      })
                                        .then((response) => response.json())
                                        .then(async (result) => {
                                          console.log(result);
                                          download_transaction_count += 1;
                                          download_num += 1;
                                          transNOtes += `Invoice ${i+1} with ID:${resultData[i].entity_id} transfer Success!\n\n`;
                                          templateObject.setLogFunction(transNOtes);
                                        })
                                        .catch((error) => {
                                          console.log(error);
                                          transNOtes += `Invoice transfer Failed!\n\n`;
                                          templateObject.setLogFunction(transNOtes);
                                        });
                                    
                                    }
                                  } catch (error) {
                                    console.error('Failed to get Order:', error);
                                  }
      
                                }
      
                                transaction_details.push({
                                  detail_string:
                                    "Downloaded Invoices from Magento to TrueERP",
                                  count: download_num,
                                });
                              }
                            } else {
                              transNOtes += `[Error] Failed to add Invoices.\n`;
                              templateObject.setLogFunction(transNOtes);
                            }
    
                          } catch (error) {
                            console.error('Failed to get invoices:', error);
                          }
    
                      }

                      //update the last sync time
                      transNOtes += `----------------------------------------------------------\n`;
                      templateObject.setLogFunction(transNOtes);

                      let nowInSydney = moment()
                        .tz("Australia/Brisbane")
                        .format("YYYY-MM-DD HH:mm:ss");
                      let args = {
                        id: selConnectionId,
                        last_ran_date: nowInSydney,
                      };
                      fetch(`/api/updateLastRanDate`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(args),
                      })
                        .then((response) => response.json())
                        .then(async (result) => {
                          transNOtes += `Updated Last Sync Time as ${moment(nowInSydney).format("DD/MM/YYYY HH:mm:ss")}.\n`;
                          templateObject.setLogFunction(transNOtes);
                        })
                        .catch((err) => console.log(err));


                      let account_id = 7;
                      let connection_id = 3;
                      let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

                      // let year = today.getFullYear();
                      // let month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
                      // let day = String(today.getDate()).padStart(2, "0");

                      // let formattedDate = `${year}-${month}-${day}`;
                      let formattedDate = moment(today).format("YYYY-MM-DD");
                      let id = selConnectionId;

                      let products_num =
                        upload_transaction_count + download_transaction_count;
                      let transaction_data = {
                        accounting_soft: account_id,
                        connection_soft: connection_id,
                        date: formattedDate,
                        order_num: products_num,
                        products: products,
                        products_num: products_num,
                        uploaded_num: upload_transaction_count,
                        downloaded_num: download_transaction_count,
                        connection_id: id,
                      };

                      let insertedTransactionID = 0;
                      fetch("/api/transactionByDate", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          date: moment().format("YYYY-MM-DD"),
                          connection_id: id,
                          accounting_soft: account_id,
                          connection_soft: connection_id,
                        }),
                      })
                        .then((response) => response.json())
                        .then(async (result) => {
                          if (result != "No Result") {
                            transaction_data.order_num =
                              transaction_data.order_num + result.order_num;
                            transaction_data.products_num =
                              transaction_data.products_num + result.products_num;
                            transaction_data.uploaded_num =
                              transaction_data.uploaded_num + result.uploaded_num;
                            transaction_data.downloaded_num =
                              transaction_data.downloaded_num + result.downloaded_num;
                            let resultId = result.id;
                            fetch("/api/addtransaction", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                id: resultId,
                                transaction_data: transaction_data,
                              }),
                            })
                              .then((response) => response.json())
                              .then(async (result) => {
                                insertedTransactionID = resultId;
                                let postData = {
                                  transaction_details: transaction_details,
                                  transactionId: insertedTransactionID,
                                  date: today,
                                };
                                fetch("/api/inserttransactionDetails", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify(postData),
                                })
                                  .then((response) => response.json())
                                  .then(async (result) => {})
                                  .catch((error) => console.log(error));
                              })
                              .catch((error) => console.log(error));
                          } else {
                            fetch("/api/inserttransaction", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(transaction_data),
                            })
                              .then((response) => response.json())
                              .then(async (result) => {
                                insertedTransactionID = result;
                                let postData = {
                                  transaction_details: transaction_details,
                                  transactionId: insertedTransactionID,
                                  date: today,
                                };
                                fetch("/api/inserttransactionDetails", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify(postData),
                                })
                                  .then((response) => response.json())
                                  .then(async (result) => {})
                                  .catch((error) => console.log(error));
                              })
                              .catch((error) => console.log(error));
                          }
                        });
                    }
                    runPerFiveMinutes();
                  });
              });
          }).catch((error) => console.log(error));
    }
    else if (connectionType == "WooCommerce") {
    let constCategoryFromWoo = "";
    let woCategoryID = '';
    let postData = {
      id: tempConnection.customer_id,
    };
    fetch(`/api/WooCommerceByID`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    }).then(response => response.json())
      .then(async (result) => {
          let customerCount;
          tempConnectionSoftware = result[0];

          let postData = {
              id: tempConnection.account_id,
          };
          fetch(`/api/softwareByID`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(postData)
          })
              .then(response => response.json())
              .then(async (result) => {
                  let postData = {
                      id: tempConnection.customer_id,
                  };
                  fetch(`/api/${result[0].name}ByID`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(postData)
                  })
                      .then(response => response.json())
                      .then(async (result) => {
                          tempAccount = result[0];
                          transNOtes = "";
                          var myHeaders = new Headers();
                          myHeaders.append("Database", `${tempAccount.database}`);
                          myHeaders.append("Username", `${tempAccount.user_name}`);
                          myHeaders.append("Password", `${tempAccount.password}`);

                          // Getting Wocommerce token
                          let url = tempConnectionSoftware.base_url;
                          let username = tempConnectionSoftware.emailkey;
                          let password = tempConnectionSoftware.secret;

                          const axios = require('axios');
                          const FormData = require('form-data');
                          let data = new FormData();
                          data.append('username', username);
                          data.append('password', password);

                          let config = {
                              method: 'post',
                              maxBodyLength: Infinity,
                              url: url + '/wp-json/jwt-auth/v1/token',
                              headers: {
                                  'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
                              },
                              data: data
                          };
                          var token
                          await axios.request(config)
                              .then(async (response) => {
                                  token = response.data.token

                                  transNOtes += 'Got token for WooCommerce.\n';
                                  templateObject.setLogFunction(transNOtes);
                              })

                            let postData1 = {
                                id: selConnectionId
                            };

                            //Get Categories:
                              await axios.get(`${url}/wp-json/wc/v3/products/categories`, {
                                  headers: {
                                      'Authorization': `Bearer ${token}`,
                                  }
                              }).then(async (response) => {
                                  constCategoryFromWoo = response.data;
                                  templateObject.woCategories.set(constCategoryFromWoo);
                                  console.log(response);
                              });

                            fetch('/api/transfertypesByID', {
                                method: 'POST',
                                headers: {
                                'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(postData1)
                                })
                                .then(response => response.json())
                                .then(async (results) => {
                                let transferTypes2 = [];
                                $.each(results, async function (i, e) {
                                    if(e.tab_id == 2){
                                        transferTypes2.push(e);
                                    }
                                });

                                await templateObject.transferTypes2.set(transferTypes2);
                                let transferTypes =  await templateObject.transferTypes2.get();
                                let customer_status = false;
                                let product_status = false;

                                for(let i = 0; i< transferTypes.length; i++){
                                    if(transferTypes[i].transfer_type == 'TrueERP Customers'
                                                            && transferTypes[i].status == 1){
                                        customer_status = true
                                    }
                                    else if(transferTypes[i].transfer_type == 'TrueERP Products'
                                                            && transferTypes[i].status == 1){
                                        product_status = true
                                    }
                                }

                                transNOtes += `Last Sync Time as ${moment(lstUpdateTime).format("DD/MM/YYYY hh:mm:ss")}.\n`;
                                templateObject.setLogFunction(transNOtes);
                                async function runPerFiveMinutes() {
                                    if(customer_status){
                                    //getting newly added customer from ERP database
                                    transNOtes += `-----------------------------------------------------------\n`;
                                    templateObject.setLogFunction(transNOtes);
                                    await fetch(`${tempAccount.base_url}/TCustomer?select=[MsTimeStamp]>"${lstUpdateTime}"`,
                                        {
                                            method: 'GET',
                                            headers: myHeaders,
                                            redirect: 'follow'
                                        })
                                        .then(response => response.json())
                                        .then(async result => {
                                            const newCustomersFromERP = result.tcustomer

                                            if (newCustomersFromERP.length === 0) {
                                                transNOtes += `There is no newly added Customer in TrueERP.\n`;
                                                templateObject.setLogFunction(transNOtes);
                                            }
                                            else {
                                                transNOtes += `Found ${newCustomersFromERP.length} newly added customer(s) in TrueERP database.\n`;
                                                templateObject.setLogFunction(transNOtes);
                                                let newCustomersFromERPCount = 0

                                                for (const newCustomerFromERP of newCustomersFromERP) {
                                                    await fetch(`${tempAccount.base_url}/TCustomer/${newCustomerFromERP.Id}`,
                                                        {
                                                            method: 'GET',
                                                            headers: myHeaders,
                                                            redirect: 'follow'
                                                        })
                                                        .then(response => response.json())
                                                        .then(async result => {
                                                            transNOtes += `Got ${++newCustomersFromERPCount} Customer data with Id: ${newCustomerFromERP.Id} and MsTimeStamp: ${newCustomerFromERP.MsTimeStamp} from TrueERP.\n`;
                                                            templateObject.setLogFunction(transNOtes);
                                                            const bodyToAddWoocommerce = {
                                                                email: result?.fields?.Email,
                                                                first_name: result?.fields?.FirstName,
                                                                last_name: result?.fields?.LastName,
                                                                role: "customer",
                                                                username: result?.fields?.FirstName + " " + result?.fields?.LastName,
                                                                billing: {
                                                                    first_name: result?.fields?.FirstName,
                                                                    last_name: result?.fields?.LastName,
                                                                    company: result?.fields?.Company,
                                                                    address_1: result?.fields?.Street,
                                                                    address_2: result?.fields?.Street2,
                                                                    // city: result?.fields?.Contacts[0]?.fields?.ContactCity,
                                                                    postcode: result?.fields?.Postcode,
                                                                    country: result?.fields?.Country,
                                                                    state: result?.fields?.State,
                                                                    email: result?.fields?.Email,
                                                                    phone: result?.fields?.Phone
                                                                },
                                                                shipping: {
                                                                    first_name: result?.fields?.FirstName,
                                                                    last_name: result?.fields?.LastName,
                                                                    company: result?.fields?.Company,
                                                                    address_1: result?.fields?.Street,
                                                                    address_2: result?.fields?.Street2,
                                                                    // city: result?.fields?.Contacts[0]?.fields?.ContactCity,
                                                                    postcode: result?.fields?.Postcode,
                                                                    country: result?.fields?.Country,
                                                                    state: result?.fields?.State,
                                                                    phone: result?.fields?.Phone
                                                                }
                                                            }
                                                            transNOtes += `(Detail) First name: ${bodyToAddWoocommerce?.first_name}, Last name: ${bodyToAddWoocommerce?.last_name}, Email: ${bodyToAddWoocommerce?.email}.\n`;
                                                            transNOtes += `Adding ${newCustomersFromERPCount} Customer to Woocommerce.\n`;
                                                            templateObject.setLogFunction(transNOtes);
                                                            await axios.post(`${url}/wp-json/wc/v3/customers`, bodyToAddWoocommerce, {
                                                                headers: {
                                                                    'Authorization': `Bearer ${token}`,
                                                                }
                                                            })
                                                                .then(async (response) => {
                                                                    const id = response.data.id
                                                                    if (id) {
                                                                        transNOtes += `Successfully added ${newCustomersFromERPCount} Customer to Woocommerce with ID: ${id}.\n`;
                                                                        templateObject.setLogFunction(transNOtes);
                                                                    } else {
                                                                        transNOtes += `[Error] Already existing customer..\n`;
                                                                        templateObject.setLogFunction(transNOtes);
                                                                    }
                                                                })
                                                                .catch((err) => {
                                                                    transNOtes += `[Error] Already existing customer..\n`;
                                                                    templateObject.setLogFunction(transNOtes);
                                                                })

                                                        })
                                                }

                                            }
                                        })
                                        .catch(() => {
                                            transNOtes += `There is no newly added Customer.\n`;
                                            templateObject.setLogFunction(transNOtes);
                                        })
                                    }
                                    if(product_status){
                                    //getting newly added products from ERP database
                                    transNOtes += `-----------------------------------------------------------\n`;
                                    templateObject.setLogFunction(transNOtes);
                                    await fetch(`${tempAccount.base_url}/TProduct?select=[MsTimeStamp]>"${lstUpdateTime}"&[PublishOnWeb]=true`,
                                        {
                                            method: 'GET',
                                            headers: myHeaders,
                                            redirect: 'follow'
                                        })
                                        .then(response => response.json())
                                        .then(async result => {
                                            const newProductsFromERP = result.tproduct
                                            upload_transaction_count = newProductsFromERP.length

                                            if (newProductsFromERP.length === 0) {
                                                transNOtes += `There is no newly added Product in TrueERP.\n`;
                                                templateObject.setLogFunction(transNOtes);
                                            }
                                            else {
                                                transNOtes += `Found ${newProductsFromERP.length} newly added product(s) in TrueERP database.\n`;
                                                templateObject.setLogFunction(transNOtes);
                                                let newProductsFromERPCount = 0

                                                for (const newProductFromERP of newProductsFromERP) {
                                                    await fetch(`${tempAccount.base_url}/TProduct/${newProductFromERP.Id}`,
                                                        {
                                                            method: 'GET',
                                                            headers: myHeaders,
                                                            redirect: 'follow'
                                                        })
                                                        .then(response => response.json())
                                                        .then(async result => {
                                                            transNOtes += `Got ${++newProductsFromERPCount} Product data with Id: ${newProductFromERP.Id} and MsTimeStamp: ${newProductFromERP.MsTimeStamp} from TrueERP.\n`;
                                                            templateObject.setLogFunction(transNOtes);

                                                            /* Add Cateory To WooCommerce */
                                                            const filteredArray = $.grep(constCategoryFromWoo, function(objCat) {
                                                                return objCat.name.toUpperCase().includes(result?.fields?.ProductGroup2.toUpperCase());
                                                            });

                                                            if(filteredArray == '' && result?.fields?.ProductGroup2 != ''){
                                                              const addMissingCategoriesWo = {
                                                                  name: result?.fields?.ProductGroup2,
                                                                  slug: result?.fields?.ProductGroup2,
                                                                  parent: 0,
                                                                  display: "default"
                                                              };

                                                              await axios.post(`${url}/wp-json/wc/v3/products/categories`, addMissingCategoriesWo, {
                                                                  headers: {
                                                                      'Authorization': `Bearer ${token}`,
                                                                  }
                                                              }).then(async (response) => {
                                                                    woCategoryID = response.data.id;
                                                                    console.log(woCategoryID);
                                                                  transNOtes += `Successfully added ${result?.fields?.ProductGroup2} Category to Woocommerce with ID: ${woCategoryID}.\n`;
                                                              });

                                                            }else{
                                                              woCategoryID = filteredArray[0]?.id||0;
                                                            };
                                                            /* Add Cateory To WooCommerce */
                                                            // const uomSalesName = esult?.fields?.UOMSales
                                                            const bodyToAddWoocommerce = {
                                                                name: result?.fields?.ProductName,
                                                                permalink: result?.fields?.Hyperlink,
                                                                //type: result?.fields?.ProductGroup2,
                                                                description: result?.fields?.SalesDescription,
                                                                short_description: result?.fields?.SalesDescription,
                                                                sku: result?.fields?.SKU,
                                                                price: result?.fields?.SellQty1PriceInc,
                                                                regular_price: `${result?.fields?.SellQty1PriceInc}`||'0',
                                                                purchasable: true,
                                                                categories:[{id:woCategoryID}],
                                                                // sale_price: `${result?.fields?.SellQty1PriceInc}`||'0',
                                                                total_sales: result?.fields?.SellQTY1 + result?.fields?.SellQTY2 + result?.fields?.SellQTY3,
                                                                weight: `"${result?.fields?.NetWeightKg}"`
                                                            };
                                                            products.push(bodyToAddWoocommerce?.name)

                                                            transNOtes += `(Detail) Product name: ${bodyToAddWoocommerce?.name}, Price: ${bodyToAddWoocommerce?.price}, Description: ${bodyToAddWoocommerce?.description}.\n`;
                                                            transNOtes += `Adding ${newProductsFromERPCount} Product to Woocommerce.\n`;
                                                            templateObject.setLogFunction(transNOtes);
                                                            await axios.post(`${url}/wp-json/wc/v3/products`, bodyToAddWoocommerce, {
                                                                headers: {
                                                                    'Authorization': `Bearer ${token}`,
                                                                }
                                                            }).then(async (response) => {
                                                                    const id = response.data.id
                                                                    if (id) {
                                                                        transNOtes += `Successfully added ${newProductsFromERPCount} Product to Woocommerce with ID: ${id}.\n`;
                                                                        templateObject.setLogFunction(transNOtes);
                                                                    } else {
                                                                        transNOtes += `[Error] Already existing product..\n`;
                                                                        templateObject.setLogFunction(transNOtes);
                                                                    }
                                                                })
                                                                .catch((err) => {
                                                                    transNOtes += `[Error] Already existing product..\n`;
                                                                    templateObject.setLogFunction(transNOtes);
                                                                })

                                                        })
                                                }

                                            }
                                        })
                                        .catch(() => {
                                            transNOtes += `There is no newly added product.\n`;
                                            templateObject.setLogFunction(transNOtes);
                                        })
                                    }

                                    //Getting newly added orders from woocommerce
                                    transNOtes += `-----------------------------------------------------------\n`;
                                    templateObject.setLogFunction(transNOtes);
                                    await axios.get(`${url}/wp-json/wc/v3/orders?modified_after=${lstUpdateTimeUTC}`, {
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                        }
                                    })
                                        .then(async (response) => {
                                            const ordersFromWoocommerce = response.data
                                            order_transaction_count  = ordersFromWoocommerce.length

                                            if (ordersFromWoocommerce.length === 0) {
                                                transNOtes += `There is no newly added Order in the Woocommerce Website.\n`;
                                                templateObject.setLogFunction(transNOtes);
                                            }
                                            else {
                                                transNOtes += `Found ${ordersFromWoocommerce.length} newly added order(s) in the Woocommerce Website.\n`;
                                                templateObject.setLogFunction(transNOtes);
                                                let count = 0
                                                for (const orderFromWoocommerce of ordersFromWoocommerce) {

                                                    transNOtes += `Checking ${++count} Order from the Woocommerce Website\n`;
                                                    transNOtes += `(Billing Detail) First name: ${orderFromWoocommerce?.billing?.first_name}, Last name: ${orderFromWoocommerce?.billing?.last_name}, Postcode: ${orderFromWoocommerce?.billing?.postcode}.\n`;
                                                    for (const line of orderFromWoocommerce?.line_items) {
                                                        transNOtes += `(Line Detail)    Product Id: ${line?.product_id}, Product Name: "${line?.name}", Product Price: ${line?.price}\n`;
                                                    }
                                                    // transNOtes += `Adding ${count}th Order to ERP database.\n`;
                                                    templateObject.setLogFunction(transNOtes);

                                                    //check if the customer exists and add if not
                                                    const clientName = orderFromWoocommerce?.billing?.first_name + " " + orderFromWoocommerce?.billing?.last_name
                                                    let clientId
                                                    transNOtes += `Checking Customer in the TrueERP database for ClientName : ${clientName}...\n`;
                                                    templateObject.setLogFunction(transNOtes);
                                                    await fetch(`${tempAccount.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
                                                        {
                                                            method: 'GET',
                                                            headers: myHeaders,
                                                            redirect: 'follow'
                                                        })
                                                        .then(response => response.json())
                                                        .then(async result => {
                                                            if (result?.tcustomer.length > 0) {
                                                                clientId = result?.tcustomer[0]?.Id
                                                                transNOtes += `Found the Customer as ID : ${clientId}\n`;
                                                                templateObject.setLogFunction(transNOtes);
                                                            } else {
                                                                transNOtes += `Not Existing Customer, creating...\n`;
                                                                templateObject.setLogFunction(transNOtes);
                                                                const tempCustomerDetailtoERP = {
                                                                    type: "TCustomer",
                                                                    fields: {
                                                                        ClientTypeName: "Camplist",
                                                                        ClientName: orderFromWoocommerce?.billing?.first_name + " " + orderFromWoocommerce?.billing?.last_name,
                                                                        Companyname: orderFromWoocommerce?.billing?.company,
                                                                        Email: orderFromWoocommerce?.billing?.email,
                                                                        FirstName: orderFromWoocommerce?.billing?.first_name,
                                                                        LastName: orderFromWoocommerce?.billing?.last_name,
                                                                        Phone: orderFromWoocommerce?.billing?.phone,
                                                                        Country: orderFromWoocommerce?.billing?.country,
                                                                        State: orderFromWoocommerce?.billing?.state,
                                                                        Street: orderFromWoocommerce?.billing?.address_1,
                                                                        Street2: orderFromWoocommerce?.billing?.address_2,
                                                                        Postcode: orderFromWoocommerce?.billing?.postcode
                                                                    }
                                                                }
                                                                await fetch(`${tempAccount.base_url}/TCustomer`,
                                                                    {
                                                                        method: 'POST',
                                                                        headers: myHeaders,
                                                                        redirect: 'follow',
                                                                        body: JSON.stringify(tempCustomerDetailtoERP)
                                                                    })
                                                                    .then(response => response.json())
                                                                    .then(async result => {
                                                                        clientId = result?.fields?.ID
                                                                        transNOtes += `Added a new customer to TrueERP database with ID : ${clientId}.\n`;
                                                                        templateObject.setLogFunction(transNOtes);
                                                                    })
                                                                    .catch(error => console.log('error', error));
                                                            }
                                                        })
                                                        .catch(() => {
                                                            transNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                                            templateObject.setLogFunction(transNOtes);
                                                        })

                                                    //check if the product exists and add if not
                                                    const productList = orderFromWoocommerce?.line_items
                                                    const productIdList = []
                                                    const productQtyList = []
                                                    download_transaction_count = productList.length
                                                    transNOtes += `There are ${productList.length} products in the Invoice line.\n`;
                                                    templateObject.setLogFunction(transNOtes);

                                                    for (const product of productList) {
                                                        transNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.name}...\n`;
                                                        products.push(product?.name)
                                                        templateObject.setLogFunction(transNOtes);
                                                        await fetch(`${tempAccount.base_url}/TProduct?select=[ProductPrintName]="${product?.name}"`,
                                                            {
                                                                method: 'GET',
                                                                headers: myHeaders,
                                                                redirect: 'follow'
                                                            })
                                                            .then(response => response.json())
                                                            .then(async result => {
                                                                if (result?.tproduct.length > 0) {
                                                                    const productId = result?.tproduct[0]?.Id
                                                                    transNOtes += `Found the Product as ID : ${productId}\n`;
                                                                    templateObject.setLogFunction(transNOtes);
                                                                    productIdList.push(productId)
                                                                    productQtyList.push(product?.quantity)
                                                                } else {
                                                                    // transNOtes += `Not Existing Product, creating...\n`;
                                                                    // templateObject.setLogFunction(transNOtes);

                                                                    //getting product by id from
                                                                    // await axios.get(`${url}/wp-json/wc/v3/products/${product.product_id}`, {
                                                                    //     headers: {
                                                                    //         'Authorization': `Bearer ${token}`,
                                                                    //     }
                                                                    // })
                                                                    //     .then(async (response) => {
                                                                    //         const productFromWoo = response.data

                                                                    //         const tempProductDetailtoERP = {
                                                                    //             type: "TProductWeb",
                                                                    //             fields:
                                                                    //             {
                                                                    //                 ProductType: "INV",
                                                                    //                 ProductName: productFromWoo?.name,
                                                                    //                 PurchaseDescription: productFromWoo?.description,
                                                                    //                 SalesDescription: productFromWoo?.short_description,
                                                                    //                 AssetAccount: "Inventory Asset",
                                                                    //                 CogsAccount: "Cost of Goods Sold",
                                                                    //                 IncomeAccount: "Sales",
                                                                    //                 BuyQty1: 1,
                                                                    //                 BuyQty1Cost: parseFloat(productFromWoo?.price),
                                                                    //                 BuyQty2: 1,
                                                                    //                 BuyQty2Cost: parseFloat(productFromWoo?.price),
                                                                    //                 BuyQty3: 1,
                                                                    //                 BuyQty3Cost: parseFloat(productFromWoo?.price),
                                                                    //                 SellQty1: 1,
                                                                    //                 SellQty1Price: parseFloat(productFromWoo?.price),
                                                                    //                 SellQty2: 1,
                                                                    //                 SellQty2Price: parseFloat(productFromWoo?.price),
                                                                    //                 SellQty3: 1,
                                                                    //                 SellQty3Price: parseFloat(productFromWoo?.price),
                                                                    //                 TaxCodePurchase: "NCG",
                                                                    //                 TaxCodeSales: "GST",
                                                                    //                 UOMPurchases: "Units",
                                                                    //                 UOMSales: "Units"
                                                                    //             }
                                                                    //         }

                                                                    //         // await fetch(`${tempAccount.base_url}/TProductWeb`,
                                                                    //         //     {
                                                                    //         //         method: 'POST',
                                                                    //         //         headers: myHeaders,
                                                                    //         //         redirect: 'follow',
                                                                    //         //         body: JSON.stringify(tempProductDetailtoERP)
                                                                    //         //     })
                                                                    //         //     .then(response => response.json())
                                                                    //         //     .then(async result => {
                                                                    //         //         const tempProductId = result?.fields?.ID
                                                                    //         //         // transNOtes += `Added a new product to TrueERP database with ID : ${tempProductId}.\n`;
                                                                    //         //         // templateObject.setLogFunction(transNOtes);
                                                                    //         //         productIdList.push(tempProductId)
                                                                    //         //         productQtyList.push(product?.quantity)
                                                                    //         //     })
                                                                    //         //     .catch(error => console.log('error', error));
                                                                    //     })
                                                                }
                                                                // productQtyList.push(product?.quantity)
                                                            })
                                                            .catch(() => {
                                                                transNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                                                templateObject.setLogFunction(transNOtes);
                                                            })

                                                    }

                                                    // create a new invoice in ERP.
                                                    const invoiceLines = []
                                                    productIdList.forEach((item, index) => {
                                                        invoiceLines.push({
                                                            type: "TInvoiceLine",
                                                            fields: {
                                                                ProductID: item,
                                                                OrderQty: productQtyList[index]
                                                            }
                                                        })
                                                    })
                                                    if (invoiceLines.length === 0) {
                                                        continue
                                                    }
                                                    const backOrderInvoiceToERP = {
                                                        type: "TInvoiceEx",
                                                        fields: {
                                                            CustomerID: clientId,
                                                            Lines: invoiceLines,
                                                            IsBackOrder: true
                                                        }
                                                    }
                                                    await fetch(`${tempAccount.base_url}/TinvoiceEx`,
                                                        {
                                                            method: 'POST',
                                                            headers: myHeaders,
                                                            redirect: 'follow',
                                                            body: JSON.stringify(backOrderInvoiceToERP)
                                                        })
                                                        .then(response => response.json())
                                                        .then(async result => {
                                                            const addedId = result?.fields?.ID
                                                            transNOtes += `Added a new Invoice to TrueERP database with ID: ${addedId}.\n`;
                                                            templateObject.setLogFunction(transNOtes);
                                                        })
                                                        .catch(error => console.log('error', error));


                                                }

                                                //Save Transaction Here

                                                let account_id = tempConnection.account_id;
                                                let connection_id = tempConnection.connection_id;
                                                let today = new Date();

                                                let year = today.getFullYear();
                                                let month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
                                                let day = String(today.getDate()).padStart(2, '0');

                                                let formattedDate = `${year}-${month}-${day}`;
                                                products_num = upload_transaction_count + download_transaction_count
                                                let transaction_data = {
                                                    'accounting_soft': account_id,
                                                    'connection_soft': connection_id,
                                                    'date': formattedDate,
                                                    'order_num': order_transaction_count||0,
                                                    'products': products||'',
                                                    'products_num': products_num||0,
                                                    'uploaded_num': upload_transaction_count||0,
                                                    'downloaded_num': download_transaction_count||0,
                                                    'connection_id': selConnectionId
                                                }
                                                transaction_details.push({
                                                    detail_string: 'Uploaded products from TrueERP to WooCommerce',
                                                    count: upload_transaction_count
                                                })
                                                transaction_details.push({
                                                    detail_string: 'Orders from WooCommerce to TrueERP',
                                                    count: order_transaction_count
                                                })

                                                let insertedTransactionID = 0;
                                                fetch('/api/inserttransaction', {
                                                    method: 'POST',
                                                    headers: {
                                                    'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify(transaction_data)
                                                    }).then(response => response.json()).then(async (result) => {
                                                        insertedTransactionID = result
                                                        let postData = {
                                                            'transaction_details': transaction_details,
                                                            'transactionId': insertedTransactionID
                                                        }
                                                        fetch('/api/inserttransactionDetails', {
                                                            method: 'POST',
                                                            headers: {
                                                            'Content-Type': 'application/json'
                                                            },
                                                            body: JSON.stringify(postData)
                                                            }).then(response => response.json())
                                                              .then(async (result) => {

                                                            }).catch(error => console.log(error));
                                                }).catch(error => console.log(error));
                                            }


                                        })
                                        .catch(() => {
                                            transNOtes += `There is no newly added Orders in the Woocommerce Website.\n`;
                                            templateObject.setLogFunction(transNOtes);
                                        })


                                    //update the last sync time
                                    transNOtes += `-----------------------------------------------------------\n`;
                                    templateObject.setLogFunction(transNOtes);

                                    let nowInSydney = moment().tz("Australia/Brisbane").format("YYYY-MM-DD hh:mm:ss");
                                    let args = {
                                        id: selConnectionId,
                                        last_ran_date: nowInSydney
                                    };
                                    fetch(`/api/updateLastRanDate`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(args)
                                    })
                                    .then(response => response.json())
                                    .then(async (result) => {
                                        transNOtes += `Updated Last Sync Time as ${moment(nowInSydney).format("DD/MM/YYYY hh:mm:ss")}.\n`;
                                        templateObject.setLogFunction(transNOtes);
                                    })
                                    .catch((err) => console.log(err));



                                }
                                runPerFiveMinutes()

                                }).catch(
                                    error => console.log(error)
                                );
                      })
                      .catch((err) => console.log(err))
              })
              .catch((err) => console.log(err))
      })
      .catch((err) => console.log(err))

    }
    else if (connectionType == "AustraliaPOST") {
    let postData = {
      id: tempConnection.customer_id,
    };
    fetch(`/api/AustraliaPOSTByID`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    }).then(response => response.json()).then(async (result) => {
          tempConnectionSoftware = result[0];
          transNOtes = "";
          let postData = {
              id: tempConnection.account_id,
          };
          fetch(`/api/softwareByID`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(postData)
          }).then(response => response.json()).then(async (result) => {
                  let postData = {
                      id: tempConnection.customer_id,
                  };
                  fetch(`/api/${result[0].name}ByID`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(postData)
                  })
                      .then(response => response.json())
                      .then(async (result) => {
                          tempAccount = result[0];

                          var myHeaders = new Headers();
                          myHeaders.append("Database", `${tempAccount.database}`);
                          myHeaders.append("Username", `${tempAccount.user_name}`);
                          myHeaders.append("Password", `${tempAccount.password}`);

                          transNOtes += `Last Sync Time as ${moment(lstUpdateTime).format("DD/MM/YYYY hh:mm:ss")}.\n`;
                          templateObject.setLogFunction(transNOtes);
                          // Getting backorders invoice from ERP machine
                          transNOtes += `-----------------------------------------------------------\n`;
                          templateObject.setLogFunction(transNOtes);
                          await fetch(`${tempAccount.base_url}/Tinvoice?select=[MsTimeStamp]>"${lstUpdateTime}"`,
                              {
                                  method: 'GET',
                                  headers: myHeaders,
                                  redirect: 'follow'
                              })
                              .then(response => response.json())
                              .then(async result => {
                                  let backOrderInvoiceCount = 0
                                  const tempInvoiceList = result?.tinvoice
                                  if (tempInvoiceList?.length === 0) {
                                      transNOtes += `There is no newly added Back Order Invoice in the ERP database.\n`;
                                      templateObject.setLogFunction(transNOtes);
                                  }
                                  else {
                                      for (const tempInvoice of tempInvoiceList) {
                                          await fetch(`${tempAccount.base_url}/Tinvoice/${tempInvoice?.Id}`,
                                              {
                                                  method: 'GET',
                                                  headers: myHeaders,
                                                  redirect: 'follow'
                                              })
                                              .then(response => response.json())
                                              .then(async result => {
                                                  if (result?.fields?.IsBackOrder) {
                                                      if (result?.fields?.Shipping !== "Aust Post") {
                                                          transNOtes += `${++backOrderInvoiceCount} Back Order Invoice from TrueERP Database with InvoiceID : ${result?.fields?.ID} Isn't through Australia POST, skipping...\n`;
                                                          templateObject.setLogFunction(transNOtes);
                                                      }
                                                      else {
                                                          transNOtes += `${++backOrderInvoiceCount} Back Order Invoice from TrueERP Database with InvoiceID : ${result?.fields?.ID}.\n`;
                                                          templateObject.setLogFunction(transNOtes);

                                                          const invoiceDetail = result?.fields

                                                          const shipPostcode = result?.fields?.ShipPostcode || 7010
                                                          const invoicePostcode = result?.fields?.InvoicePostcode || 7010

                                                          const tempInvoiceLines = result?.fields?.Lines

                                                          for (const tempInvoiceLine of tempInvoiceLines) {
                                                              // if (tempInvoiceLine?.fields?.QtyShipped === 0) {
                                                              //     transNOtes += `No QtyShipped, skipping...\n`;
                                                              //     templateObject.setLogFunction(transNOtes);
                                                              //     continue
                                                              // }
                                                              const uomNameProductKey = tempInvoiceLine?.fields?.UOMNameProductKey
                                                              const lineTaxCode = tempInvoiceLine?.fields?.LineTaxCode

                                                              transNOtes += `Unit of Measure : ${uomNameProductKey}\n`;
                                                              templateObject.setLogFunction(transNOtes);
                                                              await fetch(`${tempAccount.base_url}/TUnitOfMeasure?listtype=detail&select=[KeyValue]="${uomNameProductKey}"`,
                                                                  {
                                                                      method: 'GET',
                                                                      headers: myHeaders,
                                                                      redirect: 'follow'
                                                                  })
                                                                  .then(response => response.json())
                                                                  .then(async result => {

                                                                      const length = result?.tunitofmeasure[0]?.fields?.Length;
                                                                      const weight = result?.tunitofmeasure[0]?.fields?.Weight;
                                                                      const width = result?.tunitofmeasure[0]?.fields?.Width;
                                                                      const height = result?.tunitofmeasure[0]?.fields?.Height;
                                                                      const multiplier = result?.tunitofmeasure[0]?.fields?.Multiplier ||1;
                                                                      const testBedObj = {
                                                                          "shipments": [
                                                                              {
                                                                                  "shipment_reference": invoiceDetail?.GlobalRef,
                                                                                  "from": {
                                                                                      "country": invoiceDetail?.InvoiceCountry || "AU",
                                                                                      "email": invoiceDetail?.ContactEmail,
                                                                                      "lines": [
                                                                                          invoiceDetail?.InvoiceStreet1,
                                                                                          invoiceDetail?.InvoiceStreet2,
                                                                                          invoiceDetail?.InvoiceStreet3
                                                                                      ],
                                                                                      "name": invoiceDetail?.ContactName,
                                                                                      "phone": invoiceDetail?.ContactMobile,
                                                                                      "postcode": invoiceDetail?.InvoicePostcode,
                                                                                      "state": invoiceDetail?.InvoiceState || "VIC",
                                                                                      "suburb": invoiceDetail?.InvoiceSuburb
                                                                                  },
                                                                                  "to": {
                                                                                      "email": invoiceDetail?.ContactEmail,
                                                                                      "lines": [
                                                                                          invoiceDetail?.ShipStreet1,
                                                                                          invoiceDetail?.ShipStreet2,
                                                                                          invoiceDetail?.ShipStreet3
                                                                                      ],
                                                                                      "name": invoiceDetail?.CustomerName,
                                                                                      "phone": invoiceDetail?.ContactMobile,
                                                                                      "postcode": invoiceDetail?.ShipPostcode,
                                                                                      "state": invoiceDetail?.ShipState || "VIC",
                                                                                      "suburb": invoiceDetail?.ShipSuburb,
                                                                                      "country": invoiceDetail?.ShipCountry || "AU"
                                                                                  },
                                                                                  "items": [
                                                                                      {
                                                                                          "classification_type": invoiceDetail?.Lines[0]?.fields?.ProductType,
                                                                                          "commercial_value": true,
                                                                                          "description_of_other": invoiceDetail?.Lines[0]?.fields?.ProductDescription,
                                                                                          "export_declaration_number": invoiceDetail?.Lines[0]?.fields?.GlobalRef,
                                                                                          "import_reference_number": invoiceDetail?.Lines[0]?.fields?.GlobalRef,
                                                                                          "item_contents": [
                                                                                              {
                                                                                                  "country_of_origin": "AU",
                                                                                                  // "description": "",
                                                                                                  // "sku": "ABC1243567",
                                                                                                  "quantity": invoiceDetail?.Lines[0]?.fields?.OrderQty,
                                                                                                  // "tariff_code": "123456",
                                                                                                  "value": invoiceDetail?.Lines[0]?.fields?.LinePriceInc,
                                                                                                  "weight": weight,
                                                                                                  "item_contents_reference": invoiceDetail?.Lines[0]?.fields?.GlobalRef
                                                                                              }
                                                                                          ],
                                                                                          "item_description": invoiceDetail?.Lines[0]?.fields?.ProductDescription,
                                                                                          "item_reference": invoiceDetail?.Lines[0]?.fields?.GlobalRef,
                                                                                          "length": length,
                                                                                          "height": height,
                                                                                          "weight": weight,
                                                                                          "product_id": invoiceDetail?.Lines[0]?.fields?.ID,
                                                                                          "width": width
                                                                                      }
                                                                                  ]
                                                                              }
                                                                          ]
                                                                      }

                                                                      const starTrackShippingJSON = {
                                                                      "shipments": [
                                                                          {
                                                                              "from": {
                                                                                  "name": invoiceDetail?.ContactName,
                                                                                  "lines": [
                                                                                        invoiceDetail?.InvoiceStreet1,
                                                                                        invoiceDetail?.InvoiceStreet2,
                                                                                        invoiceDetail?.InvoiceStreet3
                                                                                  ],
                                                                                  "suburb": invoiceDetail?.InvoiceSuburb|| "Strawberry Hills",
                                                                                  "postcode": invoiceDetail?.InvoicePostcode||"2012",
                                                                                  "state": invoiceDetail?.InvoiceState ||"NSW"
                                                                              },
                                                                              "to": {
                                                                                  "name": invoiceDetail?.CustomerName,
                                                                                  "lines": [
                                                                                    invoiceDetail?.ShipStreet1,
                                                                                    invoiceDetail?.ShipStreet2,
                                                                                    invoiceDetail?.ShipStreet3
                                                                                  ],
                                                                                  "suburb": invoiceDetail?.ShipSuburb||"Yarraville",
                                                                                  "state": invoiceDetail?.ShipState ||"VIC",
                                                                                  "postcode": invoiceDetail?.ShipPostcode||"3013"
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

                                                                      // var austHeaders = new Headers();
                                                                      // austHeaders.append("Content-Type", `application/json`);
                                                                      // austHeaders.append("Accept", `application/json`);
                                                                      // austHeaders.append("Account-Number", `${tempConnectionSoftware.name}`);
                                                                      // austHeaders.append("Authorization", "Basic " + btoa(`${tempConnectionSoftware.api_key}:${tempConnectionSoftware.password}`));

                                                                      let baseUrl = tempConnectionSoftware.base_url;
                                                                      let accountNumber = tempConnectionSoftware.name;
                                                                      let userAutorization = `Basic ${btoa(`${tempConnectionSoftware.api_key}:${tempConnectionSoftware.password}`)}`;

                                                                      await Meteor.call('checkAUSPOSTshipments', baseUrl, accountNumber, userAutorization, starTrackShippingJSON, async function(error, result) {
                                                                          if (error) {
                                                                            // console.log(error);
                                                                          } else {
                                                                            const deliverCost = result.data?.shipments[0]?.shipment_summary?.total_cost * multiplier
                                                                            const trackingNumber = result.data.shipments[0]?.items[0]?.tracking_details?.article_id;
                                                                            transNOtes += `Deliver cost : ${deliverCost}AUD\n`;
                                                                            transNOtes += `Tracking Number : ${trackingNumber}\n`;
                                                                            templateObject.setLogFunction(transNOtes);
                                                                            console.log(tempInvoice);
                                                                            const updateObj = {
                                                                                "type": "TInvoice",
                                                                                "fields": {
                                                                                    "ID": tempInvoice?.Id||0,
                                                                                    "Shipping": "Aust Post",
                                                                                    "ShippingCost": deliverCost,
                                                                                    "ConNote": trackingNumber
                                                                                }
                                                                            }
                                                                            await fetch(`${tempAccount.base_url}/Tinvoice`,
                                                                                {
                                                                                    method: 'POST',
                                                                                    headers: myHeaders,
                                                                                    redirect: 'follow',
                                                                                    body: JSON.stringify(updateObj)
                                                                                })
                                                                                .then(response => response.json())
                                                                                .then(async result => {
                                                                                    transNOtes += `Updated the Invoice with ID : ${tempInvoice?.Id}\n`;
                                                                                    templateObject.setLogFunction(transNOtes);
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
                                                                                            // "OrderDate": "2023-12-21",
                                                                                            "Deleted": false,
                                                                                            "SupplierInvoiceNumber": `${tempInvoice?.Id}`,
                                                                                            "ConNote": `${trackingNumber}`,
                                                                                            "TermsName": "30 Days",
                                                                                            "Shipping": "Australia Post",
                                                                                            "Comments": "",
                                                                                            "SalesComments": "",
                                                                                            "OrderStatus": "",
                                                                                            "BillTotal": parseFloat(billTotal.toFixed(2)),
                                                                                            "TotalAmountInc": parseFloat(billTotal.toFixed(2))
                                                                                        }
                                                                                    }

                                                                                    console.log("billObj", JSON.stringify(billObj))

                                                                                    await fetch(`${tempAccount.base_url}/TBill`,
                                                                                        {
                                                                                            method: 'POST',
                                                                                            headers: myHeaders,
                                                                                            redirect: 'follow',
                                                                                            body: JSON.stringify(billObj)
                                                                                        }).then(response => response.json()).then(async result => {
                                                                                            if (result?.fields?.ID) {
                                                                                                transNOtes += `Created a Bill with ID : ${result?.fields?.ID}\n`;
                                                                                                templateObject.setLogFunction(transNOtes);
                                                                                            }
                                                                                        })
                                                                                });
                                                                          }
                                                                      });


                                                                  })
                                                          }
                                                      }
                                                  }
                                              })
                                      }
                                  }
                              })
                              .catch(() => {
                                  transNOtes += `There is no newly added Back Order Invoice.\n`;
                                  templateObject.setLogFunction(transNOtes);
                              });

                              let tempDate = new Date();
                              // let dateString = moment().tz("Australia/Brisbane").format("YYYY-MM-DD HH:mm:ss");
                              let dateString = tempDate.getFullYear() + "/" + ("0" + (tempDate.getMonth() + 1)).slice(-2) + "/" + ("0" + tempDate.getDate()).slice(-2) + " " +
                                ("0" + tempDate.getHours()).slice(-2) + ":" + ("0" + tempDate.getMinutes()).slice(-2) + ":" + ("0" + tempDate.getSeconds()).slice(-2);
                                console.log(dateString);
                              let argsDate = {
                                id: selConnectionId,
                                last_ran_date: dateString,
                              };
                              await fetch(`/api/updateLastRanDate`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify(argsDate),
                              }).then((response) => response.json()).then(async (result) => {
                                transNOtes += `Updated Last Sync Time as ${dateString}.\n`;
                                templateObject.setLogFunction(transNOtes);
                              }).catch((err) => console.log(err));

                          // //update the last sync time
                          // transNOtes += `-----------------------------------------------------------\n`;
                          // templateObject.setLogFunction(transNOtes);

                          // let nowInSydney = moment().tz("Australia/Brisbane").format("YYYY-MM-DD HH:mm:ss");
                          // let args = {
                          //     id: selConnectionId,
                          //     last_ran_date: nowInSydney
                          // };
                          // fetch(`/api/updateLastRanDate`, {
                          //     method: 'POST',
                          //     headers: {
                          //         'Content-Type': 'application/json'
                          //     },
                          //     body: JSON.stringify(args)
                          // })
                          //     .then(response => response.json())
                          //     .then(async (result) => {
                          //         transNOtes += `Updated Last Sync Time as ${nowInSydney}.\n`;
                          //         templateObject.setLogFunction(transNOtes);
                          //     })
                          //     .catch((err) => console.log(err))

                      })
                      .catch((err) => console.log(err))
              }).catch((err) => console.log(err))
      })
      .catch((err) => console.log(err))
    }
    else if (connectionType == "Zoho") {
          var responseCount = 0;
          let customerCount = 0;

          HTTP.call("post","/api/getAccSoftt",{
              data: {
                id: tempConnection.customer_id,
              }
            },
            async (error, res) => {
              let erpObject;
              if (error) {
                transNOtes += "Can't connect to TrueERP database\n";
                templateObject.setLogFunction(transNOtes);
                return;
              } else {
                erpObject = res.data[0];
              }

              let upload_transaction_count = 0;
              let download_transaction_count = 0;
              let transaction_details = [];
              let products;

              await fetch('/api/ZohoByID', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: tempConnection.customer_id})
              }).then(response => response.json()).then(async (ZohoClient) => {
                  let ZohoInfo = ZohoClient[0];

                  const CLIENT_ID = ZohoInfo.client_id;
                  const CLIENT_SECRET = ZohoInfo.client_secret;
                  const REDIRECT_URI = ZohoInfo.redirect_uri;
                  const RESPONSE_TYPE = "token";
                  const SCOPE = "ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.users.ALL,ZohoSearch.securesearch.READ"
                  const ZOHO_USERNAME = ZohoInfo.username;
                  const ZOHO_PASSWORD = ZohoInfo.password;
                  const ZOHO_ACCESS_TOKEN = ZohoInfo.access_token;
                  const ZOHO_REFRESH_TOKEN = ZohoInfo.refresh_token;

                  const authorizationUrl = `https://accounts.zoho.com/oauth/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=token`;

                  let token = '';
                  transNOtes += 'Getting token for Zoho.....\n';
                  templateObject.setLogFunction(transNOtes);
                  if (ZOHO_ACCESS_TOKEN) {
                    token = ZOHO_ACCESS_TOKEN;
                    datacenter = datacenter;
                    transNOtes += 'Got token for Zoho.\n';
                    templateObject.setLogFunction(transNOtes);
                  }
                  console.log(token);
                  const resultUser = await new Promise((resolve, reject) => {
                      Meteor.call("getZohoCurrentUser", {auth: token, datacenter: datacenter},(error, result) => {
                          if (error) {
                            console.log(error);
                            resolve('');
                          } else {
                            console.log(result);
                            resolve(result);
                          }
                        }
                      )
                    });
                  console.log(resultUser);
                  if (resultUser != '') {

                  }else{
                        let zohoData = {};
                        zohoData.grant_type = "authorization_code";
                        zohoData.clientid = CLIENT_ID;
                        zohoData.clientsecret = CLIENT_SECRET;
                        zohoData.refresh_token = ZOHO_REFRESH_TOKEN;
                        if(ZOHO_REFRESH_TOKEN !=  ''){
                        const tokenPromise = await new Promise(async (resolve, reject) => {
                            await Meteor.call("getZohoTokenByRefreshToken", zohoData, datacenter, (error, resultToken) => {
                              if (error) {
                                swal(`Error Occurred While Attempting to Connect to the ${result[0].name} Server`, `Head to Connection Details and Check if ${result[0].name} Server Configuration is Correct`, "error");
                                reject(error);
                              } else {
                                resolve(resultToken);
                              }
                            });
                         });
                         if(tokenPromise){
                           token = tokenPromise;//GET Token
                           const zohoSaveData = {
                           access_token: token,
                           refresh_token: ZOHO_REFRESH_TOKEN
                           };

                           fetch('/api/updateZohoToken', {
                           method: 'POST',
                           headers: {
                           'Content-Type': 'application/json'
                           },
                           body: JSON.stringify(zohoSaveData)
                           }).then(response => response.json()).then(async (result) => {
                           }).catch(error => console.log(error));
                         }
                        }

                  }

                  console.log(token);
                  transNOtes += `Last Sync Time as ${moment(lstUpdateTime).format("DD/MM/YYYY hh:mm:ss")}.\n`;
                  templateObject.setLogFunction(transNOtes);

                  if (ERP_SalesState) {
                    transNOtes += `-----------------------------------------------------------\n`;
                    templateObject.setLogFunction(transNOtes);
                    await fetch(erpObject.base_url +`/TSalesOrder?Listtype=detail&select=[MsTimeStamp]>"${lstUpdateTime}" AND [Deleted]=false`,
                      {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json",
                          Username: erpObject.user_name,
                          Password: erpObject.password,
                          Database: erpObject.database,
                        },
                      }
                    ).then((response) => response.json()).then(async (result) => {
                        if (result.tsalesorder.length === 0) {
                          transNOtes += `There is no newly added Sales Order in TrueERP.\n`;
                          templateObject.setLogFunction(transNOtes);
                        } else {
                          responseCount = result.tsalesorder.length;
                          var resultData = result.tsalesorder;

                          let formatting = responseCount > 1 ? "Sales Orders" : "Sales Order";
                          transNOtes += `Received ` + responseCount + ` ${formatting} from TrueERP.\n`;

                          transNOtes += `Adding ${formatting} to Zoho CRM \n`;
                          templateObject.setLogFunction(transNOtes);
                          function sleep(ms) {
                            return new Promise((resolve) =>
                              setTimeout(resolve, ms || DEF_DELAY)
                            );
                          }


                          const reqData = {
                            auth: token,
                            module: "Sales_Orders",
                            datacenter: datacenter,
                            fieldName: "GlobalRef",
                            data: {
                              fields: [
                                {
                                  field_label: "GlobalRef",
                                  data_type: "text",
                                },
                              ],
                            },
                          };

                          //Check GlobalRef existence
                          const resultPromise = await new Promise((resolve, reject) => {
                              Meteor.call("checkFieldExistence",reqData,(error, result) => {
                                  if (error) {
                                    reject(error);
                                  } else {
                                    resolve(result);
                                  }
                                }
                              );
                            }
                          );

                          // Process the resultPromise
                          
                          if (!resultPromise) {
                            const resultPromise2 = await new Promise(
                              (resolve, reject) => {
                                Meteor.call("addcustomFields", reqData,(error, result) => {
                                    if (error) {
                                      reject(error);
                                    } else {
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );

                            if (resultPromise2.fields[0].code === "SUCCESS") {
                              transNOtes += `${reqData.module} field has been added in Sales_Orders module!\n`;
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              console.log(resultPromise2);
                              transNOtes += `${reqData.module} field adding Failed!\n`;
                              templateObject.setLogFunction(transNOtes);
                            }
                        
                          } else if (resultPromise) {
                            transNOtes += `${reqData.fieldName} field already exists!\n`;
                            templateObject.setLogFunction(transNOtes);
                          } else {
                            console.error("Error:", resultPromise);
                            transNOtes += `Checking Field existing Failed!\n`;
                            transNOtes += `Failed!!!\n`;
                            templateObject.setLogFunction(transNOtes);
                          }

                          let postData = [];
                          for (let i = 0; i < responseCount; i++) {
                            let tempCount = i%10;
                            let count = tempCount === 0 ? `${i+1}st` : tempCount === 1 ? `${i+1}nd` : tempCount === 2 ? `${i+1}rd` : `${i+1}th`;
                            transNOtes += `Adding ${count} Sales Order to Zoho CRM.\n`;
                            templateObject.setLogFunction(transNOtes);
                            const productList = [];
                            if (!resultData[i].fields.Lines) {
                              continue;
                            }
                            for (let j = 0;j < resultData[i].fields.Lines.length;j++) {
                              const productreqData = {
                                auth: token,
                                datacenter: datacenter,
                                productName: resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g, ""),
                                productID:resultData[i]?.fields?.Lines[j]?.fields?.ProductID,
                              };
                              if (!productreqData.productName) {
                                productreqData.productName = "Temp product";
                              }
                              const resultPromiseProductDetect = await new Promise((resolve, reject) => {
                                  Meteor.call("getZohoProduct", productreqData,(error, result) => {
                                      if (error) {
                                        console.log(error);
                                        reject(error);
                                      } else {
                                        console.log(result);
                                        resolve(result);
                                      }
                                    }
                                  );
                                }
                              );
                              console.log(resultPromiseProductDetect);
                              if (resultPromiseProductDetect?.data) {
                                if (resultPromiseProductDetect?.data?.length > 0) {
                                  productList.push({
                                    product: {
                                      name: resultData[i]?.fields?.Lines[j]?.fields?.ProductName,
                                      id: resultPromiseProductDetect.data[0].id,
                                    },
                                    quantity:resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                                    unit_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                    list_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                    total:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                                    product_description:resultData[i]?.fields?.Lines[j].fields?.ProductDescription,
                                  });
                                } else {
                                  const addProduct2Zotorequest = {
                                    auth: token,
                                    data: [
                                      {
                                        Product_Name: resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g,""),
                                        Description:resultData[i]?.fields?.Lines[j]?.fields?.ProductDescription,
                                        Unit_Price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                        GlobalRef:resultData[i]?.fields?.Lines[j]?.fields?.GlobalRef,
                                      },
                                    ],
                                    datacenter: datacenter
                                  };

                                  const resultPromiseProduct = await new Promise((resolve, reject) => {
                                      Meteor.call("addZohoProduct",addProduct2Zotorequest,(error, result) => {
                                          if (error) {
                                            reject(error);
                                          } else {
                                            resolve(result);
                                          }
                                        }
                                      );
                                    }
                                  );

                                  if (resultPromiseProduct.data) {
                                    if(resultPromiseProduct.data.code == "SUCCESS"){
                                      transNOtes += `${addProduct2Zotorequest.data[0].Product_Name} has been added in ZOHO\n`;
                                      templateObject.setLogFunction(transNOtes);
                                      productList.push({
                                        product: {
                                          name: resultData[i]?.fields?.Lines[j]?.fields?.ProductName,
                                          id: resultPromiseProduct.data[0].details.id,
                                        },
                                        quantity:resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                                        total:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                                        unit_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                        list_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                        product_description:resultData[i]?.fields?.Lines[j].fields?.ProductDescription,
                                      });
                                    }else{
                                      // transNOtes += `${resultPromiseProduct.message}`;
                                      // templateObject.setLogFunction(transNOtes);
                                    }
                                  } else {
                                    transNOtes += `${resultPromiseProduct}`;
                                    templateObject.setLogFunction(transNOtes);
                                  }
                                }
                              } else {
                                const addProduct2Zotorequest = {
                                  auth: token,
                                  data: [
                                    {
                                      Product_Name: resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g,""),
                                      Description: resultData[i]?.fields?.Lines[j]?.fields?.ProductDescription,
                                      Unit_Price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                      GlobalRef: resultData[i]?.fields?.Lines[j]?.fields?.GlobalRef,
                                    },
                                  ],
                                  datacenter: datacenter
                                };

                                const resultPromiseProduct = await new Promise((resolve, reject) => {
                                    Meteor.call("addZohoProduct", addProduct2Zotorequest,(error, result) => {
                                        if (error) {
                                          reject(error);
                                        } else {
                                          resolve(result);
                                        }
                                      }
                                    );
                                  }
                                );

                                if (resultPromiseProduct.data) {
                                  if(resultPromiseProduct.data.code == "SUCCESS"){
                                    transNOtes += `${addProduct2Zotorequest.data[0].Product_Name} has been added in ZOHO\n`;
                                    templateObject.setLogFunction(transNOtes);
                                    productList.push({
                                      product: {
                                        name: resultData[i]?.fields?.Lines[j]?.fields?.ProductName,
                                        id: resultPromiseProduct.data[0].details.id,
                                      },
                                      quantity: resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                                      total:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                                      unit_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                      list_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                      product_description: resultData[i].fields.Lines[j].fields.ProductDescription || "",
                                    });
                                  }else{
                                      // transNOtes += `${resultPromiseProduct.message}`;
                                      // templateObject.setLogFunction(transNOtes);
                                  }
                                }else {
                                  console.log(resultPromiseProduct);
                                  transNOtes += `${resultPromiseProduct}`;
                                  templateObject.setLogFunction(transNOtes);
                                }
                              }
                            }

                            const accountreqData = {
                              auth: token,
                              datacenter: datacenter,
                              Account_Name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g, ""),
                            };
                            if (!accountreqData.Account_Name) {
                              accountreqData.Account_Name = "Temp Account";
                            }
                            let accountID;

                            const resultPromiseAccountDetect = await new Promise((resolve, reject) => {
                                Meteor.call("getZohoAccount",accountreqData,(error, result) => {
                                    if (error) {
                                      console.log(error);
                                      reject(error);
                                    } else {
                                      console.log(result);
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );

                            if (resultPromiseAccountDetect?.data) {
                              if (resultPromiseAccountDetect?.data?.length > 0) {
                                transNOtes += `Account Name "${accountreqData.Account_Name}" already exists in ZOHO\n`;
                                templateObject.setLogFunction(transNOtes);
                                accountID = resultPromiseAccountDetect.data[0].id;
                              } else {
                                const addAccount2Zotorequest = {
                                  auth: token,
                                  data: [
                                    {
                                      Account_Name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g,""),
                                    },
                                  ],
                                  datacenter: datacenter
                                };

                                const resultPromiseAccount = await new Promise((resolve, reject) => {
                                    Meteor.call("addZohoAccounts",addAccount2Zotorequest,(error, result) => {
                                        if (error) {
                                          console.log(error);
                                          reject(error);
                                        } else {
                                          console.log(result);
                                          resolve(result);
                                        }
                                      }
                                    );
                                  }
                                );

                                if (resultPromiseAccount?.data) {
                                  if(resultPromiseAccount?.data?.code == "SUCCESS"){
                                    transNOtes += `Account ${addAccount2Zotorequest.data[0].Account_Name} has been added in ZOHO\n`;
                                    templateObject.setLogFunction(transNOtes);
                                    accountID = resultPromiseAccount.data[0].id;
                                  }else{
                                    // transNOtes += `${resultPromiseAccount.message}`;
                                    // templateObject.setLogFunction(transNOtes);
                                  }
                                } else {
                                  console.log(error);
                                  transNOtes += `${error.message}`;
                                  templateObject.setLogFunction(transNOtes);
                                }
                              }
                            } else {
                              const addAccount2Zotorequest = {
                                auth: token,
                                data: [
                                  {
                                    Account_Name:resultData[i].fields.ClientName.replace(/[\[\]()]/g,"") || "TEST NAME",
                                  },
                                ],
                                datacenter: datacenter
                              };

                              const resultPromiseAccount = await new Promise((resolve, reject) => {
                                  Meteor.call("addZohoAccounts", addAccount2Zotorequest, (error, result) => {
                                      if (error) {
                                        reject(error);
                                      } else {
                                        resolve(result);
                                      }
                                    }
                                  );
                                }
                              );

                              if (resultPromiseAccount?.data) {
                                if(resultPromiseAccount?.data?.code == "SUCCESS"){
                                  transNOtes += `Account ${addAccount2Zotorequest.data[0].Account_Name} has been added in ZOHO\n`;
                                  templateObject.setLogFunction(transNOtes);
                                  accountID = resultPromiseAccount.data[0].id;
                                }else{
                                  // transNOtes += `${resultPromiseAccount.message}`;
                                  // templateObject.setLogFunction(transNOtes);
                                }
                              } else {
                                console.log(resultPromiseAccount);
                              }
                            }

                            postData.push({
                              Account_Name: {
                                name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g,""),
                                id: accountID,
                              },
                              Product_Details: productList,
                              GlobalRef: resultData[i]?.fields?.GlobalRef,
                              // Subject: resultData[i]?.fields?.ShipToDesc,
                              Subject: resultData[i]?.fields?.GlobalRef,
                              Billing_Country: resultData[i]?.ShipCountry,
                              Billing_State: resultData[i]?.ShipState,
                              Billing_Street: resultData[i]?.ShipStreet1,
                              Billing_Code: resultData[i]?.ShipPostcode,
                              Tax: resultData[i]?.LineTaxTotal
                            });

                            let tempNote = transNOtes;
                          }

                          let args = {
                            auth: token,
                            data: postData,
                            datacenter: datacenter
                          };

                          const batchSize = 100;
                          const numBatches = Math.ceil(postData.length / batchSize);

                          let upload_num = 0;
                          // Loop through the data in batches
                          for (let i = 0; i < numBatches; i++) {
                            const startIdx = i * batchSize;
                            const endIdx = Math.min(
                              startIdx + batchSize,
                              postData.length
                            );
                            const batchData = postData.slice(startIdx, endIdx);
                            args.data = batchData;

                            const resultSalesOrder = await new Promise((resolve, reject) => {
                                Meteor.call("updateZohoOrders",args,(error, result) => {
                                    if (error) {
                                      console.log(error);
                                      reject(error);
                                    } else {
                                      console.log(result);
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );

                            if (resultSalesOrder.data) {
                              console.log(resultSalesOrder);
                              if (resultSalesOrder.data) {
                                upload_transaction_count +=
                                  resultSalesOrder.data.length;
                                upload_num += resultSalesOrder.data.length;
                                transNOtes += `Sales Order transfer Success!\n`;
                              } else {
                                transNOtes += `Sales Order transfer Failed!\n${result.message}\n`;
                              }
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              console.log(resultSalesOrder);
                              transNOtes += `Sales Order transfer Failed!\n`;
                              transNOtes += `Failed!!!\n`;
                              templateObject.setLogFunction(transNOtes);
                            }
                          }
                          transaction_details.push({
                            detail_string:"Uploaded Sales Orders from TrueERP to Zoho",
                            count: upload_num,
                          });

                        }
                      }).catch((error) => {
                        console.log(error);
                        transNOtes += `An error occurred while receiving Sales_Orders from TrueERP database\n`;
                        templateObject.setLogFunction(transNOtes);
                      });
                  }

                  if (ERP_CustomerState) {
                    transNOtes += `-----------------------------------------------------------\n`;
                    templateObject.setLogFunction(transNOtes);
                    await fetch(
                      // erpObject.base_url +`/TCustomer?PropertyList=ClientName,Email,FirstName,LastName,Phone,Mobile,SkypeName,Title,Faxnumber,Country,State,Street,Postcode,Billcountry,BillState,BillPostcode,BillStreet&select=[MsTimeStamp]>"${lstUpdateTime}" and [Active]=true`,
                      erpObject.base_url +`/TCustomer?PropertyList=ClientName,Email,FirstName,LastName,Phone,Country,State,Street,Postcode,Billcountry,BillState,BillPostcode,BillStreet&select=[MsTimeStamp]>"${lstUpdateTime}" and [Active]=true`,
                      {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json",
                          Username: erpObject.user_name,
                          Password: erpObject.password,
                          Database: erpObject.database,
                        },
                      }
                    ).then((response) => response.json()).then(async (result) => {
                        if (result.tcustomer.length === 0) {
                          transNOtes += `There is no newly added Customer in TrueERP.\n`;
                          templateObject.setLogFunction(transNOtes);
                        } else {
                          responseCount = result.tcustomer.length;
                          var resultData = result.tcustomer;
                          let formatting = responseCount > 1 ? "Customers" : "Customer";
                          transNOtes += `Received ` + responseCount + ` ${formatting} from TrueERP.\n`;
                          transNOtes += `Adding ${formatting} to Zoho CRM \n`;
                          templateObject.setLogFunction(transNOtes);
                          function sleep(ms) {
                            return new Promise((resolve) =>
                              setTimeout(resolve, ms || DEF_DELAY)
                            );
                          }

                          // fields existence checking
                          const reqData = {
                            auth: token,
                            module: "Accounts",
                            datacenter: datacenter,
                            fieldName: "GlobalRef",
                            data: {
                              fields: [
                                {
                                  field_label: "GlobalRef",
                                  data_type: "text",
                                },
                              ],
                            },
                          };

                          //Check GlobalRef existence
                          const resultPromise = await new Promise((resolve, reject) => {
                              Meteor.call("checkFieldExistence",reqData,(error, result) => {
                                  if (error) {
                                    console.log(error);
                                    reject(error);
                                  } else {
                                    console.log(result);
                                    resolve(result);
                                  }
                                }
                              );
                            }
                          );
                          console.log(resultPromise);
                          // Process the resultPromise

                          if (!resultPromise) {
                            const resultPromise2 = await new Promise((resolve, reject) => {
                                Meteor.call("addcustomFields",reqData,(error, result) => {
                                    if (error) {
                                      console.log(error);
                                      reject(error);
                                    } else {
                                      console.log(result);
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );
                            if (resultPromise2.fields[0].code === "SUCCESS") {
                              transNOtes += `${reqData.module} field has been added in Contacts module!\n`;
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              console.log(resultPromise2);
                              transNOtes += `${reqData.module} field adding Failed!\n`;
                              templateObject.setLogFunction(transNOtes);
                            }
                          } else if (resultPromise) {
                            transNOtes += `${reqData.fieldName} field already exists!\n`;
                            templateObject.setLogFunction(transNOtes);
                          } else {
                            console.error("Error:", resultPromise);
                            transNOtes += `Checking Field existing Failed!\n`;
                            transNOtes += `Failed!!!\n`;
                            templateObject.setLogFunction(transNOtes);
                          }

                          
                          const reqDataCustomerID = {
                            auth: token,
                            module: "Accounts",
                            datacenter: datacenter,
                            fieldName: "Customer_ID",
                            data: {
                              fields: [
                                {
                                  field_label: "Customer_ID",
                                  data_type: "integer",
                                },
                              ],
                            },
                          };

                          //Check GlobalRef existence
                          const resultPromiseCustomerID = await new Promise((resolve, reject) => {
                              Meteor.call("checkFieldExistence",reqDataCustomerID,(error, result) => {
                                  if (error) {
                                    console.log(error);
                                    reject(error);
                                  } else {
                                    console.log(result);
                                    resolve(result);
                                  }
                                }
                              );
                            }
                          );
                          console.log(resultPromiseCustomerID);
                          // Process the resultPromiseCustomerID

                          if (!resultPromiseCustomerID) {
                            const resultPromise2 = await new Promise((resolve, reject) => {
                                Meteor.call("addcustomFields",reqDataCustomerID,(error, result) => {
                                    if (error) {
                                      console.log(error);
                                      reject(error);
                                    } else {
                                      console.log(result);
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );
                            if (resultPromise2) {
                              transNOtes += `${reqDataCustomerID.module} field has been added in Contacts module!\n`;
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              console.log(resultPromise2);
                              transNOtes += `${reqDataCustomerID.module} field adding Failed!\n`;
                              templateObject.setLogFunction(transNOtes);
                            }
                          } else if (resultPromiseCustomerID) {
                            transNOtes += `${reqDataCustomerID.fieldName} field already exists!\n`;
                            templateObject.setLogFunction(transNOtes);
                          } else {
                            console.error("Error:", resultPromiseCustomerID);
                            transNOtes += `Checking Field existing Failed!\n`;
                            transNOtes += `Failed!!!\n`;
                            templateObject.setLogFunction(transNOtes);
                          }

                          let postData = [];
                          for (let i = 0; i < responseCount; i++) {

                            let tempCount = i%10;
                            let count = tempCount === 0 ? `${i+1}st` : tempCount === 1 ? `${i+1}nd` : tempCount === 2 ? `${i+1}rd` : `${i+1}th`;
                            transNOtes += `Adding ${count} Customer to Zoho CRM\n`;
                            templateObject.setLogFunction(transNOtes);
                            let tempData = {};

                            let tempNote = transNOtes;
                            //Email converting
                            // tempData.Email = resultData[i].Email || "";

                            // Customer Name converting
                            // tempData.First_Name = resultData[i].FirstName == '.'? resultData[i].ClientName : resultData[i].FirstName ||'',
                            // tempData.Last_Name = resultData[i].LastName == '.'? resultData[i].ClientName : resultData[i].LastName ||'',
                            tempData.Account_Name = resultData[i].ClientName || "";
                            transNOtes = tempNote + `Customer ${resultData[i]?.LastName} formating.... \n`;
                            templateObject.setLogFunction(transNOtes);

                            //Phone converting
                            tempData.Phone = resultData[i].Phone || "";

                            // Mobile converting
                            // tempData.Mobile = resultData[i].Mobile || "";

                            // Skypenumber converting
                            // tempData.Skype_ID = resultData[i].SkypeName || "";

                            // Title converting
                            // tempData.Title = resultData[i].Title || "";

                            // // Fax converting
                            // tempData.Fax = resultData[i].Faxnumber || "";

                            // // Country converting
                            tempData.Billing_Country = resultData[i].Country || "";

                            tempData.GlobalRef = resultData[i].GlobalRef;

                            tempData.Customer_ID = resultData[i].Id;

                            // City converting
                            tempData.Billing_City = resultData[i].City || "";

                            // State converting
                            tempData.Billing_State = resultData[i].State || "";

                            // Street converting
                            tempData.Billing_Street = resultData[i].Street || "";

                            // Postcode converting
                            tempData.Billing_Code = resultData[i].Postcode || "";

                            if ((!resultData[i].LastName)) {
                              transNOtes += `Customer ID ${resultData[i].Id} not imported as no Last name\n`;
                              templateObject.setLogFunction(transNOtes);
                              continue;
                            } else {
                              postData.push(tempData);
                            }
                          }

                          let args = {
                            auth: token,
                            data: postData,
                            datacenter: datacenter
                          };
                          console.log(args);
                          const batchSize = 100;
                          const numBatches = Math.ceil(postData.length / batchSize);
                          let upload_num = 0;
                          // Loop through the data in batches
                          for (let i = 0; i < numBatches; i++) {
                            const startIdx = i * batchSize;
                            const endIdx = Math.min(
                              startIdx + batchSize,
                              postData.length
                            );
                            const batchData = postData.slice(startIdx, endIdx);
                            args.data = batchData;

                            const resultPromise = await new Promise((resolve, reject) => {
                                Meteor.call("updateZohoCustomers",args,(error, result) => {
                                    if (error) {
                                      console.log(error);
                                      reject(error);
                                    } else {
                                      console.log(result);
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );
                            console.log(resultPromise);
                            if (resultPromise.data) {
                              upload_transaction_count += resultPromise.data.length;
                              upload_num = resultPromise.data.length;
                              transNOtes += `Customers transfer Success!\n\n`;
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              console.log(resultPromise);
                              transNOtes += `Customers transfer Failed!\n\n`;
                              transNOtes += `Failed!!!\n`;
                              templateObject.setLogFunction(transNOtes);
                            }
                          }

                          transaction_details.push({
                            detail_string:
                              "Uploaded Customers from TrueERP to Zoho",
                            count: upload_num,
                          });


                        }
                      }).catch((error) => {
                        console.log(error);
                        transNOtes += `An error occurred while receiving a Customer from TrueERP database\n`;
                        templateObject.setLogFunction(transNOtes);
                      });
                  }

                  if (ERP_ProductsState) {
                    transNOtes += `-----------------------------------------------------------\n`;
                    templateObject.setLogFunction(transNOtes);
                    //await fetch(erpObject.base_url + `/TProduct?Listtype=detail&select=[MsTimeStamp]>"${lstUpdateTime}" AND [PublishOnWeb]=true AND [Active]=true`,
                    await fetch(erpObject.base_url + `/TProduct?PropertyList=ProductName,PRODUCTCODE,ProductDescription,Active,SalesDescription,TotalQtyonOrder,TotalQtyInStock,SellQty1PriceInc,WHOLESALEPRICE&select=[MsTimeStamp]>"${lstUpdateTime}" AND [PublishOnWeb]=true AND [Active]=true`,
                      // `/TProduct?PropertyList=ProductName,PRODUCTCODE,ProductDescription,Active,SalesDescription,TotalQtyonOrder,TotalQtyInStock,WHOLESALEPRICE`,
                      {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json",
                          Username: erpObject.user_name,
                          Password: erpObject.password,
                          Database: erpObject.database,
                        },
                      }
                    ).then((response) => response.json()).then(async (result) => {
                        if (result.tproduct.length === 0) {
                          transNOtes += `There is no newly added Products in TrueERP.\n`;
                          templateObject.setLogFunction(transNOtes);
                        } else {
                          responseCount = result.tproduct.length;
                          var resultData = result.tproduct;
                          products = resultData;
                          // download_transaction_count += responseCount;
                          // transaction_details.push({
                          //   detail_string:
                          //     "Downloaded Products from TrueERP to Zoho",
                          //   count: responseCount,
                          // });
                          let formatting =
                            responseCount > 1 ? "Products" : "Product";
                          transNOtes +=
                            `Received ` +
                            responseCount +
                            ` ${formatting} from TrueERP.\n`;

                          transNOtes += `Adding ${formatting} to Zoho CRM \n`;
                          templateObject.setLogFunction(transNOtes);
                          function sleep(ms) {
                            return new Promise((resolve) =>
                              setTimeout(resolve, ms || DEF_DELAY)
                            );
                          }

                          const reqData = {
                            auth: token,
                            module: "Products",
                            datacenter: datacenter,
                            fieldName: "GlobalRef",
                            data: {
                              fields: [
                                {
                                  field_label: "GlobalRef",
                                  data_type: "text",
                                },
                              ],
                            },
                          };

                          //Check GlobalRef existence
                          const resultPromise = await new Promise(
                            (resolve, reject) => {
                              Meteor.call("checkFieldExistence",reqData,(error, result) => {
                                  if (error) {
                                    reject(error);
                                  } else {
                                    resolve(result);
                                  }
                                }
                              );
                            }
                          );

                          // Process the resultPromise
                          
                          if (!resultPromise) {
                            const resultPromise2 = await new Promise(
                              (resolve, reject) => {
                                Meteor.call(
                                  "addcustomFields",
                                  reqData,
                                  (error, result) => {
                                    if (error) {
                                      reject(error);
                                    } else {
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );

                            if (resultPromise2.fields[0].code === "SUCCESS") {
                              transNOtes += `${reqData.module} field has been added in Products module!\n`;
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              console.log(resultPromise2);
                              transNOtes += `${reqData.module} field adding Failed!\n`;
                              templateObject.setLogFunction(transNOtes);
                            }
                          } else if (resultPromise) {
                            transNOtes += `${reqData.fieldName} field already exists!\n`;
                            templateObject.setLogFunction(transNOtes);
                          } else {
                            console.error("Error:", resultPromise);
                            transNOtes += `Checking Field existing Failed!\n`;
                            transNOtes += `Failed!!!\n`;
                            templateObject.setLogFunction(transNOtes);
                          }

                          let postData = [responseCount];
                          for (let i = 0; i < responseCount; i++) {

                            let tempCount = i%10;
                            let count = tempCount === 0 ? `${i+1}st` : tempCount === 1 ? `${i+1}nd` : tempCount === 2 ? `${i+1}rd` : `${i+1}th`;
                            transNOtes += `Adding ${count} Product to Zoho CRM.\n`;
                            templateObject.setLogFunction(transNOtes);
                            // postData[i] = {};

                            let tempNote = transNOtes;

                            postData[i] = {
                              Product_Name: resultData[i]?.ProductName,
                              Product_Code: resultData[i]?.PRODUCTCODE,
                              Description: resultData[i]?.SalesDescription,
                              Product_Active: resultData[i]?.Active,
                              Qty_Ordered: resultData[i]?.TotalQtyonOrder,
                              Qty_in_Stock: resultData[i]?.TotalQtyInStock,
                              Unit_Price: resultData[i]?.SellQty1PriceInc,
                              GlobalRef: resultData[i]?.GlobalRef,
                            };
                          }

                          let args = {
                            auth: token,
                            data: postData,
                            datacenter: datacenter
                          };
                          console.log(postData);
                          const batchSize = 100;
                          const numBatches = Math.ceil(postData.length / batchSize);
                          let upload_num = 0;
                          // Loop through the data in batches
                          for (let i = 0; i < numBatches; i++) {
                            const startIdx = i * batchSize;
                            const endIdx = Math.min(
                              startIdx + batchSize,
                              postData.length
                            );
                            const batchData = postData.slice(startIdx, endIdx);
                            args.data = batchData;

                            const resultProductsPromise = await new Promise((resolve, reject) => {
                                Meteor.call("updateZohoProducts",args,(error, result) => {
                                    if (error) {
                                      console.log(error);
                                      reject(error);
                                    } else {
                                      console.log(result);
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );
                            console.log(resultProductsPromise);
                            if (resultProductsPromise.data) {
                              upload_transaction_count += resultProductsPromise.data.length;
                              upload_num += resultProductsPromise.data.length;
                              transNOtes += `Products transfer Success!\n`;
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              console.log(resultProductsPromise);
                              transNOtes += `Products transfer Failed!\n`;
                              templateObject.setLogFunction(transNOtes);
                            }
                          }

                          transaction_details.push({
                            detail_string: "Uploaded Products from TrueERP to Zoho",
                            count: upload_num,
                          });

                        }
                      }).catch((error) => {
                        console.log(error);
                        transNOtes += `An error occurred while receiving a Products from TrueERP database\n`;
                        templateObject.setLogFunction(transNOtes);
                      });
                  }

                  if (ERP_QuotesState) {
                    transNOtes += `-----------------------------------------------------------\n`;
                    templateObject.setLogFunction(transNOtes);
                    await fetch(
                      erpObject.base_url + `/TQuote?Listtype=detail&select=[MsTimeStamp]>"${lstUpdateTime}" AND [Deleted]=false`,
                      {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json",
                          Username: erpObject.user_name,
                          Password: erpObject.password,
                          Database: erpObject.database,
                        },
                      }
                    ).then((response) => response.json()).then(async (result) => {
                        if (result.tquote.length === 0) {
                          transNOtes += `There is no newly added Quote in TrueERP.\n`;
                          templateObject.setLogFunction(transNOtes);
                        } else {
                          responseCount = result.tquote.length;
                          var resultData = result.tquote;
                          // download_transaction_count += responseCount;
                          // transaction_details.push({
                          //   detail_string:
                          //     "Downloaded Quotes from TrueERP to Zoho",
                          //   count: responseCount,
                          // });
                          let formatting = responseCount > 1 ? "Quotes" : "Quote";
                          transNOtes +=
                            `Received ` +
                            responseCount +
                            ` ${formatting} from TrueERP.\n`;

                          transNOtes += `Adding ${formatting} to Zoho CRM \n`;
                          templateObject.setLogFunction(transNOtes);
                          function sleep(ms) {
                            return new Promise((resolve) =>
                              setTimeout(resolve, ms || DEF_DELAY)
                            );
                          }



                          const reqData = {
                            auth: token,
                            module: "Quotes",
                            datacenter: datacenter,
                            fieldName: "GlobalRef",
                            data: {
                              fields: [
                                {
                                  field_label: "GlobalRef",
                                  data_type: "text",
                                },
                              ],
                            },
                          };

                          //Check GlobalRef existence
                          const resultPromise = await new Promise(
                            (resolve, reject) => {
                              Meteor.call(
                                "checkFieldExistence",
                                reqData,
                                (error, result) => {
                                  if (error) {
                                    reject(error);
                                  } else {
                                    resolve(result);
                                  }
                                }
                              );
                            }
                          );

                          // Process the resultPromise
                          if (!resultPromise) {
                            const resultPromise2 = await new Promise(
                              (resolve, reject) => {
                                Meteor.call(
                                  "addcustomFields",
                                  reqData,
                                  (error, result) => {
                                    if (error) {
                                      reject(error);
                                    } else {
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );

                            if (resultPromise2.fields[0].code === "SUCCESS") {
                              transNOtes += `${reqData.module} field has been added in Quotes module!\n`;
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              console.log(resultPromise2);
                              transNOtes += `${reqData.module} field adding Failed!\n`;
                              templateObject.setLogFunction(transNOtes);
                            }
                          } else if (resultPromise) {
                            transNOtes += `${reqData.fieldName} field already exists!\n`;
                            templateObject.setLogFunction(transNOtes);
                          } else {
                            console.error("Error:", resultPromise);
                            transNOtes += `Checking Field existing Failed!\n`;
                            transNOtes += `Failed!!!\n`;
                            templateObject.setLogFunction(transNOtes);
                          }

                          let postData = [];
                          for (let i = 0; i < responseCount; i++) {

                            let tempCount = i%10;
                            let count = tempCount === 0 ? `${i+1}st` : tempCount === 1 ? `${i+1}nd` : tempCount === 2 ? `${i+1}rd` : `${i+1}th`;
                            transNOtes += `Adding ${count} Quote to Zoho CRM.\n`;
                            templateObject.setLogFunction(transNOtes);
                            const productList = [];
                            if (!resultData[i].fields.Lines) {
                              continue;
                            }
                            for (let j = 0; j < resultData[i].fields.Lines.length;j++) {
                              const productreqData = {
                                auth: token,
                                datacenter: datacenter,
                                productName: resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g, ""),
                                productID:resultData[i]?.fields?.Lines[j]?.fields?.ProductID,
                              };
                              if (!productreqData.productName) {
                                productreqData.productName = "Temp product";
                              }
                              const resultPromiseProductDetect = await new Promise((resolve, reject) => {
                                  Meteor.call("getZohoProduct",productreqData,(error, result) => {
                                      if (error) {
                                        console.log(error);
                                        reject(error);
                                      } else {
                                        console.log(result);
                                        resolve(result);
                                      }
                                    }
                                  );
                                }
                              );
                              console.log(resultPromiseProductDetect);
                              if (resultPromiseProductDetect?.data) {
                                if (resultPromiseProductDetect?.data?.length > 0) {

                                  productList.push({
                                    product: {
                                      name: resultData[i]?.fields?.Lines[j]?.fields?.ProductName,
                                      id: resultPromiseProductDetect.data[0].id,
                                    },
                                    quantity: resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                                    total:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                                    unit_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                    list_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                    product_description:resultData[i]?.fields?.Lines[j].fields?.ProductDescription,
                                  });
                                } else {
                                  const addProduct2Zotorequest = {
                                    auth: token,
                                    data: [
                                      {
                                        Product_Name: resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g,""),
                                        Description: resultData[i]?.fields?.Lines[j]?.fields?.ProductDescription,
                                        Unit_Price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                        GlobalRef:resultData[i]?.fields?.Lines[j]?.fields?.GlobalRef,
                                      },
                                    ],
                                    datacenter: datacenter
                                  };

                                  const resultPromiseProduct = await new Promise((resolve, reject) => {
                                      Meteor.call("addZohoProduct",addProduct2Zotorequest,(error, result) => {
                                          if (error) {
                                            reject(error);
                                          } else {
                                            resolve(result);
                                          }
                                        }
                                      );
                                    }
                                  );

                                  if (resultPromiseProduct.data) {
                                    if(resultPromiseProduct.data.code == "SUCCESS"){
                                      transNOtes += `${addProduct2Zotorequest.data[0].Product_Name}` + ` has been added in ZOHO\n`;
                                      templateObject.setLogFunction(transNOtes);
                                      productList.push({
                                        product: {
                                          name: resultData[i]?.fields?.Lines[j]?.fields?.ProductName,
                                          id: resultPromiseProduct.data[0].details.id,
                                        },
                                        quantity:resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                                        total:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                                        unit_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                        list_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                        product_description:resultData[i]?.fields?.Lines[j].fields?.ProductDescription,
                                      });
                                    }else{
                                      // transNOtes += `${resultPromiseProduct.message}`;
                                      // templateObject.setLogFunction(transNOtes);
                                    }
                                  } else {
                                    transNOtes += `${resultPromiseProduct}`;
                                    templateObject.setLogFunction(transNOtes);
                                  }
                                }
                              } else {
                                const addProduct2Zotorequest = {
                                  auth: token,
                                  data: [
                                    {
                                      Product_Name: resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g,""),
                                      Description: resultData[i]?.fields?.Lines[j]?.fields?.ProductDescription,
                                      GlobalRef: resultData[i]?.fields?.Lines[j]?.fields?.GlobalRef,
                                    },
                                  ],
                                  datacenter: datacenter
                                };

                                const resultPromiseProduct = await new Promise(
                                  (resolve, reject) => {
                                    Meteor.call(
                                      "addZohoProduct",
                                      addProduct2Zotorequest,
                                      (error, result) => {
                                        if (error) {
                                          reject(error);
                                        } else {
                                          resolve(result);
                                        }
                                      }
                                    );
                                  }
                                );

                                if (resultPromiseProduct.data) {
                                    if(resultPromiseProduct.data.code == "SUCCESS"){
                                    transNOtes += `${addProduct2Zotorequest.data[0].Product_Name} has been added in ZOHO\n`;
                                    templateObject.setLogFunction(transNOtes);
                                    productList.push({
                                      product: {
                                        name: resultData[i]?.fields?.Lines[j]?.fields?.ProductName,
                                        id: resultPromiseProduct.data[0].details.id,
                                      },
                                      quantity:resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                                      total:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                                      unit_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                      list_price:resultData[i]?.fields?.Lines[j].fields?.LinePrice,
                                      product_description:resultData[i]?.fields?.Lines[j].fields?.ProductDescription,
                                    });
                                  }else{
                                    // transNOtes += `${resultPromiseProduct.message}`;
                                    // templateObject.setLogFunction(transNOtes);
                                  }
                                } else {
                                  console.log(resultPromiseProduct);
                                  transNOtes += `${resultPromiseProduct}`;
                                  templateObject.setLogFunction(transNOtes);
                                }
                              }
                            }

                            const accountreqData = {
                              auth: token,
                              datacenter: datacenter,
                              Account_Name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g, ""),
                            };
                            if (!accountreqData.Account_Name) {
                              accountreqData.Account_Name = "Temp Account";
                            }
                            let accountID;

                            const resultPromiseAccountDetect = await new Promise(
                              (resolve, reject) => {
                                Meteor.call(
                                  "getZohoAccount",
                                  accountreqData,
                                  (error, result) => {
                                    if (error) {
                                      reject(error);
                                    } else {
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );

                            if (resultPromiseAccountDetect?.data) {
                              if (resultPromiseAccountDetect?.data?.length > 0) {
                                transNOtes += `Account Name "${accountreqData.Account_Name}" already exists in ZOHO\n`;
                                templateObject.setLogFunction(transNOtes);
                                accountID = resultPromiseAccountDetect.data[0].id;
                              } else {
                                const addAccount2Zotorequest = {
                                  auth: token,
                                  data: [
                                    {
                                      Account_Name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g,""),
                                    },
                                  ],
                                  datacenter: datacenter
                                };

                                const resultPromiseAccount = await new Promise(
                                  (resolve, reject) => {
                                    Meteor.call(
                                      "addZohoAccounts",
                                      addAccount2Zotorequest,
                                      (error, result) => {
                                        if (error) {
                                          reject(error);
                                        } else {
                                          resolve(result);
                                        }
                                      }
                                    );
                                  }
                                );

                                if (resultPromiseAccount.data) {
                                  if(resultPromiseAccount.data.code == "SUCCESS"){
                                    transNOtes += `Account ${addAccount2Zotorequest.data[0].Account_Name} has been added in ZOHO\n`;
                                    templateObject.setLogFunction(transNOtes);
                                    accountID = resultPromiseAccount.data[0].id;
                                  }else{
                                    // transNOtes += `${resultPromiseAccount.message}`;
                                    // templateObject.setLogFunction(transNOtes);
                                  }
                                } else {
                                  console.log(error);
                                  transNOtes += `${error.message}`;
                                  templateObject.setLogFunction(transNOtes);
                                }
                              }
                            } else {
                              const addAccount2Zotorequest = {
                                auth: token,
                                data: [
                                  {
                                    Account_Name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g, ""),
                                  },
                                ],
                                datacenter: datacenter
                              };

                              const resultPromiseAccount = await new Promise(
                                (resolve, reject) => {
                                  Meteor.call(
                                    "addZohoAccounts",
                                    addAccount2Zotorequest,
                                    (error, result) => {
                                      if (error) {
                                        reject(error);
                                      } else {
                                        resolve(result);
                                      }
                                    }
                                  );
                                }
                              );

                              if (resultPromiseAccount.data) {
                                if(resultPromiseAccount.data.code == "SUCCESS"){
                                  transNOtes += `Account ${addAccount2Zotorequest.data[0].Account_Name} has been added in ZOHO\n`;
                                  templateObject.setLogFunction(transNOtes);
                                  accountID = resultPromiseAccount.data[0].id;
                                }else{
                                  // transNOtes += `${resultPromiseAccount.message}`;
                                  // templateObject.setLogFunction(transNOtes);
                                }
                              } else {
                                console.log(resultPromiseAccount);
                              }
                            }

                            postData.push({
                              Account_Name: {
                                name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g,""),
                                id: accountID,
                              },
                              Product_Details: productList,
                              GlobalRef: resultData[i]?.fields?.GlobalRef,
                              // Subject: resultData[i]?.fields?.ShipToDesc,
                              Subject: resultData[i]?.fields?.GlobalRef,
                              Billing_Country: resultData[i]?.ShipCountry,
                              Billing_State: resultData[i]?.ShipState,
                              Billing_Street: resultData[i]?.ShipStreet1,
                              Billing_Code: resultData[i]?.ShipPostcode,
                              Tax: resultData[i]?.TotalTax
                            });
                          }

                          let args = {
                            auth: token,
                            data: postData,
                            datacenter: datacenter
                          };

                          const batchSize = 100;
                          const numBatches = Math.ceil(postData.length / batchSize);
                          let upload_num = 0;
                          // Loop through the data in batches
                          for (let i = 0; i < numBatches; i++) {
                            const startIdx = i * batchSize;
                            const endIdx = Math.min(
                              startIdx + batchSize,
                              postData.length
                            );
                            const batchData = postData.slice(startIdx, endIdx);
                            args.data = batchData;

                            const resultQuotes = await new Promise(
                              (resolve, reject) => {
                                Meteor.call(
                                  "updateZohoQuotes",
                                  args,
                                  (error, result) => {
                                    if (error) {
                                      reject(error);
                                    } else {
                                      resolve(result);
                                    }
                                  }
                                );
                              }
                            );

                            if (resultQuotes.data) {
                              if (resultQuotes.data) {
                                console.log(resultQuotes);
                                upload_transaction_count +=
                                  resultQuotes.data.length;
                                upload_num += resultQuotes.data.length;
                                transNOtes += `Quotes transfer Success!\n`;
                              } else {
                                transNOtes += `Quotes transfer Failed!\n${result.message}\n`;
                              }
                              templateObject.setLogFunction(transNOtes);
                            } else {
                              console.log(resultQuotes);
                              transNOtes += `Quotes transfer Failed!\n`;
                              transNOtes += `Failed!!!\n`;
                              templateObject.setLogFunction(transNOtes);
                            }
                          }
                          transaction_details.push({
                            detail_string: "Uploaded Quotes from TrueERP to Zoho",
                            count: upload_num,
                          });
                        }
                      }).catch((error) => {
                        console.log(error);
                        transNOtes += `An error occurred while receiving a Quotes from TrueERP database\n`;
                        templateObject.setLogFunction(transNOtes);
                      });
                  }

                  // let account_id = 7;
                  // let connection_id = 13;
                  // let account_id = tempConnection.account_id;
                  // let connection_id = tempConnection.connection_id;
                  // let today = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

                  // // let year = today.getFullYear();
                  // // let month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
                  // // let day = String(today.getDate()).padStart(2, "0");

                  // // let formattedDate = `${year}-${month}-${day}`;
                  // let formattedDate = moment(today).format("YYYY-MM-DD");

                  // let products_num =
                  //   upload_transaction_count + download_transaction_count;
                  // let transaction_data = {
                  //   accounting_soft: account_id,
                  //   connection_soft: connection_id,
                  //   date: formattedDate,
                  //   order_num: products_num,
                  //   products: products,
                  //   products_num: products_num,
                  //   uploaded_num: upload_transaction_count,
                  //   downloaded_num: download_transaction_count,
                  //   connection_id: selConnectionId,
                  // };

                  // console.log(transaction_data);
                  // let insertedTransactionID = 0;
                  // fetch("/api/transactionByDate", {
                  //   method: "POST",
                  //   headers: {
                  //     "Content-Type": "application/json",
                  //   },
                  //   body: JSON.stringify({
                  //     date: moment().format("YYYY-MM-DD"),
                  //     connection_id: selConnectionId,
                  //     accounting_soft: account_id,
                  //     connection_soft: connection_id,
                  //   }),
                  // }).then((response) => response.json()).then(async (result) => {
                  //     if (result != "No Result") {
                  //       transaction_data.order_num =
                  //         transaction_data.order_num + result.order_num;
                  //       transaction_data.products_num =
                  //         transaction_data.products_num + result.products_num;
                  //       transaction_data.uploaded_num =
                  //         transaction_data.uploaded_num + result.uploaded_num;
                  //       transaction_data.downloaded_num =
                  //         transaction_data.downloaded_num + result.downloaded_num;
                  //       let resultId = result.id;
                  //       fetch("/api/addtransaction", {
                  //         method: "POST",
                  //         headers: {
                  //           "Content-Type": "application/json",
                  //         },
                  //         body: JSON.stringify({
                  //           id: resultId,
                  //           transaction_data: transaction_data,
                  //         }),
                  //       })
                  //         .then((response) => response.json())
                  //         .then(async (result) => {
                  //           insertedTransactionID = resultId;
                  //           let postData = {
                  //             transaction_details: transaction_details,
                  //             transactionId: insertedTransactionID,
                  //             date: today,
                  //           };
                  //           fetch("/api/inserttransactionDetails", {
                  //             method: "POST",
                  //             headers: {
                  //               "Content-Type": "application/json",
                  //             },
                  //             body: JSON.stringify(postData),
                  //           })
                  //             .then((response) => response.json())
                  //             .then(async (result) => {})
                  //             .catch((error) => console.log(error));
                  //         })
                  //         .catch((error) => console.log(error));
                  //     } else {
                  //       fetch("/api/inserttransaction", {
                  //         method: "POST",
                  //         headers: {
                  //           "Content-Type": "application/json",
                  //         },
                  //         body: JSON.stringify(transaction_data),
                  //       })
                  //         .then((response) => response.json())
                  //         .then(async (result) => {
                  //           insertedTransactionID = result;
                  //           let postData = {
                  //             transaction_details: transaction_details,
                  //             transactionId: insertedTransactionID,
                  //             date: today,
                  //           };
                  //           fetch("/api/inserttransactionDetails", {
                  //             method: "POST",
                  //             headers: {
                  //               "Content-Type": "application/json",
                  //             },
                  //             body: JSON.stringify(postData),
                  //           })
                  //             .then((response) => response.json())
                  //             .then(async (result) => {})
                  //             .catch((error) => console.log(error));
                  //         })
                  //         .catch((error) => console.log(error));
                  //     }
                  //   });

                  // upload_transaction_count = 0;
                  // download_transaction_count = 0;
                  // transaction_details = [];

                  if (ZOHO_QuotesState) {
                    transNOtes += `-----------------------------------------------------------\n`;
                    templateObject.setLogFunction(transNOtes);
                    transNOtes += "Processing Quotes.........\n";
                    templateObject.setLogFunction(transNOtes);
                    const args = {
                      auth: token,
                      data: {
                        module: "Quotes",
                        lstTime: lstUpdateTimeZoho,
                      },
                      datacenter: datacenter
                    };
                    const resultQuotes = await new Promise((resolve, reject) => {
                      Meteor.call("getDatafromZohoByDate",args,(error, result) => {
                          if (error) {
                            console.log(error);
                            reject(error);
                          } else {
                            console.log(result);
                            resolve(result);
                          }
                        }
                      );
                    });
                    console.log(resultQuotes);
                    if (resultQuotes) {
                      const ids = resultQuotes.data.map((quote) => {
                        return quote.id;
                      });
                      let combinedIds = ids.join(",");
                      const resultQuotesByIDs = await new Promise((resolve, reject) => {
                        Meteor.call("getZohoQuotesByIDs", token,datacenter,combinedIds,(error, result) => {
                            if (error) {
                              transNOtes += `There is no newly added Quote in ZOHO.\n`;
                              templateObject.setLogFunction(transNOtes);
                              reject(error);
                            } else {
                              resolve(result);
                            }
                          }
                        );
                      });

                      if(resultQuotesByIDs){
                        if (resultQuotesByIDs.data.length === 0) {
                          transNOtes += `There is no newly added Quote in ZOHO.\n`;
                          templateObject.setLogFunction(transNOtes);
                        } else {
                          responseCount = resultQuotesByIDs.data.length;
                          var resultData = resultQuotesByIDs.data;
                          let formatting = responseCount > 1 ? "Quotes" : "Quote";
                          transNOtes += `Received ` + responseCount + ` ${formatting} from Zoho.\n`;

                          transNOtes += `Adding ${formatting} to TrueERP \n`;
                          templateObject.setLogFunction(transNOtes);

                          let upload_num = 0;

                          for (let i = 0; i < responseCount; i++) {
                            let tempCount = i % 10;
                            let count =
                              tempCount === 0
                                ? `${i + 1}st`
                                : tempCount === 1
                                ? `${i + 1}nd`
                                : tempCount === 2
                                ? `${i + 1}rd`
                                : `${i + 1}th`;
                            transNOtes += `Adding ${count} Quote to ERP database.\n`;
                            templateObject.setLogFunction(transNOtes);
                            const clientName = resultData[i]?.Account_Name?.name;
                            let clientId;
                            transNOtes += `Checking Customer in the TrueERP database for ClientName : ${clientName}...\n`;
                            templateObject.setLogFunction(transNOtes);
                            await fetch(`${erpObject.base_url}/TCustomer?select=[ClientName]="${clientName}"&[Active]=true`,
                              {
                                method: "GET",
                                headers: {
                                  Username: erpObject.user_name,
                                  Password: erpObject.password,
                                  Database: erpObject.database,
                                  "Content-Type": "application/json",
                                },
                                redirect: "follow",
                              }
                            )
                              .then((response) => response.json())
                              .then(async (result) => {
                                if (result?.tcustomer.length > 0) {
                                  clientId = result?.tcustomer[0]?.Id;
                                  transNOtes += `Found the Customer as ID : ${clientId}\n`;
                                  templateObject.setLogFunction(transNOtes);
                                } else {
                                  transNOtes += `Not Existing Customer, creating...\n`;
                                  templateObject.setLogFunction(transNOtes);
                                  const tempCustomerDetailtoERP = {
                                    type: "TCustomer",
                                    fields: {
                                      ClientName: resultData[i].Account_Name.name,
                                      Country:
                                        resultData[i].Billing_Country || "",
                                      State: resultData[i].Billing_State || "",
                                      Street: resultData[i].Billing_Street || "",
                                      Postcode: resultData[i].Billing_Code || "",
                                    },
                                  };
                                  console.log(
                                    tempCustomerDetailtoERP,
                                    "tempCustomer"
                                  );
                                  await fetch(`${erpObject.base_url}/TCustomer`, {
                                    method: "POST",
                                    headers: {
                                      Username: erpObject.user_name,
                                      Password: erpObject.password,
                                      Database: erpObject.database,
                                      "Content-Type": "application/json",
                                    },
                                    redirect: "follow",
                                    body: JSON.stringify(tempCustomerDetailtoERP),
                                  })
                                    .then((response) => {
                                      console.log(response);
                                      response.json();
                                    })
                                    .then(async (result) => {
                                      clientId = result?.fields?.ID;
                                      transNOtes += `Added a new customer to TrueERP database with ID : ${clientId}.\n`;
                                      templateObject.setLogFunction(transNOtes);
                                    })
                                    .catch((error) =>
                                      console.log("error", error)
                                    );
                                }
                              })
                              .catch(() => {
                                transNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                templateObject.setLogFunction(transNOtes);
                              });

                            //check if the product exists and add if not
                            const productList = resultData[i]?.Product_Details;
                            const productIdList = [];
                            const productQtyList = [];
                            transNOtes += `There are ${productList.length} products in the Product_Details.\n`;
                            templateObject.setLogFunction(transNOtes);

                            for (const product of productList) {
                              transNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.product?.name}...\n`;
                              templateObject.setLogFunction(transNOtes);
                              await fetch(
                                `${erpObject.base_url}/TProduct?select=[ProductName]="${product?.product?.name}"&[Active]=true`,
                                {
                                  method: "GET",
                                  headers: {
                                    Username: erpObject.user_name,
                                    Password: erpObject.password,
                                    Database: erpObject.database,
                                    "Content-Type": "application/json",
                                  },
                                  redirect: "follow",
                                }
                              )
                                .then((response) => response.json())
                                .then(async (result) => {
                                  if (result?.tproduct.length > 0) {
                                    const productId = result?.tproduct[0]?.Id;
                                    transNOtes += `Found the Product as ID : ${productId}\n`;
                                    templateObject.setLogFunction(transNOtes);
                                    productIdList.push(productId);
                                    productQtyList.push(product?.quantity);
                                  }

                                })
                                .catch(() => {
                                  transNOtes += `Error while getting Product Id from the TrueERP database.\n`;
                                  templateObject.setLogFunction(transNOtes);
                                });
                            }

                            // create a new Qutoes in ERP.

                            const QuoteLines = [];

                            productIdList.forEach((item, index) => {
                              QuoteLines.push({
                                type: "TQuoteLine",
                                fields: {
                                  ProductID: item,
                                  OrderQty: productQtyList[index],
                                },
                              });
                            });
                            if (QuoteLines.length === 0) {
                              continue;
                            }
                            const QuoteData = {
                              type: "TQuote",
                              fields: {
                                CustomerID: clientId,
                                Lines: QuoteLines,
                                IsBackOrder: true,
                                Comments: "Quote Produced in ZOHO",
                                ShipCountry: resultData[i]?.Billing_Country,
                                ShipState: resultData[i]?.Billing_State,
                                ShipStreet1: resultData[i]?.Billing_Street,
                                ShipPostcode: resultData[i]?.Billing_Code,
                                TotalTax: resultData[i]?.Tax
                              },
                            };

                            if (resultData[i]?.GlobalRef) {
                              QuoteData.fields.GlobalRef =
                                resultData[i].GlobalRef;
                            }

                            await fetch("/api/updateTrueERP2", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                data: QuoteData,
                                Username: erpObject.user_name,
                                Password: erpObject.password,
                                Database: erpObject.database,
                                url: erpObject.base_url + "/TQuote",
                              }),
                            })
                              .then((response) => response.json())
                              .then(async (result) => {
                                if(result.statusCode == 200){
                                upload_transaction_count += 1;
                                upload_num += 1;
                                transNOtes += `Quotes transfer Success!\n`;

                                templateObject.setLogFunction(transNOtes);
                              }else{
                                if (result && result.headers && result.headers.errormessage) {
                                  transNOtes += `Quotes transfer Failed!\n`;
                                  transNOtes += `${result.headers.errormessage}\n`;
                                  templateObject.setLogFunction(transNOtes);
                                }
                              }
                              }).catch((error) => {
                                console.log(error);
                                transNOtes += `Quotes transfer Failed!\n`;
                                transNOtes += `Failed!!!\n`;
                                templateObject.setLogFunction(transNOtes);
                              });
                          }

                          transaction_details.push({
                            detail_string:
                              "Downloaded Quotes from Zoho to TrueERP",
                            count: upload_num,
                          });


                        }
                      }
                    } else {
                      transNOtes += `There is no newly added Quote in ZOHO.\n`;
                      templateObject.setLogFunction(transNOtes);
                    }
                  }

                  if (ZOHO_SalesState) {
                    transNOtes += `-----------------------------------------------------------\n`;
                    templateObject.setLogFunction(transNOtes);
                    transNOtes += "Processing Sales Orders.........\n";
                    templateObject.setLogFunction(transNOtes);
                    const args = {
                      auth: token,
                      data: {
                        module: "Sales_Orders",
                        lstTime: lstUpdateTimeZoho,
                      },
                      datacenter: datacenter
                    };
                    const resultOrders = await new Promise((resolve, reject) => {
                      Meteor.call("getDatafromZohoByDate",args,(error, result) => {
                          if (error) {
                            reject(error);
                          } else {
                            resolve(result);
                          }
                        }
                      );
                    });

                    if (resultOrders) {
                      const ids = resultOrders.data.map((order) => {
                        return order.id;
                      });
                      let combinedIds = ids.join(",");

                      const resultSales_OrdersByIDs = await new Promise((resolve, reject) => {
                        Meteor.call("getZohoSales_OrdersByIDs", token,datacenter,combinedIds,(error, result) => {
                            if (error) {
                              transNOtes += `An error occurred while receiving a Sales Orders from Zoho\n`;
                              templateObject.setLogFunction(transNOtes);
                              reject(error);
                            } else {
                              resolve(result);
                            }
                          }
                        );
                      });

                      if(resultSales_OrdersByIDs){
                        if (resultSales_OrdersByIDs.data.length === 0) {
                          transNOtes += `There is no newly added Sales Order in ZOHO.\n`;
                          templateObject.setLogFunction(transNOtes);
                        } else {
                          responseCount = resultSales_OrdersByIDs.data.length;
                          var resultData = resultSales_OrdersByIDs.data;
                          let formatting =
                            responseCount > 1 ? "Sales Orders" : "Sales Order";
                          transNOtes +=
                            `Received ` +
                            responseCount +
                            ` ${formatting} from Zoho.\n`;

                          transNOtes += `Adding ${formatting} to TrueERP \n`;
                          templateObject.setLogFunction(transNOtes);

                          let upload_num = 0;

                          for (let i = 0; i < responseCount; i++) {
                            let tempCount = i % 10;
                            let count =
                              tempCount === 0
                                ? `${i + 1}st`
                                : tempCount === 1
                                ? `${i + 1}nd`
                                : tempCount === 2
                                ? `${i + 1}rd`
                                : `${i + 1}th`;
                            transNOtes += `Adding ${count} Sales Order to ERP database.\n`;
                            templateObject.setLogFunction(transNOtes);

                            const clientName = resultData[i]?.Account_Name?.name;
                            let clientId;
                            transNOtes += `Checking Customer in the TrueERP database for ClientName : ${clientName}...\n`;
                            templateObject.setLogFunction(transNOtes);
                            await fetch(
                              `${erpObject.base_url}/TCustomer?select=[ClientName]="${clientName}"&[Active]=true`,
                              {
                                method: "GET",
                                headers: {
                                  Username: erpObject.user_name,
                                  Password: erpObject.password,
                                  Database: erpObject.database,
                                  "Content-Type": "application/json",
                                },
                                redirect: "follow",
                              }
                            ).then((response) => response.json()).then(async (result) => {
                                if (result?.tcustomer.length > 0) {
                                  clientId = result?.tcustomer[0]?.Id;
                                  transNOtes += `Found the Customer as ID : ${clientId}\n`;
                                  templateObject.setLogFunction(transNOtes);
                                } else {
                                  transNOtes += `Not Existing Customer, creating...\n`;
                                  templateObject.setLogFunction(transNOtes);
                                  const tempCustomerDetailtoERP = {
                                    type: "TCustomer",
                                    fields: {
                                      ClientName: resultData[i].Account_Name.name,
                                      Country:
                                        resultData[i].Billing_Country || "",
                                      State: resultData[i].Billing_State || "",
                                      Street: resultData[i].Billing_Street || "",
                                      Postcode: resultData[i].Billing_Code || "",
                                    },
                                  };
                                  await fetch(`${erpObject.base_url}/TCustomer`, {
                                    method: "POST",
                                    headers: {
                                      Username: erpObject.user_name,
                                      Password: erpObject.password,
                                      Database: erpObject.database,
                                      "Content-Type": "application/json",
                                    },
                                    redirect: "follow",
                                    body: JSON.stringify(tempCustomerDetailtoERP),
                                  }).then((response) => {
                                      console.log(response);
                                      response.json();
                                    }).then(async (result) => {
                                      clientId = result?.fields?.ID;
                                      transNOtes += `Added a new customer to TrueERP database with ID : ${clientId}.\n`;
                                      templateObject.setLogFunction(transNOtes);
                                    }).catch((error) =>
                                      console.log("error", error)
                                    );
                                }
                              }).catch(() => {
                                transNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                templateObject.setLogFunction(transNOtes);
                              });

                            //check if the product exists and add if not
                            const productList = resultData[i]?.Product_Details;
                            const productIdList = [];
                            const productQtyList = [];
                            transNOtes += `There are ${productList.length} products in the Product_Details.\n`;
                            templateObject.setLogFunction(transNOtes);

                            for (const product of productList) {
                              transNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.product?.name}...\n`;
                              templateObject.setLogFunction(transNOtes);
                              await fetch(
                                `${erpObject.base_url}/TProduct?select=[ProductName]="${product?.product?.name}"&[Active]=true`,
                                {
                                  method: "GET",
                                  headers: {
                                    Username: erpObject.user_name,
                                    Password: erpObject.password,
                                    Database: erpObject.database,
                                    "Content-Type": "application/json",
                                  },
                                  redirect: "follow",
                                }
                              ).then((response) => response.json()).then(async (result) => {
                                  if (result?.tproduct.length > 0) {
                                    const productId = result?.tproduct[0]?.Id;
                                    transNOtes += `Found the Product as ID : ${productId}\n`;
                                    templateObject.setLogFunction(transNOtes);
                                    productIdList.push(productId);
                                    productQtyList.push(product?.quantity);
                                  }
                                }).catch(() => {
                                  transNOtes += `Error while getting Product Id from the TrueERP database.\n`;
                                  templateObject.setLogFunction(transNOtes);
                                });
                            }

                            // create a new Qutoes in ERP.

                            const OrderLines = [];

                            productIdList.forEach((item, index) => {
                              OrderLines.push({
                                type: "TSalesOrderLine",
                                fields: {
                                  ProductID: item,
                                  OrderQty: productQtyList[index],
                                },
                              });
                            });
                            if (OrderLines.length === 0) {
                              continue;
                            }
                            const OrderData = {
                              type: "TSalesOrder",
                              fields: {
                                CustomerID: clientId,
                                Lines: OrderLines,
                                IsBackOrder: true,
                                Comments: "Sales Order Produced in ZOHO",
                                ShipCountry: resultData[i]?.Billing_Country,
                                ShipState: resultData[i]?.Billing_State,
                                ShipStreet1: resultData[i]?.Billing_Street,
                                ShipPostcode: resultData[i]?.Billing_Code,
                                LineTaxTotal: resultData[i]?.Tax
                              },
                            };

                            if (resultData[i]?.GlobalRef) {
                              OrderData.fields.GlobalRef =
                                resultData[i].GlobalRef;
                            }

                            await fetch("/api/updateTrueERP2", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                data: OrderData,
                                Username: erpObject.user_name,
                                Password: erpObject.password,
                                Database: erpObject.database,
                                url: erpObject.base_url + "/TSalesOrder",
                              }),
                            })
                              .then((response) => response.json())
                              .then(async (result) => {
                                if(result.statusCode == 200){
                                  upload_transaction_count += 1;
                                  upload_num += 1;
                                  transNOtes += `SalesOrder transfer Success!\n`;

                                  templateObject.setLogFunction(transNOtes);
                                }else{

                                  if (result && result.headers && result.headers.errormessage) {
                                    transNOtes += `SalesOrder transfer Failed!\n`;
                                    transNOtes += `${result.headers.errormessage}\n`;
                                    templateObject.setLogFunction(transNOtes);
                                  }

                                }
                              }).catch((error) => {
                                console.log(error);
                                transNOtes += `SalesOrder transfer Failed!\n`;
                                transNOtes += `Failed!!!\n`;
                                templateObject.setLogFunction(transNOtes);
                              });
                          }

                          transaction_details.push({
                            detail_string:
                              "Downloaded Sales Orders from Zoho to TrueERP",
                            count: upload_num,
                          });


                        }
                      }
                    } else {
                      transNOtes += `There is no newly added Sales Order in ZOHO.\n`;
                      templateObject.setLogFunction(transNOtes);
                    }
                  }

                  if (ZOHO_LeadsState) {
                    transNOtes += `-----------------------------------------------------------\n`;
                    templateObject.setLogFunction(transNOtes);
                    transNOtes += "Processing Leads .........\n";
                    templateObject.setLogFunction(transNOtes);
                    const args = {
                      auth: token,
                      data: {
                        module: "Leads",
                        lstTime: lstUpdateTimeZoho,
                      },
                      datacenter: datacenter
                    };
                    const resultLeads = await new Promise((resolve, reject) => {
                      Meteor.call("getDatafromZohoByDate", args, (error, result) => {
                          if (error) {
                            transNOtes += `An error occurred while receiving a Leads from Zoho\n`;
                            templateObject.setLogFunction(transNOtes);
                            reject(error);
                          } else {
                            resolve(result);
                          }
                        }
                      );
                    });

                    if (resultLeads) {
                      const ids = resultLeads.data.map((lead) => {
                        return lead.id;
                      });
                      let combinedIds = ids.join(",");

                      const resultLeadsByIDs = await new Promise((resolve, reject) => {
                        Meteor.call("getZohoLeadsByIDs", token,datacenter,combinedIds,(error, result) => {
                            if (error) {
                              reject(error);
                            } else {
                              resolve(result);
                            }
                          }
                        );
                      });

                      if(resultLeadsByIDs){
                        if (resultLeadsByIDs.data.length === 0) {
                          transNOtes += `There is no newly added Lead in ZOHO.\n`;
                          templateObject.setLogFunction(transNOtes);
                        } else {
                          responseCount = resultLeadsByIDs.data.length;
                          var resultData = resultLeadsByIDs.data;

                          let formatting = responseCount > 1 ? "Leads" : "Lead";

                          transNOtes +=
                            `Received ` +
                            responseCount +
                            ` ${formatting} from Zoho.\n`;

                          transNOtes += `Adding ${formatting} to TrueERP \n`;
                          templateObject.setLogFunction(transNOtes);

                          let upload_num = 0;

                          for (let i = 0; i < responseCount; i++) {
                            let tempCount = i % 10;
                            let count =
                              tempCount === 0
                                ? `${i + 1}st`
                                : tempCount === 1
                                ? `${i + 1}nd`
                                : tempCount === 2
                                ? `${i + 1}rd`
                                : `${i + 1}th`;
                            transNOtes += `Adding ${count} Lead to ERP database.\n`;
                            templateObject.setLogFunction(transNOtes);

                            let postData = {};
                            postData.type = "TProspect";
                            postData.fields = {};

                            postData.fields.FirstName =
                              resultData[i]?.First_Name || "";

                            postData.fields.LastName =
                              resultData[i]?.Last_Name || "";

                            transNOtes += `Lead ${resultData[i]?.Full_Name} converting ..........\n`;
                            templateObject.setLogFunction(transNOtes);
                            postData.fields.LastName =
                              resultData[i]?.Last_Name || "";

                            postData.fields.Email = resultData[i].Email || "";

                            postData.fields.Companyname =
                              resultData[i].Company || "";

                            postData.fields.Phone = resultData[i].Phone || "";

                            postData.fields.Title = resultData[i].Title || "";

                            postData.fields.SkypeName =
                              resultData[i].Skype_ID || "";

                            const clientName = resultData[i].Full_Name;

                            if (!resultData[i].GlobalRef) {
                              await fetch(
                                `${erpObject.base_url}/TProspect?select=[ClientName]="${clientName}"&[Active]=true`,
                                {
                                  method: "GET",
                                  headers: {
                                    Username: erpObject.user_name,
                                    Password: erpObject.password,
                                    Database: erpObject.database,
                                    "Content-Type": "application/json",
                                  },
                                  redirect: "follow",
                                }
                              )
                                .then((response) => response.json())
                                .then(async (result) => {
                                  if (result?.tprospect.length > 0) {
                                    postData.fields.GlobalRef =
                                      result?.tprospect[0]?.GlobalRef;
                                    transNOtes += `Found the TProspect as ClientName : ${clientName}\n`;
                                    templateObject.setLogFunction(transNOtes);
                                  } else {
                                    postData.fields.ClientName =
                                      resultData[i].Full_Name;
                                  }
                                })
                                .catch((err) => {
                                  console.log(err);
                                  postData.fields.ClientName =
                                    resultData[i].Full_Name;
                                  transNOtes += `Confirming TProspect existence of Lead in TrueERP Failed! \n`;
                                  templateObject.setLogFunction(transNOtes);
                                });
                            } else {
                              postData.fields.GlobalRef = resultData[i].GlobalRef;
                            }

                            await fetch("/api/updateTrueERP2", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                data: postData,
                                Username: erpObject.user_name,
                                Password: erpObject.password,
                                Database: erpObject.database,
                                url: erpObject.base_url + "/TProspect",
                              }),
                            })
                              .then((response) => response.json())
                              .then(async (result) => {
                                if(result.statusCode == 200){
                                upload_transaction_count += 1;
                                upload_num += 1;
                                transNOtes += `Leads transfer Success!\n`;

                                templateObject.setLogFunction(transNOtes);
                              }else{

                              if (result && result.headers && result.headers.errormessage) {
                                transNOtes += `Leads transfer Failed!\n`;
                                transNOtes += `${result.headers.errormessage}\n`;
                                templateObject.setLogFunction(transNOtes);
                              }

                            }
                              })
                              .catch((error) => {
                                console.log(error);

                                transNOtes += `Leads transfer Failed!\n`;
                                transNOtes += `Failed!!!\n`;
                                templateObject.setLogFunction(transNOtes);
                              });
                          }

                          transaction_details.push({
                            detail_string:
                              "Downloaded Prospects from Zoho to TrueERP",
                            count: upload_num,
                          });


                        }
                      }

                    } else {
                      transNOtes += `There is no newly added Lead in ZOHO.\n`;
                      templateObject.setLogFunction(transNOtes);
                    }
                  }

                  if (ZOHO_CustomerState) {
                    transNOtes += `-----------------------------------------------------------\n`;
                    templateObject.setLogFunction(transNOtes);
                    transNOtes += "Processing Contacts .........\n";
                    templateObject.setLogFunction(transNOtes);
                    const args = {
                      auth: token,
                      data: {
                        module: "Contacts",
                        lstTime: lstUpdateTimeZoho,
                      },
                      datacenter: datacenter
                    };
                    const resultContacts = await new Promise((resolve, reject) => {
                      Meteor.call("getDatafromZohoByDate", args,(error, result) => {
                          if (error) {
                            reject(error);
                          } else {
                            resolve(result);
                          }
                        }
                      );
                    });

                    if (resultContacts) {
                      const ids = resultContacts.data.map((contact) => {
                        return contact.id;
                      });
                      let combinedIds = ids.join(",");

                      const resultContactsByIDs = await new Promise((resolve, reject) => {
                        Meteor.call("getZohoContactByIDs", token,datacenter,combinedIds,(error, result) => {
                            if (error) {
                              reject(error);
                            } else {
                              resolve(result);
                            }
                          }
                        );
                      });

                      if(resultContactsByIDs){
                        if (resultContactsByIDs.data.length === 0) {
                          transNOtes += `There is no newly added Contact in ZOHO.\n`;
                          templateObject.setLogFunction(transNOtes);
                        } else {
                          responseCount = resultContactsByIDs.data.length;
                          var resultData = resultContactsByIDs.data;
                          let formatting =
                            responseCount > 1 ? "Contacts" : "Contact";
                          transNOtes +=
                            `Received ` +
                            responseCount +
                            ` ${formatting} from Zoho.\n`;

                          transNOtes += `Adding ${formatting} to TrueERP \n`;
                          templateObject.setLogFunction(transNOtes);
                          let upload_num = 0;

                          for (let i = 0; i < responseCount; i++) {
                            let tempCount = i % 10;
                            let count = tempCount === 0 ? `${i + 1}st` : tempCount === 1 ? `${i + 1}nd` : tempCount === 2 ? `${i + 1}rd` : `${i + 1}th`;
                            transNOtes += `Adding ${count} Contact to ERP database.\n`;
                            templateObject.setLogFunction(transNOtes);

                            let postData = {};
                            postData.type = "TCustomer";
                            postData.fields = {};
                            postData.fields.Email = resultData[i].Email || "";

                            postData.fields.FirstName =
                              resultData[i].First_Name || "";

                            postData.fields.LastName =
                              resultData[i].Last_Name || "";

                            postData.fields.Phone = resultData[i].Phone || "";

                            postData.fields.Mobile = resultData[i].Mobile || "";

                            postData.fields.SkypeName =
                              resultData[i].Skype_ID || "";

                            postData.fields.Title = resultData[i].Title || "";

                            postData.fields.Faxnumber = resultData[i].Fax || "";

                            const clientName = resultData[i].Full_Name;

                            if (!resultData[i].GlobalRef) {
                              await fetch(`${erpObject.base_url}/TCustomer?select=[ClientName]="${clientName}"&[Active]=true`,
                                {
                                  method: "GET",
                                  headers: {
                                    Username: erpObject.user_name,
                                    Password: erpObject.password,
                                    Database: erpObject.database,
                                    "Content-Type": "application/json",
                                  },
                                  redirect: "follow",
                                }
                              ).then((response) => response.json()).then(async (result) => {
                                  if (result.tcustomer.length > 0) {
                                    postData.fields.GlobalRef = result?.tcustomer[0]?.GlobalRef;
                                    transNOtes += `Found the Customer as ClientName : ${clientName}\n`;
                                    templateObject.setLogFunction(transNOtes);
                                  } else {
                                    postData.fields.ClientName = resultData[i].Full_Name;
                                  }
                                }).catch((err) => {
                                  console.log(err);
                                  postData.fields.ClientName = resultData[i].Full_Name;
                                  transNOtes += `Confirming Customer existence in TrueERP Failed! \n`;
                                  templateObject.setLogFunction(transNOtes);
                                });
                            } else {
                              postData.fields.GlobalRef = resultData[i].GlobalRef;
                            }

                            await fetch("/api/updateTrueERP2", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                data: postData,
                                Username: erpObject.user_name,
                                Password: erpObject.password,
                                Database: erpObject.database,
                                url: erpObject.base_url + "/TCustomer",
                              }),
                            }).then((response) => response.json()).then(async (result) => {
                              if(result.statusCode == 200){
                                upload_transaction_count += 1;
                                upload_num += 1;
                                transNOtes += `Customers transfer Success!\n`;

                                templateObject.setLogFunction(transNOtes);
                              }else{

                                if (result && result.headers && result.headers.errormessage) {
                                  transNOtes += `Customers transfer Failed!\n`;
                                  transNOtes += `${result.headers.errormessage}\n`;
                                  templateObject.setLogFunction(transNOtes);
                                }

                              }
                              }).catch((error) => {
                                console.log(error);
                                transNOtes += `Customers transfer Failed!\n`;
                                transNOtes += `Failed!!!\n`;
                                templateObject.setLogFunction(transNOtes);
                              });
                          }

                          transaction_details.push({
                            detail_string:
                              "Downloaded Customers from Zoho to TrueERP",
                            count: upload_num,
                          });
                        }
                      };
                    } else {
                      transNOtes += `There is no newly added Contact in ZOHO.\n`;
                      templateObject.setLogFunction(transNOtes);
                    }
                  }

                  // account_id = 13;
                  // connection_id = 7;
                  let account_id = tempConnection.account_id;
                  let connection_id = tempConnection.connection_id;
                  let today = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

                  // let year = today.getFullYear();
                  // let month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
                  // let day = String(today.getDate()).padStart(2, "0");

                  // let formattedDate = `${year}-${month}-${day}`;
                  let formattedDate = moment(today).format("YYYY-MM-DD");

                  let products_num =
                    upload_transaction_count + download_transaction_count;
                  let transaction_data = {
                    accounting_soft: account_id,
                    connection_soft: connection_id,
                    date: formattedDate,
                    order_num: products_num,
                    products: products,
                    products_num: products_num,
                    uploaded_num: upload_transaction_count,
                    downloaded_num: download_transaction_count,
                    connection_id: selConnectionId,
                  };

                  console.log(transaction_data);
                  let insertedTransactionID = 0;
                  fetch("/api/transactionByDate", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      date: moment().format("YYYY-MM-DD"),
                      connection_id: selConnectionId,
                      accounting_soft: account_id,
                      connection_soft: connection_id,
                    }),
                  }).then((response) => response.json()).then(async (result) => {
                      if (result != "No Result") {
                        transaction_data.order_num =
                          transaction_data.order_num + result.order_num;
                        transaction_data.products_num =
                          transaction_data.products_num + result.products_num;
                        transaction_data.uploaded_num =
                          transaction_data.uploaded_num + result.uploaded_num;
                        transaction_data.downloaded_num =
                          transaction_data.downloaded_num + result.downloaded_num;
                        let resultId = result.id;
                        fetch("/api/addtransaction", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            id: resultId,
                            transaction_data: transaction_data,
                          }),
                        })
                          .then((response) => response.json())
                          .then(async (result) => {
                            insertedTransactionID = resultId;
                            let postData = {
                              transaction_details: transaction_details,
                              transactionId: insertedTransactionID,
                              date: today,
                            };
                            fetch("/api/inserttransactionDetails", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(postData),
                            })
                              .then((response) => response.json())
                              .then(async (result) => {})
                              .catch((error) => console.log(error));
                          })
                          .catch((error) => console.log(error));
                      } else {
                        fetch("/api/inserttransaction", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(transaction_data),
                        })
                          .then((response) => response.json())
                          .then(async (result) => {
                            insertedTransactionID = result;
                            let postData = {
                              transaction_details: transaction_details,
                              transactionId: insertedTransactionID,
                              date: today,
                            };
                            fetch("/api/inserttransactionDetails", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(postData),
                            })
                              .then((response) => response.json())
                              .then(async (result) => {})
                              .catch((error) => console.log(error));
                          })
                          .catch((error) => console.log(error));
                      }
                    });

              let tempDate = new Date();
              let dateString = tempDate.getFullYear() + "/" + ("0" + (tempDate.getMonth() + 1)).slice(-2) + "/" + ("0" + tempDate.getDate()).slice(-2) + " " +
                          ("0" + tempDate.getHours()).slice(-2) + ":" + ("0" + tempDate.getMinutes()).slice(-2) + ":" + ("0" + tempDate.getSeconds()).slice(-2);
                          console.log(dateString);
                        let argsDate = {
                          id: selConnectionId,
                          last_ran_date: dateString,
                        };
                        await fetch(`/api/updateLastRanDate`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(argsDate),
                        }).then((response) => response.json()).then(async (result) => {
                          transNOtes += `Updated Last Sync Time as ${dateString}.\n`;
                          templateObject.setLogFunction(transNOtes);
                        }).catch((err) => console.log(err));

              }).catch(error => {console.log(error)})
            }
          );
    }
    else {
    swal(`Error Occurred While Attempting to Connect to the ${result[0].name} Server`, `Head to Connection Details and Check if ${result[0].name} Server Configuration is Correct`, "error")
    }
    }).catch(error => {
      templateObject.setLogFunction(error);
    });
    }).catch(error => {
      templateObject.setLogFunction(error);
    });
  };
}
