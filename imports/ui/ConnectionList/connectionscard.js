// @ts-nocheck
import { ReactiveVar } from 'meteor/reactive-var';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { HTTP } from 'meteor/http';
import { first, template } from 'lodash';
import './connectionscard.html';
const axios = require('axios');
import moment from "moment";
import {UtilityService} from "../../utility-service";
let utilityService = new UtilityService();
let cancelBtnFlag = false;
Template.connectionscard.onCreated(function () {
const templateObject = Template.instance();
templateObject.record = ReactiveVar();
templateObject.record1 = ReactiveVar();
templateObject.record2 = ReactiveVar();
templateObject.idxRecord = ReactiveVar();
templateObject.account = ReactiveVar();
templateObject.connection = ReactiveVar();
templateObject.testNote = ReactiveVar();
templateObject.action = ReactiveVar();
templateObject.customerdetails = ReactiveVar();
templateObject.softwaredata = ReactiveVar();

templateObject.selConnectionId = new ReactiveVar(-1);
templateObject.seltransactionId = new ReactiveVar(1);
templateObject.connectionType = new ReactiveVar("");

templateObject.transferTypes1 = new ReactiveVar([]);
templateObject.transferTypes2 = new ReactiveVar([]);

templateObject.identifiertypes1 = new ReactiveVar([]);
templateObject.identifiertypes2 = new ReactiveVar([]);

fetch("/api/customers", {
method: "POST",
headers: {
'Content-Type': 'application/json'
},
}).then(response => response.json()).then(async (resultCustomer) => {
if (FlowRouter.current().queryParams.customerId) {
let customerID = FlowRouter.current().queryParams.customerId || '';
let resultArray = [];
$.each(resultCustomer, async function (i, e) {
if (e.id == customerID) {
resultArray.push(e);
}
});

if (resultArray.length) {
await templateObject.customerdetails.set(resultArray);
};
} else {
await templateObject.customerdetails.set(resultCustomer);
}


}).catch(error => console.log(error));

const postData = {
id: FlowRouter.current().queryParams.id||0
}

fetch('/api/transfertypesByID', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(postData)
}).then(response => response.json()).then(async (results) => {
let transferTypes1 = [];
let transferTypes2 = [];
$.each(results, async function (i, e) {
if (e.tab_id == 1) {
transferTypes1.push(e);
}
else {
transferTypes2.push(e);
}
});

await templateObject.transferTypes1.set(transferTypes1);
await templateObject.transferTypes2.set(transferTypes2);
})
.catch((error) => console.log(error));

fetch("/api/identifiertypesByID", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(postData),
})
.then((response) => response.json())
.then(async (results) => {
let identifierTypes1 = [];
let identifierTypes2 = [];
$.each(results, async function (i, e) {
if (e.tab_id == 1) {
identifierTypes1.push(e);
} else {
identifierTypes2.push(e);
}
});

await templateObject.identifiertypes1.set(identifierTypes1);
await templateObject.identifiertypes2.set(identifierTypes2);
})
.catch((error) => console.log(error));

fetch("/api/softwareData", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
})
.then((response) => response.json())
.then(async (resultSoftware) => {
await templateObject.softwaredata.set(resultSoftware);
})
.catch((error) => console.log(error));

if (!FlowRouter.current().queryParams.id) {
templateObject.action.set("new");
if (FlowRouter.current().queryParams.customerId) {
let customerID = FlowRouter.current().queryParams.customerId || 0;
$('.edtClientID').val(customerID);
}
} else if (FlowRouter.current().queryParams.id == 0 && FlowRouter.current().queryParams.customerId && FlowRouter.current().queryParams.connsoftware) {
templateObject.account.set("TrueERP");
templateObject.idxRecord.set("TrueERP");
templateObject.connection.set(FlowRouter.current().queryParams.connsoftware);

Meteor.setTimeout(function () {
$('.edtClientID').val(FlowRouter.current().queryParams.customerId);
}, 900);

} else {
const postData = {
id: FlowRouter.current().queryParams.id
};
fetch('/api/connectionsSoftwareByID', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(postData)
})
.then(response => response.json())
.then(async (result) => {
templateObject.account.set(result[0]?.account_name);
templateObject.idxRecord.set(result[0]?.account_name);
templateObject.connection.set(result[0]?.connection_name);

const postData1 = {
id: FlowRouter.current().queryParams.customerId
};

fetch(`/api/${templateObject.account.get().replace(' ', '')}ByID`, {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(postData1)
})
.then(response => response.json())
.then(async (result) => {
  $('.edtClientID').val(FlowRouter.current().queryParams.customerId);
templateObject.record1.set(result[0]);
templateObject.record.set(result[0]);
})
.catch(error => console.log(error));

fetch(`/api/${templateObject.connection.get().replace(' ', '')}ByID`, {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(postData1)
})
.then(response => response.json())
.then(async (result) => {
templateObject.record2.set(result[0]);
})
.catch(error => console.log(error));

})
.catch(error => console.log(error));
}

});

Template.connectionscard.onRendered(function () {
const templateObject = Template.instance();
  Meteor.setTimeout(function () {
      if (FlowRouter.current().queryParams.tab) {
      let tabIndex = (FlowRouter.current().queryParams.tab == 1) ? ".navIdx1" : ".navIdx2";
      let otherTab = (FlowRouter.current().queryParams.tab == 1) ? ".navIdx2" : ".navIdx1";
      this.$(tabIndex).click()
      this.$(tabIndex + ' a')[0].classList.add('active')
      this.$(otherTab + ' a')[0].classList.remove('active')
      }
  }, 300);

  templateObject.setLogFunction = async function(logitem) {
    await templateObject.testNote.set(logitem);
    var textarea = $('.testNotes');
    textarea.scrollTop(textarea[0].scrollHeight);
  };

  templateObject.saveTransferType2Func = async function() {
    let transfer_type = [];
    let transferTypes = templateObject.transferTypes2.get();
    $('.chkTransferType2').each(function(event){
          let statusChecked = false;
          let transTypeID =0;
          let connectionID =FlowRouter.current()?.queryParams?.id||FlowRouter.current().queryParams.connsoftwareid||0;
          let transTypeValue = $(this).val()||'';
          if (this.checked) {
              statusChecked = true;
          };
          $.grep(transferTypes, function (n) {
            if ((n.transfer_type == transTypeValue) && (n.tab_id == 2)) {
              transTypeID = n.id||0;
              connectionID = n.connection_id||FlowRouter.current()?.queryParams?.id||0;
            }
          });
          transfer_type.push({ id: transTypeID, transfer_type:transTypeValue||'', connection_id:connectionID, tab_id:2, checked: statusChecked});

    });

    //Update TransType
    fetch("/api/updatetransfertypes", {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    },
    body: JSON.stringify(transfer_type),
    }).then((response) => response.json()).then(async (result) => {
    }).catch(error => console.log(error));

};

});

Template.connectionscard.rendered = () => {

}

Template.connectionscard.events({
'click .navIdx1': function (event) {
Template.instance().idxRecord.set(event.target.innerText);
Template.instance().record.set(Template.instance().record1.get());
},

'click .navIdx2': function (event) {
Template.instance().idxRecord.set(event.target.innerText);
Template.instance().record.set(Template.instance().record2.get());
},
'click .btnNewCon': function (event) {
let selectedSoftware = $('.connectionSofwatre').val() || '';
var selectedSoftwarename = $('.connectionSofwatre option:selected').text() || '';
var selectedCustomerid = $('.customerdataid').val() || '';
if (FlowRouter.current().queryParams.customerId && !FlowRouter.current().queryParams.connsoftware) {
window.location.href = window.location.href + `&id=0&connsoftware=${selectedSoftwarename}&connsoftwareid=${selectedSoftware}`;
} else {
window.location.href = window.location.href + `?customerId=${selectedCustomerid}&id=0&connsoftware=${selectedSoftwarename}&connsoftwareid=${selectedSoftware}`;
};
},
'click #testMagento': async function (event) {

  const templateObject = Template.instance();
  function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
  };
  var testNOtes = 'Connecting..'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting.......'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting..........'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting.............'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting................'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting...................'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting........................'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting.........................\n'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)

  const username = jQuery('#magento_admin_user_name').val();
  const password = jQuery('#magento_admin_user_password').val();
  const baseUrl = jQuery('#magento_base_api_url').val();

  const arg = {
    url: baseUrl,
    username: username,
    password: password
  };

  const access_toekn = await new Promise((resolve, reject) => {

    Meteor.call("getMagentoAdminToken", arg, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });

  });

  if (access_toekn) {
    console.log(access_toekn)
    testNOtes += 'Successfully Connected to Magento\n';
    templateObject.setLogFunction(testNOtes);
    swal({
      text: "Successfully Connected to Magento",
      type: "success",
      confirmButtonText: "Ok",
      });

    return;
  } else {
    templateObject.setLogFunction(testNOtes + '\n' + 'Error Occurred While Attempting to Connect to the Magneto Server');
    swal(`Error Occurred While Attempting to Connect to the Magneto Server`, `Head to Connection Details and Check if Magento Server Configuration is Correct`, "error")
    return;
  }

},

'click #btnTestERP': async function (event) {
ConnectionSoft2TrueERP(jQuery('#magento_customers2magento').is(':checked'), false, jQuery('#magento_invoices2magento').is(':checked'));
},
'click #testWoocommerce': async function (event) {
const templateObject = Template.instance();
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
};
var testNOtes = 'Connecting..'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting.......'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting..........'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting.............'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting................'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting...................'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting........................'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting.........................\n'
await sleep(300)
templateObject.setLogFunction(testNOtes)

const username = jQuery('#woocommerce_email').val();
const password = jQuery('#woocommerce_password').val();
const baseUrl = jQuery('#woocommerce_base_url').val();

const axios = require('axios');
const FormData = require('form-data');
let data = new FormData();
data.append('username', username);
data.append('password', password);

let config = {
method: 'post',
maxBodyLength: Infinity,
url: baseUrl + '/wp-json/jwt-auth/v1/token',
headers: {
'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
},
data: data
};

await axios.request(config).then(async (response) => {
testNOtes = 'Successfully Connected to WooCommerce\n';
templateObject.setLogFunction(testNOtes);
swal({
text: "Successfully Connected to WooCommerce..",
type: "success",
confirmButtonText: "Ok",
});
testNOtes = 'Successfully Connected to WooCommerce\n';
templateObject.setLogFunction(testNOtes);
}).catch(function (err) {
templateObject.setLogFunction(err + ':: Error Occurred While Attempting to Connect to the WooCommerce`,`Head to Connection Details and Check if WooCommerce Configuration is Correct');
swal(`Error Occurred While Attempting to Connect to the WooCommerce Server`, `Head to Connection Details and Check if WooCommerce Configuration is Correct`, "error");

});

},
'click #testAustpost': async function (event) {
const templateObject = Template.instance();
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
};
var testNOtes = 'Connecting..'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting.......'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting..........'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting.............'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting................'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting...................'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting........................'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting.........................\n'
await sleep(300)
templateObject.setLogFunction(testNOtes)

const apiKey = jQuery('#austpost_key').val();
const password = jQuery('#austpost_password').val();
const baseUrl = jQuery('#austpost_url').val();
const email = jQuery('#austpost_email').val();
const name = jQuery('#austpost_name').val();
const productId = jQuery('#austpost_products').val();
const accountNumber = name;
//["2015438937", "3015438937", "05438937"][productId]
/*
let sampleData = JSON.stringify({
"from": {
"postcode": "3207"
},
"to": {
"postcode": "2001"
},
"items": [
{
"length": 5,
"height": 5,
"width": 5,
"weight": 2,
"item_reference": "abc xyz",
"features": {
"TRANSIT_COVER": {
"attributes": {
"cover_amount": 1000
}
}
}
}
]
});

console.log(sampleData);
let config = {
method: 'post',
url: baseUrl + '/test/shipping/v1/prices/items',
headers: {
'Content-Type': 'application/json',
'Accept': 'application/json',
"crossDomain": true,
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
'Access-Control-Allow-Headers': 'Authorization, Content-Type',
'Access-Control-Allow-Credentials': 'true',
'Access-Control-Max-Age': "1800",
'Account-Number': accountNumber,
'Authorization': `Basic ${btoa(`${apiKey}:${password}`)}`,
},
data: sampleData
};
*/
let userAutorization = `Basic ${btoa(`${apiKey}:${password}`)}`;

Meteor.call('checkAUSPOSTConnection', baseUrl, accountNumber, userAutorization, function (error, result) {
$('.fullScreenSpin').hide();
if (error) {
templateObject.setLogFunction(error + ':: Error Occurred While Attempting to Connect to the Australia POST`,`Head to Connection Details and Check if Australia POST Configuration is Correct');
swal(`Error Occurred While Attempting to Connect to the Australia POST Server`, `Head to Connection Details and Check if Australia POST Configuration is Correct`, "error")
return;
} else {
console.log(result);
testNOtes = 'Successfully Connected to Australia POST\n';
templateObject.setLogFunction(testNOtes);
swal({
text: "Successfully Connected to Australia POST..",
type: "success",
confirmButtonText: "Ok",
});
testNOtes = 'Successfully Connected to Australia POST\n';
templateObject.setLogFunction(testNOtes);
}
});

/* //POST Example
Meteor.call('checkAUSPOSTConnItem', baseUrl, accountNumber, userAutorization, sampleData, function(error, result) {
$('.fullScreenSpin').hide();
if (error) {
templateObject.setLogFunction(error + ':: Error Occurred While Attempting to Connect to the Australia POST`,`Head to Connection Details and Check if Australia POST Configuration is Correct');
swal(`Error Occurred While Attempting to Connect to the Australia POST Server`, `Head to Connection Details and Check if Australia POST Configuration is Correct`, "error")
return;
} else {
testNOtes = 'Successfully Connected to Australia POST\n';
templateObject.setLogFunction(testNOtes);
swal({
text: "Successfully Connected to Australia POST..",
type: "success",
confirmButtonText: "Ok",
});
testNOtes = 'Successfully Connected to Australia POST\n';
templateObject.setLogFunction(testNOtes);
}
});
*/
},
'click #true-erp-cancel-btn': async function (event) {
cancelBtnFlag = true
},

'click .btnTestERPConnection': async function (event) {
const templateObject = Template.instance();
let responseCount = 0;
let customerCount = 0;
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}
var testNOtes = 'Connecting to TrueERP..'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to TrueERP.......'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to TrueERP..........'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to TrueERP.............'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to TrueERP................'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to TrueERP...................'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to TrueERP........................'
await sleep(300)
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to TrueERP.........................\n'
await sleep(300)
templateObject.setLogFunction(testNOtes)

// testNOtes += "Get TrueERP Customers ..................\n";
await sleep(1000)
templateObject.setLogFunction(testNOtes)
HTTP.call('GET', jQuery('#trueerp_base_url').val() + '/TUser', {
headers: {
'Username': jQuery('#trueerp_user_name').val(),
'Password': jQuery('#trueerp_password').val(),
'Database': jQuery('#trueerp_database').val(),
}
}, async (error, response) => {
 responseCount++;
if (error) {
console.error('Error:', error);
testNOtes += `An Error Occurred While connecting to TrueERP\n`;
templateObject.setLogFunction(testNOtes);
//templateObject.setLogFunction(error);
}else {
  testNOtes = 'Successfully Connected to TrueERP\n';
  templateObject.setLogFunction(testNOtes);
  /*
let formatting = response.data.tcustomer.length > 1 ? "Customers" : "Customer";
testNOtes = `Received ` + `${response.data.tcustomer.length}` + ` ${formatting} from TrueERP.\n`
templateObject.setLogFunction(testNOtes);

var count = 0
for (const simpleCustomer of response.data.tcustomer) {
var myHeaders = new Headers();
myHeaders.append("Database", `${jQuery('#trueerp_database').val()}`);
myHeaders.append("Username", `${jQuery('#trueerp_user_name').val()}`);
myHeaders.append("Password", `${jQuery('#trueerp_password').val()}`);
await fetch(`${jQuery('#trueerp_base_url').val()}/TCustomer/${simpleCustomer?.Id}`,
{
method: 'GET',
headers: myHeaders,
redirect: 'follow'
}).then(response => response.json()).then(async result => {
count++
const timeStamp = result?.fields?.MsTimeStamp
const id = result?.fields?.ID
const updatecode = result?.fields?.MsUpdateSiteCode
const globalRef = result?.fields?.GlobalRef
const keyValue = result?.fields?.KeyValue
testNOtes += `Customer ${id} "${globalRef}", "${keyValue}"\n`
templateObject.setLogFunction(testNOtes);
})
}
*/
}
/*
if (responseCount == customerCount) {
let tempDate = new Date();
let dateString =
tempDate.getUTCFullYear() + "/" +
("0" + (tempDate.getUTCMonth() + 1)).slice(-2) + "/" +
("0" + tempDate.getUTCDate()).slice(-2) + " " +
("0" + tempDate.getUTCHours()).slice(-2) + ":" +
("0" + tempDate.getUTCMinutes()).slice(-2) + ":" +
("0" + tempDate.getUTCSeconds()).slice(-2);
let args = {
id: selConnectionId,
last_ran_date: dateString
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
})
.catch((err) => console.log(err))
fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, text);
}
*/
});

},

'click #btnFilterOption': async function (event) {

if (jQuery("#tblProducts tbody td").length == -1) {
$('.fullScreenSpin').css('display', 'inline-block');

setTimeout(async function () {
$('.fullScreenSpin').css('display', 'none');
await jQuery('#productModal').modal('toggle');
jQuery('#_filterOptionModal').modal('toggle');

const messageText = "Select A Product";

const msgDiv = document.querySelector('#simple-selection-msg-text');
msgDiv.innerText = '"' + messageText + '"';

const transactionDiv = document.querySelector('#div-simple-msg-selection');
transactionDiv.classList.add('show');

setTimeout(function () {
transactionDiv.classList.remove('show');
}, 1000);
}, 5000);
}
else {
$('.fullScreenSpin').css('display', 'none');
if (!$(".btnFilterReset").length) {
jQuery('#productModal').modal('toggle');

const messageText = "Select A Product";

const msgDiv = document.querySelector('#simple-selection-msg-text');
msgDiv.innerText = '"' + messageText + '"';

const transactionDiv = document.querySelector('#div-simple-msg-selection');
transactionDiv.classList.add('show');

setTimeout(function () {
transactionDiv.classList.remove('show');
}, 1000);
}
jQuery('#_filterOptionModal').modal('toggle');
}
},

'click #saveMagento': function () {
let magentoData = {};
magentoData.id = FlowRouter.current().queryParams.customerId;
magentoData.company_name = jQuery('#magento_company_name').val();
magentoData.enabled = jQuery('#magento_enabled_toggle').is(':Checked');
magentoData.consumer_key = jQuery('#magento_consumer_key').val();
magentoData.consumer_secret = jQuery('#magento_consumer_secret').val();
magentoData.admin_user_name = jQuery('#magento_admin_user_name').val();
magentoData.admin_user_password = jQuery('#magento_admin_user_password').val();
magentoData.base_api_url = jQuery('#magento_base_api_url').val();
magentoData.access_token = jQuery('#magento_access_token').val();
magentoData.access_token_secret = jQuery('#magento_access_token_secret').val();

magentoData.transfer_type_customers = jQuery("#erp_customers2magento").is(":Checked");
magentoData.transfer_type_products = jQuery("#erp_products2magento").is(":Checked");
magentoData.transfer_type_options = jQuery("#erp_product_options2magento").is(":Checked");
magentoData.transfer_type_qty = jQuery("#erp_products_qty2magento").is(":Checked");
magentoData.transfer_type_pictures = jQuery("#erp_products_pictures2magento").is(":Checked");

magentoData.synch_page_size = 100;
magentoData.sales_type = 0;
magentoData.customer_identified_by = jQuery("#magento_cIdentify").val();
magentoData.product_name = jQuery("#magento_pName").val();
magentoData.print_name_to_short_description = jQuery("#magento_pName").val();

let templateObject = Template.instance();
templateObject.saveTransferType2Func();

fetch('/api/updateMagento', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(magentoData)
}).then(response => response.json()).then(async (result) => {
if (result == 'success') {
swal("", 'Magento Successfully Updated', "success");
}

}).catch(error => console.log(error));
},

// 'click #saveMagentodUPLICATE': function () {
// let zohoData = {};
// zohoData.id = FlowRouter.current().queryParams.customerId;
// magentoData.client_id = jQuery('#zoho_client_id').val();
// magentoData.client_secret = jQuery('#zoho_client_secret').val();
// magentoData.authorizationcode = jQuery('#zoho_authorization_code').val();

// fetch('/api/updateZoho', {
// method: 'POST',
// headers: {
// 'Content-Type': 'application/json'
// },
// body: JSON.stringify(magentoData)
// }).then(response => response.json()).then(async (result) => {
// if (result == 'success') {
// swal("", 'Zoho Successfully Updated', "success");
// }

// }).catch(error => console.log(error));
// },

'click #saveWooCommerceDuplicate_': function () {
let woocommerceData = {};
woocommerceData.id = FlowRouter.current().queryParams.customerId;
woocommerceData.email = jQuery('#woocommerce_email').val();
woocommerceData.password = jQuery('#woocommerce_password').val();
woocommerceData.enabled = jQuery('#woocommerce_enabled').is(':Checked');
woocommerceData.url = jQuery('#woocommerce_base_url').val();

fetch('/api/updateWooCommerce', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(woocommerceData)
})
.then(response => response.json())
.then(async (result) => {
if (result == 'success')
swal("", 'Woocommerce Data Successfully Updated', "success");
})
.catch(error => console.log(error));
},

'click #saveAustpost': function () {
let austpostData = {};
austpostData.id = FlowRouter.current().queryParams.customerId;
austpostData.key = jQuery('#austpost_key').val();
austpostData.password = jQuery('#austpost_password').val();
austpostData.reference = jQuery('#austpost_reference').val();
austpostData.email = jQuery('#austpost_email').val();
austpostData.name = jQuery('#austpost_name').val();
austpostData.url = jQuery('#austpost_url').val();
austpostData.enabled = jQuery('#austpost_enabled').is(':Checked');
austpostData.products = jQuery('#austpost_products').val();
austpostData.accountNumber = jQuery('#austpost_name').val();
//["2015438937", "3015438937", "05438937"][austpostData.products]

fetch('/api/updateAustpost', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(austpostData)
})
.then(response => response.json())
.then(async (result) => {
if (result == 'success')
swal("", 'AustPost Successfully Updated', "success");
})
.catch(error => console.log(error));
},

