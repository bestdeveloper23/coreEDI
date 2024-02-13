import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

//------------------ Library  --------------------//

import 'datatables.net-responsive-bs4';
import 'datatables.net';
import 'datatables.net-buttons';
import 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.flash';
import 'datatables.net-buttons/js/buttons.print.min.mjs';
import 'datatables.net-bs4/js/dataTables.bootstrap4.min.mjs';
import 'datatables.net-responsive/js/dataTables.responsive.min.mjs';
import 'datatables.net-responsive-bs4/js/responsive.bootstrap4.min.mjs';


//----------------------  Standard template  ---------------------------//

import './StandardTemplate/datatablelist/datatablelist.js';
import './StandardTemplate/template_buttons/export_import_print_display_button.js';

//----------------------  global  ---------------------------//

import './globalfunction.js';

//------------------

import './main.html';
import './notFound.html';
import '../imports/ui/Navigation/newsidenav.html';
import '../imports/ui/CustomerList/customerlist.html';
import '../imports/ui/Login/Login.html';
import './StandardTemplate/vs1_template/vs1_popup/vs1_popup.html';
import './StandardTemplate/vs1_template/formCloseButton.html';
import './StandardTemplate/vs1_template/vs1_select/default_select.html';
// import '../client/StandardTemplate/filterModal/customfiltersmodal.html';

import '../imports/ui/CustomerList/customerlist.js';
import '../imports/ui/CustomerList/customerscard.js';
import '../imports/ui/EmployeeList/employeelist.js';
import '../imports/ui/EmployeeList/employeescard.js';
import '../imports/ui/ConnectionList/connectionlist.js';
import '../imports/ui/ConnectionList/connectionscard.js';
// import '../client/StandardTemplate/filterModal/customfiltersmodal.js';
import '../imports/ui/Login/Login.js';
import '../imports/ui/Navigation/newsidenav.js';

import '../client/StandardTemplate/template_buttons/toggle_button.html';

import './StandardTemplate/frequencyModal/_frequencyModal.js';
import './StandardTemplate/filterModal/_filterOptionModal.js';
import './StandardTemplate/transactionModal/_transactionModal.js';
import './StandardTemplate/productModal/_productModal.js';
import './StandardTemplate/vs1_template/drop_down/vs1___dropdown.js';
import './StandardTemplate/productlistModal/productlistpopfortransaction.js';
import './StandardTemplate/vs1_template/vs1_popup/vs1_popup.js';
// import './StandardTemplate/js/new_bom_setup.js';
// import './StandardTemplate/js/new_bom_temp.js';
// import './StandardTemplate/single_date_picker.html';

import '../imports/ui/templates/auspost/auspost.js';
import '../imports/ui/templates/amazon/amazon.js';
import '../imports/ui/templates/magento/magento.js';
import '../imports/ui/templates/woocommerce/woocommerce.js';
import '../imports/ui/templates/zoho/zoho.js';
import '../imports/ui/templates/xero/xero.js';

import './route.js';

const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

Template.body.onCreated(function helloOnCreated() {
  // counter starts at 0

});

Template.body.onRendered(function() {

  // Meteor.call('getData', function(error, result) {
  //   if (error) {
  //     console.log('error');
  //   } else {
  //     console.log(result);
  //   }
  // });
})

Template.body.helpers({
  isUserLogged() {
    return isUserLogged();
  }
});
