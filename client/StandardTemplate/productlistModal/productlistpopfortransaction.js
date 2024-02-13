import { ReactiveVar } from "meteor/reactive-var";
import { CoreService } from "../../core-service";
// import { DashBoardService } from "../Dashboard/dashboard-service";
import { UtilityService } from "../utility-service";
import { ProductService } from "../product/product-service";
import "../../erp-objects.js";
import "jquery-ui-dist/external/jquery/jquery";
import "jquery-ui-dist/jquery-ui";
import { Random } from "meteor/random";
import { jsPDF } from "jspdf";
import "jQuery.print/jQuery.print.js";
// import { autoTable } from "jspdf-autotable";
import "jquery-editable-select";
import { SideBarService } from "../../sidebar-service.js";
// import "../lib/global/indexdbstorage.js";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import "./productlistpopfortransaction.html";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
var times = 0;
Template.productlistpopfortransaction.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.custfields = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);

  templateObject.getDataTableList = function (data) {
    var currentLoc = FlowRouter.current().route.path;
    let linestatus = '';
    if(data?.Active == true  || data.Active == true){
      linestatus = "";
    }
    else if(data?.Active == false || data.Active == true){
      linestatus = "In-Active";
    }
    if (currentLoc == "/purchaseordercard" || currentLoc == '/purchaseordertemp') {
      dataList = [
        data?.ID || data.ID || "",
        data?.ProductName || data.ProductName || "-",
        data?.SalesDescription || data.SalesDescription || "",
        data?.BARCODE || data.BARCODE || "",
        utilityService.modifynegativeCurrencyFormat(Math.floor(data?.CostExA * 100) / 100) ||
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.CostExA * 100) / 100),
        utilityService.modifynegativeCurrencyFormat(Math.floor(data?.PriceExA * 100) / 100) ||
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.PriceExA * 100) / 100),
        data?.TotalQtyInStock,
        data?.PurchaseTaxcode || data.PurchaseTaxcode || "",
        JSON.stringify(data?.ExtraSellPrice) || JSON.stringify(data.ExtraSellPrice) || null,
        linestatus,
        data?.NetWeightKg|| data.NetWeightKg,
        "",
        data?.Volume || data.Volume,
        ""
      ];
    } else {
      dataList = [
        data?.ID ||data.Id|| "",
        data?.ProductName ||data.ProductName|| "-",
        data?.SalesDescription ||data.SalesDescription|| "",
        data?.BARCODE ||data.BARCODE|| "",
        utilityService.modifynegativeCurrencyFormat(Math.floor(data?.CostExA * 100) / 100) ||
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.CostExA * 100) / 100),
        utilityService.modifynegativeCurrencyFormat(Math.floor(data?.PriceExA * 100) / 100) ||
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.PriceExA * 100) / 100),
        data?.TotalQtyInStock || data.TotalQtyInStock,
        data?.TAXCODE ||data.TAXCODE|| "",
        JSON.stringify(data?.ExtraSellPrice) ||JSON.stringify(data.ExtraSellPrice)|| null,
        linestatus,
        data?.NetWeightKg|| data.NetWeightKg || 1,
        "",
        data?.Volume || data.Volume || 1,
        ""
      ];
    }

    if (currentLoc == "/stockadjustmentcard") {
      if (data?.ProductType == "INV" || data.ProductType == "INV") {
        return dataList;
      } else {
        return [];
      }
    } else {
      return dataList;
    }
  };

  templateObject.getExData = function (data) {
    var currentLoc = FlowRouter.current().route.path;
    let linestatus = '';
    if(data.fields?.Active == true || data.Active== true){
      linestatus = "";
    }
    else if(data.fields?.Active == false || data.Active == false){
      linestatus = "In-Active";
    }
    if (currentLoc == "/purchaseordercard") {
      dataList = [
        data.fields?.ID || data.ID|| "",
        data.fields?.ProductName || data.ProductName|| "-",
        data.fields?.SalesDescription || data.SalesDescription|| "",
        data.fields?.BARCODE || data.BARCODE|| "",
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.fields?.CostExA * 100) / 100) ||
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.CostExA * 100) / 100),
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.fields?.PriceExA * 100) / 100) ||
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.PriceExA * 100) / 100),
        data.fields?.TotalQtyInStock || data.TotalQtyInStock,
        data.fields?.TaxCodePurchase || data.TaxCodePurchase|| "",
        JSON.stringify(data.fields?.ExtraSellPrice) || JSON.stringify(data.ExtraSellPrice)|| null,
        linestatus,
        data.fields?.NetWeightKg|| data.NetWeightKg || 1,
        "",
        data.fields?.Volume || data.Volume || 1,
        ""
      ];
    } else {
      dataList = [
        data.fields?.ID || data.ID || "",
        data.fields?.ProductName || data.ProductName || "-",
        data.fields?.SalesDescription || data.SalesDescription || "",
        data.fields?.BARCODE || data.BARCODE || "",
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.fields?.CostExA * 100) / 100) ||
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.CostExA * 100) / 100) ,
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.fields?.PriceExA * 100) / 100) ||
        utilityService.modifynegativeCurrencyFormat(Math.floor(data.PriceExA * 100) / 100) ,
        data.fields?.TotalQtyInStock || data.TotalQtyInStock,
        data.fields?.TaxCodeSales || data.TaxCodeSales || "",
        JSON.stringify(data.fields?.ExtraSellPrice) || JSON.stringify(data.ExtraSellPrice) || null,
        linestatus,
        data.fields?.NetWeightKg|| data.NetWeightKg || 1,
        "",
        data.fields?.Volume || data.Volume || 1,
        ""
      ];
    }

    if (currentLoc == "/stockadjustmentcard") {
      if (data.fields?.ProductType == "INV" || data.ProductType == "INV") {
        return dataList;
      }
      else{
        return [];
      }
    } else {
      return dataList;
    }
  };

  let headerStructure = [
    // { index: 0, label: '#Sort Date', class:'colSortDate', active: false, display: true, width: "20" },
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
      width: "200",
    },
    {
      index: 2,
      label: "Sales Description",
      class: "colproductDesc",
      active: true,
      display: true,
      width: "500",
    },
    {
      index: 3,
      label: "Barcoder",
      class: "colBarcode",
      active: true,
      display: true,
      width: "300",
    },
    {
      index: 4,
      label: "Cost Price",
      class: "colcostPrice",
      active: true,
      display: true,
      width: "110",
    },
    {
      index: 5,
      label: "Sale Price",
      class: "colsalePrice",
      active: true,
      display: true,
      width: "110",
    },
    {
      index: 6,
      label: "Quantity",
      class: "colprdqty",
      active: true,
      display: true,
      width: "110",
    },
    {
      index: 7,
      label: "Tax Rate",
      class: "coltaxrate",
      active: true,
      display: true,
      width: "80",
    },
    {
      index: 8,
      label: "ExSellPrice",
      class: "colExtraSellPrice",
      active: false,
      display: true,
      width: "110",
    },
    {
        index: 9,
        label: "Status",
        class: "colStatus",
        active: true,
        display: true,
        width: "120",
      },
      {
        index: 10,
        label: 'Weight',
        class: "colWeight",
        active: false,
        display: true,
        width: "55"
      },
      {
        index: 11,
        label: 'Weight Unit',
        class: "colWeightUnit",
        active: false,
        display: true,
        width: "55"
      },
      {
        index: 12,
        label: 'Volume',
        class: "colVolume",
        active: false,
        display: true,
        width: "55"
      },
      {
        index: 13,
        label: 'Volume Unit',
        class: "colVolumeUnit",
        active: false,
        display: true,
        width: "55"
      }
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.productlistpopfortransaction.onRendered(function () {
  let tempObj = Template.instance();
  let utilityService = new UtilityService();
  var splashArrayProductList = new Array();
  var splashArrayTaxRateList = new Array();
  const taxCodesList = [];
  const lineExtaSellItems = [];
  var currentLoc = FlowRouter.current().route.path;
  //   tempObj.getAllProducts = function () {
  //     getVS1Data("TProductVS1")
  //       .then(function (dataObject) {
  //         if (dataObject.length == 0) {
  //           sideBarService
  //             .getNewProductListVS1(initialBaseDataLoad, 0)
  //             .then(function (data) {
  //               addVS1Data("TProductVS1", JSON.stringify(data));
  //               let records = [];
  //               let inventoryData = [];
  //               for (let i = 0; i < data.tproductvs1.length; i++) {
  //                 if (data.tproductvs1[i].fields.ExtraSellPrice != null) {
  //                   for (
  //                     let e = 0;
  //                     e < data.tproductvs1[i].fields.ExtraSellPrice.length;
  //                     e++
  //                   ) {
  //                     let lineExtaSellObj = {
  //                       clienttype:
  //                         data.tproductvs1[i].fields.ExtraSellPrice[e].fields
  //                           .ClientTypeName || "",
  //                       productname:
  //                         data.tproductvs1[i].fields.ExtraSellPrice[e].fields
  //                           .ProductName ||
  //                         data.tproductvs1[i].fields.ProductName,
  //                       price:
  //                         utilityService.modifynegativeCurrencyFormat(
  //                           data.tproductvs1[i].fields.ExtraSellPrice[e].fields
  //                             .Price1
  //                         ) || 0,
  //                       qtypercent: data.tproductvs1[i].fields.QtyPercent1 || 0,
  //                     };
  //                     lineExtaSellItems.push(lineExtaSellObj);
  //                   }
  //                 }
  //                 var dataList = "";
  //                 if (currentLoc == "/purchaseordercard") {
  //                   dataList = [
  //                     data.tproductvs1[i].fields.ProductName || "-",
  //                     data.tproductvs1[i].fields.SalesDescription || "",
  //                     data.tproductvs1[i].fields.BARCODE || "",
  //                     utilityService.modifynegativeCurrencyFormat(
  //                       Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) /
  //                         100
  //                     ),
  //                     utilityService.modifynegativeCurrencyFormat(
  //                       Math.floor(
  //                         data.tproductvs1[i].fields.SellQty1Price * 100
  //                       ) / 100
  //                     ),
  //                     data.tproductvs1[i].fields.TotalQtyInStock,
  //                     data.tproductvs1[i].fields.TaxCodePurchase || "",
  //                     data.tproductvs1[i].fields.ID || "",
  //                     JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) ||
  //                       null,
  //                   ];
  //                 } else {
  //                   dataList = [
  //                     data.tproductvs1[i].fields.ProductName || "-",
  //                     data.tproductvs1[i].fields.SalesDescription || "",
  //                     data.tproductvs1[i].fields.BARCODE || "",
  //                     utilityService.modifynegativeCurrencyFormat(
  //                       Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) /
  //                         100
  //                     ),
  //                     utilityService.modifynegativeCurrencyFormat(
  //                       Math.floor(
  //                         data.tproductvs1[i].fields.SellQty1Price * 100
  //                       ) / 100
  //                     ),
  //                     data.tproductvs1[i].fields.TotalQtyInStock,
  //                     data.tproductvs1[i].fields.TaxCodeSales || "",
  //                     data.tproductvs1[i].fields.ID || "",
  //                     JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) ||
  //                       null,
  //                   ];
  //                 }

  //                 if (currentLoc == "/stockadjustmentcard") {
  //                   if (data.tproductvs1[i].fields.ProductType == "INV") {
  //                     splashArrayProductList.push(dataList);
  //                   }
  //                 } else {
  //                   splashArrayProductList.push(dataList);
  //                 }
  //               }
  //               //localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));

  //               if (splashArrayProductList) {
  //                 $("#tblInventory").dataTable({
  //                   data: splashArrayProductList,
  //                   sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

  //                   columnDefs: [
  //                     {
  //                       className: "productName",
  //                       targets: [0],
  //                     },
  //                     {
  //                       className: "productDesc",
  //                       targets: [1],
  //                     },
  //                     {
  //                       className: "colBarcode",
  //                       targets: [2],
  //                     },
  //                     {
  //                       className: "costPrice text-right",
  //                       targets: [3],
  //                     },
  //                     {
  //                       className: "salePrice text-right",
  //                       targets: [4],
  //                     },
  //                     {
  //                       className: "prdqty text-right",
  //                       targets: [5],
  //                     },
  //                     {
  //                       className: "taxrate",
  //                       targets: [6],
  //                     },
  //                     {
  //                       className: "colProuctPOPID hiddenColumn",
  //                       targets: [7],
  //                     },
  //                     {
  //                       className: "colExtraSellPrice hiddenColumn",
  //                       targets: [8],
  //                     },
  //                   ],
  //                   select: true,
  //                   destroy: true,
  //                   colReorder: true,
  //                   lengthMenu: [
  //                     [initialBaseDataLoad, -1],
  //                     [initialBaseDataLoad, "All"],
  //                   ],
  //                   info: true,
  //                   responsive: true,
  //                   fnDrawCallback: function (oSettings) {
  //                     // $('.dataTables_paginate').css('display', 'none');
  //                   },
  //                   language: { search: "", searchPlaceholder: "Search List..." },
  //                   fnInitComplete: function () {
  //                     $(
  //                       "<a class='btn btn-primary scanProdBarcodePOP' href='' id='scanProdBarcodePOP' role='button' style='margin-left: 12px; height:32px;padding: 4px 10px;'><i class='fas fa-camera'></i></a>"
  //                     ).insertAfter("#tblInventory_filter");
  //                     $(
  //                       "<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#newProductModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
  //                     ).insertAfter("#tblInventory_filter");
  //                     $(
  //                       "<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
  //                     ).insertAfter("#tblInventory_filter");
  //                   },
  //                 });

  //                 $("div.dataTables_filter input").addClass(
  //                   "form-control form-control-sm"
  //                 );
  //               }
  //             });
  //         } else {
  //           let data = JSON.parse(dataObject[0].data);
  //           let useData = data.tproductvs1;
  //           let records = [];
  //           let inventoryData = [];
  //           for (let i = 0; i < data.tproductvs1.length; i++) {
  //             if (data.tproductvs1[i].fields.ExtraSellPrice != null) {
  //               for (
  //                 let e = 0;
  //                 e < data.tproductvs1[i].fields.ExtraSellPrice.length;
  //                 e++
  //               ) {
  //                 let lineExtaSellObj = {
  //                   clienttype:
  //                     data.tproductvs1[i].fields.ExtraSellPrice[e].fields
  //                       .ClientTypeName || "",
  //                   productname:
  //                     data.tproductvs1[i].fields.ExtraSellPrice[e].fields
  //                       .ProductName || data.tproductvs1[i].fields.ProductName,
  //                   price:
  //                     utilityService.modifynegativeCurrencyFormat(
  //                       data.tproductvs1[i].fields.ExtraSellPrice[e].fields.Price1
  //                     ) || 0,
  //                   qtypercent: data.tproductvs1[i].fields.QtyPercent1 || 0,
  //                 };
  //                 lineExtaSellItems.push(lineExtaSellObj);
  //               }
  //             }

  //             var dataList = "";
  //             if (currentLoc == "/purchaseordercard") {
  //               dataList = [
  //                 data.tproductvs1[i].fields.ProductName || "-",
  //                 data.tproductvs1[i].fields.SalesDescription || "",
  //                 data.tproductvs1[i].fields.BARCODE || "",
  //                 utilityService.modifynegativeCurrencyFormat(
  //                   Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100
  //                 ),
  //                 utilityService.modifynegativeCurrencyFormat(
  //                   Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) /
  //                     100
  //                 ),
  //                 data.tproductvs1[i].fields.TotalQtyInStock,
  //                 data.tproductvs1[i].fields.TaxCodePurchase || "",
  //                 data.tproductvs1[i].fields.ID || "",
  //                 JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) ||
  //                   null,
  //               ];
  //             } else {
  //               dataList = [
  //                 data.tproductvs1[i].fields.ProductName || "-",
  //                 data.tproductvs1[i].fields.SalesDescription || "",
  //                 data.tproductvs1[i].fields.BARCODE || "",
  //                 utilityService.modifynegativeCurrencyFormat(
  //                   Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100
  //                 ),
  //                 utilityService.modifynegativeCurrencyFormat(
  //                   Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) /
  //                     100
  //                 ),
  //                 data.tproductvs1[i].fields.TotalQtyInStock,
  //                 data.tproductvs1[i].fields.TaxCodeSales || "",
  //                 data.tproductvs1[i].fields.ID || "",
  //                 JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) ||
  //                   null,
  //               ];
  //             }

  //             // splashArrayProductList.push(dataList);
  //             if (currentLoc == "/stockadjustmentcard") {
  //               if (data.tproductvs1[i].fields.ProductType == "INV") {
  //                 splashArrayProductList.push(dataList);
  //               }
  //             } else {
  //               splashArrayProductList.push(dataList);
  //             }
  //           }

  //           tempObj.productextrasellrecords.set(lineExtaSellItems);
  //           //localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));

  //           if (splashArrayProductList) {
  //             $("#tblInventory")
  //               .dataTable({
  //                 data: splashArrayProductList,

  //                 sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

  //                 columnDefs: [
  //                   {
  //                     className: "productName",
  //                     targets: [0],
  //                   },
  //                   {
  //                     className: "productDesc",
  //                     targets: [1],
  //                   },
  //                   {
  //                     className: "colBarcode",
  //                     targets: [2],
  //                   },
  //                   {
  //                     className: "costPrice text-right",
  //                     targets: [3],
  //                   },
  //                   {
  //                     className: "salePrice text-right",
  //                     targets: [4],
  //                   },
  //                   {
  //                     className: "prdqty text-right",
  //                     targets: [5],
  //                   },
  //                   {
  //                     className: "taxrate",
  //                     targets: [6],
  //                   },
  //                   {
  //                     className: "colProuctPOPID hiddenColumn",
  //                     targets: [7],
  //                   },
  //                   {
  //                     className: "colExtraSellPrice hiddenColumn",
  //                     targets: [8],
  //                   },
  //                 ],
  //                 select: true,
  //                 destroy: true,
  //                 colReorder: true,
  //                 pageLength: initialDatatableLoad,
  //                 lengthMenu: [
  //                   [initialDatatableLoad, -1],
  //                   [initialDatatableLoad, "All"],
  //                 ],
  //                 info: true,
  //                 responsive: true,
  //                 fnDrawCallback: function (oSettings) {
  //                   $(".paginate_button.page-item").removeClass("disabled");
  //                   $("#tblInventory_ellipsis").addClass("disabled");
  //                   if (oSettings._iDisplayLength == -1) {
  //                     if (oSettings.fnRecordsDisplay() > 150) {
  //                     }
  //                   } else {
  //                   }
  //                   if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
  //                     $(".paginate_button.page-item.next").addClass("disabled");
  //                   }

  //                   $(
  //                     ".paginate_button.next:not(.disabled)",
  //                     this.api().table().container()
  //                   ).on("click", function () {
  //                     $(".fullScreenSpin").css("display", "inline-block");
  //                     let dataLenght = oSettings._iDisplayLength;
  //                     let customerSearch = $("#tblInventory_filter input").val();

  //                     sideBarService
  //                       .getNewProductListVS1(
  //                         initialDatatableLoad,
  //                         oSettings.fnRecordsDisplay()
  //                       )
  //                       .then(function (dataObjectnew) {
  //                         for (
  //                           let i = 0;
  //                           i < dataObjectnew.tproductvs1.length;
  //                           i++
  //                         ) {
  //                           var dataListDupp = "";

  //                           if (currentLoc == "/purchaseordercard") {
  //                             dataListDupp = [
  //                               data.tproductvs1[i].fields.ProductName || "-",
  //                               data.tproductvs1[i].fields.SalesDescription || "",
  //                               data.tproductvs1[i].fields.BARCODE || "",
  //                               utilityService.modifynegativeCurrencyFormat(
  //                                 Math.floor(
  //                                   data.tproductvs1[i].fields.BuyQty1Cost * 100
  //                                 ) / 100
  //                               ),
  //                               utilityService.modifynegativeCurrencyFormat(
  //                                 Math.floor(
  //                                   data.tproductvs1[i].fields.SellQty1Price * 100
  //                                 ) / 100
  //                               ),
  //                               data.tproductvs1[i].fields.TotalQtyInStock,
  //                               data.tproductvs1[i].fields.TaxCodePurchase || "",
  //                               data.tproductvs1[i].fields.ID || "",
  //                               JSON.stringify(
  //                                 data.tproductvs1[i].fields.ExtraSellPrice
  //                               ) || null,
  //                             ];
  //                           } else {
  //                             dataListDupp = [
  //                               data.tproductvs1[i].fields.ProductName || "-",
  //                               data.tproductvs1[i].fields.SalesDescription || "",
  //                               data.tproductvs1[i].fields.BARCODE || "",
  //                               utilityService.modifynegativeCurrencyFormat(
  //                                 Math.floor(
  //                                   data.tproductvs1[i].fields.BuyQty1Cost * 100
  //                                 ) / 100
  //                               ),
  //                               utilityService.modifynegativeCurrencyFormat(
  //                                 Math.floor(
  //                                   data.tproductvs1[i].fields.SellQty1Price * 100
  //                                 ) / 100
  //                               ),
  //                               data.tproductvs1[i].fields.TotalQtyInStock,
  //                               data.tproductvs1[i].fields.TaxCodeSales || "",
  //                               data.tproductvs1[i].fields.ID || "",
  //                               JSON.stringify(
  //                                 data.tproductvs1[i].fields.ExtraSellPrice
  //                               ) || null,
  //                             ];
  //                           }

  //                           if (currentLoc == "/stockadjustmentcard") {
  //                             if (
  //                               data.tproductvs1[i].fields.ProductType == "INV"
  //                             ) {
  //                               splashArrayProductList.push(dataListDupp);
  //                             }
  //                           } else {
  //                             splashArrayProductList.push(dataListDupp);
  //                           }
  //                         }

  //                         let uniqueChars = [...new Set(splashArrayProductList)];
  //                         // var datatable = $('#tblInventory').DataTable();
  //                         // datatable.clear();
  //                         // datatable.rows.add(uniqueChars);
  //                         // datatable.draw(false);
  //                         // setTimeout(function () {
  //                         //   $(".tblInventory").DataTable().fnPageChange('last');
  //                         // }, 400);

  //                         $(".fullScreenSpin").css("display", "none");
  //                       })
  //                       .catch(function (err) {
  //                         $(".fullScreenSpin").css("display", "none");
  //                       });
  //                   });
  //                   // setTimeout(function () {
  //                   //     MakeNegative();
  //                   // }, 100);
  //                 },
  //                 language: { search: "", searchPlaceholder: "Search List..." },
  //                 fnInitComplete: function () {
  //                   $(
  //                     "<a class='btn btn-primary scanProdBarcodePOP' href='' id='scanProdBarcodePOP' role='button' style='margin-left: 12px; height:32px;padding: 4px 10px;'><i class='fas fa-camera'></i></a>"
  //                   ).insertAfter("#tblInventory_filter");
  //                   $(
  //                     "<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#newProductModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
  //                   ).insertAfter("#tblInventory_filter");
  //                   $(
  //                     "<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
  //                   ).insertAfter("#tblInventory_filter");
  //                 },
  //               })
  //               .on("length.dt", function (e, settings, len) {
  //                 $(".fullScreenSpin").css("display", "inline-block");
  //                 let dataLenght = settings._iDisplayLength;
  //                 // splashArrayProductList = [];
  //                 if (dataLenght == -1) {
  //                   $(".fullScreenSpin").css("display", "none");
  //                 } else {
  //                   if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
  //                     $(".fullScreenSpin").css("display", "none");
  //                   } else {
  //                     $(".fullScreenSpin").css("display", "none");
  //                   }
  //                 }
  //               });

  //             $("div.dataTables_filter input").addClass(
  //               "form-control form-control-sm"
  //             );
  //           }
  //         }
  //       })
  //       .catch(function (err) {
  //         sideBarService
  //           .getNewProductListVS1(initialBaseDataLoad, 0)
  //           .then(function (data) {
  //             addVS1Data("TProductVS1", JSON.stringify(data));
  //             let records = [];
  //             let inventoryData = [];
  //             for (let i = 0; i < data.tproductvs1.length; i++) {
  //               if (data.tproductvs1[i].fields.ExtraSellPrice != null) {
  //                 for (
  //                   let e = 0;
  //                   e < data.tproductvs1[i].fields.ExtraSellPrice.length;
  //                   e++
  //                 ) {
  //                   let lineExtaSellObj = {
  //                     clienttype:
  //                       data.tproductvs1[i].fields.ExtraSellPrice[e].fields
  //                         .ClientTypeName || "",
  //                     productname:
  //                       data.tproductvs1[i].fields.ExtraSellPrice[e].fields
  //                         .ProductName || data.tproductvs1[i].fields.ProductName,
  //                     price:
  //                       utilityService.modifynegativeCurrencyFormat(
  //                         data.tproductvs1[i].fields.ExtraSellPrice[e].fields
  //                           .Price1
  //                       ) || 0,
  //                     qtypercent: data.tproductvs1[i].fields.QtyPercent1 || 0,
  //                   };
  //                   lineExtaSellItems.push(lineExtaSellObj);
  //                 }
  //               }
  //               var dataList = "";

  //               if (currentLoc == "/purchaseordercard") {
  //                 dataList = [
  //                   data.tproductvs1[i].fields.ProductName || "-",
  //                   data.tproductvs1[i].fields.SalesDescription || "",
  //                   data.tproductvs1[i].fields.BARCODE || "",
  //                   utilityService.modifynegativeCurrencyFormat(
  //                     Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) /
  //                       100
  //                   ),
  //                   utilityService.modifynegativeCurrencyFormat(
  //                     Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) /
  //                       100
  //                   ),
  //                   data.tproductvs1[i].fields.TotalQtyInStock,
  //                   data.tproductvs1[i].fields.TaxCodePurchase || "",
  //                   data.tproductvs1[i].fields.ID || "",
  //                   JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) ||
  //                     null,
  //                 ];
  //               } else {
  //                 dataList = [
  //                   data.tproductvs1[i].fields.ProductName || "-",
  //                   data.tproductvs1[i].fields.SalesDescription || "",
  //                   data.tproductvs1[i].fields.BARCODE || "",
  //                   utilityService.modifynegativeCurrencyFormat(
  //                     Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) /
  //                       100
  //                   ),
  //                   utilityService.modifynegativeCurrencyFormat(
  //                     Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) /
  //                       100
  //                   ),
  //                   data.tproductvs1[i].fields.TotalQtyInStock,
  //                   data.tproductvs1[i].fields.TaxCodeSales || "",
  //                   data.tproductvs1[i].fields.ID || "",
  //                   JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) ||
  //                     null,
  //                 ];
  //               }

  //               if (currentLoc == "/stockadjustmentcard") {
  //                 if (data.tproductvs1[i].fields.ProductType == "INV") {
  //                   splashArrayProductList.push(dataList);
  //                 }
  //               } else {
  //                 splashArrayProductList.push(dataList);
  //               }
  //             }
  //             //localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));

  //             if (splashArrayProductList) {
  //               $("#tblInventory").dataTable({
  //                 data: splashArrayProductList,
  //                 sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
  //                 columnDefs: [
  //                   {
  //                     className: "productName",
  //                     targets: [0],
  //                   },
  //                   {
  //                     className: "productDesc",
  //                     targets: [1],
  //                   },
  //                   {
  //                     className: "colBarcode",
  //                     targets: [2],
  //                   },
  //                   {
  //                     className: "costPrice text-right",
  //                     targets: [3],
  //                   },
  //                   {
  //                     className: "salePrice text-right",
  //                     targets: [4],
  //                   },
  //                   {
  //                     className: "prdqty text-right",
  //                     targets: [5],
  //                   },
  //                   {
  //                     className: "taxrate",
  //                     targets: [6],
  //                   },
  //                   {
  //                     className: "colProuctPOPID hiddenColumn",
  //                     targets: [7],
  //                   },
  //                   {
  //                     className: "colExtraSellPrice hiddenColumn",
  //                     targets: [8],
  //                   },
  //                 ],
  //                 select: true,
  //                 destroy: true,
  //                 colReorder: true,
  //                 lengthMenu: [
  //                   [initialBaseDataLoad, -1],
  //                   [initialBaseDataLoad, "All"],
  //                 ],
  //                 info: true,
  //                 responsive: true,
  //                 order: [[0, "asc"]],
  //                 fnDrawCallback: function (oSettings) {
  //                   // $('.dataTables_paginate').css('display', 'none');
  //                 },
  //                 language: { search: "", searchPlaceholder: "Search List..." },
  //                 fnInitComplete: function () {
  //                   $(
  //                     "<a class='btn btn-primary scanProdBarcodePOP' href='' id='scanProdBarcodePOP' role='button' style='margin-left: 12px; height:32px;padding: 4px 10px;'><i class='fas fa-camera'></i></a>"
  //                   ).insertAfter("#tblInventory_filter");
  //                   $(
  //                     "<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#newProductModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
  //                   ).insertAfter("#tblInventory_filter");
  //                   $(
  //                     "<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
  //                   ).insertAfter("#tblInventory_filter");
  //                 },
  //               });

  //               $("div.dataTables_filter input").addClass(
  //                 "form-control form-control-sm"
  //               );
  //             }
  //           });
  //       });
  //   };

  //   tempObj.getAllProducts();

  function onScanSuccessProdModal(decodedText, decodedResult) {
    var barcodeScannerProdModal = decodedText.toUpperCase();
    $("#scanBarcodeModalProduct").modal("toggle");
    if (barcodeScannerProdModal != "") {
      setTimeout(function () {
        $("#tblInventory_filter .form-control-sm").val(barcodeScannerProdModal);
        $("#tblInventory_filter .form-control-sm").trigger("input");
      }, 200);
    }
  }

  var html5QrcodeScannerProdModal = new Html5QrcodeScanner(
    "qr-reader-productmodal",
    {
      fps: 10,
      qrbox: 250,
      rememberLastUsedCamera: true,
    }
  );
  html5QrcodeScannerProdModal.render(onScanSuccessProdModal);
});