'click #saveWooCommerce': function () {
let woocommerceData = {};
woocommerceData.id = FlowRouter.current().queryParams.customerId;
woocommerceData.email = jQuery('#woocommerce_email').val();
woocommerceData.password = jQuery('#woocommerce_password').val();
woocommerceData.enabled = jQuery('#woocommerce_enabled').is(':Checked');
woocommerceData.url = jQuery('#woocommerce_base_url').val();

let templateObject = Template.instance();
templateObject.saveTransferType2Func();

fetch('/api/updateWooCommerce', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(woocommerceData)
})
.then(response => response.json())
.then(async (result) => {
if (result == 'success')
swal({
  title: 'Woocommerce Data Successfully Updated',
  text: "",
  type: 'success',
  showCancelButton: false,
  confirmButtonText: 'Ok'
}).then((resultData) => {
  if (resultData.value) {
  if (window.localStorage.super == 'false'){
    FlowRouter.go(`/customerscard?id=${window.localStorage.customerId}&TransTab=connection`);
  }else {
    FlowRouter.go('/connectionlist');
  };
 }
  //FlowRouter.go('/customerscard?id=' + window.localStorage.customerId);
});

})
.catch(error => console.log(error));
},

'click #saveAustpost': function () {
let austpostData = {};
austpostData.id = FlowRouter.current().queryParams.customerId;
austpostData.key = jQuery('#austpost_key').val();
austpostData.password = jQuery('#austpost_password').val();
austpostData.reference = jQuery('#austpost_reference').val();
austpostData.email = jQuery('#austpost_email').val();
austpostData.name = jQuery('#austpost_name').val();
austpostData.url = jQuery('#austpost_url').val();
austpostData.enabled = jQuery('#austpost_enabled').is(':Checked');
austpostData.products = jQuery('#austpost_products').val();
austpostData.accountNumber = jQuery('#austpost_name').val();
//["2015438937", "3015438937", "05438937"][austpostData.products]

let templateObject = Template.instance();
templateObject.saveTransferType2Func();

fetch('/api/updateAustpost', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(austpostData)
})
.then(response => response.json())
.then(async (result) => {
if (result == 'success')
swal({
  title: 'AustPost Data Successfully Updated',
  text: "",
  type: 'success',
  showCancelButton: false,
  confirmButtonText: 'Ok'
}).then((resultData) => {
  if (resultData.value) {
  if (window.localStorage.super == 'false'){
    FlowRouter.go(`/customerscard?id=${window.localStorage.customerId}&TransTab=connection`);
  }else {
    FlowRouter.go('/connectionlist');
  };
 }
});

})
.catch(error => console.log(error));
},

'click #saveTrueERP': function () {
let trueERPData = {};
let templateObject = Template.instance();
trueERPData.user_name = jQuery('#trueerp_user_name').val();
trueERPData.password = jQuery('#trueerp_password').val();
trueERPData.database = jQuery('#trueerp_database').val();
trueERPData.base_url = jQuery('#trueerp_base_url').val();
trueERPData.id = jQuery('#trueerp_id').val();
trueERPData.enabled = jQuery('#trueerp_enabled').is(':Checked');
trueERPData.invoice_template = parseInt($("#magento_cIdentify").val())||0;
trueERPData.customer_type = parseInt($("#magento_pName").val())||0;
fetch("/api/updateTrueERP", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(trueERPData),
}).then((response) => response.json()).then(async (result) => {
if (result == 'success'){
  if (FlowRouter.current().queryParams.id == 0 && FlowRouter.current().queryParams.customerId && FlowRouter.current().queryParams.connsoftware) {
  swal("TrueERP Data Successfully Updated", '', "success");
}else{
  swal({
    title: 'TrueERP Data Successfully Updated',
    text: "",
    type: 'success',
    showCancelButton: false,
    confirmButtonText: 'Ok'
  }).then((resultData) => {
    if (resultData.value) {
    if (window.localStorage.super == 'false'){
      FlowRouter.go(`/customerscard?id=${window.localStorage.customerId}&TransTab=connection`);
    }else {
      FlowRouter.go('/connectionlist');
    };
   }
  });
}
}
//swal("", 'TrueERP Successfully Updated', "success");
}).catch(error => console.log(error));

let transfer_type = [];
let transferTypes = templateObject.transferTypes1.get();
$('.chkTransferType').each(function(event){
      let statusChecked = false;
      let transTypeID =0;
      let connectionID =FlowRouter.current()?.queryParams?.id||FlowRouter.current().queryParams.connsoftwareid||0;
      let transTypeValue = $(this).val()||'';
      if (this.checked) {
          statusChecked = true;
      };

      $.grep(transferTypes, function (n) {
        if ((n.transfer_type == transTypeValue) && (n.tab_id == 1)) {
          transTypeID = n.id||0;
          connectionID = n.connection_id||FlowRouter.current()?.queryParams?.id||0;
        }
      });
      transfer_type.push({ id: transTypeID, transfer_type:transTypeValue||'', connection_id:connectionID, tab_id:1, checked: statusChecked});

});
//Update TransType
fetch("/api/updatetransfertypes", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(transfer_type),
}).then((response) => response.json()).then(async (result) => {
}).catch(error => console.log(error));

if (FlowRouter.current().queryParams.id == 0 && FlowRouter.current().queryParams.customerId && FlowRouter.current().queryParams.connsoftware) {
let connectionData = {};
connectionData.customer_id = FlowRouter.current().queryParams.customerId;
connectionData.account_id = 7;
connectionData.db_name = jQuery('#trueerp_database').val();
connectionData.connection_id = FlowRouter.current().queryParams.connsoftwareid;
connectionData.enabled = jQuery('#trueerp_enabled').is(':Checked');
connectionData.last_ran_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

fetch('/api/addConnections', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(connectionData)
}).then(response => response.json()).then(async (result) => {
console.log(result);

}).catch(error => console.log(error));

}else{
  if (window.localStorage.super == 'false'){
    //FlowRouter.go('/customerscard?id=' + window.localStorage.customerId);
  }else {
    //FlowRouter.go('/connectionlist');
  };
};
},

"click #saveZoho": function () {
  let zohoData = {};
  zohoData.id = FlowRouter.current().queryParams.customerId;
  zohoData.client_id = jQuery("#zoho_client_id").val();
  zohoData.client_secret = jQuery("#zoho_client_secret").val();
  zohoData.authorization_code = jQuery("#zoho_access_token").val();
  zohoData.redirect_uri = jQuery("#zoho_redirect_uri").val();
  zohoData.enabled = jQuery("#zoho_enabled_toggle").is(":Checked");
  zohoData.customer_identified_by = jQuery("#zoho_cIdentify").val();
  zohoData.print_name_to_short_description = jQuery("#zoho_pName").val();
  zohoData.access_token = jQuery("#zoho_access_token").val();
  zohoData.refresh_token = jQuery("#zoho_refresh_token").val();
  zohoData.transfer_type_salesorder = jQuery("#erp_sales_orders2zoho").is(":Checked");
  zohoData.transfer_type_customers = jQuery("#erp_customers2zoho").is(":Checked");
  zohoData.transfer_type_products = jQuery("#erp_products2zoho").is(":Checked");
  zohoData.transfer_type_quotes = jQuery("#erp_quotoes2zoho").is(":Checked");
  zohoData.username = jQuery("#zoho_username").val();
  zohoData.password = jQuery("#zoho_password").val();

  let templateObject = Template.instance();
  templateObject.saveTransferType2Func();

  fetch("/api/updateZoho", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(zohoData),
  })
    .then((response) => response.json())
    .then(async (result) => {
      if (result == "success") {
        //swal("", "Zoho Successfully Updated", "success");
        if (FlowRouter.current().queryParams.id == 0 && FlowRouter.current().queryParams.customerId && FlowRouter.current().queryParams.connsoftware) {
            swal("Zoho Data Successfully Updated", '', "success");
        }else{
          swal({
            title: 'Zoho Data Successfully Updated',
            text: "",
            type: 'success',
            showCancelButton: false,
            confirmButtonText: 'Ok'
          }).then((resultData) => {
            if (resultData.value) {
            if (window.localStorage.super == 'false'){
              FlowRouter.go(`/customerscard?id=${window.localStorage.customerId}&TransTab=connection`);
            }else {
              FlowRouter.go('/connectionlist');
            };
            }
          });
        };
      }
    })
    .catch((error) => console.log(error));
},

"click #testZoho": async function () {

  const templateObject = Template.instance();
  function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
  };

  var testNOtes = 'Connecting..'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting.......'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting..........'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting.............'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting................'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting...................'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting........................'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)
  testNOtes = 'Connecting.........................\n'
  await sleep(300)
  templateObject.setLogFunction(testNOtes)


  let zohoData = {};
  zohoData.grant_type = "authorization_code";
  zohoData.clientid = jQuery('#zoho_client_id').val()||'';
  zohoData.clientsecret = jQuery('#zoho_client_secret').val()||'';
  zohoData.refresh_token = jQuery('#zoho_refresh_token').val()||"";
  let ZOHO_REFRESH_TOKEN = jQuery('#zoho_refresh_token').val()||"";
  const tokenPromise = await new Promise((resolve, reject) => {
    Meteor.call("getZohoTokenByRefreshToken", zohoData, datacenter, (error, result) => {
      if (error) {
        console.log(error);
        testNOtes += `An Error Occurred While connecting to ZOHO\n`;
        templateObject.setLogFunction(testNOtes);
        //reject(error);
      } else {

        testNOtes = 'Successfully Connected to Zoho\n';
        templateObject.setLogFunction(testNOtes);

        jQuery('#zoho_access_token').val(result);

        let token = result;//GET Token
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


        resolve(result);
      }
    });
  });
  console.log(tokenPromise);
},

"click #runNowZohoNOTNEEDED": async function () {
  TrueERP2Zoho(
    jQuery("#erp_sales_orders2zoho").is(":checked"),
    jQuery("#erp_customers2zoho").is(":checked"),
    jQuery("#erp_products2zoho").is(":checked"),
    jQuery("#erp_quotoes2zoho").is(":checked")
  );
  return;
},

"click #btnRunERP": async function () {
  var templateObject = Template.instance();
  let listData = FlowRouter.current().queryParams.id || '';
  let connectionType = templateObject.connection.get() || '';
  //RunNow('', listData);
if(listData != ''){
   utilityService.runNowFunction('',listData, Template.instance());
 }else{
   swal({
     title: 'Oooops...',
     text: "This connection has not been saved yet, please save it first and then try again",
     type: 'error',
     showCancelButton: false,
     confirmButtonText: 'Ok'
   }).then((result) => {
     if (result.value) {
     } else if (result.dismiss === 'cancel') {
       return;
     }
   });
 }
  // Zoho2TrueERP(
  //   jQuery("#zoho_quotes2trueerp").is(":checked"),
  //   jQuery("#zoho_sales_orders2trueerp").is(":checked"),
  //   jQuery("#zoho_leads_prospects2trueerp").is(":checked"),
  //   jQuery("#zoho_contacts_customers2trueerp").is(":checked")
  // );
},
'click .importAgain': function () {
var templateObject = Template.instance();
var tempCustomDate = $('.edtDailyStartDate').val()||'';

const parts = tempCustomDate.split('/');
const day = parts[0];
const month = parts[1];
const year = parts[2];

// Create a Date object
const parsedDate = new Date(`${year}-${month}-${day}`);

// Extract the components of the parsed date
const newYear = parsedDate.getFullYear();
const newMonth = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
const newDay = String(parsedDate.getDate()).padStart(2, '0');

// Create the output date string in "yyyy-mm-dd" format
const customDate = `${newYear}-${newMonth}-${newDay}`;

let listData = FlowRouter.current().queryParams.id || '';
let connectionType = templateObject.connection.get() || '';
if(listData != ''){
 utilityService.runNowFunction(customDate,listData, Template.instance());
}else{
  swal({
    title: 'Oooops...',
    text: "This connection has not been saved yet, please save it first and then try again",
    type: 'error',
    showCancelButton: false,
    confirmButtonText: 'Ok'
  }).then((result) => {
    if (result.value) {
    } else if (result.dismiss === 'cancel') {
      return;
    }
  });
}
},
'click .btnBack': function (event) {
event.preventDefault();
history.back(1);
},
'click .runNow': function () {
var templateObject = Template.instance();
let listData = FlowRouter.current().queryParams.id || '';
let connectionType = templateObject.connection.get() || '';
//RunNow('', listData);
if(listData != ''){
 utilityService.runNowFunction('',listData, Template.instance());
}else{
  swal({
    title: 'Oooops...',
    text: "This connection has not been saved yet, please save it first and then try again",
    type: 'error',
    showCancelButton: false,
    confirmButtonText: 'Ok'
  }).then((result) => {
    if (result.value) {
    } else if (result.dismiss === 'cancel') {
      return;
    }
  });
}
},
'click .setFrequency': function () {
var templateObject = Template.instance();
let listData = FlowRouter.current().queryParams.id || '';
let connectionType = templateObject.connection.get() || '';
jQuery('#frequencyModal').modal('toggle');
},
'change #magento_cIdentify': function () {
let currentIdentification = $("#magento_cIdentify").val();
if (currentIdentification == 0) $("label[for='account_transfertype_8']").text("WooCommerce Invoices");
if (currentIdentification == 1) $("label[for='account_transfertype_8']").text("WooCommerce Sales Orders");
}
});

Template.connectionscard.helpers({
record: () => {
return Template.instance().record.get();
},
action: () => {
return Template.instance().action.get();
},
idxRecord: () => {
return Template.instance().idxRecord.get();
},
account: () => {
return Template.instance().account.get();
},
connection: () => {
return Template.instance().connection.get();
},
testNote: () => {
return Template.instance().testNote.get();
},
customerdata: () => {
return Template.instance().customerdetails.get();
},
softwaredata: () => {
return Template.instance().softwaredata.get();
},
transfertypes1: () => {
let templateObject = Template.instance();
return templateObject.transferTypes1.get();
},
transfertypes2: () => {
let templateObject = Template.instance();
return templateObject.transferTypes2.get();
},
identifiertypes1: () => {
let templateObject = Template.instance();
let identifierTypes1 = templateObject.identifiertypes1.get();
return identifierTypes1;
},
identifiertypes2: () => {
let templateObject = Template.instance();
let identifierTypes2 = templateObject.identifiertypes2.get();
return identifierTypes2;
},
});

Template.registerHelper('equals', function (a, b) {
return a === b;
});
Template.registerHelper('notEquals', function (a, b) {
return a != b;
});

