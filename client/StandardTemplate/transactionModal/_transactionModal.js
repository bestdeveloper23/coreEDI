import { ReactiveVar } from "meteor/reactive-var";
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { Template } from 'meteor/templating';
import moment from "moment";
import '../../../imports/ui/CustomerList/customerscard.css';
import "./_transactionModal.html";
import { template } from "lodash";


let currentDate = new Date();
let currentFormatedDate = currentDate.getDay() + "/" + currentDate.getMonth() + "/" + currentDate.getFullYear();

let fxUpdateObject;

Template._transactionModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.selConnectionId = new ReactiveVar();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.transNote = new ReactiveVar();

  templateObject.getDataTableList = function (data) {
    // console.log(data.LastRanDate,  moment(data.Date).format("YYYY/MM/DD HH:mm:ss"))
    let dataList = [
      data.Id,
      data.AccName || '',
      data.ConnName || '',
      data.Date || '',
      (data.Times).split('.')[0] || '',
      data.Total
    ];
    return dataList;
  }

  let headerStructure = [
    { index: 0, label: "ID", class: "colConnectionId", active: true, display: true, width: "50" },
    { index: 1, label: "Accounting Software", class: "colAccountingSoftware", active: true, display: true, width: "200" },
    { index: 2, label: "Connection Software", class: "colConnectionSoftware", active: true, display: true, width: "200" },
    { index: 3, label: "Transaction Date", class: "colTransactionDate", active: true, display: true, width: "200" },
    { index: 4, label: "Transaction Time", class: "colTransactionTime", active: true, display: true, width: "200" },
    { index: 5, label: "Total", class: "colTotalTransactions", active: true, display: true, width: "50" },
  ];

  templateObject.tableheaderrecords.set(headerStructure);

});

Template._transactionModal.onRendered(function () {
  let templateObject = Template.instance();
});

Template._transactionModal.events({

  'click #tblTransactionsById tbody td:nth-child(n)': function (event) {
    let templateObject = Template.instance();
    let listData = $(event.target).closest('tr').attr("id");
    console.log(listData)
    templateObject.selConnectionId.set(listData);
    $(event.target).closest('tr').siblings().removeClass('currentSelect');
    $(event.target).closest('tr').addClass('currentSelect');

    $(event.target).closest('tr').siblings().attr('style', 'background: node');
    $(event.target).closest('tr').attr('style', 'background: rgba(78, 115, 223, 0.31)!important;');
    console.log(templateObject.datatablerecords)
    var transData = `AccName: ` + templateObject.datatablerecords.AccName + `
ConnName: ` + templateObject.datatablerecords.ConnName + `
Date: ` + templateObject.datatablerecords.Date + `
Id: ` + templateObject.datatablerecords.Id + `
OrderNum: ` + templateObject.datatablerecords.OrderNum + `
ProductName: ` + templateObject.datatablerecords.ProductName + `
Total: ` + templateObject.datatablerecords.Total + ``;
    templateObject.transNote.set(transData)
  },
});


Template._transactionModal.helpers({

  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },

  transNote: () => {
    return Template.instance().transNote.get();
  },

  datahandler: function () {
    let templateObject = Template.instance();
    return function (data) {
      templateObject.datatablerecords = data;
      let dataReturn = templateObject.getDataTableList(data)
      return dataReturn
    }
  },

});