Template.productlistpopfortransaction.events({
  "keyup #tblInventory_filter input": function (event) {
    if (event.keyCode == 13) {
      $(".btnRefreshProduct").trigger("click");
    }
  },
  'click .btnNewProduct': function (){
        $('div#newProductModal').modal('show');
    },
  "click .btnRefreshProduct": function (event) {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let productService = new ProductService();
    var currentLoc = FlowRouter.current().route.path;
    //let salesService = new SalesBoardService();
    let tableProductList;
    var splashArrayProductList = new Array();
    var splashArrayTaxRateList = new Array();
    const taxCodesList = [];
    const lineExtaSellItems = [];
    $(".fullScreenSpin").css("display", "inline-block");
    let dataSearchName = $("#tblInventory_filter input").val();
    if (dataSearchName.replace(/\s/g, "") != "") {
      sideBarService
        .getNewProductListVS1ByName(dataSearchName)
        .then(function (data) {
          let records = [];

          let inventoryData = [];
          if (data.tproductvs1.length > 0) {
            for (let i = 0; i < data.tproductvs1.length; i++) {
              var dataList = "";
              if (currentLoc == "/purchaseordercard") {
                dataList = [

                    data.tproductvs1[i].fields.ProductName || '-',
                    data.tproductvs1[i].fields.SalesDescription || '',
                    data.tproductvs1[i].fields.BARCODE || '',
                    utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100),
                    utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) / 100),
                    data.tproductvs1[i].fields.TotalQtyInStock ,
                    data.tproductvs1[i].fields.TaxCodePurchase || '',
                    data.tproductvs1[i].fields.ID || '',
                    JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice)||null,

                ];
               }else{
                 dataList = [

                     data.tproductvs1[i].fields.ProductName || '-',
                     data.tproductvs1[i].fields.SalesDescription || '',
                     data.tproductvs1[i].fields.BARCODE || '',
                     utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100),
                     utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) / 100),
                     data.tproductvs1[i].fields.TotalQtyInStock,
                     data.tproductvs1[i].fields.TaxCodeSales || '',
                     data.tproductvs1[i].fields.ID || '',
                     JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice)||null,
                 ];
               }

            if (data.tproductvs1[i].fields.ExtraSellPrice != null) {
                for (let e = 0; e < data.tproductvs1[i].fields.ExtraSellPrice.length; e++) {
                    let lineExtaSellObj = {
                        clienttype: data.tproductvs1[i].fields.ExtraSellPrice[e].fields.ClientTypeName || '',
                        productname: data.tproductvs1[i].fields.ExtraSellPrice[e].fields.ProductName || data.tproductvs1[i].fields.ProductName,
                        price: utilityService.modifynegativeCurrencyFormat(data.tproductvs1[i].fields.ExtraSellPrice[e].fields.Price1) || 0
                    };
                    lineExtaSellItems.push(lineExtaSellObj);

                }
              }
              if (currentLoc == "/stockadjustmentcard") {
                if (data.tproductvs1[i].fields.ProductType == "INV") {
                  splashArrayProductList.push(dataList);
                }
              } else {
                splashArrayProductList.push(dataList);
              }
            }
            //localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));
            $(".fullScreenSpin").css("display", "none");
            if (splashArrayProductList) {
              var datatable = $(".tblInventory").DataTable();
              datatable.clear();
              datatable.rows.add(splashArrayProductList);
              datatable.draw(false);
            }
          } else {
            $(".fullScreenSpin").css("display", "none");
            $("#productListModal").modal("toggle");
            swal({
              title: "Question",
              text: "Product does not exist, would you like to create it?",
              type: "question",
              showCancelButton: true,
              confirmButtonText: "Yes",
              cancelButtonText: "No",
            }).then((result) => {
              if (result.value) {
                $("#newProductModal").modal("toggle");
                $("#edtproductname").val(dataSearchName);
              } else if (result.dismiss === "cancel") {
                $("#productListModal").modal("toggle");
              }
            });
          }
        })
        .catch(function (err) {
          $(".fullScreenSpin").css("display", "none");
        });
    } else {
    sideBarService.getNewProductListVS1(initialBaseDataLoad,0).then(function (data) {
      addVS1Data('TProductVS1',JSON.stringify(data));
          let records = [];
          let inventoryData = [];
          for (let i = 0; i < data.tproductvs1.length; i++) {
            var dataList = "";

              if (currentLoc == "/purchaseordercard"){
                dataList = [

                    data.tproductvs1[i].fields.ProductName || '-',
                    data.tproductvs1[i].fields.SalesDescription || '',
                    data.tproductvs1[i].fields.BARCODE || '',
                    utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100),
                    utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) / 100),
                    data.tproductvs1[i].fields.TotalQtyInStock,
                    data.tproductvs1[i].fields.TaxCodePurchase || '',
                    data.tproductvs1[i].fields.ID || '',
                    JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice)||null,

                ];
               }else{
                 dataList = [

                     data.tproductvs1[i].fields.ProductName || '-',
                     data.tproductvs1[i].fields.SalesDescription || '',
                     data.tproductvs1[i].fields.BARCODE || '',
                     utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100),
                     utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) / 100),
                     data.tproductvs1[i].fields.TotalQtyInStock,
                     data.tproductvs1[i].fields.TaxCodeSales || '',
                     data.tproductvs1[i].fields.ID || '',
                     JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice)||null,

                 ];
               }
              if (data.tproductvs1[i].fields.ExtraSellPrice != null) {
                  for (let e = 0; e < data.tproductvs1[i].fields.ExtraSellPrice.length; e++) {
                      let lineExtaSellObj = {
                          clienttype: data.tproductvs1[i].fields.ExtraSellPrice[e].fields.ClientTypeName || '',
                          productname: data.tproductvs1[i].fields.ExtraSellPrice[e].fields.ProductName || data.tproductvs1[i].fields.ProductName,
                          price: utilityService.modifynegativeCurrencyFormat(data.tproductvs1[i].fields.ExtraSellPrice[e].fields.Price1) || 0
                      };
                      lineExtaSellItems.push(lineExtaSellObj);

                  }
              }
              if (currentLoc == "/stockadjustmentcard"){
                if (data.tproductvs1[i].fields.ProductType == "INV") {
                splashArrayProductList.push(dataList);
              }
            } else {
              splashArrayProductList.push(dataList);
            }
          }
          //localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));
          $(".fullScreenSpin").css("display", "none");
          if (splashArrayProductList) {
            // var datatable = $('#tblInventory').DataTable();
            // datatable.clear();
            // datatable.rows.add(splashArrayProductList);
            // datatable.draw(false);
          }
        })
        .catch(function (err) {
          $(".fullScreenSpin").css("display", "none");
        });
    }
  },
  "click #productListModal #refreshpagelist": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    localStorage.setItem("VS1SalesProductList", "");
    let templateObject = Template.instance();
    Meteor._reload.reload();
    templateObject.getAllProducts();
  },
  "click .scanProdServiceBarcodePOP": function (event) {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      $("#scanBarcodeModalProduct").modal("toggle");
    } else {
      swal({
        title: "Please Note:",
        text: "This function is only available on mobile devices!",
        type: "warning",
      }).then((result) => {});
    }
  },
  "click .btnCloseProdModal": function (event) {
    $("#scanBarcodeModalProduct").modal("toggle");
  },
});