function ConnectionSoft2TrueERP(customerStatus, productsStatus, salesOrderStatus) {
var transNOtes = 'Connecting....'
let templateObject = Template.instance();
let selConnectionId = FlowRouter.current().queryParams.id;
let lstUpdateTime = new Date();
let tempConnection;
let tempResponse;
let text = "";
let token;
let connectionType;
let tempConnectionSoftware;
let tempAccount;
let transferTypes = templateObject.transferTypes1.get();
let magento_invoice_status = false;
let magento_customer_status = false;
for (let i = 0; i < transferTypes.length; i++) {
if (transferTypes[i].transfer_type == 'WooCommerce Sales Orders') {
let id = 'account_transfertype_' + String(transferTypes[i].id);
magento_invoice_status = $('#' + id).prop('checked');
}
else if (transferTypes[i].transfer_type == 'WooCommerce Customers') {
let id = 'account_transfertype_' + String(transferTypes[i].id);
magento_customer_status = $('#' + id).prop('checked');
}
}
if (selConnectionId == -1) {
swal("", 'Please select one connection', "error")
return;
}
templateObject.setLogFunction(transNOtes);
const postData = {
id: selConnectionId
};
fetch('/api/connectionsByID', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(postData)
})
.then(response => response.json())
.then(async (re) => {
lstUpdateTime = moment(re[0].last_ran_date).format("YYYY-MM-DD HH:mm:ss");
tempConnection = re[0];
transNOtes = transNOtes +
'\nConnected to CoreEDI database:' +
' { customer: ' + tempConnection.customer_name + ', DB Name: ' + tempConnection.db_name + '}';
templateObject.setLogFunction(transNOtes);
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
connectionType = result[0].name.toLowerCase();
// templateObject.connectionType.set(connectionType);
transNOtes =
transNOtes +
"\nSet Up Connection Software\n" +
"Connecting to " +
(connectionType == "magento" ? "Magento" : connectionType) +
"............\n";
templateObject.setLogFunction(transNOtes);
if (connectionType == "magento") {
connectionType = "Magento";
const postData = {
id: tempConnection.customer_id
};
fetch('/api/MagentoByID', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(postData)
})
.then(response => response.json())
.then(async (result) => {
tempConnectionSoftware = result[0];
transNOtes = transNOtes +
'\nGet access to Magento \n' +
'Authenticating to ' + connectionType + ' website: ' + result[0].base_api_url + ' ............';
templateObject.setLogFunction(transNOtes);
HTTP.call('POST', 'api/magentoAdminToken', {
headers: {
'Content-Type': 'application/json',
},
data: {
'url': tempConnectionSoftware.base_api_url,
'username': `${tempConnectionSoftware.admin_user_name}`,
'password': `${tempConnectionSoftware.admin_user_password}`
}
}, (error, response) => {
if (customerStatus) {

// HTTP.call('GET', '/api/getLastRanDate?id='+ selConnectionId, (e, r) => {
//     console.log(r);
// })

// let customer_url = `${tempConnectionSoftware.base_api_url}/rest/all/V1/customers/search?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`;
let customer_url = '/api/getMCustomers';
if (error) {
console.error('Error:', error);
templateObject.setLogFunction(transNOtes + '\n' + error + ':: Error Occurred While Attempting to Connect to the Magneto Server`,`Head to Connection Details and Check if Magento Server Configuration is Correct');
swal(`Error Occurred While Attempting to Connect to the Magneto Server`, `Head to Connection Details and Check if Magento Server Configuration is Correct`, "error")
return;
} else {
token = response.data;
transNOtes = transNOtes +
'\nMagento admin token has been created successfully\n' +
'Get Magento Customers data .....';
templateObject.setLogFunction(transNOtes);
let customerCount;
HTTP.call('POST', customer_url, {
data: {
auth: `Bearer ${token}`,
url: tempConnectionSoftware.base_api_url
}
}, (error, response) => {
if (error) {
templateObject.setLogFunction(transNOtes + '\n' + error + ':: Error Occurred While Attempting to get the Magento Customers\n');
} else {
customerCount = response.data.total_count;
tempResponse = response.data.items;
token = response.data;
transNOtes = transNOtes +
'\nSuccessfully received the Magento customer data: [customer count - ' + customerCount + ' ]\n' +
'Connect Magento customers to CoreEDI customers ..... \n';
templateObject.setLogFunction(transNOtes);
// Process the response data here
// templateObject.setLogFunction(JSON.stringify(response.data.items));

const postData = {
id: tempConnection.account_id
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
const postData = {
id: tempConnection.customer_id
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
let jsonData;

if (!customerCount) {
text += `There are no customers to receive.\n`;
fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, text);
templateObject.setLogFunction(text);
let tempDate = new Date();
let dateString =
tempDate.getUTCFullYear() + "/" +
("0" + (tempDate.getUTCMonth() + 1)).slice(-2) + "/" +
("0" + tempDate.getUTCDate()).slice(-2) + " " +
("0" + tempDate.getUTCHours()).slice(-2) + ":" +
("0" + tempDate.getUTCMinutes()).slice(-2) + ":" +
("0" + tempDate.getUTCSeconds()).slice(-2);
let args = {
id: selConnectionId,
last_ran_date: dateString
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
// console.log(result);
})
.catch((err) => console.log(err))
} else {
if (customerCount == 1) {
transNOtes = transNOtes +
'One customer Successfully Received from Magento\n';
templateObject.setLogFunction(transNOtes);
} else {
transNOtes += customerCount + ' Customers Successfully Received from Magento\n\n';
templateObject.setLogFunction(transNOtes);
transNOtes += 'Customer Data:\n';
templateObject.setLogFunction(transNOtes);
for (let i = 0; i < customerCount; i++) {
transNOtes += "[" + i + "]: " + tempResponse[i].firstname + ' ' + tempResponse[i].lastname + ", " + tempResponse[i].email + "\n";
templateObject.setLogFunction(transNOtes);
}
transNOtes += "\n";
templateObject.setLogFunction(transNOtes);
}
}
let responseCount = 0;

for (let i = 0; i < customerCount; i++) {
jsonData = {
"type": "TCustomer",
"fields":
{
"ClientTypeName": "Default",
"SourceName": "Radio"
}
}
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}

await sleep(500);
var tempNote = transNOtes;
jsonData.fields.ClientName = tempResponse[i].firstname + ' ' + tempResponse[i].lastname || "";
transNOtes = tempNote + 'Full-Name formating.... \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);
jsonData.fields.Title = tempResponse[i].gender == 1 ? "Mrs" : "Mr" || "";
transNOtes = tempNote + 'Converting Title .............. \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);
jsonData.fields.FirstName = tempResponse[i].firstname || "";
transNOtes = tempNote + 'Converting First Name ..... \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);
jsonData.fields.LastName = tempResponse[i].lastname || "";
transNOtes = tempNote + 'Converting Last Name .................. \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);
jsonData.fields.Street = tempResponse[i].addresses[0] ? tempResponse[i].addresses[0].street[0] : "";
transNOtes = tempNote + 'Converting Street Address1 ............... \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);
jsonData.fields.Street2 = tempResponse[i].addresses[0] ? tempResponse[i].addresses[0].street[1] : "";
transNOtes = tempNote + 'Converting Street Address2 ...... \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);
jsonData.fields.Postcode = tempResponse[i].addresses[0] ? tempResponse[i].addresses[0].postcode : "";
transNOtes = tempNote + 'Converting Post Code ............................... \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);
jsonData.fields.State = tempResponse[i].addresses[0] ? (tempResponse[i].addresses[0].region.region_code ? tempResponse[i].addresses[0].region.region_code : "") : "";
transNOtes = tempNote + 'Converting State Address ....... \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);
jsonData.fields.Country = tempResponse[i].addresses[0] ? tempResponse[i].addresses[0].country_id : "";
transNOtes = tempNote + 'Converting Country .............................. \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);
jsonData.fields.Phone = tempResponse[i].addresses[0] ? tempResponse[i].addresses[0].telephone : "";
transNOtes = tempNote + 'Converting Phone Number .................... \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);
jsonData.fields.Email = tempResponse[i].email;
transNOtes = tempNote + 'Converting Email Address ................................. \n';
await sleep(100);
templateObject.setLogFunction(transNOtes);

await sleep(300);
templateObject.setLogFunction(transNOtes);

fetch(tempAccount.base_url + '/erpapi/TCustomer', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Username': `${tempAccount.user_name}`,
'Password': `${tempAccount.password}`,
'Database': `${tempAccount.database}`,
},
body: JSON.stringify(jsonData)
})
.then(response => response.json())
.then(async (result) => {
responseCount++;
transNOtes += `Customer(${jsonData.fields.ClientName}, ${jsonData.fields.Email}) Successfully Added to TrueERP:  ID: ${result.fields.ID}, GlobalRef: ${result.fields.GlobalRef}\n`
templateObject.setLogFunction(transNOtes);
if (responseCount == customerCount) {
// let tempDate = new Date();
// let dateString =
//   tempDate.getUTCFullYear() +
//   "/" +
//   (
//     "0" +
//     (tempDate.getUTCMonth() + 1)
//   ).slice(-2) +
//   "/" +
//   (
//     "0" + tempDate.getUTCDate()
//   ).slice(-2) +
//   " " +
//   (
//     "0" + tempDate.getUTCHours()
//   ).slice(-2) +
//   ":" +
//   (
//     "0" + tempDate.getUTCMinutes()
//   ).slice(-2) +
//   ":" +
//   (
//     "0" + tempDate.getUTCSeconds()
//   ).slice(-2);
// let args = {
//   id: selConnectionId,
//   last_ran_date: dateString,
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
//         console.log(result);
//     })
//     .catch((err) => console.log(err))
// fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, text);
}
})
.catch(error => {
transNOtes += `An Error Occurred While Adding a Customer(` + tempResponse[i].firstname + ' ' + tempResponse[i].lastname + `) to TrueERP\n`
templateObject.setLogFunction(transNOtes);

});
}

fetch(tempAccount.base_url + '/erpapi/TCustomer', {
method: 'GET',
headers: {
'Content-Type': 'application/json',
'Username': `${tempAccount.user_name}`,
'Password': `${tempAccount.password}`,
'Database': `${tempAccount.database}`,
}
})
.then(response => response.json())
.then(async (result) => {
responseCount = result.tcustomer.length;
var resultData = result.tcustomer;
transNOtes += `Received ` + responseCount + ` Customers data successfully from TrueERP. \nCustomer data: \n`;
for (let i = 0; i < responseCount; i++) {
transNOtes += "[" + i + "]:  {" + resultData[i]['KeyValue'] + ", " + resultData[i]['GlobalRef'] + " \"}\n";
await sleep(100)
templateObject.setLogFunction(transNOtes)
}
templateObject.setLogFunction(transNOtes);
if (responseCount == customerCount) {
let tempDate = new Date();
let dateString =
tempDate.getUTCFullYear() + "/" +
("0" + (tempDate.getUTCMonth() + 1)).slice(-2) + "/" +
("0" + tempDate.getUTCDate()).slice(-2) + " " +
("0" + tempDate.getUTCHours()).slice(-2) + ":" +
("0" + tempDate.getUTCMinutes()).slice(-2) + ":" +
("0" + tempDate.getUTCSeconds()).slice(-2);
let args = {
id: jQuery('#trueerp_id').val(),
last_ran_date: dateString
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
})
.catch((err) => console.log(err))
transNOtes += `Connection Datebase updated!\n`;
transNOtes += `SUCCESS!!!`;
templateObject.setLogFunction(transNOtes);
// fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, text);
}
})
.catch(error => {
transNOtes += `An Error Occurred While Adding a Customer to TrueERP\n`
templateObject.setLogFunction(transNOtes);

});
})
.catch((err) => console.log(err))
})
.catch((err) => console.log(err))

}
});
}
}
if (productsStatus) {
}
if (salesOrderStatus) {
// let customer_url = `${tempConnectionSoftware.base_api_url}/rest/all/V1/customers/search?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`;
let customer_url = '/api/getMOrders';
if (error) {
console.error('Error:', error);
templateObject.setLogFunction(transNOtes + '\n' + error + ':: Error Occurred While Attempting to Connect to the Magneto Server`,`Head to Connection Details and Check if Magento Server Configuration is Correct');
// swal(`Error Occurred While Attempting to Connect to the Magneto Server`, `Head to Connection Details and Check if Magento Server Configuration is Correct`, "error")
return;
} else {
token = response.data;
transNOtes = transNOtes +
'\nSuccessfully generated Magento Admin Token\n' +
'Getting Magento Order data .....';
templateObject.setLogFunction(transNOtes);
let orderCount;
HTTP.call('POST', customer_url, {
data: {
auth: `Bearer ${token}`,
url: tempConnectionSoftware.base_api_url
}
}, (error, response) => {
if (error) {
console.error('Error:', error);
templateObject.setLogFunction(transNOtes + '\n' + error + ':: Error Occurred While Attempting to get the Magento Customers\n');
} else {
orderCount = response.data.total_count;
tempResponse = response.data.items;
token = response.data;
transNOtes = transNOtes +
'\nSuccessfully received Magento orders: [order count - ' + orderCount + ' ]\n' +
'Connecting Magento Order to CoreEDI Server ..... \n';
templateObject.setLogFunction(transNOtes);
// Process the response data here
// templateObject.setLogFunction(JSON.stringify(response.data.items));

const postData = {
id: tempConnection.account_id
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
const postData = {
id: tempConnection.customer_id
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
let jsonData;

if (!orderCount) {
text += `There are No Order to Receive\n`;
fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, text);
templateObject.setLogFunction(text);
let tempDate = new Date();
let dateString =
tempDate.getUTCFullYear() + "/" +
("0" + (tempDate.getUTCMonth() + 1)).slice(-2) + "/" +
("0" + tempDate.getUTCDate()).slice(-2) + " " +
("0" + tempDate.getUTCHours()).slice(-2) + ":" +
("0" + tempDate.getUTCMinutes()).slice(-2) + ":" +
("0" + tempDate.getUTCSeconds()).slice(-2);
let args = {
id: selConnectionId,
last_ran_date: dateString
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
})
.catch((err) => console.log(err))
} else {
if (orderCount == 1) {
transNOtes = transNOtes +
'One Order Successfully Received from Magento\n';
templateObject.setLogFunction(transNOtes);
} else {
transNOtes += orderCount + ' Orders Successfully Received from Magento\n\n';
templateObject.setLogFunction(transNOtes);
transNOtes += 'Order Data:\n';
templateObject.setLogFunction(transNOtes);
for (let i = 0; i < orderCount; i++) {
transNOtes += "[" + i + "]: " + tempResponse[i].updated_at + ',  ' + tempResponse[i].items[0].name + ", " + tempResponse[i].status + "\n";
templateObject.setLogFunction(transNOtes);
}
transNOtes += "\n";
templateObject.setLogFunction(transNOtes);
}
}
let responseCount = 0;

for (let i = 0; i < orderCount; i++) {
jsonData = {
"type": "TSalesOrder",
"fields":
{
"Lines": [{
"type": "TSalesOrderLine",
"fields": {}
}]
}
}
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}

await sleep(50);
var tempNote = transNOtes;
jsonData.fields.CustomerName = tempResponse[i].customer_firstname + ' ' + tempResponse[i].customer_lastname || "";
transNOtes = tempNote + 'Full-Name formating.... \n';
await sleep(50);
templateObject.setLogFunction(transNOtes);
jsonData.fields.SaleDate = tempResponse[i].created_at || "";
transNOtes = tempNote + 'Converting Sales Date .............. \n';
await sleep(50);
templateObject.setLogFunction(transNOtes);
jsonData.fields.TotalAmount = tempResponse[i].base_subtotal || "";
transNOtes = tempNote + 'Converting Total Amount ...... \n';
await sleep(50);
if (tempResponse[i].base_subtotal == 0) return;
templateObject.setLogFunction(transNOtes);
jsonData.fields.TotalAmountInc = tempResponse[i].base_grand_total || "";
transNOtes = tempNote + 'Converting Sub_Total Amount ...... \n';
await sleep(50);
templateObject.setLogFunction(transNOtes);
jsonData.fields.TotalAmountInc = (tempResponse[i].base_tax_amount == 0) ? (tempResponse[i].base_grand_total - tempResponse[i].base_subtotal) : tempResponse[i].base_tax_amount;
transNOtes = tempNote + 'Converting Tax Amount ...... \n';
await sleep(50);
templateObject.setLogFunction(transNOtes);
jsonData.fields.Lines[0].fields.ProductName = "New Product";
transNOtes = tempNote + 'Converting Product Data ...... \n';
await sleep(50);

await sleep(50);
templateObject.setLogFunction(transNOtes);

fetch(tempAccount.base_url + '/erpapi/TSalesOrder', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Username': `${tempAccount.user_name}`,
'Password': `${tempAccount.password}`,
'Database': `${tempAccount.database}`,
},
body: JSON.stringify(jsonData)
})
.then(response => response.json())
.then(async (result) => {
responseCount++;
transNOtes += `Order(${i}) Successfully Added to TrueERP:  ID: ${result.fields.ID}, GlobalRef: ${result.fields.GlobalRef}\n`
templateObject.setLogFunction(transNOtes);
if (responseCount == orderCount) {
let tempDate = new Date();
let dateString =
tempDate.getUTCFullYear() + "/" +
("0" + (tempDate.getUTCMonth() + 1)).slice(-2) + "/" +
("0" + tempDate.getUTCDate()).slice(-2) + " " +
("0" + tempDate.getUTCHours()).slice(-2) + ":" +
("0" + tempDate.getUTCMinutes()).slice(-2) + ":" +
("0" + tempDate.getUTCSeconds()).slice(-2);
let args = {
id: selConnectionId,
last_ran_date: dateString
};
// fetch(`/api/updateLastRanDate`, {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(args)
// })
//     .then(response => response.json())
//     .then(async (result) => {
//         console.log(result);
//     })
//     .catch((err) => console.log(err))
// fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, text);
}
})
.catch(error => {
transNOtes += `An Error Occurred While Adding a Order(` + tempResponse[i].updated_at + ',  ' + tempResponse[i].items[0].name + `) to TrueERP\n`
templateObject.setLogFunction(transNOtes);

});
}

})
.catch((err) => console.log(err))
})
.catch((err) => console.log(err))

}
});
}

}
});
})
.catch(error => console.log(error));
}
else if (connectionType == "woocommerce") {
let postData = {
id: tempConnection.customer_id,
};
fetch(`/api/WooCommerceByID`, {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(postData)
})
.then(response => response.json())
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

// Getting Wocommerce token
let url = tempConnectionSoftware.base_url;
let username = tempConnectionSoftware.emailkey;
let password = tempConnectionSoftware.secret;

const axios = require('axios');
const FormData = require('form-data');
let data = new FormData();
data.append('username', username);
data.append('password', password);

var myHeaders = new Headers();
myHeaders.append("Database", `${tempAccount.database}`);
myHeaders.append("Username", `${tempAccount.user_name}`);
myHeaders.append("Password", `${tempAccount.password}`);

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
if (magento_customer_status) {
let customerIdentifier = $("#magento_pName").val(); // 0: Email, 1: Customer ID
HTTP.call(
"GET",
`${tempConnectionSoftware.base_url}/wp-json/wc/v3/customers?orderby=registered_date&order=desc`,
{
headers: {
Authorization: `Bearer ${token}`,
},
},
(error, response) => {
if (error) {
console.log(error);
swal(`Error Occurred While Attempting to Connect to the WooCommerce Server`, `Head to Connection Details and Check if WooCommerce Server Configuration is Correct`, "error")
return;
} else {
const filteredCustomers = response.data.filter(customer => {
const createdDate = moment(customer.date_created).valueOf();
const lstUpdateTimeDate = moment(lstUpdateTime).valueOf();
return createdDate > lstUpdateTimeDate;
});
customerCount = filteredCustomers.length;
tempResponse = filteredCustomers;
// Process the response data here
// templateObject.setLogFunction(JSON.stringify(response.data.items));
if (!customerCount) {
transNOtes += `There are No Customers to Receive\n`;
templateObject.setLogFunction(transNOtes);
let tempDate = new Date();
let dateString =
tempDate.getUTCFullYear() + "/" +
("0" + (tempDate.getUTCMonth() + 1)).slice(-2) + "/" +
("0" + tempDate.getUTCDate()).slice(-2) + " " +
("0" + tempDate.getUTCHours()).slice(-2) + ":" +
("0" + tempDate.getUTCMinutes()).slice(-2) + ":" +
("0" + tempDate.getUTCSeconds()).slice(-2);
let args = {
id: selConnectionId,
last_ran_date: dateString
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
})
.catch((err) => console.log(err))
} else {
if (customerCount == 1)
transNOtes += `${customerCount}` + ` Customer Successfully Received from WooCommerce\n`;
else
transNOtes += `${customerCount}` + ` Customers Successfully Received from WooCommerce\n`;
}

templateObject.setLogFunction(transNOtes);

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
let jsonData;
let responseCount = 0;

for (let i = 0; i < customerCount; i++) {
jsonData = {
"type": "TCustomer",
"fields":
{
"ClientTypeName": "Default",
"SourceName": "Radio"
}
}
if (tempResponse[i].first_name + tempResponse[i].last_name) jsonData.fields.ClientName = tempResponse[i].first_name + ' ' + tempResponse[i].last_name;
else jsonData.fields.ClientName = tempResponse[i].username;
jsonData.fields.FirstName = tempResponse[i].first_name;
jsonData.fields.LastName = tempResponse[i].last_name;
jsonData.fields.Street = tempResponse[i].billing.address_1;
jsonData.fields.Street2 = tempResponse[i].billing.address_2;
jsonData.fields.Postcode = tempResponse[i].billing.postcode;
jsonData.fields.State = tempResponse[i].billing.state;
jsonData.fields.Country = tempResponse[i].billing.country;
jsonData.fields.Phone = tempResponse[i].billing.phone;
jsonData.fields.Email = tempResponse[i].email;

let clientName =
jsonData.fields.ClientName;
transNOtes += `Adding Customer (${clientName}) to TrueERP....\n`;
templateObject.setLogFunction(
transNOtes
);
let errorMessage = "";
await fetch(
`${tempAccount.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
{
method: "GET",
headers: myHeaders,
redirect: "follow",
}
)
.then((response) => {
errorMessage = response?.headers?.get("Errormessage");
return response.json()
})
.then(async (result) => {
if (
result?.tcustomer.length > 0
) {
clientId =
result?.tcustomer[0]?.Id;
if (customerIdentifier == "0") transNOtes += `Already existing Customer, Email : ${tempResponse[i].email}, Adding customer is rejected....\n`;
else if (customerIdentifier == "1") transNOtes += `Already existing Customer, ID : ${clientId}, Adding customer is rejected....\n`;
else transNOtes += `Already existing Customer, ID : ${clientId}, Adding customer is rejected....\n`;
templateObject.setLogFunction(
transNOtes
);
} else {
HTTP.call(
"POST",
`${tempAccount.base_url}/TCustomer`,
{
headers: {
'Username': `${tempAccount.user_name}`,
'Password': `${tempAccount.password}`,
'Database': `${tempAccount.database}`,
},
data: jsonData
}, (error, response) => {
responseCount++;
if (error) {
console.error('Error:', error);
transNOtes += `An Error Occurred While Adding a Customer to TrueERP\n`;
transNOtes += `{${response?.headers?.get("Errormessage")}}\n`;
templateObject.setLogFunction(transNOtes);
} else {
transNOtes += `${clientName} Successfully Added to TrueERP with ID ${response.data.fields.ID}\n`;
templateObject.setLogFunction(transNOtes);
}
if (responseCount == customerCount) {
let nowInSydney = moment()
.tz("Australia/Brisbane")
.format("YYYY-MM-DD HH:mm:ss");
let args = {
id: selConnectionId,
last_ran_date: nowInSydney,
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
})
.catch((err) => console.log(err))
// fetchWooProduct(templateObject, lstUpdateTime, tempAccount, tempConnectionSoftware.base_url, tempConnectionSoftware.key, tempConnectionSoftware.secret, selConnectionId, text);
}
}
);
}
})
.catch((e) => {
transNOtes += `Error while getting client Id from the TrueERP database.\n`;
transNOtes += `(${errorMessage})\n`;
templateObject.setLogFunction(
transNOtes
);
});
}
})
.catch((err) => console.log(err))
})
.catch((err) => console.log(err))
}
})
}
if (magento_invoice_status) {
if ($("#magento_cIdentify").val() == '1') {  // Sales Order
await axios.get(`${url}/wp-json/wc/v3/orders`, {
headers: {
'Authorization': `Bearer ${token}`,
}
})
.then(async (response) => {
const ordersFromWoocommerce = response.data
order_transaction_count = ordersFromWoocommerce.length

if (ordersFromWoocommerce.length === 0) {
transNOtes += `There is no newly added Order in the Woocommerce Website.\n`;
templateObject.setLogFunction(transNOtes);
}
else {
transNOtes += `Found ${ordersFromWoocommerce.length} newly added order(s) in the Woocommerce Website.\n`;
templateObject.setLogFunction(transNOtes);
let count = 0
for (const orderFromWoocommerce of ordersFromWoocommerce) {
transNOtes += `Checking ${getOrderString(++count)} Order from the Woocommerce Website\n`;
transNOtes += `(Order Detail) First name: ${orderFromWoocommerce?.billing?.first_name}, Last name: ${orderFromWoocommerce?.billing?.last_name}.\n`;
for (const line of orderFromWoocommerce?.line_items) {
transNOtes += `(Line Detail)    Product Id: ${line?.product_id}, Product Name: "${line?.name}", Product Price: $${line?.price}\n`;
}
let orderString = getOrderString(count);
transNOtes += `Adding ${orderString} Order to ERP database.\n`;
templateObject.setLogFunction(transNOtes);

//check if the customer exists and add if not
const clientName = orderFromWoocommerce?.billing?.first_name + " " + orderFromWoocommerce?.billing?.last_name;
let clientId;

transNOtes += `Checking Customer in the TrueERP database for ClientName : ${clientName}...\n`;
templateObject.setLogFunction(transNOtes);
let errorMessage = "";
await fetch(
`${tempAccount.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
{
method: "GET",
headers: myHeaders,
redirect: "follow",
}
)
.then((response) => {
errorMessage = response?.headers?.get("errorMessage");
return response.json();
})
.then(async (result) => {
if (result?.tcustomer.length > 0) {
clientId = result?.tcustomer[0]?.Id;
transNOtes += `Found the Customer as ID : ${clientId}\n`;
templateObject.setLogFunction(
transNOtes
);
} else {
transNOtes += `Not Existing Customer, creating...\n`;
templateObject.setLogFunction(
transNOtes
);
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
Postcode: orderFromWoocommerce?.billing?.postcode,
},
};

await fetch(
`${tempAccount.base_url}/TCustomer`,
{
method: "POST",
headers: myHeaders,
redirect: "follow",
body: JSON.stringify(tempCustomerDetailtoERP),
}
)
.then((response) => response.json())
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
transNOtes += `(${errorMessage})\n`;
templateObject.setLogFunction(transNOtes);
});

//check if the product exists and add if not

const productList = orderFromWoocommerce?.line_items;
const productIdList = [];
const productQtyList = [];
transNOtes += `There are ${productList.length} products in the Invoice line.\n`;
download_transaction_count = productList.length;
templateObject.setLogFunction(transNOtes);

let productExist = true;

for (const product of productList) {
if (productExist) {
transNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.name}...\n`;
templateObject.setLogFunction(transNOtes);
await fetch(
`${tempAccount.base_url}/TProduct?select=[ProductName]="${product?.name}"`,
{
method: "GET",
headers: myHeaders,
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
} else {
productExist = false;
transNOtes += `Not Existing Product, Creating New Sales Order is Rejected...\n`;
templateObject.setLogFunction(transNOtes);
}
})
.catch(() => {
transNOtes += `Error while getting client Id from the TrueERP database.\n`;
templateObject.setLogFunction(transNOtes);
});
}
}

// create a new invoice in ERP.
if (productExist) {
let jsonData;
jsonData = {
type: "TSalesOrderEx",
fields:
{
GLAccountName: "Accounts Receivable",
CustomerName: orderFromWoocommerce.billing.first_name + ' ' + orderFromWoocommerce.billing.last_name,
TermsName: "COD",
SaleClassName: "Adventure One",
SaleDate: moment(orderFromWoocommerce.date_created).format("YYYY-MM-DD"),
TotalAmount: parseFloat(orderFromWoocommerce.total),
TotalAmountInc: parseFloat(orderFromWoocommerce.total),
}
}
let lineItems = [];
for (let j = 0; j < orderFromWoocommerce.line_items.length; j++) {
let tempItems = {
"type": "TSalesOrderLine",
"fields":
{
"ProductName": orderFromWoocommerce.line_items[j].name.split(' - ')[0],
"UnitOfMeasure": "Units",
"UOMQtySold": parseFloat(orderFromWoocommerce.line_items[j].quantity),
"LinePrice": parseFloat(orderFromWoocommerce.line_items[j].price),
"LinePriceInc": parseFloat(orderFromWoocommerce.line_items[j].total),
"TotalLineAmount": parseFloat(orderFromWoocommerce.line_items[j].subtotal),
"TotalLineAmountInc": parseFloat(orderFromWoocommerce.line_items[j].total)
}
}
lineItems.push(tempItems);
}
jsonData.fields.Lines = lineItems;

HTTP.call('POST', `${tempAccount.base_url}/TSalesOrderEx`, {
headers: {
'Username': `${tempAccount.user_name}`,
'Password': `${tempAccount.password}`,
'Database': `${tempAccount.database}`,
},
data: jsonData
}, (error, response) => {
if (error) {
transNOtes += `An Error Occured While Adding New Sales Order to ERP: ${error}.\n`;
templateObject.setLogFunction(transNOtes);
console.error('Error:', error);
}
else {
transNOtes += `1 Sales Order Successfully Added to TrueERP with ID Number ${response.data.fields.ID}\n`
}
});
}
}
}
})
.catch(() => {
transNOtes += `There is no newly added Orders in the Woocommerce Website.\n`;
templateObject.setLogFunction(transNOtes);
})
} else if ($("#magento_cIdentify").val() == '0') {  // Invoice
await axios.get(`${url}/wp-json/wc/v3/orders`, {
headers: {
'Authorization': `Bearer ${token}`,
}
})
.then(async (response) => {
const ordersFromWoocommerce = response.data
order_transaction_count = ordersFromWoocommerce.length

if (ordersFromWoocommerce.length === 0) {
transNOtes += `There is no newly added Order in the Woocommerce Website.\n`;
templateObject.setLogFunction(transNOtes);
}
else {
transNOtes += `Found ${ordersFromWoocommerce.length} newly added order(s) in the Woocommerce Website.\n`;
templateObject.setLogFunction(transNOtes);
let count = 0
for (const orderFromWoocommerce of ordersFromWoocommerce) {
transNOtes += `Checking ${getOrderString(++count)} Order from the Woocommerce Website\n`;
transNOtes += `(Order Detail) First name: ${orderFromWoocommerce?.billing?.first_name}, Last name: ${orderFromWoocommerce?.billing?.last_name}.\n`;
for (const line of orderFromWoocommerce?.line_items) {
transNOtes += `(Line Detail)    Product Id: ${line?.product_id}, Product Name: "${line?.name}", Product Price: $${line?.price}\n`;
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
transNOtes += `There are ${productList.length} products in the Invoice line.\n`;
download_transaction_count = productList.length
templateObject.setLogFunction(transNOtes);

let productExist = true;


for (const product of productList) {

if (productExist) {

transNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.name}...\n`;
templateObject.setLogFunction(transNOtes);
await fetch(`${tempAccount.base_url}/TProduct?select=[ProductName]="${product?.name}"`,
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

productExist = false;
transNOtes += `Not Existing Product, Creating New Invoice is Rejected...\n`;
templateObject.setLogFunction(transNOtes);
}
})
.catch(() => {

transNOtes += `Error while getting client Id from the TrueERP database.\n`;
templateObject.setLogFunction(transNOtes);
})
}
}

// create a new invoice in ERP.
if (productExist) {

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
}
}
})
.catch(() => {
transNOtes += `There is no newly added Orders in the Woocommerce Website.\n`;
templateObject.setLogFunction(transNOtes);
})
}
}
})
.catch((err) => console.log(err))
})
.catch((err) => console.log(err))
})
.catch((err) => console.log(err))

}
else if (connectionType == "zoho") {

// Meteor.call(`getZohoFromId`, {id: tempConnection.customer_id}, (err, result) => {
//     if(err)
//         console.error('Error: ', err);
//     else {
//         tempAccount = result[0];
//         Meteor.call(`getAccessToken`, {tempAccount: tempAccount}, (err, result) => {
//             if(err)
//                 swal(`Error Occurred While Attempting to Connect to the Zoho CRM`,`Head to Connection Details and Check if Zoho CRM Configuration is Correct`, "error")
//             else
//                 console.log(result);
//         })
//         // HTTP.call('POST', `${tempAccount.redirect_uri}/oauth/v2/token`, {
//         //     data: {
//         //         'grant_type': `authorization_code`,
//         //         'client_id': `${tempAccount.client_id}`,
//         //         'client_secret': `${tempAccount.client_secret}`,
//         //         'redirect_uri': `${tempAccount.redirect_uri}`,
//         //         'code': `1000.ec67460612687c1be3e1bef9b17b9751.2e0c738cd582f2888162707e8e7d20f0`,
//         //     },
//         // }, (error, response) => {
//         //     if(error)
//         //         console.error('Error: ', error);
//         //     else
//         //         console.log(response);
//         // })
//     }
// })
}
else {
swal(`Error Occurred While Attempting to Connect to the ${result[0].name} Server`, `Head to Connection Details and Check if ${result[0].name} Server Configuration is Correct`, "error")
}
})
.catch(error => {
console.log(error)
templateObject.setLogFunction(error)
});
})
.catch(error => {
console.log(error)
templateObject.setLogFunction(error)

});
}

