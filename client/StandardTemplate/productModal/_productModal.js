import { ReactiveVar } from "meteor/reactive-var";
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { Template } from 'meteor/templating';
import moment from "moment";
import '../../../imports/ui/CustomerList/customerscard.css';
import "./_productModal.html";
import { template } from "lodash";


let currentDate = new Date();
let currentFormatedDate = currentDate.getDay() + "/" + currentDate.getMonth() + "/" + currentDate.getFullYear();

let fxUpdateObject;

Template._productModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.selConnectionId = new ReactiveVar();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.transNote = new ReactiveVar();

  templateObject.getDataTableList = function (data) {
    let linestatus = '';
    dataList = [
      data.fields?.ID || data.ID || "",
      data.fields?.ProductName || data.ProductName || "-",
      data.fields?.SalesDescription || data.SalesDescription || "",
      data.fields?.BARCODE || data.BARCODE || "",
      `$${(data.fields?.AverageCost).toFixed(2) || (data.AverageCost).toFixed(2) || 0.00}`,
      `$${(data.fields?.SellQty1PriceInc).toFixed(2) || (data.SellQty1PriceInc).toFixed(2) || 0.00}`,
      data.fields?.InStock || data.InStock || "",
      data.fields?.TAXCODE || data.TAXCODE || "",
      JSON.stringify(data.fields?.ExtraSellPrice) || JSON.stringify(data.ExtraSellPrice) || null,
      linestatus,
      data.fields?.NetWeightKg || data.NetWeightKg || 1,
      "",
      data.fields?.Volume || data.Volume || 1,
      "",
      data.fields?.ProductGroup1 || data.ProductGroup1 || "",
      data.fields?.ProductGroup2 || data.ProductGroup2 || "",
      data.fields?.ProductGroup3 || data.ProductGroup3 || "",
      data.fields?.ProductType || data.ProductType || "",
      data.fields?.ProductClass ? data.fields.ProductClass[0].fields.DeptName : "" || "",
      "",
    ];
    $('.fullScreenSpin').css('display', 'none');
    return dataList;
  }

  let headerStructure = [
    {
      index: 0,
      label: "ID",
      class: "colProuctPOPID colID",
      active: false,
      display: true,
      width: "100",
    },
    {
      index: 1,
      label: "Product Name",
      class: "colproductName",
      active: true,
      display: true,
      width: "140",
    },
    {
      index: 2,
      label: "Sales Description",
      class: "colproductDesc",
      active: true,
      display: true,
      width: "200",
    },
    {
      index: 3,
      label: "Barcode",
      class: "colBarcode",
      active: false,
      display: false,
      width: "140",
    },
    {
      index: 4,
      label: "Cost Price",
      class: "colcostPrice",
      active: false,
      display: false,
      width: "110",
    },
    {
      index: 5,
      label: "Sale Price",
      class: "colsalePrice",
      active: false,
      display: false,
      width: "110",
    },
    {
      index: 6,
      label: "Quantity",
      class: "colprdqty",
      active: false,
      display: false,
      width: "110",
    },
    {
      index: 7,
      label: "Tax Rate",
      class: "coltaxrate",
      active: false,
      display: false,
      width: "80",
    },
    {
      index: 8,
      label: "ExSellPrice",
      class: "colExtraSellPrice",
      active: false,
      display: false,
      width: "110",
    },
    {
      index: 9,
      label: 'Weight',
      class: "colWeight",
      active: false,
      display: false,
      width: "55"
    },
    {
      index: 10,
      label: 'Weight Unit',
      class: "colWeightUnit",
      active: false,
      display: false,
      width: "55"
    },
    {
      index: 11,
      label: 'Volume',
      class: "colVolume",
      active: false,
      display: false,
      width: "55"
    },
    {
      index: 12,
      label: 'Volume Unit',
      class: "colVolumeUnit",
      active: false,
      display: false,
      width: "55"
    },
    {
      index: 13,
      label: "Product Desc",
      class: "colproductDesc",
      active: false,
      display: false,
      width: "500",
    },
    {
      index: 14,
      label: "Sub Group1",
      class: "colproductGroup1",
      active: true,
      display: true,
      width: "500",
    },
    {
      index: 15,
      label: "Sub Group2",
      class: "colproductGroup2",
      active: true,
      display: true,
      width: "500",
    },
    {
      index: 16,
      label: "Sub Group3",
      class: "colproductGroup3",
      active: true,
      display: true,
      width: "500",
    },
    {
      index: 17,
      label: "Product Type",
      class: "colBarcode",
      active: true,
      display: true,
      width: "300",
    },
    {
      index: 18,
      label: "Dept",
      class: "colcostPrice",
      active: true,
      display: true,
      width: "110",
    },
    {
      index: 19,
      label: "Status",
      class: "colStatus",
      active: true,
      display: true,
      width: "120",
    },
  ];

  templateObject.tableheaderrecords.set(headerStructure);
});

Template._productModal.onRendered(function () {
  let templateObject = Template.instance();
});

Template._productModal.events({

});


Template._productModal.helpers({

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
  // apiFunction: function () {
  // do not use arrow function
  // return sideBarService.getProductListVS1;
  // },
  apiParams: function () {
    return [
      "limitCount",
      "limitFrom",
      "deleteFilter",
    ];
  },

});