Template.productlistpopfortransaction.helpers({
  datatablerecords: () => {
    return Template.instance().datatablerecords.get();
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "tblInventory",
    });
  },
  // custom fields displaysettings
  custfields: () => {
    return Template.instance().custfields.get();
  },

  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },

  convertedStatus: () => {
    return Template.instance().convertedStatus.get();
  },

  apiFunction: function () {
    // do not use arrow function
    return sideBarService.getNewProductQtyListVS1;
  },

  searchAPI: function () {
    return sideBarService.getNewProductListVS1ByName;
  },

  apiParams: function () {
    return [
      "limitCount",
      "limitFrom",
      "deleteFilter",
    ];
  },

  service: function () {
    return sideBarService;
  },

  datahandler: function () {
    let templateObject = Template.instance();
    return function (data) {
      let dataReturn = templateObject.getDataTableList(data);
      return dataReturn;
    };
  },

  exDataHandler: function () {
    let templateObject = Template.instance();
    return function (data) {
      //let dataReturn = templateObject.getExData(data);
      let dataReturn = templateObject.getDataTableList(data);
      return dataReturn;
    };
  },

  tablename: () => {
    let templateObject = Template.instance();
    let accCustID = templateObject.data.custid ? templateObject.data.custid : '';
    return 'tblInventory'+ accCustID;
  },
 
});