async function TrueERP2Magento(ERP_productState, ERP_CustomerState) {
var responseCount = 0;
let customerCount = 0;
const templateObject = Template.instance();
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}
var testNOtes = 'Connecting to Magento..'
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to Magento.......'
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to Magento..........'
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to Magento.............'
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to Magento................'
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to Magento...................'
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to Magento........................'
templateObject.setLogFunction(testNOtes)
testNOtes = 'Connecting to Magento.........................\n';
templateObject.setLogFunction(testNOtes);


HTTP.call('POST', 'api/magentoAdminToken', {
  headers: {
  'Content-Type': 'application/json',
  },
  data: {
  'url': jQuery('#magento_base_api_url').val(),
  'username': jQuery('#magento_admin_user_name').val(),
  'password': jQuery('#magento_admin_user_password').val(),
  }
  }, async (error, response) => {
    if(error) {
      console.error('Error:', error);
      templateObject.setLogFunction(testNOtes + '\n' + error + ':: Error Occurred While Attempting to Connect to the Magneto Server`,`Head to Connection Details and Check if Magento Server Configuration is Correct');
      swal(`Error Occurred While Attempting to Connect to the Magneto Server`, `Head to Connection Details and Check if Magento Server Configuration is Correct`, "error")
      return;
    }
  })


HTTP.call('POST', '/api/getAccSoftt', {
  headers: {
    'Content-Type': 'application/json',
    },
    data: {
    id: FlowRouter.current().queryParams.customerId,
    }
}, async (error, res) => {
  console.log(FlowRouter.current().queryParams.customerId, error, res)
const erpObject = res.data[0];

if (ERP_CustomerState) {

testNOtes += "Processing Customers.........\n";
templateObject.setLogFunction(testNOtes);

testNOtes += "Get TrueERP Customers ..................\n";
templateObject.setLogFunction(testNOtes)
console.log(erpObject)
fetch(erpObject.base_url + '/erpapi/TCustomer?PropertyList=FirstName,LastName,Street,City,Title,ClientName,Phone,Mobile,Country,Postcode,Email', {
method: 'GET',
headers: {
'Content-Type': 'application/json',
'Username': erpObject.user_name,
'Password': erpObject.password,
'Database': erpObject.database,
}
}).then(response => response.json())
.then(async (result) => {
responseCount = result.tcustomer.length;
var resultData = result.tcustomer;
let formatting = responseCount > 1 ? "Customers" : "Customer";
testNOtes += `Received ` + responseCount + ` ${formatting} from TrueERP.\n`;
for (let i = 0; i < resultData.length; i++) {
testNOtes += "[" + (Number(i) + 1) + "]:  {Get " + resultData[i]['ClientName'] + ", " + resultData[i]['GlobalRef'] + " \"}\n";
templateObject.setLogFunction(testNOtes)
}
testNOtes += `Adding customers to Magento website \n`;
templateObject.setLogFunction(testNOtes);
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}

HTTP.call('POST', 'api/magentoAdminToken', {
headers: {
'Content-Type': 'application/json',
},
data: {
'url': jQuery('#magento_base_api_url').val(),
'username': jQuery('#magento_admin_user_name').val(),
'password': jQuery('#magento_admin_user_password').val(),
}
}, async (error, response) => {
// let customer_url = `${tempConnectionSoftware.base_api_url}/rest/all/V1/customers/search?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`;
let customer_url = '/api/addMCustomers';
if (error) {
console.error('Error:', error);
templateObject.setLogFunction(testNOtes + '\n' + error + ':: Error Occurred While Attempting to Connect to the Magneto Server`,`Head to Connection Details and Check if Magento Server Configuration is Correct');
swal(`Error Occurred While Attempting to Connect to the Magneto Server`, `Head to Connection Details and Check if Magento Server Configuration is Correct`, "error")
return;
} else {
testNOtes += 'Successfully generated Magento Admin Token\n' +
'Getting Magento Customers data .....\n';
templateObject.setLogFunction(testNOtes);
token = response.data;
// Convert Magento Format
// testNOtes += 'Formatting  customer\'s format to Magento format... \n';
// await sleep(300);
// templateObject.setLogFunction(testNOtes);
for (let i = 0; i < responseCount; i++) {
const jsonData = {
"customer": {
"addresses": [
{
"street": []
}
]
}
}

let tempNote = testNOtes;
jsonData.customer.email = resultData[i].Email || "";
testNOtes = tempNote + 'Email formating.... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.firstname = resultData[i].FirstName || "";
testNOtes = tempNote + 'Converting First Name ..... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.lastname = resultData[i].LastName || "";
testNOtes = tempNote + 'Converting Last Name .................. \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].firstname = resultData[i].FirstName || "";
testNOtes = tempNote + 'Converting Street Address ............... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].lastname = resultData[i].LastName || "";
testNOtes = tempNote + 'Converting Street Address2 ...... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].postcode = resultData[i].Postcode || "";
testNOtes = tempNote + 'Converting Post Code ............................... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].street[0] = resultData[i].Street || "";
testNOtes = tempNote + 'Converting Street ....... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].countryId = resultData[i].Country || "";
testNOtes = tempNote + 'Converting Country .............................. \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].city = resultData[i].State || "";
testNOtes = tempNote + 'Converting State .................... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses.telephone = resultData[i].Phone || "";
testNOtes = tempNote + 'Converting Phone Number ................................. \n';
templateObject.setLogFunction(testNOtes);

templateObject.setLogFunction(testNOtes);

HTTP.call('POST', customer_url, {
data: {
'auth': `Bearer ${token}`,
'url': jQuery('#magento_base_api_url').val(),
'data': JSON.stringify(jsonData),
},
}, async (error, response) => {
console.log(response);
if (error) {
if (error.message != "already exit") return;
HTTP.call('POST', '/api/updateMCustomers', {
data: {
'auth': `Bearer ${token}`,
'url': jQuery('#magento_base_api_url').val(),
'data': JSON.stringify(jsonData),
'customerID': i
},
}, async (err, res) => {
if (err) {
console.log(err)
}
else {
templateObject.setLogFunction(testNOtes + '\n' + "Customer successfully updated" + ':: Customer-' + i + '\n');
}
console.log('successuly updated');
})
} else {
// customerCount = response.data;
// const tempResponse = JSON.stringify(response.data.items);
token = JSON.stringify(response.data.items);
// console.log(token);
testNOtes = testNOtes +
'\nSuccessfully added Magento customer: [CustomerID: ' + response.data.id + ', Email: ' + response.data.email + ' ]\n';
templateObject.setLogFunction(testNOtes);
// Process the response data here
// templateObject.setLogFunction(JSON.stringify(response.data.items));
customerCount++

}
});
}
}

});
// if (responseCount == customerCount) {
//     let tempDate = new Date();
//     let dateString =
//         tempDate.getUTCFullYear() + "/" +
//         ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) + "/" +
//         ("0" + tempDate.getUTCDate()).slice(-2) + " " +
//         ("0" + tempDate.getUTCHours()).slice(-2) + ":" +
//         ("0" + tempDate.getUTCMinutes()).slice(-2) + ":" +
//         ("0" + tempDate.getUTCSeconds()).slice(-2);
//     let args = {
//         id: jQuery('#trueerp_id').val(),
//         last_ran_date: dateString
//     };
//     fetch(`/api/updateLastRanDate`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(args)
//     })
//         .then(response => response.json())
//         .then(async (result) => {
//             console.log(result);
//         })
//         .catch((err) => console.log(err))
//     testNOtes += `Connection Datebase updated!\n`;
//     testNOtes += `SUCCESS!!!`;
//     templateObject.setLogFunction(testNOtes);
//     // fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, text);
// }
})
.catch(error => {
console.log(error)
testNOtes += `An error occurred while receiving a Customer from TrueERP database\n`
templateObject.setLogFunction(testNOtes);

});
}

if (ERP_productState) {

testNOtes += "Processing Products.........\n\n";
templateObject.setLogFunction(testNOtes);

testNOtes += "Get TrueERP Products ..................\n";
templateObject.setLogFunction(testNOtes);
fetch(erpObject.base_url + '/erpapi/TProductWeb', {
method: 'GET',
headers: {
'Content-Type': 'application/json',
'Username': erpObject.user_name,
'Password': erpObject.password,
'Database': erpObject.database,
}
})
.then(response => response.json())
.then(async (result) => {
responseCount = result.tcustomer.length;
var resultData = result.tcustomer;
let formatting = responseCount > 1 ? "Products" : "Product";
testNOtes += `Received ` + responseCount + ` ${formatting} from TrueERP.\n`;
// for (let i = 0; i < resultData.length; i++) {
//     testNOtes += "[" + i + "]:  {" + resultData[i]['KeyValue'] + ", " + resultData[i]['GlobalRef'] + " \"}\n";
//     templateObject.setLogFunction(testNOtes)
// }
templateObject.setLogFunction(testNOtes);
testNOtes += `Adding Products to Magento website \n`;
templateObject.setLogFunction(testNOtes);

HTTP.call('POST', 'api/magentoAdminToken', {
headers: {
'Content-Type': 'application/json',
},
data: {
'url': jQuery('#magento_base_api_url').val(),
'username': jQuery('#magento_admin_user_name').val(),
'password': jQuery('#magento_admin_user_password').val(),
}
}, async (error, response) => {
// let customer_url = `${tempConnectionSoftware.base_api_url}/rest/all/V1/customers/search?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`;
let customer_url = '/api/addMProducts';
if (error) {
console.error('Error:', error);
templateObject.setLogFunction(testNOtes + '\n' + error + ':: Error Occurred While Attempting to Connect to the Magneto Server`,`Head to Connection Details and Check if Magento Server Configuration is Correct');
swal(`Error Occurred While Attempting to Connect to the Magneto Server`, `Head to Connection Details and Check if Magento Server Configuration is Correct`, "error")
return;
} else {
testNOtes = testNOtes +
'Successfully generated Magento Admin Token\n' +
'Getting Magento Products data .....\n';
templateObject.setLogFunction(testNOtes);
token = response.data;
// Convert Magento Format
for (let i = 0; i < responseCount; i++) {
const jsonData = {
"products": {
"addresses": [
{
"street": []
}
]
}
}
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}

var tempNote = testNOtes;
jsonData.customer.email = resultData[i].Email || "";
testNOtes = tempNote + 'Email formating.... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.firstname = resultData[i].FirstName || "";
testNOtes = tempNote + 'Converting First Name ..... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.lastname = resultData[i].LastName || "";
testNOtes = tempNote + 'Converting Last Name .................. \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].firstname = resultData[i].FirstName || "";
testNOtes = tempNote + 'Converting Street Address ............... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].lastname = resultData[i].LastName || "";
testNOtes = tempNote + 'Converting Street Address2 ...... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].postcode = resultData[i].Postcode || "";
testNOtes = tempNote + 'Converting Post Code ............................... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].street[0] = resultData[i].Street || "";
testNOtes = tempNote + 'Converting Street ....... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].countryId = resultData[i].Country || "";
testNOtes = tempNote + 'Converting Country .............................. \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses[0].city = resultData[i].State || "";
testNOtes = tempNote + 'Converting State .................... \n';
templateObject.setLogFunction(testNOtes);
jsonData.customer.addresses.telephone = resultData[i].Phone || "";
testNOtes = tempNote + 'Converting Email Address ................................. \n';
templateObject.setLogFunction(testNOtes);

templateObject.setLogFunction(testNOtes);

// HTTP.call('POST', customer_url, {
//     data: {
//         'auth': `Bearer ${token}`,
//         'url': jQuery('#magento_base_api_url').val(),
//         'data': JSON.stringify(jsonData),
//     },
// }, async (error, response) => {
//     if (error) {
//         console.log('Error:', error);
//         templateObject.setLogFunction(testNOtes + '\n' + error + ':: Error Occurred While Attempting to get the Magento Customers\n');
//     } else {
//         // customerCount = response.data;
//         // const tempResponse = JSON.stringify(response.data.items);
//         token = JSON.stringify(response.data.items);
//         testNOtes = testNOtes +
//             '\nSuccessfully added Magento customer: [CustomerID: ' + response.data.id + ', Email: ' + response.data.email + ' ]\n';
//         templateObject.setLogFunction(testNOtes);
//         // Process the response data here
//         // templateObject.setLogFunction(JSON.stringify(response.data.items));
//         await sleep(100);
//         customerCount++

//     }
// });
}
}

});
// if (responseCount == customerCount) {
//     let tempDate = new Date();
//     let dateString =
//         tempDate.getUTCFullYear() + "/" +
//         ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) + "/" +
//         ("0" + tempDate.getUTCDate()).slice(-2) + " " +
//         ("0" + tempDate.getUTCHours()).slice(-2) + ":" +
//         ("0" + tempDate.getUTCMinutes()).slice(-2) + ":" +
//         ("0" + tempDate.getUTCSeconds()).slice(-2);
//     let args = {
//         id: jQuery('#trueerp_id').val(),
//         last_ran_date: dateString
//     };
//     fetch(`/api/updateLastRanDate`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(args)
//     })
//         .then(response => response.json())
//         .then(async (result) => {
//             console.log(result);
//         })
//         .catch((err) => console.log(err))
//     testNOtes += `Connection Datebase updated!\n`;
//     testNOtes += `SUCCESS!!!`;
//     templateObject.setLogFunction(testNOtes);
//     // fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, text);
// }
})
.catch(error => {
testNOtes += `An error occurred while receiving a Customer to TrueERP\n`
templateObject.setLogFunction(testNOtes);

});
}
})


}

export const RunNow = (customDate, selConnectionId = '') => {
Template.instance().testNote.set('');
var templateObject = Template.instance();
templateObject.setLogFunction('');

let transaction_details = []
let upload_transaction_count = 0
let products_num = 0
let products = []
let download_transaction_count = 0
let order_transaction_count = 0

let transferTypes = templateObject.transferTypes2.get();
let customer_status = false;
let product_status = false;

for (let i = 0; i < transferTypes.length; i++) {
if (transferTypes[i].transfer_type == 'TrueERP Customers') {
let id = 'connection_transfertype_' + String(i + 1);
customer_status = $('#' + id).prop('checked');
}
else if (transferTypes[i].transfer_type == 'TrueERP Products') {
let id = 'connection_transfertype_' + String(i + 1);
product_status = $('#' + id).prop('checked');
}
}

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
// if (selConnectionId == -1) {
//     swal("", 'Please Select Connection Data', "error")
//     return;
// }
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
lstUpdateTime = moment(connectionResult[0].last_ran_date).tz("Australia/Brisbane").subtract(1, 'hours').format("YYYY-MM-DD HH:mm:ss");
var lstUpdateTimeUTC = moment(connectionResult[0].last_ran_date).tz("Australia/Brisbane").format("YYYY-MM-DDTHH:mm:ss")
// lstUpdateTime = moment(connectionResult[0].last_ran_date).tz("Australia/Brisbane").subtract(1, 'hours').format("YYYY-MM-DD HH:mm:ss");
// var lstUpdateTimeUTC = moment(connectionResult[0].last_ran_date).tz("Australia/Brisbane").format("YYYY-MM-DDTHH:mm:ss")
if (customDate != '') {
lstUpdateTime = customDate
lstUpdateTimeUTC = customDate
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

            transNOtes += `Last Sync Time: ${moment(lstUpdateTime).format(
              "DD/MM/YYYY HH:mm:ss"
            )}\n`;
            // transNOtes += `Last Sync Time: 01/01/2024\n`;
            templateObject.setLogFunction(transNOtes);
            async function runPerFiveMinutes() {

              const CustomerState = jQuery('#erp_customers2magento').is(':checked');
              const ProductsState = jQuery('#erp_products2magento').is(':checked');

              if ( CustomerState ) {
              //getting newly added customer from ERP database
                transNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
                templateObject.setLogFunction(transNOtes);
                await fetch(
                  `${tempAccount.base_url}/TCustomer?listtype=detail&select=[MsTimeStamp]>"${lstUpdateTime}"&limitCount=3`,
                  {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow",
                  }
                )
                  .then((response) => response.json())
                  .then(async (result) => {
                    const newCustomersFromERP = result.tcustomer;
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
                          newCustomerFromERP.fields?.ID
                        } and MsTimeStamp: ${
                          newCustomerFromERP.MsTimeStamp
                        } from TrueERP.\n`;
                        templateObject.setLogFunction(transNOtes);
                        const bodyToAddMagento = {
                          email:
                            newCustomerFromERP?.fields?.Email ||
                            newCustomerFromERP?.fields?.FirstName + "@email.com" ||
                            "",
                          firstname: newCustomerFromERP?.fields?.FirstName,
                          lastname: newCustomerFromERP?.fields?.LastName,
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
                                transNOtes += `Successfully updated ${newCustomersFromERPCount} Customer to Magento with ID: ${newCustomerFromERP.fields?.ID}.\n`;
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
                                transNOtes += `Successfully added ${newCustomersFromERPCount} Customer to Magento with ID: ${newCustomerFromERP.fields?.ID}.\n`;
                                templateObject.setLogFunction(transNOtes);
                              } else {
                                transNOtes += `[Error] Failed to add customer.\n`;
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
                transNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
                templateObject.setLogFunction(transNOtes);
                await fetch(
                  `${tempAccount.base_url}/TProduct?listtype=detail&select=[MsTimeStamp]>"${lstUpdateTime}"&[PublishOnWeb]=true&limitCount=3`,
                  {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow",
                  }
                )
                  .then((response) => response.json())
                  .then(async (result) => {
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
                          newProductFromERP?.fields?.ID
                        } and MsTimeStamp: ${
                          newProductFromERP?.fields?.MsTimeStamp
                        } from TrueERP.\n`;
                        templateObject.setLogFunction(transNOtes);
                        // const uomSalesName = esult?.fields?.UOMSales
                        const bodyToAddMagento = {
                          name: newProductFromERP?.fields?.ProductName,
                          sku: newProductFromERP?.fields?.SKU || newProductFromERP?.fields?.GlobalRef,
                          price: newProductFromERP?.fields?.WHOLESALEPRICE,
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
                            transNOtes += `Successfully added ${newProductsFromERPCount} Product to Magento with ID: ${newProductFromERP?.fields?.ID}.\n`;
                            templateObject.setLogFunction(transNOtes);
                          } else {
                            transNOtes += `[Error] Failed to add product.\n`;
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
                transNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
                templateObject.setLogFunction(transNOtes);
              }

              /* Rasheed Comment out WooCommerce Code from Magento
await axios.get(`${url}/wp-json/wc/v3/orders?modified_after=${lstUpdateTimeUTC}`, {
headers: {
'Authorization': `Bearer ${token}`,
}
})
.then(async (response) => {
const ordersFromMagento = response.data
if (ordersFromMagento.length === 0) {
transNOtes += `There is no newly added Order in the Magento Website.\n`;
templateObject.setLogFunction(transNOtes);
}
else {
transNOtes += `Found ${ordersFromMagento.length} newly added order(s) in the Magento Website.\n`;
templateObject.setLogFunction(transNOtes);
let count = 0
for (const orderFromMagento of ordersFromMagento) {
transNOtes += `Checking ${++count} Order from the Magento Website\n`;
transNOtes += `(Billing Detail) First name: ${orderFromMagento?.billing?.first_name}, Last name: ${orderFromMagento?.billing?.last_name}, Postcode: ${orderFromMagento?.billing?.postcode}.\n`;
for (const line of orderFromMagento?.line_items) {
transNOtes += `(Line Detail)    Product Id: ${line?.product_id}, Product Name: "${line?.name}", Product Price: ${line?.price}\n`;
}
// transNOtes += `Adding ${count}th Order to ERP database.\n`;
templateObject.setLogFunction(transNOtes);

//check if the customer exists and add if not
const clientName = orderFromMagento?.billing?.first_name + " " + orderFromMagento?.billing?.last_name
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
ClientName: orderFromMagento?.billing?.first_name + " " + orderFromMagento?.billing?.last_name,
Companyname: orderFromMagento?.billing?.company,
Email: orderFromMagento?.billing?.email,
FirstName: orderFromMagento?.billing?.first_name,
LastName: orderFromMagento?.billing?.last_name,
Phone: orderFromMagento?.billing?.phone,
Country: orderFromMagento?.billing?.country,
State: orderFromMagento?.billing?.state,
Street: orderFromMagento?.billing?.address_1,
Street2: orderFromMagento?.billing?.address_2,
Postcode: orderFromMagento?.billing?.postcode
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
const productList = orderFromMagento?.line_items
const productIdList = []
const productQtyList = []
transNOtes += `There are ${productList.length} products in the Invoice line.\n`;
templateObject.setLogFunction(transNOtes);

for (const product of productList) {
transNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.name}...\n`;
templateObject.setLogFunction(transNOtes);
await fetch(`${tempAccount.base_url}/TProduct?select=[ProductName]="${product?.name}"`,
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
transNOtes += `Not Existing Product, creating...\n`;
templateObject.setLogFunction(transNOtes);

//getting product by id from
await axios.get(`${url}/wp-json/wc/v3/products/${product.product_id}`, {
headers: {
'Authorization': `Bearer ${token}`,
}
})
.then(async (response) => {
const productFromWoo = response.data

const tempProductDetailtoERP = {
type: "TProductWeb",
fields:
{
ProductType: "INV",
ProductName: productFromWoo?.name,
PurchaseDescription: productFromWoo?.description,
SalesDescription: productFromWoo?.short_description,
AssetAccount: "Inventory Asset",
CogsAccount: "Cost of Goods Sold",
IncomeAccount: "Sales",
BuyQty1: 1,
BuyQty1Cost: productFromWoo?.price,
BuyQty2: 1,
BuyQty2Cost: productFromWoo?.price,
BuyQty3: 1,
BuyQty3Cost: productFromWoo?.price,
SellQty1: 1,
SellQty1Price: productFromWoo?.price,
SellQty2: 1,
SellQty2Price: productFromWoo?.price,
SellQty3: 1,
SellQty3Price: productFromWoo?.price,
TaxCodePurchase: "NCG",
TaxCodeSales: "GST",
UOMPurchases: "Units",
UOMSales: "Units"
}
}

await fetch(`${tempAccount.base_url}/TProductWeb`,
{
method: 'POST',
headers: myHeaders,
redirect: 'follow',
body: JSON.stringify(tempProductDetailtoERP)
})
.then(response => response.json())
.then(async result => {
const tempProductId = result?.fields?.ID
transNOtes += `Added a new product to TrueERP database with ID : ${tempProductId}.\n`;
templateObject.setLogFunction(transNOtes);
productIdList.push(tempProductId)
productQtyList.push(product?.quantity)
})
.catch(error => console.log('error', error));
})
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
}
})
.catch(() => {
transNOtes += `There is no newly added Orders in the Magento Website.\n`;
templateObject.setLogFunction(transNOtes);
})

*/
              //update the last sync time
              transNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
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
                  transNOtes += `Updated Last Sync Time as ${moment(
                    nowInSydney
                  ).format("DD/MM/YYYY HH:mm:ss")}.\n`;
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
              let id = FlowRouter.current().queryParams.id;

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
  })
  .catch((error) => console.log(error));
}
else if (connectionType == "WooCommerce") {
let postData = {
id: tempConnection.customer_id,
};
fetch(`/api/WooCommerceByID`, {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(postData)
})
.then(response => response.json())
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
transNOtes = ""
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

// transNOtes += `Last Sync Time: ${lstUpdateTime}\n`;
transNOtes += `Last Sync Time: ${moment(lstUpdateTime).format("DD/MM/YYYY HH:mm:ss")}\n`;
templateObject.setLogFunction(transNOtes);
async function runPerFiveMinutes() {
if (customer_status) {
//getting newly added customer from ERP database
transNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
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
transNOtes += `Got ${++newCustomersFromERPCount} Customer data with Id: ${newCustomerFromERP.Id} and Name: ${result?.fields?.FirstName + " " + result?.fields?.LastName} from TrueERP.\n`;
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
transNOtes += `[Error] ${response.data.message}\n`;
templateObject.setLogFunction(transNOtes);
}
})
.catch((err) => {
transNOtes += `[Error] ${err}\n`;
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
if (product_status) {
//getting newly added products from ERP database
transNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
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
// const uomSalesName = esult?.fields?.UOMSales
const bodyToAddWoocommerce = {
name: result?.fields?.ProductName,
permalink: result?.fields?.Hyperlink,
// type: result?.fields?.ProductType,
description: result?.fields?.SalesDescription,
short_description: result?.fields?.SalesDescription,
sku: result?.fields?.SKU,
price: result?.fields?.WHOLESALEPRICE,
total_sales: result?.fields?.SellQTY1 + result?.fields?.SellQTY2 + result?.fields?.SellQTY3,
weight: `"${result?.fields?.NetWeightKg}"`
}
// products.append(bodyToAddWoocommerce?.name)
transNOtes += `(Detail) Product name: ${bodyToAddWoocommerce?.name}, Price: ${bodyToAddWoocommerce?.price}, Description: ${bodyToAddWoocommerce?.description}.\n`;
transNOtes += `Adding ${newProductsFromERPCount} Product to Woocommerce.\n`;
templateObject.setLogFunction(transNOtes);
await axios.post(`${url}/wp-json/wc/v3/products`, bodyToAddWoocommerce, {
headers: {
'Authorization': `Bearer ${token}`,
}
})
.then(async (response) => {
const id = response.data.id
if (id) {
transNOtes += `${result?.fields?.ProductName} Successfully Added to Woocommerce with ID: ${id}.\n`;
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
transNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
templateObject.setLogFunction(transNOtes);
await axios.get(`${url}/wp-json/wc/v3/orders?modified_after=${lstUpdateTimeUTC}`, {
headers: {
'Authorization': `Bearer ${token}`,
}
})
.then(async (response) => {
const ordersFromWoocommerce = response.data
order_transaction_count = ordersFromWoocommerce.length

if (ordersFromWoocommerce.length === 0) {
transNOtes += `There is no newly added Order in the Woocommerce Website.\n`;
templateObject.setLogFunction(transNOtes);
}
else {
transNOtes += `Found ${ordersFromWoocommerce.length} newly added order(s) in the Woocommerce Website.\n`;
templateObject.setLogFunction(transNOtes);
let count = 0
for (const orderFromWoocommerce of ordersFromWoocommerce) {
transNOtes += `Checking ${getOrderString(++count)} Order from the Woocommerce Website\n`;
transNOtes += `(Order Detail) First name: ${resultData[i]?.billing?.first_name}, Last name: ${resultData[i]?.billing?.last_name}.\n`;
for (const line of orderFromWoocommerce?.line_items) {
transNOtes += `(Line Detail)    Product Id: ${line?.product_id}, Product Name: "${line?.name}", Product Price: $${line?.price}\n`;
}
// transNOtes += `Adding ${count}th Order to ERP database.\n`;
templateObject.setLogFunction(transNOtes);

//check if the customer exists and add if not
const clientName = resultData[i]?.billing?.first_name + " " + resultData[i]?.billing?.last_name
let clientId
transNOtes += `Checking Customer in the TrueERP database for ClientName : ${clientName}...\n`;
templateObject.setLogFunction(transNOtes);
let errorMessage = "";
await fetch(`${tempAccount.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
{
method: 'GET',
headers: myHeaders,
redirect: 'follow'
})
.then((response) => {
errorMessage = response?.headers?.get("Errormessage");
return response.json();
})
.then(async (result) => {
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
ClientName: resultData[i]?.billing?.first_name + " " + resultData[i]?.billing?.last_name,
Companyname: resultData[i]?.billing?.company,
Email: resultData[i]?.billing?.email,
FirstName: resultData[i]?.billing?.first_name,
LastName: resultData[i]?.billing?.last_name,
Phone: resultData[i]?.billing?.phone,
Country: resultData[i]?.billing?.country,
State: resultData[i]?.billing?.state,
Street: resultData[i]?.billing?.address_1,
Street2: resultData[i]?.billing?.address_2,
Postcode: resultData[i]?.billing?.postcode
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
transNOtes += `(${errorMessage})\n`;
templateObject.setLogFunction(transNOtes);
})

//check if the product exists and add if not
const productList = resultData[i]?.line_items
const productIdList = []
const productQtyList = []
transNOtes += `There are ${productList.length} products in the Invoice line.\n`;
download_transaction_count = productList.length
templateObject.setLogFunction(transNOtes);

let productExist = true;

for (const product of productList) {
if (productExist) {
transNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.name}...\n`;
products.push(product?.name)
templateObject.setLogFunction(transNOtes);
await fetch(`${tempAccount.base_url}/TProduct?select=[ProductName]="${product?.name}"`,
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
productExist = false;
transNOtes += `Not Existing Product, Creating New Invoice is Rejected...\n`;
templateObject.setLogFunction(transNOtes);

//getting product by id from
// await axios.get(`${url}/wp-json/wc/v3/products/${product.product_id}`, {
//   headers: {
//     'Authorization': `Bearer ${token}`,
//   }
// })
//   .then(async (response) => {
//     const productFromWoo = response.data

//     const tempProductDetailtoERP = {
//       type: "TProductWeb",
//       fields:
//       {
//         ProductType: "INV",
//         ProductName: productFromWoo?.name,
//         PurchaseDescription: productFromWoo?.description,
//         SalesDescription: productFromWoo?.short_description,
//         AssetAccount: "Inventory Asset",
//         CogsAccount: "Cost of Goods Sold",
//         IncomeAccount: "Sales",
//         BuyQty1: 1,
//         BuyQty1Cost: parseFloat(productFromWoo?.price),
//         BuyQty2: 1,
//         BuyQty2Cost: parseFloat(productFromWoo?.price),
//         BuyQty3: 1,
//         BuyQty3Cost: parseFloat(productFromWoo?.price),
//         SellQty1: 1,
//         SellQty1Price: parseFloat(productFromWoo?.price),
//         SellQty2: 1,
//         SellQty2Price: parseFloat(productFromWoo?.price),
//         SellQty3: 1,
//         SellQty3Price: parseFloat(productFromWoo?.price),
//         TaxCodePurchase: "NCG",
//         TaxCodeSales: "GST",
//         UOMPurchases: "Units",
//         UOMSales: "Units"
//       }
//     }

//     await fetch(`${tempAccount.base_url}/TProductWeb`,
//       {
//         method: 'POST',
//         headers: myHeaders,
//         redirect: 'follow',
//         body: JSON.stringify(tempProductDetailtoERP)
//       })
//       .then(response => response.json())
//       .then(async result => {
//         const tempProductId = result?.fields?.ID
//         // transNOtes += `Added a new product to TrueERP database with ID : ${tempProductId}.\n`;
//         // templateObject.setLogFunction(transNOtes);
//         productIdList.push(tempProductId)
//         productQtyList.push(product?.quantity)
//       })
//       .catch(error => console.log('error', error));
//   })
}
// productQtyList.push(product?.quantity)
})
.catch(() => {
transNOtes += `Error while getting client Id from the TrueERP database.\n`;
templateObject.setLogFunction(transNOtes);
})
}
}

// create a new invoice in ERP.
if (productExist) {
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
}
}
})
.catch(() => {
transNOtes += `There is no newly added Orders in the Woocommerce Website.\n`;
templateObject.setLogFunction(transNOtes);
})


//update the last sync time
transNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
templateObject.setLogFunction(transNOtes);

let nowInSydney = moment().tz("Australia/Brisbane").format("YYYY-MM-DD HH:mm:ss");
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
transNOtes += `Updated Last Sync Time as ${moment(nowInSydney).format("DD/MM/YYYY HH:mm:ss")}.\n`;
templateObject.setLogFunction(transNOtes);
})
.catch((err) => console.log(err))

let account_id = tempConnection.account_id;
let connection_id = tempConnection.connection_id;
let today = new Date();

let year = today.getFullYear();
let month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
let day = String(today.getDate()).padStart(2, '0');

let formattedDate = `${year}-${month}-${day}`;
let id = FlowRouter.current().queryParams.id;

products_num = upload_transaction_count + download_transaction_count
let transaction_data = {
'accounting_soft': account_id,
'connection_soft': connection_id,
'date': formattedDate,
'order_num': order_transaction_count,
'products': products,
'products_num': products_num,
'uploaded_num': upload_transaction_count,
'downloaded_num': download_transaction_count,
'connection_id': id
}
// transaction_details.push({
//     detail_string: 'downloaded products from TrueERP to WooCommerce',
//     count: download_transaction_count
// });
transaction_details.push({
detail_string: 'Uploaded products from TrueERP to WooCommerce',
count: upload_transaction_count
})
transaction_details.push({
detail_string: 'Orders from WooCommerce to TrueERP',
count: order_transaction_count
})

let insertedTransactionID = 0;
fetch('/api/transactionByDate', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
date: moment().format('YYYY-MM-DD'),
connection_id: id
})
})
.then(response => response.json())
.then(async (result) => {
if (result != "No Result") {
transaction_data.order_num = transaction_data.order_num + result.products||'';
transaction_data.products_num = transaction_data.products_num + result.products_num||0;
transaction_data.uploaded_num = transaction_data.uploaded_num + result.uploaded_num||0;
transaction_data.downloaded_num = transaction_data.downloaded_num + result.downloaded_num||0;
let resultId = result.id;
fetch('/api/addtransaction', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
id: resultId,
transaction_data: transaction_data
})
})
.then(response => response.json())
.then(async (result) => {
insertedTransactionID = resultId
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
} else {
fetch('/api/inserttransaction', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(transaction_data)
})
.then(response => response.json())
.then(async (result) => {
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
}
runPerFiveMinutes()
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
})
.then(response => response.json())
.then(async (result) => {
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

var myHeaders = new Headers();
myHeaders.append("Database", `${tempAccount.database}`);
myHeaders.append("Username", `${tempAccount.user_name}`);
myHeaders.append("Password", `${tempAccount.password}`);

transNOtes += `Last Sync Time: ${moment(lstUpdateTime).format("DD/MM/YYYY HH:mm:ss")}\n`;
templateObject.setLogFunction(transNOtes);
// Getting backorders invoice from ERP machine
transNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
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
const multiplier = result?.tunitofmeasure[0]?.fields?.Multiplier || 1;
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
"suburb": invoiceDetail?.InvoiceSuburb || "Strawberry Hills",
"postcode": invoiceDetail?.InvoicePostcode || "2012",
"state": invoiceDetail?.InvoiceState || "NSW"
},
"to": {
"name": invoiceDetail?.CustomerName,
"lines": [
invoiceDetail?.ShipStreet1,
invoiceDetail?.ShipStreet2,
invoiceDetail?.ShipStreet3
],
"suburb": invoiceDetail?.ShipSuburb || "Yarraville",
"state": invoiceDetail?.ShipState || "VIC",
"postcode": invoiceDetail?.ShipPostcode || "3013"
},
"items": [
{
"length": parseInt(length) || 1,
"height": height || "20",
"width": width || "15",
"weight": parseFloat(weight) || 2,
"packaging_type": "CTN",
"product_id": "FPP"
}
]
}
]
};

let baseUrl = tempConnectionSoftware.base_url;
let accountNumber = tempConnectionSoftware.name;
let userAutorization = `Basic ${btoa(`${tempConnectionSoftware.api_key}:${tempConnectionSoftware.password}`)}`;

await Meteor.call('checkAUSPOSTshipments', baseUrl, accountNumber, userAutorization, starTrackShippingJSON, async function (error, result) {
if (error) {
// console.log(error);
} else {
const deliverCost = result.data?.shipments[0]?.shipment_summary?.total_cost * multiplier
const trackingNumber = result.data.shipments[0]?.items[0]?.tracking_details?.article_id;
transNOtes += `Deliver cost : ${deliverCost}AUD\n`;
transNOtes += `Tracking Number : ${trackingNumber}\n`;
templateObject.setLogFunction(transNOtes);

const updateObj = {
"type": "TInvoice",
"fields": {
"ID": tempInvoice?.Id || 0,
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
})

})
.catch((err) => console.log(err))
})
.catch((err) => console.log(err))
})
.catch((err) => console.log(err))
}
else if (connectionType == "Zoho") {
}
else {
swal(`Error Occurred While Attempting to Connect to the ${result[0].name} Server`, `Head to Connection Details and Check if ${result[0].name} Server Configuration is Correct`, "error")
}
})
.catch(error => {
templateObject.setLogFunction(error)
});
})
.catch(error => {
templateObject.setLogFunction(error)

});
};

function getOrderString(number) {
if (number % 100 >= 11 && number % 100 <= 13) {
return number + "th";
}

switch (number % 10) {
case 1:
return number + "st";
case 2:
return number + "nd";
case 3:
return number + "rd";
default:
return number + "th";
}
}

async function TrueERP2Zoho(
  ERP_SalesState = false,
  ERP_CustomerState = true,
  ERP_ProductState = false,
  ERP_QuotesState = false
) {
  if (
    ERP_CustomerState === false &&
    ERP_SalesState === false &&
    ERP_QuotesState === false &&
    ERP_ProductState === false
  ) {
    return;
  }

  const templateObject = Template.instance();
  let tempConnection;
  let lstUpdateTime = new Date();
  let selConnectionId = FlowRouter.current().queryParams.id;

  fetch('/api/connectionsByID', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({id: selConnectionId})
    })
    .then(response => response.json())
    .then(async (connectionResult) => {
      lstUpdateTime = moment(connectionResult[0]?.last_ran_date).tz("Australia/Brisbane").subtract(1, 'hours').format("YYYY-MM-DD HH:mm:ss");
      tempConnection = connectionResult[0];

      const postData = {
        id: FlowRouter.current().queryParams.customerId,
      };
      var responseCount = 0;
      let customerCount = 0;
      let token = null;

      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms || DEF_DELAY));
      }

      var testNOtes = "Getting token for Zoho.......\n"

      templateObject.setLogFunction(testNOtes);
      HTTP.call(
        "post",
        "/api/getAccSoftt",
        {
          data: {
            id: postData.id
          },
        },
        async (error, res) => {
          let erpObject;
          if (error) {
            testNOtes += "Can't connect to TrueERP database\n";
            templateObject.setLogFunction(testNOtes);
            return;
          } else {
            erpObject = res.data[0];

            let upload_transaction_count = 0;
            let download_transaction_count = 0;
            let transaction_details = [];
            let products;

            let zohoData = {};
            zohoData.clientid = jQuery('#zoho_client_id').val();
            zohoData.clientsecret = jQuery('#zoho_client_secret').val();
            zohoData.redirect_uri = jQuery('#zoho_redirect_uri').val();
            const CLIENT_ID = zohoData.clientid;
            const REDIRECT_URI = zohoData.redirect_uri;
            const RESPONSE_TYPE = 'token';
            const SCOPE = 'ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.users.ALL,ZohoSearch.securesearch.READ';

            const authorizationUrl = `https://accounts.zoho.com/oauth/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=token`;

            const username = jQuery('#zoho_username').val();
            const zohopass = jQuery('#zoho_password').val();

            const clientAccessToken = jQuery('#zoho_access_token').val();

            // const tokenPromise = await new Promise((resolve, reject) => {
            //   Meteor.call("getZohoAccessToken", authorizationUrl, username, zohopass, (error, result) => {
            //     if (error) {
            //       reject(error);
            //     } else {
            //       resolve(result);
            //     }
            //   });
            // })

            //if (tokenPromise) {
              token = clientAccessToken;
              datacenter = datacenter;
              testNOtes = "Got token for Zoho.......\n"
              templateObject.setLogFunction(testNOtes);
            //}
            //console.log(token, tokenPromise)

          testNOtes += "Connecting to TrueERP database.............\n";
          templateObject.setLogFunction(testNOtes);

          if (ERP_SalesState) {
            testNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
            templateObject.setLogFunction(testNOtes);
            testNOtes += "Processing Sales Orders.........\n";
            templateObject.setLogFunction(testNOtes);
            await sleep(1000);
            testNOtes += "Getting TrueERP Sales Orders ..................\n";
            templateObject.setLogFunction(testNOtes);
            await fetch(
              erpObject.base_url +
                // "/TSalesOrder?PropertyList=Lines,ClientName,OrderNumber,CustomerID,CreationDate,ClientName,DueDate,InvoicePrintDesc,ID&select=[MsTimeStamp]>"${lstUpdateTime}"`,
                // `/TSalesOrder?Listtype=detail&select=[MsTimeStamp]>"${lstUpdateTime}"`,
                `/TSalesOrder?Listtype=detail&select=[MsTimeStamp]>"${lstUpdateTime}"`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Username: erpObject.user_name,
                  Password: erpObject.password,
                  Database: erpObject.database,
                },
              }
            )
              .then((response) => response.json())
              .then(async (result) => {
                if (result.tsalesorder.length === 0) {
                  testNOtes += `There is no newly added Sales Order in TrueERP.\n`;
                  templateObject.setLogFunction(testNOtes);
              } else {
                responseCount = result.tsalesorder.length;
                var resultData = result.tsalesorder;
                // download_transaction_count += responseCount;
                // transaction_details.push({
                //   detail_string:
                //     "Downloaded Sales Orders from TrueERP to Zoho",
                //   count: responseCount,
                // });
                let formatting = responseCount > 1 ? "Sales Orders" : "Sales Order";
                testNOtes +=
                  `Received ` +
                  responseCount +
                  ` ${formatting} from TrueERP.\n`;

                testNOtes += `Adding ${formatting} to Zoho CRM \n`;
                templateObject.setLogFunction(testNOtes);

                // token = jQuery("#zoho_access_token").val();
                console.log("token : ", token)
                const reqData = {
                  auth: token,
                  module: "Sales_Orders",
                  datacenter: datacenter,
                  fieldName: "GlobalRef",
                  data: {
                    fields:[{
                      field_label: "GlobalRef",
                      data_type: "text"
                    }]
                  }
                };

              //Check GlobalRef existence
                const resultPromise = await new Promise((resolve, reject) => {

                  Meteor.call("checkFieldExistence", reqData, (error, result) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve(result);
                    }
                  });

                });

                // Process the resultPromise
                if (resultPromise) {
                  if(!resultPromise) {
                    const resultPromise = await new Promise((resolve, reject) => {

                      Meteor.call("addcustomFields", reqData, (error, result) => {
                        if (error) {
                          reject(error);
                        } else {
                          resolve(result);
                        }
                      });

                    });

                    if (resultPromise.data) {
                      testNOtes += `${reqData.module} field has been added in Sales_Orders module!\n`;
                      templateObject.setLogFunction(testNOtes);
                    } else {
                      console.log(resultPromise);
                      testNOtes += `${reqData.module} field adding Failed!\n`;
                      templateObject.setLogFunction(testNOtes);
                    }

                  }
                } else if(!resultPromise) {
                  testNOtes += `${reqData.fieldName} field already exists!\n`;
                  templateObject.setLogFunction(testNOtes);
                } else {
                  console.error('Error:', resultPromise);
                  testNOtes += `Checking Field existing Failed!\n`;
                  testNOtes += `Failed!!!\n`;
                  templateObject.setLogFunction(testNOtes);
                }

                let postData = [];
                for (let i = 0; i < responseCount; i++) {
                  const productList = [];
                  if(!resultData[i].fields.Lines) {
                    continue;
                  }
                  for (let j = 0; j < resultData[i].fields.Lines.length; j++) {
                    const productreqData = {
                      auth: token,
                      datacenter: datacenter,
                      productName:
                        resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g, ''),
                      productID: resultData[i]?.fields?.Lines[j]?.fields?.ProductID,
                    };
                    if (!productreqData.productName) {
                      productreqData.productName = "Temp product";
                    }
                    const resultPromiseProductDetect = await new Promise(
                      (resolve, reject) => {
                        Meteor.call(
                          "getZohoProduct",
                          productreqData,
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

                    if (resultPromiseProductDetect.data) {
                      if (resultPromiseProductDetect.data.length > 0) {
                        // testNOtes += `Product Name "${productreqData.productName}" already exits in ZOHO\n`;
                        productList.push({
                          product: {
                            name: resultData[i]?.fields?.Lines[j]?.fields
                              ?.ProductName,
                            id: resultPromiseProductDetect.data[0].id
                          },
                          quantity:
                            resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                          price:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                          product_description:
                            resultData[i]?.fields?.Lines[j].fields
                              ?.ProductDescription,
                        });
                      } else {
                        const addProduct2Zotorequest = {
                          auth: token,
                          data: [
                            {
                              Product_Name:
                                resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g, ''),
                              Description:
                                resultData[i]?.fields?.Lines[j]?.fields?.ProductDescription,
                              GlobalRef: resultData[i]?.fields?.Lines[j]?.fields?.GlobalRef
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
                          testNOtes += `${addProduct2Zotorequest.data[0].Product_Name} has been added in ZOHO\n`;
                          templateObject.setLogFunction(testNOtes);
                          productList.push({
                            product: {
                              name: resultData[i]?.fields?.Lines[j]?.fields
                                ?.ProductName,
                              id: resultPromiseProduct.data[0].details.id
                            },
                            quantity:
                              resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                           price:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                            product_description:
                              resultData[i]?.fields?.Lines[j].fields
                                ?.ProductDescription,
                          });
                        } else {
                          testNOtes += `${resultPromiseProduct}`;
                          templateObject.setLogFunction(testNOtes);
                        }
                      }
                    } else {
                      const addProduct2Zotorequest = {
                        auth: token,
                        data: [
                          {
                            Product_Name:
                              resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g, ''),
                            Description:
                              resultData[i]?.fields?.Lines[j]?.fields?.ProductDescription,
                              GlobalRef: resultData[i]?.fields?.Lines[j]?.fields?.GlobalRef
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
                        testNOtes += `${addProduct2Zotorequest.data[0].Product_Name} has been added in ZOHO\n`;
                        templateObject.setLogFunction(testNOtes);
                        productList.push({
                          product: {
                            name: resultData[i]?.fields?.Lines[j]?.fields
                              ?.ProductName,
                            id: resultPromiseProduct.data[0].details.id
                          },
                          quantity:
                            resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                          price:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                          product_description:
                            resultData[i].fields.Lines[j].fields
                              .ProductDescription || "",
                        });
                      } else {
                        console.log(resultPromiseProduct);
                        testNOtes += `${resultPromiseProduct}`;
                        templateObject.setLogFunction(testNOtes);
                      }

                    }
                  }

                  const accountreqData = {
                    auth: token,
                    datacenter: datacenter,
                    Account_Name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g, ''),
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

                  if (resultPromiseAccountDetect.data) {
                    if (resultPromiseAccountDetect.data.length > 0) {
                      testNOtes += `Account Name "${accountreqData.Account_Name}" already exists in ZOHO\n`;
                      templateObject.setLogFunction(testNOtes);
                      accountID = resultPromiseAccountDetect.data[0].id;
                    } else {
                      const addAccount2Zotorequest = {
                        auth: token,
                        data: [
                          {
                            Account_Name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g, ''),
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
                        testNOtes += `Account ${addAccount2Zotorequest.data[0].Account_Name} has been added in ZOHO\n`;
                        templateObject.setLogFunction(testNOtes);
                        accountID = resultPromiseAccount.data[0].id;
                      } else {
                        console.log(error);
                        testNOtes += `${error.message}`;
                        templateObject.setLogFunction(testNOtes);
                      }
                    }
                  } else {
                    const addAccount2Zotorequest = {
                      auth: token,
                      data: [
                        {
                          Account_Name: resultData[i].fields.ClientName.replace(/[\[\]()]/g, '') || "TEST NAME",
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
                      testNOtes += `Account ${addAccount2Zotorequest.data[0].Account_Name} has been added in ZOHO\n`;
                      templateObject.setLogFunction(testNOtes);
                      accountID = resultPromiseAccount.data[0].id;
                    } else {
                      console.log(resultPromiseAccount);
                    }
                  }

                  postData.push({
                    Account_Name: {
                      name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g, ''),
                      id: accountID,
                    },
                    Product_Details: productList,
                    GlobalRef: resultData[i]?.fields?.GlobalRef,
                    // Subject: resultData[i]?.fields?.ShipToDesc,
                    Subject: resultData[i]?.fields?.GlobalRef
                  });

                  let tempNote = testNOtes;

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
                  const endIdx = Math.min(startIdx + batchSize, postData.length);
                  const batchData = postData.slice(startIdx, endIdx);
                  args.data = batchData;

                  const resultSalesOrder = await new Promise(
                    (resolve, reject) => {
                      Meteor.call(
                        "updateZohoOrders",
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

                  if (resultSalesOrder.data) {
                    console.log(resultSalesOrder)
                    if (resultSalesOrder.data) {
                      upload_transaction_count += resultSalesOrder.data.length;
                      upload_num += resultSalesOrder.data.length;
                      testNOtes += `Sales Order transfer Success!\n`;
                    } else {
                      testNOtes += `Sales Order transfer Failed!\n${result.message}\n`;
                    }
                    templateObject.setLogFunction(testNOtes);
                  } else {
                    console.log(resultSalesOrder)
                    testNOtes += `Sales Order transfer Failed!\n`;
                    testNOtes += `Failed!!!\n`;
                    templateObject.setLogFunction(testNOtes);
                  }

                }
                transaction_details.push({
                  detail_string:
                    "Uploaded Sales Orders from TrueERP to Zoho",
                  count: upload_num,
                });

                let tempDate = new Date();
                let dateString =
                  tempDate.getUTCFullYear() +
                  "/" +
                  ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) +
                  "/" +
                  ("0" + tempDate.getUTCDate()).slice(-2) +
                  " " +
                  ("0" + tempDate.getUTCHours()).slice(-2) +
                  ":" +
                  ("0" + tempDate.getUTCMinutes()).slice(-2) +
                  ":" +
                  ("0" + tempDate.getUTCSeconds()).slice(-2);
                let argsDate = {
                  id: FlowRouter.current().queryParams.id,
                  last_ran_date: dateString,
                };
                await fetch(`/api/updateLastRanDate`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(argsDate),
                })
                  .then((response) => response.json())
                  .then(async (result) => {
                    console.log(result);
                  })
                  .catch((err) => console.log(err));
              }

              })
              .catch((error) => {
                console.log(error)
                testNOtes += `An error occurred while receiving Sales_Orders from TrueERP database\n`;
                templateObject.setLogFunction(testNOtes);
              });
          }

          if (ERP_CustomerState) {
            testNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
            templateObject.setLogFunction(testNOtes);
            testNOtes += "Processing Customers.........\n";
            templateObject.setLogFunction(testNOtes);
            await sleep(1000);
            testNOtes += "Getting TrueERP Customers ..................\n";
            templateObject.setLogFunction(testNOtes);
            await fetch(
              erpObject.base_url +
                // `/TCustomer?Listtype=detail&select=[MsTimeStamp]>"${lstUpdateTime}"`,
                `/TCustomer?PropertyList=ClientName,Email,FirstName,LastName,Phone,Mobile,SkypeName,Title,Faxnumber,Country,State,Street,Postcode,Billcountry,BillState,BillPostcode,BillStreet&select=[MsTimeStamp]>"${lstUpdateTime}"`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Username: erpObject.user_name,
                  Password: erpObject.password,
                  Database: erpObject.database,
                },
              }
            )
              .then((response) => response.json())
              .then(async (result) => {
                if (result.tcustomer.length === 0) {
                    testNOtes += `There is no newly added Customer in TrueERP.\n`;
                    templateObject.setLogFunction(testNOtes);
                } else {
                  responseCount = result.tcustomer.length;
                  var resultData = result.tcustomer;
                  // download_transaction_count += responseCount;
                  // transaction_details.push({
                  //   detail_string:
                  //     "Downloaded Customers from TrueERP to Zoho",
                  //   count: responseCount,
                  // });
                  let formatting = responseCount > 1 ? "Customers" : "Customer";
                  testNOtes +=
                    `Received ` +
                    responseCount +
                    ` ${formatting} from TrueERP.\n`;

                  testNOtes += `Adding ${formatting} to Zoho CRM \n`;
                  templateObject.setLogFunction(testNOtes);
                  function sleep(ms) {
                    return new Promise((resolve) =>
                      setTimeout(resolve, ms || DEF_DELAY)
                    );
                  }

                  // token = jQuery("#zoho_access_token").val();

                  // fields existence checking

                  const reqData = {
                    auth: token,
                    module: "Contacts",
                    datacenter: datacenter,
                    fieldName: "GlobalRef",
                    data: {
                      fields:[{
                        field_label: "GlobalRef",
                        data_type: "text"
                      }]
                    }
                  };

                  //Check GlobalRef existence
                  const resultPromise = await new Promise((resolve, reject) => {

                    Meteor.call("checkFieldExistence", reqData, (error, result) => {
                      if (error) {
                        reject(error);
                      } else {
                        resolve(result);
                      }
                    });

                  });

                  // Process the resultPromise
                  if (resultPromise) {
                    if(!resultPromise) {
                      const resultPromise = await new Promise((resolve, reject) => {

                        Meteor.call("addcustomFields", reqData, (error, result) => {
                          if (error) {
                            reject(error);
                          } else {
                            resolve(result);
                          }
                        });

                      });

                      if (resultPromise.data) {
                        testNOtes += `${reqData.module} field has been added in Contacts module!\n`;
                        templateObject.setLogFunction(testNOtes);
                      } else {
                        console.log(resultPromise);
                        testNOtes += `${reqData.module} field adding Failed!\n`;
                        templateObject.setLogFunction(testNOtes);
                      }

                    }
                  } else if(!resultPromise) {
                    testNOtes += `${reqData.fieldName} field already exists!\n`;
                    templateObject.setLogFunction(testNOtes);
                  } else {
                    console.error('Error:', resultPromise);
                    testNOtes += `Checking Field existing Failed!\n`;
                    testNOtes += `Failed!!!\n`;
                    templateObject.setLogFunction(testNOtes);
                  }


                  let postData = [];
                  for (let i = 0; i < responseCount; i++) {
                    tempData = {};

                    let tempNote = testNOtes;
                    //Email converting
                    tempData.Email = resultData[i].Email || "";

                    // Customer Name converting
                    tempData.First_Name = resultData[i].FirstName || "";

                    tempData.Last_Name = resultData[i].LastName || "";
                    testNOtes = tempNote + `Customer ${resultData[i]?.LastName} formating.... \n`;
                    templateObject.setLogFunction(testNOtes);


                    //Phone converting
                    tempData.Phone = resultData[i].Phone || "";

                    // Mobile converting
                    tempData.Mobile = resultData[i].Mobile || "";

                    // Skypenumber converting
                    tempData.Skype_ID = resultData[i].SkypeName || "";

                    // Title converting
                    tempData.Title = resultData[i].Title || "";

                    // Fax converting
                    tempData.Fax = resultData[i].Faxnumber || "";

                    // Country converting
                    tempData.Mailing_Country = resultData[i].Country || "";

                    tempData.GlobalRef = resultData[i].GlobalRef;

                    // City converting
                    tempData.Mailing_City = resultData[i].City || "";

                    // State converting
                    tempData.Mailing_State = resultData[i].State || "";

                    // Street converting
                    tempData.Mailing_Street = resultData[i].Street || "";

                    // Postcode converting
                    tempData.Mailing_Zip = resultData[i].Postcode || "";


                    if(!resultData[i].LastName) {
                      testNOtes += `Customer ID ${resultData[i].Id} not imported as no Last name\n`
                      templateObject.setLogFunction(testNOtes);
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

                  const batchSize = 100;
                  const numBatches = Math.ceil(postData.length / batchSize);
                  let upload_num = 0;
                  // Loop through the data in batches
                  for (let i = 0; i < numBatches; i++) {
                    const startIdx = i * batchSize;
                    const endIdx = Math.min(startIdx + batchSize, postData.length);
                    const batchData = postData.slice(startIdx, endIdx);
                    args.data = batchData;

                    const resultPromise = await new Promise((resolve, reject) => {

                      Meteor.call("updateZohoCustomers", args, (error, result) => {
                        if (error) {
                          reject(error);
                        } else {
                          resolve(result);
                        }
                      });

                    });

                    if (resultPromise.data) {
                      console.log(resultPromise.data);
                      upload_transaction_count += resultPromise.data.length;
                      upload_num = resultPromise.data.length;
                      testNOtes += `Customers transfer Success!\n`;
                      templateObject.setLogFunction(testNOtes);
                    } else {
                      console.log(resultPromise);
                      testNOtes += `Customers transfer Failed!\n`;
                      testNOtes += `Failed!!!\n`;
                      templateObject.setLogFunction(testNOtes);
                    }

                  }

                  transaction_details.push({
                    detail_string:
                      "Uploaded Customers from TrueERP to Zoho",
                    count: upload_num,
                  });


                  let tempDate = new Date();
                  let dateString =
                    tempDate.getUTCFullYear() +
                    "/" +
                    ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) +
                    "/" +
                    ("0" + tempDate.getUTCDate()).slice(-2) +
                    " " +
                    ("0" + tempDate.getUTCHours()).slice(-2) +
                    ":" +
                    ("0" + tempDate.getUTCMinutes()).slice(-2) +
                    ":" +
                    ("0" + tempDate.getUTCSeconds()).slice(-2);
                  let argsDate = {
                    id: FlowRouter.current().queryParams.id,
                    last_ran_date: dateString,
                  };
                  await fetch(`/api/updateLastRanDate`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(argsDate),
                  })
                    .then((response) => response.json())
                    .then(async (result) => {
                      console.log(result);
                    })
                    .catch((err) => console.log(err));
                  // fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, text);
                  // }
                }

              })
              .catch((error) => {
                console.log(error)
                testNOtes += `An error occurred while receiving a Customer from TrueERP database\n`;
                templateObject.setLogFunction(testNOtes);
              });
          }

          if (ERP_ProductState) {
            testNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
            templateObject.setLogFunction(testNOtes);
            testNOtes += "Processing Products.........\n";
            templateObject.setLogFunction(testNOtes);
            await sleep(1000);
            testNOtes += "Getting TrueERP Products ..................\n";
            templateObject.setLogFunction(testNOtes);
            await fetch(
              erpObject.base_url + `/TProduct?PropertyList=ProductName,PRODUCTCODE,ProductDescription,Active,SalesDescription,TotalQtyonOrder,TotalQtyInStock,WHOLESALEPRICE&select=[MsTimeStamp]>"${lstUpdateTime}"`,
              //`/TProduct?Listtype=detail&select=[MsTimeStamp]>"${lstUpdateTime}"&[PublishOnWeb]=true`
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Username: erpObject.user_name,
                  Password: erpObject.password,
                  Database: erpObject.database,
                },
              }
            )
              .then((response) => response.json())
              .then(async (result) => {
                if (result.tproduct.length === 0) {
                  testNOtes += `There is no newly added Products in TrueERP.\n`;
                  templateObject.setLogFunction(testNOtes);
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
                let formatting = responseCount > 1 ? "Products" : "Product";
                testNOtes +=
                  `Received ` +
                  responseCount +
                  ` ${formatting} from TrueERP.\n`;

                testNOtes += `Adding ${formatting} to Zoho CRM \n`;
                templateObject.setLogFunction(testNOtes);
                function sleep(ms) {
                  return new Promise((resolve) =>
                    setTimeout(resolve, ms || DEF_DELAY)
                  );
                }

                // token = jQuery("#zoho_access_token").val();

                const reqData = {
                  auth: token,
                  module: "Products",
                  datacenter: datacenter,
                  fieldName: "GlobalRef",
                  data: {
                    fields:[{
                      field_label: "GlobalRef",
                      data_type: "text"
                    }]
                  }
                };

                //Check GlobalRef existence
                const resultPromise = await new Promise((resolve, reject) => {

                  Meteor.call("checkFieldExistence", reqData, (error, result) => {
                    if (error) {
                      console.log(error);
                      reject(error);
                    } else {
                      console.log(result);
                      resolve(result);
                    }
                  });

                });

                // Process the resultPromise
                if (resultPromise) {
                  if(!resultPromise) {
                    const resultPromise = await new Promise((resolve, reject) => {

                      Meteor.call("addcustomFields", reqData, (error, result) => {
                        if (error) {
                          reject(error);
                        } else {
                          resolve(result);
                        }
                      });

                    });

                    if (resultPromise.data) {
                      testNOtes += `${reqData.module} field has been added in Products module!\n`;
                      templateObject.setLogFunction(testNOtes);
                    } else {
                      console.log(resultPromise);
                      testNOtes += `${reqData.module} field adding Failed!\n`;
                      templateObject.setLogFunction(testNOtes);
                    }

                  }
                } else if(!resultPromise) {
                  testNOtes += `${reqData.fieldName} field already exists!\n`;
                  templateObject.setLogFunction(testNOtes);
                } else {
                  console.error('Error:', resultPromise);
                  testNOtes += `Checking Field existing Failed!\n`;
                  testNOtes += `Failed!!!\n`;
                  templateObject.setLogFunction(testNOtes);
                }

                let postData = [responseCount];
                for (let i = 0; i < responseCount; i++) {
                  // postData[i] = {};

                  let tempNote = testNOtes;

                  console.log(resultData);
                  postData[i] = {
                    Product_Name: resultData[i]?.ProductName,
                    Product_Code: resultData[i]?.PRODUCTCODE,
                    Description: resultData[i]?.SalesDescription,
                    Product_Active: resultData[i]?.Active,
                    Qty_Ordered: resultData[i]?.TotalQtyonOrder,
                    Qty_in_Stock: resultData[i]?.TotalQtyInStock,
                    Unit_Price: resultData[i]?.WHOLESALEPRICE,
                    GlobalRef: resultData[i]?.GlobalRef,
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
                  const endIdx = Math.min(startIdx + batchSize, postData.length);
                  const batchData = postData.slice(startIdx, endIdx);
                  console.log(batchData);
                  args.data = batchData;

                  const resultProductsPromise = await new Promise((resolve, reject) => {
                    console.log(args);
                    Meteor.call("updateZohoProducts", args, (error, result) => {
                      if (error) {
                        reject(error);
                      } else {
                        console.log(result);
                        resolve(result);
                      }
                    });

                  });
                  console.log(resultProductsPromise.data);
                  if (resultProductsPromise.data) {
                    upload_transaction_count += resultProductsPromise.data.length;
                    upload_num += resultProductsPromise.data.length;
                    testNOtes += `${upload_num} Products Transfer Successfully!\n`;
                    templateObject.setLogFunction(testNOtes);
                  } else {
                    console.log(resultProductsPromise);
                    testNOtes += `Products transfer Failed!\n`;
                    templateObject.setLogFunction(testNOtes);
                  }

                }

                transaction_details.push({
                  detail_string:
                    "Uploaded Products from TrueERP to Zoho",
                  count: upload_num,
                });


                let tempDate = new Date();
                let dateString =
                  tempDate.getUTCFullYear() +
                  "/" +
                  ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) +
                  "/" +
                  ("0" + tempDate.getUTCDate()).slice(-2) +
                  " " +
                  ("0" + tempDate.getUTCHours()).slice(-2) +
                  ":" +
                  ("0" + tempDate.getUTCMinutes()).slice(-2) +
                  ":" +
                  ("0" + tempDate.getUTCSeconds()).slice(-2);
                let argsDate = {
                  id: FlowRouter.current().queryParams.id,
                  last_ran_date: dateString,
                };
                await fetch(`/api/updateLastRanDate`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(argsDate),
                })
                  .then((response) => response.json())
                  .then(async (result) => {
                    console.log(result);
                  })
                  .catch((err) => console.log(err));
              }

              })
              .catch((error) => {
                console.log(error)
                testNOtes += `An error occurred while receiving a Products from TrueERP database\n`;
                templateObject.setLogFunction(testNOtes);
              });
          }

          if (ERP_QuotesState) {
            testNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
            templateObject.setLogFunction(testNOtes);
            testNOtes += "Processing Quotes.........\n";
            templateObject.setLogFunction(testNOtes);
            await sleep(1000);
            testNOtes += "Getting TrueERP Quotes ..................\n";
            templateObject.setLogFunction(testNOtes);
            await fetch(
              erpObject.base_url +
                // `/TQuote?Listtype=detail&select=[MsTimeStamp]>"${lstUpdateTime}"`,
                `/TQuote?Listtype=detail&LimitCount=25`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Username: erpObject.user_name,
                  Password: erpObject.password,
                  Database: erpObject.database,
                },
              }
            )
              .then((response) => response.json())
              .then(async (result) => {
                if (result.tquote.length === 0) {
                  testNOtes += `There is no newly added Quote in TrueERP.\n`;
                  templateObject.setLogFunction(testNOtes);
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
                testNOtes +=
                  `Received ` +
                  responseCount +
                  ` ${formatting} from TrueERP.\n`;

                testNOtes += `Adding ${formatting} to Zoho CRM \n`;
                templateObject.setLogFunction(testNOtes);
                function sleep(ms) {
                  return new Promise((resolve) =>
                    setTimeout(resolve, ms || DEF_DELAY)
                  );
                }

                // token = jQuery("#zoho_access_token").val();

                const reqData = {
                  auth: token,
                  module: "Quotes",
                  datacenter: datacenter,
                  fieldName: "GlobalRef",
                  data: {
                    fields:[{
                      field_label: "GlobalRef",
                      data_type: "text"
                    }]
                  }
                };

                //Check GlobalRef existence
                const resultPromise = await new Promise((resolve, reject) => {

                  Meteor.call("checkFieldExistence", reqData, (error, result) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve(result);
                    }
                  });

                });

                // Process the resultPromise
                if (resultPromise) {
                  if(!resultPromise) {
                    const resultPromise = await new Promise((resolve, reject) => {

                      Meteor.call("addcustomFields", reqData, (error, result) => {
                        if (error) {
                          reject(error);
                        } else {
                          resolve(result);
                        }
                      });

                    });

                    if (resultPromise.data) {
                      testNOtes += `${reqData.module} field has been added in Quotes module!\n`;
                      templateObject.setLogFunction(testNOtes);
                    } else {
                      console.log(resultPromise);
                      testNOtes += `${reqData.module} field adding Failed!\n`;
                      templateObject.setLogFunction(testNOtes);
                    }

                  }
                } else if(!resultPromise) {
                  testNOtes += `${reqData.fieldName} field already exists!\n`;
                  templateObject.setLogFunction(testNOtes);
                } else {
                  console.error('Error:', resultPromise);
                  testNOtes += `Checking Field existing Failed!\n`;
                  testNOtes += `Failed!!!\n`;
                  templateObject.setLogFunction(testNOtes);
                }

                let postData = [];
                for (let i = 0; i < responseCount; i++) {
                  const productList = [];
                  if(!resultData[i].fields.Lines) {
                    continue;
                  }
                  for (let j = 0; j < resultData[i].fields.Lines.length; j++) {
                    const productreqData = {
                      auth: token,
                      datacenter: datacenter,
                      productName:
                        resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g, ''),
                      productID: resultData[i]?.fields?.Lines[j]?.fields?.ProductID,
                    };
                    if (!productreqData.productName) {
                      productreqData.productName = "Temp product";
                    }
                    const resultPromiseProductDetect = await new Promise(
                      (resolve, reject) => {
                        Meteor.call(
                          "getZohoProduct",
                          productreqData,
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

                    if (resultPromiseProductDetect.data) {
                      if (resultPromiseProductDetect.data.length > 0) {
                        // testNOtes += `Product Name "${productreqData.productName}" already exits in ZOHO\n`;
                        productList.push({
                          product: {
                            name: resultData[i]?.fields?.Lines[j]?.fields
                              ?.ProductName,
                            id: resultPromiseProductDetect.data[0].id
                          },
                          quantity:
                            resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                          price:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                          product_description:
                            resultData[i]?.fields?.Lines[j].fields
                              ?.ProductDescription,
                        });
                      } else {
                        const addProduct2Zotorequest = {
                          auth: token,
                          data: [
                            {
                              Product_Name:
                                resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g, ''),
                              Description:
                                resultData[i]?.fields?.Lines[j]?.fields?.ProductDescription,
                                GlobalRef: resultData[i]?.fields?.Lines[j]?.fields?.GlobalRef
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
                          testNOtes += `${addProduct2Zotorequest.data[0].Product_Name}` + ` has been added in ZOHO\n`;
                          templateObject.setLogFunction(testNOtes);
                          productList.push({
                            product: {
                              name: resultData[i]?.fields?.Lines[j]?.fields
                                ?.ProductName,
                              id: resultPromiseProduct.data[0].details.id
                            },
                            quantity:
                              resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                          price:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                            product_description:
                              resultData[i]?.fields?.Lines[j].fields
                                ?.ProductDescription,
                          });
                        } else {
                          testNOtes += `${resultPromiseProduct}`;
                          templateObject.setLogFunction(testNOtes);
                        }
                      }
                    } else {
                      const addProduct2Zotorequest = {
                        auth: token,
                        data: [
                          {
                            Product_Name:
                              resultData[i]?.fields?.Lines[j]?.fields?.ProductName.replace(/[\[\]()]/g, ''),
                            Description:
                              resultData[i]?.fields?.Lines[j]?.fields?.ProductDescription,
                              GlobalRef: resultData[i]?.fields?.Lines[j]?.fields?.GlobalRef
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
                        testNOtes += `${addProduct2Zotorequest.data[0].Product_Name} has been added in ZOHO\n`;
                        templateObject.setLogFunction(testNOtes);
                        productList.push({
                          product: {
                            name: resultData[i]?.fields?.Lines[j]?.fields
                              ?.ProductName,
                            id: resultPromiseProduct.data[0].details.id
                          },
                          quantity:resultData[i]?.fields?.Lines[j].fields?.OrderQty,
                          price:resultData[i]?.fields?.Lines[j].fields?.LinePriceInc,
                          product_description:
                            resultData[i]?.fields?.Lines[j].fields
                              ?.ProductDescription,
                        });
                      } else {
                        console.log(resultPromiseProduct);
                        testNOtes += `${resultPromiseProduct}`;
                        templateObject.setLogFunction(testNOtes);
                      }

                    }
                  }


                  const accountreqData = {
                    auth: token,
                    datacenter: datacenter,
                    Account_Name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g, ''),
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

                  if (resultPromiseAccountDetect.data) {
                    if (resultPromiseAccountDetect.data.length > 0) {
                      testNOtes += `Account Name "${accountreqData.Account_Name}" already exists in ZOHO\n`;
                      templateObject.setLogFunction(testNOtes);
                      accountID = resultPromiseAccountDetect.data[0].id;
                    } else {
                      const addAccount2Zotorequest = {
                        auth: token,
                        data: [
                          {
                            Account_Name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g, ''),
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
                        testNOtes += `Account ${addAccount2Zotorequest.data[0].Account_Name} has been added in ZOHO\n`;
                        templateObject.setLogFunction(testNOtes);
                        accountID = resultPromiseAccount.data[0].id;
                      } else {
                        console.log(error);
                        testNOtes += `${error.message}`;
                        templateObject.setLogFunction(testNOtes);
                      }
                    }
                  } else {
                    const addAccount2Zotorequest = {
                      auth: token,
                      data: [
                        {
                          Account_Name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g, ''),
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
                      testNOtes += `Account ${addAccount2Zotorequest.data[0].Account_Name} has been added in ZOHO\n`;
                      templateObject.setLogFunction(testNOtes);
                      accountID = resultPromiseAccount.data[0].id;
                    } else {
                      console.log(resultPromiseAccount);
                    }
                  }

                  postData.push({
                    Account_Name: {
                      name: resultData[i]?.fields?.ClientName.replace(/[\[\]()]/g, ''),
                      id: accountID,
                    },
                    Product_Details: productList,
                    GlobalRef: resultData[i]?.fields?.GlobalRef,
                    // Subject: resultData[i]?.fields?.ShipToDesc,
                    Subject: resultData[i]?.fields?.GlobalRef
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
                  const endIdx = Math.min(startIdx + batchSize, postData.length);
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
                      upload_transaction_count += resultQuotes.data.length;
                      upload_num += resultQuotes.data.length;
                      testNOtes += `Quotes transfer Success!\n`;
                    } else {
                      testNOtes += `Quotes transfer Failed!\n${result.message}\n`;
                    }
                    templateObject.setLogFunction(testNOtes);
                  } else {
                    console.log(resultQuotes)
                    testNOtes += `Quotes transfer Failed!\n`;
                    testNOtes += `Failed!!!\n`;
                    templateObject.setLogFunction(testNOtes);
                  }

                }
                transaction_details.push({
                  detail_string:
                    "Uploaded Quotes from TrueERP to Zoho",
                  count: upload_num,
                });


                let tempDate = new Date();
                let dateString =
                  tempDate.getUTCFullYear() +
                  "/" +
                  ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) +
                  "/" +
                  ("0" + tempDate.getUTCDate()).slice(-2) +
                  " " +
                  ("0" + tempDate.getUTCHours()).slice(-2) +
                  ":" +
                  ("0" + tempDate.getUTCMinutes()).slice(-2) +
                  ":" +
                  ("0" + tempDate.getUTCSeconds()).slice(-2);
                let argsDate = {
                  id: FlowRouter.current().queryParams.id,
                  last_ran_date: dateString,
                };
                await fetch(`/api/updateLastRanDate`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(argsDate),
                }).then((response) => response.json()).then(async (result) => {
                    console.log(result);
                  }).catch((err) => console.log(err));

              }

              })
              .catch((error) => {
                console.log(error)
                testNOtes += `An error occurred while receiving a Quotes from TrueERP database\n`;
                templateObject.setLogFunction(testNOtes);
              });
          }



            let account_id = 7;
            let connection_id = 13;
            let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

            // let year = today.getFullYear();
            // let month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
            // let day = String(today.getDate()).padStart(2, "0");

            // let formattedDate = `${year}-${month}-${day}`;
            let formattedDate = moment(today).format("YYYY-MM-DD");
            let id = FlowRouter.current().queryParams.id;

            let products_num =
              upload_transaction_count +
              download_transaction_count;
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
                    transaction_data.products_num +
                    result.products_num;
                  transaction_data.uploaded_num =
                    transaction_data.uploaded_num +
                    result.uploaded_num;
                  transaction_data.downloaded_num =
                    transaction_data.downloaded_num +
                    result.downloaded_num;
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
                        date: today
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
                        date: today
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
        }
      );

    }) . catch ((error) => {
      console.log(error);
    })

}

async function Zoho2TrueERP(
  ERP_QuotesState = false,
  ERP_SalesState = false,
  ERP_LeadsState = false,
  ERP_CustomerState = false
) {
  if (
    ERP_CustomerState === false &&
    ERP_SalesState === false &&
    ERP_QuotesState === false &&
    ERP_LeadsState === false
  ) {
    return;
  }

  const templateObject = Template.instance();
  let tempConnection;
  let lstUpdateTime = new Date();
  let selConnectionId = FlowRouter.current().queryParams.id;

  fetch('/api/connectionsByID', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({id: selConnectionId})
    })
    .then(response => response.json())
    .then(async (connectionResult) => {
      lstUpdateTime = moment(connectionResult[0]?.last_ran_date).tz("Australia/Brisbane").subtract(1, 'hours').format("YYYY-MM-DD HH:mm:ss");

      const postData = {
        id: FlowRouter.current().queryParams.customerId,
      };
      var responseCount = 0;
      let customerCount = 0;
      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms || DEF_DELAY));
      }
      var testNOtes = "Connecting to ZOHO database..";
      await sleep(300);
      templateObject.setLogFunction(testNOtes);
      testNOtes = "Connecting to ZOHO database.......";
      await sleep(300);
      templateObject.setLogFunction(testNOtes);
      testNOtes = "Connecting to ZOHO database..........";
      await sleep(300);
      templateObject.setLogFunction(testNOtes);
      testNOtes = "Connecting to ZOHO database.............";
      await sleep(300);
      templateObject.setLogFunction(testNOtes);
      testNOtes = "Connecting to ZOHO database................";
      await sleep(300);
      templateObject.setLogFunction(testNOtes);
      testNOtes = "Connecting to ZOHO database...................";
      await sleep(300);
      templateObject.setLogFunction(testNOtes);
      testNOtes = "Connecting to ZOHO database........................";
      await sleep(300);
      templateObject.setLogFunction(testNOtes);
      testNOtes = "Connecting to ZOHO database.........................\n";
      templateObject.setLogFunction(testNOtes);

      var token = null;

      let zohoData = {};
      zohoData.clientid = jQuery('#zoho_client_id').val();
      zohoData.clientsecret = jQuery('#zoho_client_secret').val();
      zohoData.redirect_uri = jQuery('#zoho_redirect_uri').val();
      const CLIENT_ID = zohoData.clientid;
      const REDIRECT_URI = zohoData.redirect_uri;
      const RESPONSE_TYPE = 'token';
      const SCOPE = 'ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.users.ALL,ZohoSearch.securesearch.READ';

      const authorizationUrl = `https://accounts.zoho.com/oauth/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=token`;

      const username = jQuery('#zoho_username').val();
      const zohopass = jQuery('#zoho_password').val();

      const clientAccessToken = jQuery('#zoho_access_token').val();
      console.log(username);
      console.log(clientAccessToken);
      /*
      const tokenPromise = await new Promise((resolve, reject) => {
        Meteor.call("getZohoAccessToken", authorizationUrl, username, zohopass, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      })
      */

      //if (tokenPromise) {
        token = clientAccessToken;
        datacenter = datacenter;
        testNOtes += "Got token";
        templateObject.setLogFunction(testNOtes);
      //}

      HTTP.call("post","/api/getAccSoftt",
        {
          data: {
            id: postData.id,
          }
        },
        async (error, res) => {
          let erpObject;
          if (error) {
            testNOtes += "Can't connect to TrueERP database\n";
            templateObject.setLogFunction(testNOtes);
            return;
          } else {
            await fetch('/api/ZohoByID', {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json'
              },
              body: JSON.stringify({id: FlowRouter.current().queryParams.customerId})
              })
              .then(response => response.json())
              .then(async (ZohoClient) => {

                erpObject = res.data[0];

                let upload_transaction_count = 0;
                let download_transaction_count = 0;
                let transaction_details = [];

                // let token = ZohoClient[0].access_token;

                console.log("token : ", token)
                const resultUser = await new Promise(
                  (resolve, reject) => {
                    Meteor.call(
                      "getZohoCurrentUser",
                      {auth: token, datacenter: datacenter},
                      (error, result) => {
                        if (error) {
                          reject(error);
                        } else {
                          resolve(result);
                        }
                      }
                    )
                  }
                )

                if (resultUser) {
                  lstUpdateTime = encodeURIComponent(moment(connectionResult[0].last_ran_date).tz(result.users[0].time_zone).subtract(1, 'hours').format("YYYY-MM-DDTHH:mm:ssZ"))
                }

                // await fetch("https://www.zohoapis.${datacenter}/crm/v2/users?type=CurrentUser", {
                //   method: "GET",
                //   headers: {
                //     Authorization: `Zoho-oauthtoken ${token}`,
                //     "Content-Type": "application/json",
                //   },
                // })
                //   .then((response) => response.json())
                //   .then(async (result) => {
                //     if(result.users.length > 0) {
                //       lstUpdateTime = encodeURIComponent(moment(connectionResult[0].last_ran_date).tz(result.users[0].time_zone).subtract(1, 'hours').format("YYYY-MM-DDTHH:mm:ssZ"))
                //     }
                //   })
                //   .catch((error) => {console.log(error)});

                if (ERP_QuotesState) {
                  testNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
                  templateObject.setLogFunction(testNOtes);
                  testNOtes += "Processing Quotes.........\n";
                  templateObject.setLogFunction(testNOtes);
                  const args = {
                    auth: token,
                    data: {
                      module: "Quotes",
                      lstTime: lstUpdateTime
                    },
                    datacenter: datacenter
                  }
                  const resultQuotes = await new Promise(
                    (resolve, reject) => {
                      Meteor.call(
                        "getDatafromZohoByDate",
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

                if (resultQuotes) {
                    const ids = resultQuotes.data.map((quote) => {
                      return quote.id
                    });
                    let combinedIds = ids.join(",");

                    await fetch(`https://www.zohoapis.${datacenter}/crm/v2/Quotes?${combinedIds}`, {
                      method: "GET",
                      headers: {
                        Authorization: `Zoho-oauthtoken ${token}`,
                        "Content-Type": "application/json",
                      },
                    })
                      .then((response) => response.json())
                      .then(async (result) => {
                        if (result.data.length === 0) {
                          testNOtes += `There is no newly added Quote in ZOHO.\n`;
                          templateObject.setLogFunction(testNOtes);
                        } else {
                          responseCount = result.data.length;
                          var resultData = result.data;
                          let formatting = responseCount > 1 ? "Quotes" : "Quote";
                          testNOtes +=
                            `Received ` +
                            responseCount +
                            ` ${formatting} from Zoho.\n`;

                          testNOtes += `Adding ${formatting} to TrueERP \n`;
                          templateObject.setLogFunction(testNOtes);

                          let upload_num = 0;

                          for (let i = 0; i < responseCount; i++) {
                            let tempCount = i%10;
                            let count = tempCount === 0 ? `${i+1}st` : tempCount === 1 ? `${i+1}nd` : tempCount === 2 ? `${i+1}rd` : `${i+1}th`;
                            testNOtes += `Adding ${count} Quote to ERP database.\n`;
                            templateObject.setLogFunction(testNOtes);
                            const clientName = resultData[i]?.Account_Name?.name;
                            let clientId;
                            testNOtes += `Checking Customer in the TrueERP database for ClientName : ${clientName}...\n`;
                            templateObject.setLogFunction(testNOtes);
                            await fetch(
                              `${erpObject.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
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
                                  testNOtes += `Found the Customer as ID : ${clientId}\n`;
                                  templateObject.setLogFunction(testNOtes);
                                } else {
                                  testNOtes += `Not Existing Customer, creating...\n`;
                                  templateObject.setLogFunction(testNOtes);
                                  const tempCustomerDetailtoERP = {
                                    type: "TCustomer",
                                    fields: {
                                      ClientName: resultData[i].Account_Name.name,
                                      Country:resultData[i].Billing_Country || "",
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
                                      testNOtes += `Added a new customer to TrueERP database with ID : ${clientId}.\n`;
                                      templateObject.setLogFunction(testNOtes);
                                    })
                                    .catch((error) =>
                                      console.log("error", error)
                                    );
                                }
                              })
                              .catch(() => {
                                testNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                templateObject.setLogFunction(testNOtes);
                              });

                            //check if the product exists and add if not
                            const productList = resultData[i]?.Product_Details;
                            const productIdList = [];
                            const productQtyList = [];
                            testNOtes += `There are ${productList.length} products in the Product_Details.\n`;
                            templateObject.setLogFunction(testNOtes);

                            for (const product of productList) {
                              testNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.product?.name}...\n`;
                              templateObject.setLogFunction(testNOtes);
                              await fetch(
                                `${erpObject.base_url}/TProduct?select=[ProductName]="${product?.product?.name}"`,
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
                                    testNOtes += `Found the Product as ID : ${productId}\n`;
                                    templateObject.setLogFunction(testNOtes);
                                    productIdList.push(productId);
                                    productQtyList.push(product?.quantity);
                                  }
                                  // } else {
                                  //   testNOtes += `Not Existing Product, creating...\n`;
                                  //   templateObject.setLogFunction(testNOtes);

                                  //   let args = {
                                  //     productID: product?.product?.id,
                                  //     auth: token,
                                  //   };
                                  //   // get product by id from Zoho
                                  //   const productListFromZOHO = await new Promise(
                                  //     (resolve, reject) => {
                                  //       Meteor.call(
                                  //         "getZohoProductByID",
                                  //         args,
                                  //         (error, result) => {
                                  //           if (error) {
                                  //             reject(error);
                                  //           } else {
                                  //             resolve(result);
                                  //           }
                                  //         }
                                  //       );
                                  //     }
                                  //   );

                                  //   if (productListFromZOHO.data) {
                                  //     console.log(productListFromZOHO);
                                  //     testNOtes += `Product ${productListFromZOHO.data[0].id} Success!\n`;

                                  //     templateObject.setLogFunction(testNOtes);

                                  //     const productFromZoho =
                                  //       productListFromZOHO.data[0];

                                  //     const tempProductDetailtoERP = {
                                  //       type: "TProductWeb",
                                  //       fields: {
                                  //         ProductType: "INV",
                                  //         ProductName:
                                  //           productFromZoho?.Product_Name,
                                  //         SalesDescription:
                                  //           productFromZoho.Description || "",
                                  //         AssetAccount: "Inventory Asset",
                                  //         CogsAccount: "Cost of Goods Sold",
                                  //         IncomeAccount: "Sales",
                                  //         PRODUCTCODE:
                                  //           productFromZoho.Product_Code || "",
                                  //         TaxCodePurchase: "NCG",
                                  //         TaxCodeSales: "GST",
                                  //         UOMPurchases: "Units",
                                  //         UOMSales: "Units",
                                  //       },
                                  //     };

                                  //     if (productFromZoho.GlobalRef) {
                                  //       tempProductDetailtoERP.fields.GlobalRef =
                                  //         productFromZoho.GlobalRef;
                                  //     }

                                  //     console.log(tempProductDetailtoERP);

                                  //     await fetch(
                                  //       `${erpObject.base_url}/TProductWeb`,
                                  //       {
                                  //         method: "POST",
                                  //         headers: {
                                  //           Username: erpObject.user_name,
                                  //           Password: erpObject.password,
                                  //           Database: erpObject.database,
                                  //           "Content-Type": "application/json",
                                  //         },
                                  //         redirect: "follow",
                                  //         body: JSON.stringify(
                                  //           tempProductDetailtoERP
                                  //         ),
                                  //       }
                                  //     )
                                  //       .then((response) => response.json())
                                  //       .then(async (result) => {
                                  //         const tempProductId =
                                  //           result?.fields?.ID;
                                  //         testNOtes += `Added a new product to TrueERP database with ID : ${tempProductId}.\n`;
                                  //         templateObject.setLogFunction(testNOtes);
                                  //         productIdList.push(tempProductId);
                                  //         productQtyList.push(product?.quantity);
                                  //       })
                                  //       .catch((error) =>
                                  //         console.log("error", error)
                                  //       );
                                  //   } else {
                                  //     console.log(productListFromZOHO);
                                  //     testNOtes += `product searching by id Failed!\n`;
                                  //     testNOtes += `Failed!!!\n`;
                                  //     templateObject.setLogFunction(testNOtes);
                                  //   }
                                  // }
                                  // productQtyList.push(product?.quantity)
                                })
                                .catch(() => {
                                  testNOtes += `Error while getting Product Id from the TrueERP database.\n`;
                                  templateObject.setLogFunction(testNOtes);
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
                              },
                            };

                            if(resultData[i]?.GlobalRef) {
                              QuoteData.fields.GlobalRef = resultData[i].GlobalRef
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
                                console.log(result);
                                upload_transaction_count += 1;
                                upload_num += 1;
                                testNOtes += `Quotes transfer Success!\n`;

                                templateObject.setLogFunction(testNOtes);
                              })
                              .catch((error) => {
                                console.log(error);
                                testNOtes += `Quotes transfer Failed!\n`;
                                testNOtes += `Failed!!!\n`;
                                templateObject.setLogFunction(testNOtes);
                              });
                          }

                          transaction_details.push({
                            detail_string:
                              "Downloaded Quotes from Zoho to TrueERP",
                            count: upload_num,
                          });

                          let tempDate = new Date();
                          let dateString =
                            tempDate.getUTCFullYear() +
                            "/" +
                            ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) +
                            "/" +
                            ("0" + tempDate.getUTCDate()).slice(-2) +
                            " " +
                            ("0" + tempDate.getUTCHours()).slice(-2) +
                            ":" +
                            ("0" + tempDate.getUTCMinutes()).slice(-2) +
                            ":" +
                            ("0" + tempDate.getUTCSeconds()).slice(-2);
                          let argsDate = {
                            id: FlowRouter.current().queryParams.id,
                            last_ran_date: dateString,
                          };
                          await fetch(`/api/updateLastRanDate`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify(argsDate),
                          })
                            .then((response) => response.json())
                            .then(async (result) => {
                              console.log(result);
                            })
                            .catch((err) => console.log(err));
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                        testNOtes += `An error occurred while receiving a Quotes from Zoho\n`;
                        templateObject.setLogFunction(testNOtes);
                      });


                  } else {
                    testNOtes += `There is no newly added Quote in ZOHO.\n`;
                    templateObject.setLogFunction(testNOtes);
                  }


                }

                if (ERP_SalesState) {
                  testNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
                  templateObject.setLogFunction(testNOtes);
                  testNOtes += "Processing Sales Orders.........\n";
                  templateObject.setLogFunction(testNOtes);
                  const args = {
                    auth: token,
                    data: {
                      module: "Sales_Orders",
                      lstTime: lstUpdateTime
                    },
                    datacenter: datacenter
                  }
                  const resultOrders = await new Promise(
                    (resolve, reject) => {
                      Meteor.call(
                        "getDatafromZohoByDate",
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

                  if (resultOrders) {
                    const ids = resultOrders.data.map((order) => {
                      return order.id
                    });
                    let combinedIds = ids.join(",");

                    await fetch(`https://www.zohoapis.${datacenter}/crm/v2/Sales_Orders?${combinedIds}`, {
                      method: "GET",
                      headers: {
                        Authorization: `Zoho-oauthtoken ${token}`,
                        "Content-Type": "application/json",
                      },
                    })
                      .then((response) => response.json())
                      .then(async (result) => {
                        if (result.data.length === 0) {
                          testNOtes += `There is no newly added Sales Order in ZOHO.\n`;
                          templateObject.setLogFunction(testNOtes);
                      } else {
                        responseCount = result.data.length;
                        var resultData = result.data;
                        // download_transaction_count += responseCount;
                        // transaction_details.push({
                        //   detail_string:
                        //     "Downloaded Sales Orders from Zoho to TrueERP",
                        //   count: responseCount,
                        // });
                        let formatting = responseCount > 1 ? "Sales Orders" : "Sales Order";
                        testNOtes +=
                          `Received ` + responseCount + ` ${formatting} from Zoho.\n`;

                        testNOtes += `Adding ${formatting} to TrueERP \n`;
                        templateObject.setLogFunction(testNOtes);

                        let upload_num = 0;

                        for (let i = 0; i < responseCount; i++) {
                          let tempCount = i%10;
                          let count = tempCount === 0 ? `${i+1}st` : tempCount === 1 ? `${i+1}nd` : tempCount === 2 ? `${i+1}rd` : `${i+1}th`;
                          testNOtes += `Adding ${count} Sales Order to ERP database.\n`;
                          templateObject.setLogFunction(testNOtes);

                          const clientName = resultData[i]?.Account_Name?.name;
                          let clientId
                          testNOtes += `Checking Customer in the TrueERP database for ClientName : ${clientName}...\n`;
                          templateObject.setLogFunction(testNOtes);
                          await fetch(`${erpObject.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
                              {
                                  method: 'GET',
                                  headers: {
                                    Username: erpObject.user_name,
                                    Password: erpObject.password,
                                    Database: erpObject.database,
                                    "Content-Type": "application/json",
                                  },
                                  redirect: 'follow'
                              })
                              .then(response => response.json())
                              .then(async result => {
                                  if (result?.tcustomer.length > 0) {
                                      clientId = result?.tcustomer[0]?.Id
                                      testNOtes += `Found the Customer as ID : ${clientId}\n`;
                                      templateObject.setLogFunction(testNOtes);
                                  } else {
                                      testNOtes += `Not Existing Customer, creating...\n`;
                                      templateObject.setLogFunction(testNOtes);
                                      const tempCustomerDetailtoERP = {
                                          type: "TCustomer",
                                          fields: {
                                              ClientName: resultData[i].Account_Name.name,
                                              Country: resultData[i].Billing_Country || "",
                                              State: resultData[i].Billing_State || "",
                                              Street: resultData[i].Billing_Street || "",
                                              Postcode: resultData[i].Billing_Code || ""
                                          }
                                      }
                                      console.log(tempCustomerDetailtoERP,"tempCustomer")
                                      await fetch(`${erpObject.base_url}/TCustomer`,
                                          {
                                              method: 'POST',
                                              headers: {
                                                Username: erpObject.user_name,
                                                Password: erpObject.password,
                                                Database: erpObject.database,
                                                "Content-Type": "application/json",
                                              },
                                              redirect: 'follow',
                                              body: JSON.stringify(tempCustomerDetailtoERP)
                                          })
                                          .then(response => {console.log(response); response.json()} )
                                          .then(async result => {
                                              clientId = result?.fields?.ID
                                              testNOtes += `Added a new customer to TrueERP database with ID : ${clientId}.\n`;
                                              templateObject.setLogFunction(testNOtes);
                                          })
                                          .catch(error => console.log('error', error));
                                  }
                              })
                              .catch(() => {
                                  testNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                  templateObject.setLogFunction(testNOtes);
                              })

                          //check if the product exists and add if not
                          const productList = resultData[i]?.Product_Details
                          const productIdList = []
                          const productQtyList = []
                          testNOtes += `There are ${productList.length} products in the Product_Details.\n`;
                          templateObject.setLogFunction(testNOtes);

                          for (const product of productList) {
                              testNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.product?.name}...\n`;
                              templateObject.setLogFunction(testNOtes);
                              await fetch(`${erpObject.base_url}/TProduct?select=[ProductName]="${product?.product?.name}"`,
                                  {
                                      method: 'GET',
                                      headers: {
                                        Username: erpObject.user_name,
                                        Password: erpObject.password,
                                        Database: erpObject.database,
                                        "Content-Type": "application/json",
                                      },
                                      redirect: 'follow'
                                  })
                                  .then(response => response.json())
                                  .then(async result => {
                                      if (result?.tproduct.length > 0) {
                                          const productId = result?.tproduct[0]?.Id
                                          testNOtes += `Found the Product as ID : ${productId}\n`;
                                          templateObject.setLogFunction(testNOtes);
                                          productIdList.push(productId)
                                          productQtyList.push(product?.quantity)
                                      }
                                      // } else {
                                      //     testNOtes += `Not Existing Product, creating...\n`;
                                      //     templateObject.setLogFunction(testNOtes);

                                      //     let args = {
                                      //       productID: product?.product?.id,
                                      //       auth: token
                                      //     }
                                      //   // get product by id from Zoho
                                      //     const productListFromZOHO = await new Promise(
                                      //       (resolve, reject) => {
                                      //         Meteor.call(
                                      //           "getZohoProductByID",
                                      //           args,
                                      //           (error, result) => {
                                      //             if (error) {
                                      //               reject(error);
                                      //             } else {
                                      //               resolve(result);
                                      //             }
                                      //           }
                                      //         );
                                      //       }
                                      //     );

                                      //     if (productListFromZOHO.data) {

                                      //       console.log(productListFromZOHO)
                                      //       testNOtes += `Product ${productListFromZOHO.data[0].id} Success!\n`;

                                      //       templateObject.setLogFunction(testNOtes);

                                      //       const productFromZoho = productListFromZOHO.data[0];

                                      //             const tempProductDetailtoERP = {
                                      //                 type: "TProductWeb",
                                      //                 fields:
                                      //                 {
                                      //                     ProductType: "INV",
                                      //                     ProductName: productFromZoho?.Product_Name,
                                      //                     SalesDescription: productFromZoho.Description || "",
                                      //                     AssetAccount: "Inventory Asset",
                                      //                     CogsAccount: "Cost of Goods Sold",
                                      //                     IncomeAccount: "Sales",
                                      //                     PRODUCTCODE: productFromZoho.Product_Code || "",
                                      //                     TaxCodePurchase: "NCG",
                                      //                     TaxCodeSales: "GST",
                                      //                     UOMPurchases: "Units",
                                      //                     UOMSales: "Units",
                                      //                 }
                                      //             }

                                      //             if(productFromZoho.GlobalRef) {
                                      //               tempProductDetailtoERP.fields.GlobalRef = productFromZoho.GlobalRef
                                      //             }

                                      //             console.log(tempProductDetailtoERP)

                                      //             await fetch(`${erpObject.base_url}/TProductWeb`,
                                      //                 {
                                      //                     method: 'POST',
                                      //                     headers: {
                                      //                       Username: erpObject.user_name,
                                      //                       Password: erpObject.password,
                                      //                       Database: erpObject.database,
                                      //                       "Content-Type": "application/json",
                                      //                     },
                                      //                     redirect: 'follow',
                                      //                     body: JSON.stringify(tempProductDetailtoERP)
                                      //                 })
                                      //                 .then(response => response.json())
                                      //                 .then(async result => {
                                      //                     const tempProductId = result?.fields?.ID
                                      //                     testNOtes += `Added a new product to TrueERP database with ID : ${tempProductId}.\n`;
                                      //                     templateObject.setLogFunction(testNOtes);
                                      //                     productIdList.push(tempProductId)
                                      //                     productQtyList.push(product?.quantity)
                                      //                 })
                                      //                 .catch(error => console.log('error', error));
                                      //     } else {
                                      //       console.log(productListFromZOHO)
                                      //       testNOtes += `product searching by id Failed!\n`;
                                      //       testNOtes += `Failed!!!\n`;
                                      //       templateObject.setLogFunction(testNOtes);
                                      //     }

                                      // }
                                      // productQtyList.push(product?.quantity)
                                  })
                                  .catch(() => {
                                      testNOtes += `Error while getting Product Id from the TrueERP database.\n`;
                                      templateObject.setLogFunction(testNOtes);
                                  })

                          }

                          // create a new Qutoes in ERP.

                          const OrderLines = [];

                          productIdList.forEach((item, index) => {
                              OrderLines.push({
                                  type: "TSalesOrderLine",
                                  fields: {
                                      ProductID: item,
                                      OrderQty: productQtyList[index]
                                  }
                              })
                          })
                          if (OrderLines.length === 0) {
                              continue
                          }
                          const OrderData = {
                              type: "TSalesOrder",
                              fields: {
                                  CustomerID: clientId,
                                  Lines: OrderLines,
                                  IsBackOrder: true,
                                  Comments: "Sales Order Produced in ZOHO"
                              }
                          }

                          if(resultData[i]?.GlobalRef) {
                            OrderData.fields.GlobalRef = resultData[i].GlobalRef
                          }

                        await fetch("/api/updateTrueERP2", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                            data: OrderData,
                            Username: erpObject.user_name,
                            Password: erpObject.password,
                            Database: erpObject.database,
                            url: erpObject.base_url + "/TSalesOrder"
                          }),
                        })
                          .then((response) => response.json())
                          .then(async (result) => {
                            console.log(result);
                            upload_transaction_count += 1;
                            upload_num += 1;
                            testNOtes += `SalesOrder transfer Success!\n`;

                            templateObject.setLogFunction(testNOtes);
                          })
                          .catch((error) => {
                            console.log(error);
                            testNOtes += `SalesOrder transfer Failed!\n`;
                            testNOtes += `Failed!!!\n`;
                            templateObject.setLogFunction(testNOtes);
                          });
                        }

                        transaction_details.push({
                          detail_string:
                            "Downloaded Sales Orders from Zoho to TrueERP",
                          count: upload_num,
                        });

                        let tempDate = new Date();
                        let dateString =
                          tempDate.getUTCFullYear() +
                          "/" +
                          ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) +
                          "/" +
                          ("0" + tempDate.getUTCDate()).slice(-2) +
                          " " +
                          ("0" + tempDate.getUTCHours()).slice(-2) +
                          ":" +
                          ("0" + tempDate.getUTCMinutes()).slice(-2) +
                          ":" +
                          ("0" + tempDate.getUTCSeconds()).slice(-2);
                        let argsDate = {
                          id: FlowRouter.current().queryParams.id,
                          last_ran_date: dateString,
                        };
                        await fetch(`/api/updateLastRanDate`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(argsDate),
                        })
                          .then((response) => response.json())
                          .then(async (result) => {
                            console.log(result);
                          })
                          .catch((err) => console.log(err));
                      }

                      })
                      .catch((err) => {
                        testNOtes += `An error occurred while receiving a Sales Orders from Zoho\n`;
                        templateObject.setLogFunction(testNOtes);
                      });

                  } else {
                    testNOtes += `There is no newly added Sales Order in ZOHO.\n`;
                    templateObject.setLogFunction(testNOtes);
                  }

                }

                if (ERP_LeadsState) {
                  testNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
                  templateObject.setLogFunction(testNOtes);
                  testNOtes += "Processing Leads .........\n";
                  templateObject.setLogFunction(testNOtes);
                  const args = {
                    auth: token,
                    data: {
                      module: "Leads",
                      lstTime: lstUpdateTime
                    },
                    datacenter: datacenter
                  }
                  const resultLeads = await new Promise(
                    (resolve, reject) => {
                      Meteor.call(
                        "getDatafromZohoByDate",
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

                  if (resultLeads) {
                    const ids = resultLeads.data.map((lead) => {
                      return lead.id
                    });
                    let combinedIds = ids.join(",");

                    await fetch(`https://www.zohoapis.${datacenter}/crm/v2/Leads?${combinedIds}`, {
                      method: "GET",
                      headers: {
                        Authorization: `Zoho-oauthtoken ${token}`,
                        "Content-Type": "application/json",
                      },
                    })
                      .then((response) => response.json())
                      .then(async (result) => {
                        if (result.data.length === 0) {
                          testNOtes += `There is no newly added Lead in ZOHO.\n`;
                          templateObject.setLogFunction(testNOtes);
                      } else {
                        responseCount = result.data.length;
                        var resultData = result.data;
                        // download_transaction_count += responseCount;

                        // transaction_details.push({
                        //   detail_string:
                        //     "Downloaded Leads from Zoho to TrueERP",
                        //   count: responseCount,
                        // });

                        let formatting = responseCount > 1 ? "Leads" : "Lead";

                        testNOtes +=
                          `Received ` + responseCount + ` ${formatting} from Zoho.\n`;

                        testNOtes += `Adding ${formatting} to TrueERP \n`;
                        templateObject.setLogFunction(testNOtes);

                        let upload_num = 0;

                        for (let i = 0; i < responseCount; i++) {
                          let tempCount = i%10;
                          let count = tempCount === 0 ? `${i+1}st` : tempCount === 1 ? `${i+1}nd` : tempCount === 2 ? `${i+1}rd` : `${i+1}th`;
                          testNOtes += `Adding ${count} Lead to ERP database.\n`;
                          templateObject.setLogFunction(testNOtes);

                          let postData = {};
                          postData.type = "TProspect";
                          postData.fields = {};

                          postData.fields.FirstName = resultData[i]?.First_Name || "";

                          postData.fields.LastName = resultData[i]?.Last_Name || "";

                          testNOtes += `Lead ${resultData[i]?.Full_Name} converting ..........\n`;
                          templateObject.setLogFunction(testNOtes);
                          postData.fields.LastName = resultData[i]?.Last_Name || "";

                          postData.fields.Email = resultData[i].Email || "";

                          postData.fields.Companyname = resultData[i].Company || "";

                          postData.fields.Phone = resultData[i].Phone || "";

                          postData.fields.Title = resultData[i].Title || "";

                          postData.fields.SkypeName = resultData[i].Skype_ID || "";

                          const clientName = resultData[i].Full_Name;

                          if(!resultData[i].GlobalRef) {
                            await fetch(
                              `${erpObject.base_url}/TProspect?select=[ClientName]="${clientName}"`,
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
                                  postData.fields.GlobalRef = result?.tprospect[0]?.GlobalRef;
                                  testNOtes += `Found the TProspect as ClientName : ${clientName}\n`;
                                  templateObject.setLogFunction(testNOtes);
                                } else {
                                  postData.fields.ClientName = resultData[i].Full_Name;
                                }
                              })
                              .catch((err) => {
                                console.log(err);
                                postData.fields.ClientName = resultData[i].Full_Name;
                                testNOtes += `Confirming TProspect existence of Lead in TrueERP Failed! \n`;
                                templateObject.setLogFunction(testNOtes);
                              });
                          } else {
                            postData.fields.GlobalRef = resultData[i].GlobalRef;
                          }

                          await fetch("/api/updateTrueERP2", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                              data: postData,
                              Username: erpObject.user_name,
                              Password: erpObject.password,
                              Database: erpObject.database,
                              url: erpObject.base_url + "/TProspect"
                            }),
                          })
                            .then((response) => response.json())
                            .then(async (result) => {

                              console.log(result)
                              upload_transaction_count += 1;
                              upload_num += 1;
                              testNOtes += `Leads transfer Success!\n`;

                              templateObject.setLogFunction(testNOtes);
                            })
                            .catch((error) => {
                              console.log(error);

                              testNOtes += `Leads transfer Failed!\n`;
                              testNOtes += `Failed!!!\n`;
                              templateObject.setLogFunction(testNOtes);
                            });
                        }

                        transaction_details.push({
                          detail_string:
                            "Downloaded Prospects from Zoho to TrueERP",
                          count: upload_num,
                        });

                        let tempDate = new Date();
                        let dateString =
                          tempDate.getUTCFullYear() +
                          "/" +
                          ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) +
                          "/" +
                          ("0" + tempDate.getUTCDate()).slice(-2) +
                          " " +
                          ("0" + tempDate.getUTCHours()).slice(-2) +
                          ":" +
                          ("0" + tempDate.getUTCMinutes()).slice(-2) +
                          ":" +
                          ("0" + tempDate.getUTCSeconds()).slice(-2);
                        let argsDate = {
                          id: FlowRouter.current().queryParams.id,
                          last_ran_date: dateString,
                        };
                        await fetch(`/api/updateLastRanDate`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(argsDate),
                        })
                          .then((response) => response.json())
                          .then(async (result) => {
                            console.log(result);
                          })
                          .catch((err) => console.log(err));
                      }

                      })
                      .catch((error) => {
                        console.log(error)
                        testNOtes += `An error occurred while receiving a Leads from Zoho\n`;
                        templateObject.setLogFunction(testNOtes);
                      });
                  } else {
                    testNOtes += `There is no newly added Lead in ZOHO.\n`;
                    templateObject.setLogFunction(testNOtes);
                  }

                }

                if (ERP_CustomerState) {
                  testNOtes += `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n`;
                  templateObject.setLogFunction(testNOtes);
                  testNOtes += "Processing Contacts .........\n";
                  templateObject.setLogFunction(testNOtes);
                  const args = {
                    auth: token,
                    data: {
                      module: "Contacts",
                      lstTime: lstUpdateTime
                    },
                    datacenter: datacenter
                  }
                  const resultContacts = await new Promise(
                    (resolve, reject) => {
                      Meteor.call(
                        "getDatafromZohoByDate",
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

                  if (resultContacts) {
                    const ids = resultContacts.data.map((contact) => {
                      return contact.id
                    });
                    let combinedIds = ids.join(",");

                    await fetch(`https://www.zohoapis.${datacenter}/crm/v2/Contacts?${combinedIds}`, {
                    method: "GET",
                    headers: {
                      Authorization: `Zoho-oauthtoken ${token}`,
                      "Content-Type": "application/json",
                    },
                  })
                    .then((response) => response.json())
                    .then(async (result) => {
                      if (result.data.length === 0) {
                        testNOtes += `There is no newly added Contact in ZOHO.\n`;
                        templateObject.setLogFunction(testNOtes);
                    } else {
                      responseCount = result.data.length;
                      var resultData = result.data;
                      // download_transaction_count += responseCount;

                      // transaction_details.push({
                      //   detail_string:
                      //     "Downloaded Contacts from Zoho to TrueERP",
                      //   count: responseCount,
                      // });

                      let formatting = responseCount > 1 ? "Contacts" : "Contact";
                      testNOtes +=
                        `Received ` + responseCount + ` ${formatting} from Zoho.\n`;

                      testNOtes += `Adding ${formatting} to TrueERP \n`;
                      templateObject.setLogFunction(testNOtes);
                      let upload_num = 0;

                      for (let i = 0; i < responseCount; i++) {
                        let tempCount = i%10;
                        let count = tempCount === 0 ? `${i+1}st` : tempCount === 1 ? `${i+1}nd` : tempCount === 2 ? `${i+1}rd` : `${i+1}th`;
                        testNOtes += `Adding ${count} Contact to ERP database.\n`;
                        templateObject.setLogFunction(testNOtes);

                        let postData = {}
                        postData.type = "TCustomer";
                        postData.fields = {};
                        postData.fields.Email = resultData[i].Email || "";

                        postData.fields.FirstName = resultData[i].First_Name || "";

                        postData.fields.LastName = resultData[i].Last_Name || "";

                        postData.fields.Phone = resultData[i].Phone || "";

                        postData.fields.Mobile = resultData[i].Mobile || "";

                        postData.fields.SkypeName = resultData[i].Skype_ID || "";

                        postData.fields.Title = resultData[i].Title || "";

                        postData.fields.Faxnumber = resultData[i].Fax || "";

                        const clientName = resultData[i].Full_Name;

                        if(!resultData[i].GlobalRef) {
                          await fetch(
                            `${erpObject.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
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
                              if (result.tcustomer.length > 0) {
                                postData.fields.GlobalRef = result?.tcustomer[0]?.GlobalRef;
                                testNOtes += `Found the Customer as ClientName : ${clientName}\n`;
                                templateObject.setLogFunction(testNOtes);
                              } else {
                                postData.fields.ClientName = resultData[i].Full_Name;
                              }
                            })
                            .catch((err) => {
                              console.log(err);
                              postData.fields.ClientName = resultData[i].Full_Name;
                              testNOtes += `Confirming Customer existence in TrueERP Failed! \n`;
                              templateObject.setLogFunction(testNOtes);
                            });
                        } else {
                          postData.fields.GlobalRef = resultData[i].GlobalRef;
                        }

                        await fetch("/api/updateTrueERP2", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                            data: postData,
                            Username: erpObject.user_name,
                            Password: erpObject.password,
                            Database: erpObject.database,
                            url: erpObject.base_url + "/TCustomer"
                          }),
                        })
                          .then((response) => response.json())
                          .then(async (result) => {
                            console.log(result);
                            upload_transaction_count += 1;
                            upload_num += 1;
                            testNOtes += `Customers transfer Success!\n`;

                            templateObject.setLogFunction(testNOtes);
                          })
                          .catch((error) => {
                            console.log(error);
                            testNOtes += `Customers transfer Failed!\n`;
                            testNOtes += `Failed!!!\n`;
                            templateObject.setLogFunction(testNOtes);
                          });
                      }

                      transaction_details.push({
                        detail_string:
                          "Downloaded Customers from Zoho to TrueERP",
                        count: upload_num,
                      });

                      let tempDate = new Date();
                      let dateString =
                        tempDate.getUTCFullYear() +
                        "/" +
                        ("0" + (tempDate.getUTCMonth() + 1)).slice(-2) +
                        "/" +
                        ("0" + tempDate.getUTCDate()).slice(-2) +
                        " " +
                        ("0" + tempDate.getUTCHours()).slice(-2) +
                        ":" +
                        ("0" + tempDate.getUTCMinutes()).slice(-2) +
                        ":" +
                        ("0" + tempDate.getUTCSeconds()).slice(-2);
                      let argsDate = {
                        id: FlowRouter.current().queryParams.id,
                        last_ran_date: dateString,
                      };
                      await fetch(`/api/updateLastRanDate`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(argsDate),
                      })
                        .then((response) => response.json())
                        .then(async (result) => {
                          console.log(result);
                        })
                        .catch((err) => console.log(err));
                    }
                    }).catch((err) => console.log);

                  } else {
                    testNOtes += `There is no newly added Contact in ZOHO.\n`;
                    templateObject.setLogFunction(testNOtes);
                  }

                };




                let account_id = 13;
                let connection_id = 7;
                let today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

                // let year = today.getFullYear();
                // let month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
                // let day = String(today.getDate()).padStart(2, "0");

                // let formattedDate = `${year}-${month}-${day}`;
                let formattedDate = moment(today).format("YYYY-MM-DD");
                let id = FlowRouter.current().queryParams.id;

                let products_num =
                  upload_transaction_count +
                  download_transaction_count;
                let transaction_data = {
                  accounting_soft: account_id,
                  connection_soft: connection_id,
                  date: formattedDate,
                  order_num: products_num,
                  products: products_num,
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
                        transaction_data.products_num +
                        result.products_num;
                      transaction_data.uploaded_num =
                        transaction_data.uploaded_num +
                        result.uploaded_num;
                      transaction_data.downloaded_num =
                        transaction_data.downloaded_num +
                        result.downloaded_num;
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
                            date: today
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
                            date: today
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
              })
              .catch(error => {console.log(error)});

          }

        }
      );

    }). catch ((error) => {
      console.log(error);
    });

}

async function Magento2TrueERP(InvoiceState = false, CustomerState = false) {
  if(InvoiceState === false && CustomerState === false) {
    return;
  }

}
