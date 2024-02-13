// @ts-nocheck
import { ReactiveVar } from "meteor/reactive-var";
import "jquery-ui-dist/external/jquery/jquery";
import "jquery-ui-dist/jquery-ui";
import "jQuery.print/jQuery.print.js";
import "jquery-editable-select";
import { Template } from "meteor/templating";
import "./customerscard.css";
import "./customerscard.html";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
const moment = require("moment-timezone");
import { HTTP } from "meteor/http";
import { error } from "jquery";
import { indexOf } from "lodash";

Template.customerscard.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.listNumber = new ReactiveVar();
  templateObject.frequencyTimer = new ReactiveVar();
  templateObject.currentTab = new ReactiveVar("tab-1");
  templateObject.transNote = new ReactiveVar("");
  templateObject.transDetail = new ReactiveVar("");
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.tableheaderrecordsfortransactions = new ReactiveVar([]);
  templateObject.tableheaderrecordsfortransactionsdetail = new ReactiveVar([]);
  templateObject.todayDate = new ReactiveVar(
    moment(new Date()).format("DD/MM/YYYY")
  );
  templateObject.selConnectionId = new ReactiveVar(-1);
  templateObject.seltransactionId = new ReactiveVar(1);
  templateObject.connectionType = new ReactiveVar("");
  var today = new Date();
  templateObject.todayDate.set(
    ("0" + today.getDate()).slice(-2) +
      "/" +
      ("0" + (today.getMonth() + 1)).slice(-2) +
      "/" +
      today.getFullYear()
  );
  templateObject.getDataTableList = function (data) {
    let todaySet =
      ("0" + today.getDate()).slice(-2) +
      "/" +
      ("0" + (today.getMonth() + 1)).slice(-2) +
      "/" +
      today.getFullYear();
    let setFrequencyButton = `<button class="btn btn-success btn-frequency setFrequency" id="setFrequency"><i class="fa fa-send" style="padding-right: 5px;"></i>Set Frequency </button>`;
    let runNowButton = `<button class="btn btn-success btnSave btn-auto-update hover-text1 runNow" id="runNow"><i class="fa fa-sync" style="padding-right: 5px;"></i>Run Now <span class="tooltip-text" id="left">Run Now Will Only Import Objects, from the Selected Date that have Not Already Been Imported </span></button>`;
    let importAgainButton = `<button class="btn btn-success btnSave btn-auto-update hover-text1 importAgain" id="importAgain"><i class="fa fa-reply" style="padding-right: 5px;"></i>Import Again <span class="tooltip-text" id="left">Import Again Will Re-Import All Objects, from the Selected Date even If Already Imported.</span></button>`;
    let importDate = `<div class="row dateTimePickerMobile" data-toggle="tooltip" data-placement="bottom"
style="padding-left: 10px;padding-right: 10px; justify-content: center" title="Date format: DD/MM/YYYY">
<div class="input-group date" style="cursor: pointer;">
<input type="text" class="form-control edtDailyStartDate" id="edtDailyStartDate${data.ID}" name="edtDailyStartDate${data.ID}"
  value="${todaySet}" style="padding: 2px 6px">
<div class="input-group-addon">
  <span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>
</div>
</div>
</div>`;

    let dataList = [
      data.ID || "",
      data.DBName || "-",
      data.AccName || "",
      data.ConnName || "",
      '<span style="display:none;">' +
        (data.LastRanDate != ""
          ? moment(data.LastRanDate).format("YYYY/MM/DD")
          : data.LastRanDate) +
        "</span>" +
        (data.LastRanDate != ""
          ? moment(data.LastRanDate).format("DD/MM/YYYY")
          : data.LastRanDate),
      '<span style="display:none;">' +
        (data.LastRanDate != ""
          ? moment(data.LastRanDate).format("HH:mm:ss")
          : data.LastRanDate) +
        "</span>" +
        (data.LastRanDate != ""
          ? moment(data.LastRanDate).format("HH:mm:ss")
          : data.LastRanDate),
      data.RunCycle ? data.RunCycle + " hour" : "",
      '<span style="display:none;">' +
        (data.NextRunDate != ""
          ? moment(data.NextRunDate).format("YYYY/MM/DD")
          : data.NextRunDate) +
        "</span>" +
        (data.NextRunDate != ""
          ? moment(data.NextRunDate).format("DD/MM/YYYY")
          : data.NextRunDate),
      '<span style="display:none;">' +
        (data.NextRunDate != ""
          ? moment(data.NextRunDate).format("HH:mm:ss")
          : data.NextRunDate) +
        "</span>" +
        (data.NextRunDate != ""
          ? moment(data.NextRunDate).format("HH:mm:ss")
          : data.NextRunDate),
      setFrequencyButton,
      runNowButton,
      importAgainButton,
      importDate,
      data.Enabled ? "Y" : "N",
    ];
    return dataList;
  };
  templateObject.getDataTableList1 = function (data) {
    let dataList = [
      data.ID || "",
      data.AccName || "",
      data.ConnName || "",
      '<span style="display:none;">' +
        (data.Date != "" ? moment(data.Date).format("YYYY/MM/DD") : data.Date) +
        "</span>" +
        (data.Date != "" ? moment(data.Date).format("DD/MM/YYYY") : data.Date),
      data.Count || "0",
    ];
    return dataList;
  };
  templateObject.getDataTableList2 = function (data) {
    console.log("TEST", data?.Test);
    let dataList = [data.Detail || "", data.Count || "0"];
    return dataList;
  };

  let headerStructure = [
    {
      index: 0,
      label: "ID",
      class: "colID",
      active: false,
      display: true,
      width: "80",
    },
    {
      index: 1,
      label: "Database Name",
      class: "colDatabaseName",
      active: false,
      display: false,
      width: "200",
    },
    {
      index: 2,
      label: "Accounting",
      class: "colAccountingSoftware",
      active: true,
      display: true,
      width: "200",
    },
    {
      index: 3,
      label: "Connection",
      class: "colConnectionSoftware",
      active: true,
      display: true,
      width: "200",
    },
    {
      index: 4,
      label: "Last Run Date",
      class: "colLastScheduledJobRanOn",
      active: true,
      display: true,
      width: "100",
    },
    {
      index: 5,
      label: "Last Run Time",
      class: "colLastScheduledJobRanOn",
      active: true,
      display: true,
      width: "100",
    },
    {
      index: 6,
      label: "Run Every",
      class: "colRunEvery",
      active: true,
      display: true,
      width: "110",
    },
    {
      index: 7,
      label: "Next Run Date",
      class: "colNextScheduledRunAt",
      active: true,
      display: true,
      width: "100",
    },
    {
      index: 8,
      label: "Next Run Time",
      class: "colNextScheduledRunAt",
      active: true,
      display: true,
      width: "100",
    },
    {
      index: 9,
      label: "Frequency",
      class: "colSetFrequency",
      width: "120",
      active: true,
      display: true,
    },
    {
      index: 10,
      label: "Run Now",
      class: "colRunNow",
      width: "95",
      active: true,
      display: true,
    },
    {
      index: 11,
      label: "Import Again",
      class: "colImportAgain",
      width: "120",
      active: true,
      display: true,
    },
    {
      index: 12,
      label: "Import Date",
      class: "colImportDate",
      width: "130",
      active: true,
      display: true,
    },
    {
      index: 13,
      label: "Enabled",
      class: "colEnabled",
      active: true,
      display: true,
      width: "120",
    },
  ];

  let headerStructurefortransaction = [
    {
      index: 0,
      label: "No",
      class: "colConnectionId",
      active: true,
      display: true,
      width: "50",
    },
    {
      index: 1,
      label: "Accounting Software",
      class: "colAccountingSoftware",
      active: true,
      display: true,
      width: "200",
    },
    {
      index: 2,
      label: "Connection Software",
      class: "colConnectionSoftware",
      active: true,
      display: true,
      width: "200",
    },
    {
      index: 3,
      label: "Transaction Date",
      class: "colTransactionDate",
      active: true,
      display: true,
      width: "200",
    },
    {
      index: 4,
      label: "Transaction Count",
      class: "colTotalTransactions",
      active: true,
      display: true,
      width: "50",
    },
  ];

  let headerStructurefortransactionDetail = [
    {
      index: 0,
      label: "Detail",
      class: "colConnectionId",
      active: true,
      display: true,
      width: "50",
    },
    {
      index: 4,
      label: "Transaction Count",
      class: "colTotalTransactions",
      active: true,
      display: true,
      width: "50",
    },
  ];

  templateObject.tableheaderrecords.set(headerStructure);
  templateObject.tableheaderrecordsfortransactions.set(
    headerStructurefortransaction
  );
  templateObject.tableheaderrecordsfortransactionsdetail.set(
    headerStructurefortransactionDetail
  );
});

Template.customerscard.events({
  "click .mainTab": function (event) {
    const tabID = $(event.target).data("id");
    Template.instance().currentTab.set(tabID);
  },
  "click #btnNewConnectionIntab": function (event) {
    let customerId = FlowRouter.current().queryParams.id || "";
    FlowRouter.go("/connectionscard?customerId=" + customerId);
  },
  "click #saveCustomer": function (event) {
    const customerData = {
      companyName: $("#edtCustomerCompany").val(),
      email: $("#edtCustomerEmail").val(),
      firstName: $("#edtFirstName").val(),
      middleName: $("#edtMiddleName").val(),
      lastName: $("#edtLastName").val(),
      phone: $("#edtCustomerPhone").val(),
      mobile: $("#edtCustomerMobile").val(),
      fax: $("#edtCustomerFax").val(),
      skypeID: $("#edtCustomerSkypeID").val(),
      website: $("#edtCustomerWebsite").val(),
      logon_name: $("#logonName").val(),
      logon_password: $("#logonPassword").val(),
    };

    // Meteor.call('addCustomer', customerData, (err, result) => {
    //     if (err) console.log(err)
    //     else {
    //         if (result == "success") swal("",'successfully added!', "success");
    //         else if (result == 'email used') {
    //             swal("","Email address is already using.... \n Please use another Email address.","warning");
    //             $('#edtCustomerEmail').focus();
    //         }
    //     }
    // })

    fetch("/api/addCustomer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    })
      .then((response) => response.json())
      .then(async (result) => {
        if (result == "success")
          swal({
            title: "Customer successfully added!",
            text: "",
            type: "success",
            showCancelButton: false,
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.value) {
              window.open("/customerlist", "_self");
            } else if (result.dismiss === "cancel") {
            }
          });
        else if (result == "email used") {
          swal(
            "",
            "Email address is already using.... \n Please use another Email address.",
            "warning"
          );
          $("#edtCustomerEmail").focus();
        }
      })
      .catch((error) => console.log(error));
  },

  "click #updateCustomer": function (e) {
    const customerData = {
      id: FlowRouter.current().queryParams.id,
      companyName: $("#edtCustomerCompany").val(),
      email: $("#edtCustomerEmail").val(),
      firstName: $("#edtFirstName").val(),
      middleName: $("#edtMiddleName").val(),
      lastName: $("#edtLastName").val(),
      phone: $("#edtCustomerPhone").val(),
      mobile: $("#edtCustomerMobile").val(),
      fax: $("#edtCustomerFax").val(),
      skypeID: $("#edtCustomerSkypeID").val(),
      website: $("#edtCustomerWebsite").val(),
      logon_name: $("#logonName").val(),
      logon_password: $("#logonPassword").val(),
    };

    // Meteor.call('updateCustomer', customerData, (err, result) => {
    //     if (err) console.log(err)
    //     else {
    //         if (result == "success") swal("",'Customer Successfully Updated',"success");
    //     }
    // })

    fetch("/api/updateCustomer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    })
      .then((response) => response.json())
      .then(async (result) => {
        if (result == "success")
          swal({
            title: "Customer successfully updated!",
            text: "",
            type: "success",
            showCancelButton: false,
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.value) {
              window.open("/customerlist", "_self");
            } else if (result.dismiss === "cancel") {
            }
          });
      })
      .catch((error) => console.log(error));
  },

  "click .btnDelete": function () {
    if (FlowRouter.current().queryParams.id) {
      // Meteor.call('reomoveCustomer', FlowRouter.current().queryParams, (err, result) => {
      //     if (err) console.log(err)
      //     else {
      //         swal("",result,"error")
      //     }
      // })

      const postData = {
        id: FlowRouter.current().queryParams.id,
      };

      fetch("/api/removeCustomer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })
        .then((response) => response.json())
        .then(async (result) => {
          if (result == "success") swal("", result, "success");
        })
        .catch((error) => console.log(error));
    }
  },

  "click .btnBack": function (event) {
    event.preventDefault();
    history.back(1);
  },

  "click .connectionTab": function () {
    Template.instance().currentTab.set("tab-3");
  },

  "click .customerTab": function () {
    Template.instance().currentTab.set("tab-1");
  },

  "click .setFrequency": function () {
    var templateObject = Template.instance();
    // let selConnectionId = Template.instance().selConnectionId.get();
    // let connectionType = Template.instance().connectionType.get();
    // if (selConnectionId == -1) {
    //     swal("", 'Please Select Connection Data', "error")
    //     return;
    // }
    let listData = $(event.target).closest("tr").attr("id");
    let connectionType =
      $(event.target).closest("tr").find(".colConnectionSoftware").text() || "";
    console.log(connectionType);
    templateObject.selConnectionId.set(listData);
    templateObject.connectionType.set(connectionType);
    jQuery("#frequencyModal").modal("toggle");
  },

  'click input[name="frequencyRadio"]': function (event) {
    if (event.target.id == "frequencyMonthly") {
      document.getElementById("monthlySettings").style.display = "block";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
    } else if (event.target.id == "frequencyWeekly") {
      document.getElementById("weeklySettings").style.display = "block";
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
    } else if (event.target.id == "frequencyDaily") {
      document.getElementById("dailySettings").style.display = "block";
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
    } else if (event.target.id == "frequencyOnetimeonly") {
      document.getElementById("oneTimeOnlySettings").style.display = "block";
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
    } else {
      $("#copyFrequencyModal").modal("toggle");
    }
  },

  'click input[name="settingsMonthlyRadio"]': function (event) {
    if (event.target.id == "settingsMonthlyEvery") {
      $(".settingsMonthlyEveryOccurence").attr("disabled", false);
      $(".settingsMonthlyDayOfWeek").attr("disabled", false);
      $(".settingsMonthlySpecDay").attr("disabled", true);
    } else if (event.target.id == "settingsMonthlyDay") {
      $(".settingsMonthlySpecDay").attr("disabled", false);
      $(".settingsMonthlyEveryOccurence").attr("disabled", true);
      $(".settingsMonthlyDayOfWeek").attr("disabled", true);
    } else {
      $("#frequencyModal").modal("toggle");
    }
  },

  'click input[name="dailyRadio"]': function (event) {
    if (event.target.id == "dailyEveryDay") {
      $(".dailyEveryXDays").attr("disabled", true);
    } else if (event.target.id == "dailyWeekdays") {
      $(".dailyEveryXDays").attr("disabled", true);
    } else if (event.target.id == "dailyEvery") {
      $(".dailyEveryXDays").attr("disabled", false);
    } else {
      $("#frequencyModal").modal("toggle");
    }
  },

  "click .runNow": function () {
    var unite = $("#basic-addon3").val() == 0 ? 24 * 3600 : 60;
    var frequency = $("#dailyEveryXDays").val() * unite * 1000;
    // setInterval(RunNow(), frequency);

    var templateObject = Template.instance();
    let listData = $(event.target).closest("tr").attr("id");
    let connectionType =
      $(event.target).closest("tr").find(".colConnectionSoftware").text() || "";
    console.log(connectionType);
    templateObject.selConnectionId.set(listData);
    templateObject.connectionType.set(connectionType);
    RunNow("", listData);
  },
  "click #importAgain": function () {
    var templateObject = Template.instance();

    let listData = $(event.target).closest("tr").attr("id");
    let connectionType =
      $(event.target).closest("tr").find(".colConnectionSoftware").text() || "";
    console.log(listData);
    console.log(connectionType);
    var tempCustomDate =
      $(event.target).closest("tr").find(".edtDailyStartDate").val() || "";
    console.log(tempCustomDate);
    //$("#edtDailyStartDate").val();
    // Parse the input date string
    const parts = tempCustomDate.split("/");
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    // Create a Date object
    const parsedDate = new Date(`${year}-${month}-${day}`);

    // Extract the components of the parsed date
    const newYear = parsedDate.getFullYear();
    const newMonth = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const newDay = String(parsedDate.getDate()).padStart(2, "0");

    // Create the output date string in "yyyy-mm-dd" format
    const customDate = `${newYear}-${newMonth}-${newDay}`;

    console.log(customDate);
    templateObject.selConnectionId.set(listData);
    templateObject.connectionType.set(connectionType);
    RunNow(customDate, listData);
  },

  // 'click #tblConnectionList tbody td:nth-child(n)': function (event) {
  //     let listData = $(event.target).closest('tr').attr("id");
  //     Template.instance().selConnectionId.set(listData);
  //     $(event.target).closest('tr').siblings().removeClass('currentSelect');
  //     $(event.target).closest('tr').addClass('currentSelect');
  // },
  "click #tblConnectionListInTab tbody td:not(.colSetFrequency):not(.colRunNow):not(.colImportAgain)":
    function (event) {
      var listData = $(event.target).closest("tr").attr("id");
      var customerId = FlowRouter.current().queryParams.id;
      var target = $(event.target)[0].innerText;
      if ($(event.target)[0].className == "  colConnectionSoftware") {
        FlowRouter.go(
          "/connectionscard?id=" +
            listData +
            "&customerId=" +
            customerId +
            "&tab=2"
        );
      } else if ($(event.target)[0].className == "  colAccountingSoftware") {
        FlowRouter.go(
          "/connectionscard?id=" +
            listData +
            "&customerId=" +
            customerId +
            "&tab=1"
        );
      } else {
        FlowRouter.go(
          "/connectionscard?id=" +
            listData +
            "&customerId=" +
            customerId +
            "&tab=1"
        );
      }
      Template.instance().selConnectionId.set(listData);
      // $(event.target).closest('tr').siblings().removeClass('currentSelect');
      // $(event.target).closest('tr').addClass('currentSelect');
    },

  // 'click #tblTransactionListInTab tbody td:nth-child(n)': function (event) {
  //     var listData = $(event.target).closest('tr').attr("id");
  //     Template.instance().seltransactionId.set(listData);
  //     $(event.target).closest('tr').siblings().removeClass('currentSelect');
  //     $(event.target).closest('tr').addClass('currentSelect');
  // },

  "click #transActions": function (event) {
    jQuery("#transactionModal").modal("toggle");
  },

  "click #tblTransactionsById tbody td:nth-child(n)": function (event) {
    let templateObject = Template.instance();
    let listData = $(event.target).closest("tr").attr("id");
    templateObject.selConnectionId.set(listData);
    $(event.target).closest("tr").siblings().removeClass("currentSelect");
    $(event.target).closest("tr").addClass("currentSelect");

    $(event.target).closest("tr").siblings().attr("style", "background: node");
    $(event.target)
      .closest("tr")
      .attr("style", "background: rgba(78, 115, 223, 0.31)!important;");
    // const transData = "<div style=\"margin-top: 10px; margin: 0px;\" >" +
    //     "<h6 style=\" display: inline-block;\" ><b>Accounting Software:</b></h6>&nbsp;&nbsp;&nbsp;" +
    //     templateObject.datatablerecords.AccName +
    //     "</div>" +
    //     "<div style=\"margin: 0px;\" >" +
    //     "<h6 style=\" display: inline-block;\" ><b>Connection Software:</b></h6>&nbsp;&nbsp;&nbsp;" +
    //     templateObject.datatablerecords.ConnName +
    //     "</div>" +
    //     "<div style=\"margin: 0px;\" >" +
    //     "<h6 style=\" display: inline-block;\" ><b>Sales Date:</b></h6>&nbsp;&nbsp;&nbsp;" +
    //     templateObject.datatablerecords.Date +
    //     "</div>" +
    //     "<div style=\"margin: 0px;\" >" +
    //     "<h6 style=\" display: inline-block;\" ><b>Transaction ID:</b></h6>&nbsp;&nbsp;&nbsp;" +
    //     templateObject.datatablerecords.Id +
    //     "</div>" +
    //     "<div style=\"margin: 0px;\" >" +
    //     "<h6 style=\" display: inline-block;\" ><b>Order Number:</b></h6>&nbsp;&nbsp;&nbsp;" +
    //     templateObject.datatablerecords.OrderNum +
    //     "</div>" +
    //     "<div style=\"margin: 0px;\" >" +
    //     "<h6 style=\" display: inline-block;\" ><b>Product Cost:</b></h6>&nbsp;&nbsp;&nbsp;" +
    //     "$" + templateObject.datatablerecords.productData.SellQty1PriceInc +
    //     "</div>" +
    //     "<div style=\"margin: 0px;\" >" +
    //     "<h6 style=\" display: inline-block;\" ><b>Total Taxes:</b></h6>&nbsp;&nbsp;&nbsp;" +
    //     templateObject.datatablerecords.productData.TaxCodeSales +
    //     "</div>" +
    //     "<div style=\"margin: 0px;\" >" +
    //     "<h6 style=\" display: inline-block;\" ><b>CogsAccount:</b></h6>&nbsp;&nbsp;&nbsp;" +
    //     templateObject.datatablerecords.productData.CogsAccount +
    //     "</div>";
    // var transData = templateObject.datatablerecords;
    //   templateObject.transDetail.set(transData)
    const transData =
      '<div style="margin-top: 10px; margin: 0px;" >' +
      '<h6 style=" display: inline-block;" ><b>Uploaded products from TrueERP to Magento:</b></h6>&nbsp;&nbsp;&nbsp;' +
      templateObject.datatablerecords.UploadedNum +
      "</div>" +
      '<div style="margin: 0px;" >' +
      '<h6 style=" display: inline-block;" ><b>Downloaded products from Magento to TrueERP:</b></h6>&nbsp;&nbsp;&nbsp;' +
      templateObject.datatablerecords.DownloadedNum +
      "</div>";
    jQuery("#transDetail").html(transData);
  },
});

//Template.customerscard.onRendered(h => {
//Template.customerscard.onRendered(async function() {
Template.customerscard.onRendered(function () {
  setTimeout(function () {
    $("#startDate, .edtDailyStartDate").datepicker({
      showOn: "button",
      buttonText: "Show Date",
      buttonImageOnly: true,
      buttonImage: "/img/imgCal2.png",
      dateFormat: "dd/mm/yy",
      showOtherMonths: true,
      selectOtherMonths: true,
      changeMonth: true,
      changeYear: true,
      yearRange: "-90:+10",
    });
  }, 1000);
  $("#startDate")
    .datepicker({ dateFormat: "dd/mm/yy" })
    .datepicker("setDate", new Date());

  if (FlowRouter.current().queryParams.id) {
    if (FlowRouter.current().queryParams.TransTab == "connection") {
      $(".customerTab").removeClass("active");
      $(".connectionTab").trigger("click");
    } else {
      $(".connectionTab").removeClass("active");
      $(".customerTab").trigger("click");
    }

    // Meteor.call('getCustomerFromId', FlowRouter.current().queryParams, (err, result) => {
    //     if (err) swal("","Oooooops something went wrong!", "error")
    //     else {
    //         $('#edtCustomerCompany').val(result[0].name)
    //         $("#edtCustomerEmail").val(result[0].email)
    //         $("#edtFirstName").val(result[0].firstName)
    //         $("#edtMiddleName").val(result[0].middleName)
    //         $("#edtLastName").val(result[0].lastName)
    //         $('#edtCustomerPhone').val(result[0].phone)
    //         $('#edtCustomerMobile').val(result[0].Mobile)
    //         $('#edtCustomerFax').val(result[0].fax)
    //         $("#edtCustomerSkypeID").val(result[0].skypeID)
    //         $("#edtCustomerWebsite").val(result[0].website)
    //
    //         $('#updateCustomer').show()
    //         $('#saveCustomer').hide()
    //     }
    // })

    const postData = {
      id: FlowRouter.current().queryParams.id,
    };

    fetch("/api/customersByID", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then(async (result) => {
        $("#edtCustomerCompany").val(result[0].name);
        $("#edtCustomerEmail").val(result[0].email);
        $("#edtFirstName").val(result[0].firstName);
        $("#edtMiddleName").val(result[0].middleName);
        $("#edtLastName").val(result[0].lastName);
        $("#edtCustomerPhone").val(result[0].phone);
        $("#edtCustomerMobile").val(result[0].Mobile);
        $("#edtCustomerFax").val(result[0].fax);
        $("#edtCustomerSkypeID").val(result[0].skypeID);
        $("#edtCustomerWebsite").val(result[0].website);
        $("#logonPasswrod").val(result[0].logon_password);
        $("#logonName").val(result[0].logon_name);

        $("#updateCustomer").show();
        $("#saveCustomer").hide();
      })
      .catch((error) => swal("", "Oooooops something went wrong!", "error"));
  }
  $(
    "#edtWeeklyStartDate,#edtWeeklyFinishDate,#dtDueDate,#customdateone,#edtMonthlyStartDate,#edtMonthlyFinishDate,.edtDailyStartDate,#edtDailyFinishDate,#edtOneTimeOnlyDate"
  ).datepicker({
    showOn: "button",
    buttonText: "Show Date",
    buttonImageOnly: true,
    buttonImage: "/img/imgCal2.png",
    constrainInput: false,
    dateFormat: "d/mm/yy HH:mm:ss",
    showOtherMonths: true,
    selectOtherMonths: true,
    changeMonth: true,
    changeYear: true,
    yearRange: "-90:+10",
  });
  // $('#tblConnectionList tbody').on('click', 'td:nth-child(n)', function () {
  //     let listData = $(this).closest('tr').attr("id");
  //     Template.instance().selConnectionId.set(listData);
  //     $(this).closest('tr').siblings().removeClass('currentSelect');
  //     $(this).closest('tr').addClass('currentSelect');
  // });
}),
  Template.customerscard.helpers({
    listNumber: () => {
      return localStorage.getItem("customerActiveNumber");
    },
    // record: () => {
    //     let parentRecord = Template.parentData(0).record;
    //     if (parentRecord) {
    //         return parentRecord;
    //     } else {
    //         let temp = Template.instance().records.get();
    //         let phoneCodes = Template.instance().phoneCodeData.get();
    //         if (temp && temp.mobile && temp.country) {
    //             let thisCountry = phoneCodes.find(item => {
    //                 return item.name == temp.country
    //             })
    //             temp.mobile = temp.mobile.replace(thisCountry.dial_code, '0')
    //         }
    //         return temp;
    //     }
    // },

    currentTab: () => {
      let currentId = FlowRouter.current().queryParams;
      if (currentId.TransTab == "connection") return "tab-3";
      return "tab-1";
    },

    tableheaderrecords: () => {
      return Template.instance().tableheaderrecords.get();
    },
    tableheaderrecordsfortransactions: () => {
      return Template.instance().tableheaderrecordsfortransactions.get();
    },
    tableheaderrecordsfortransactionsdetail: () => {
      return Template.instance().tableheaderrecordsfortransactionsdetail.get();
    },

    datahandler: function () {
      let templateObject = Template.instance();
      return function (data) {
        templateObject.datatablerecords = data;
        let dataReturn = templateObject.getDataTableList(data);
        return dataReturn;
      };
    },
    datahandler1: function () {
      let templateObject = Template.instance();
      return function (data) {
        templateObject.datatablerecords = data;
        let dataReturn = templateObject.getDataTableList1(data);
        return dataReturn;
      };
    },
    datahandler2: function () {
      let templateObject = Template.instance();
      return function (data) {
        templateObject.datatablerecords = data;
        let dataReturn = templateObject.getDataTableList2(data);
        return dataReturn;
      };
    },

    todayDate: function () {
      return Template.instance().todayDate.get();
    },

    transNote: function () {
      return Template.instance().transNote.get();
    },

    transDetail: function () {
      return Template.instance().transDetail.get();
    },

    selConnectionId: function () {
      return Template.instance().selConnectionId.get();
    },

    seltransactionId: function () {
      return Template.instance().seltransactionId.get();
    },

    tableOptions() {
      // This helper returns the options for your datatablelist template
      return {
        tableclass: "tblTransactionListInTabDetail",
        tablename: "tblTransactionListInTabDetail",
        indexeddbname: "TTransactionDetailList",
        tableheaderrecords: tableheaderrecordsfortransactionsdetail,
        isselection: true,
        exportfilename: "Transaction Detail List",
        datahandler: datahandler2,
        exdatahandler: exDataHandler2,
        searchAPI: searchAPI,
        orderby: '[[ 1, "asc" ]]',
        seltransactionId: seltransactionId,
      };
    },
  });

Template.registerHelper("equals", function (a, b) {
  return a === b;
});

Template.registerHelper("notEquals", function (a, b) {
  return a != b;
});

const fetchMProduct = (
  templateObject,
  lstUpdateTime,
  base_api_url,
  tempAccount,
  token,
  selConnectionId,
  text
) => {
  text += `\n Job MAGENTO_SYNCH_PRODUCT \n`;
  text += "Magento send Products to TrueERP Queued.\n";
  templateObject.transNote.set(text);

  let productCount, tempResponse;
  let product_url = `${base_api_url}/rest/all/V1/products/?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`;
  HTTP.call(
    "POST",
    "/api/getMProducts",
    {
      data: {
        auth: `Bearer ${token}`,
        url: product_url,
      },
    },
    (error, response) => {
      if (error) {
        console.error("Error:", error);
      } else {
        productCount = response.data.total_count;
        tempResponse = response.data.items;
        // Process the response data here
        // templateObject.transNote.set(JSON.stringify(response.data.items));
        // if (!productCount) {
        //     // text += `Obtained 0 products to synch from Magento to TrueERP.\n`;
        //     // templateObject.transNote.set(text);
        //     // fetchOrder(templateObject, lstUpdateTime, base_api_url, tempAccount, token, selConnectionId, text);
        // } else {
        //     if (productCount == 1)
        //         text += `Obtained ${productCount} product to synch from Magento to TrueERP.\n`;
        //     else
        //         text += `Obtained ${productCount} product to synch from Magento to TrueERP.\n`;
        // }

        templateObject.transNote.set(text);

        // text += `\n Job TRUEERP_SYNCH_PRODUCT \n`;
        // text += 'Magento send Products to TrueERP Queued.\n';
        // templateObject.transNote.set(text);

        let jsonData;

        for (let i = 0; i < productCount; i++) {
          jsonData = {
            type: "TProductWeb",
            fields: {
              ProductType: "INV",
              ProductName: tempResponse[i].name,
              PurchaseDescription: tempResponse[i].name,
              SalesDescription: tempResponse[i].name,
              AssetAccount: "Inventory Asset",
              CogsAccount: "Cost of Goods Sold",
              IncomeAccount: "Sales",
              BuyQty1: tempResponse[i].UOMQtySold,
              BuyQty1Cost: tempResponse[i].price,
              BuyQty2: tempResponse[i].UOMQtySold,
              BuyQty2Cost: tempResponse[i].price,
              BuyQty3: tempResponse[i].UOMQtySold,
              BuyQty3Cost: tempResponse[i].price,
              SellQty1: tempResponse[i].UOMQtySold,
              SellQty1Price: tempResponse[i].price,
              SellQty2: tempResponse[i].UOMQtySold,
              SellQty2Price: tempResponse[i].price,
              SellQty3: tempResponse[i].UOMQtySold,
              SellQty3Price: tempResponse[i].price,
              TaxCodePurchase: "NCG",
              TaxCodeSales: "GST",
              UOMPurchases: "Units",
              UOMSales: "Units",
            },
          };

          HTTP.call(
            "POST",
            `${tempAccount.base_url}/erpapi/TProductWeb`,
            {
              headers: {
                Username: `${tempAccount.user_name}`,
                Password: `${tempAccount.password}`,
                Database: `${tempAccount.database}`,
              },
              data: jsonData,
            },
            (error, response) => {
              if (error) console.error("Error:", error);
              else {
                text += `Obtained ${productCount} products to synch from Magento to TrueERP\n`;
                templateObject.transNote.set(text);
                fetchProduct(
                  templateObject,
                  lstUpdateTime,
                  base_api_url,
                  tempAccount,
                  token,
                  selConnectionId,
                  text
                );
              }
            }
          );
        }
        if (productCount == 0) {
          text += `Obtained ${productCount} products to synch from Magento to TrueERP\n`;
          templateObject.transNote.set(text);
          fetchProduct(
            templateObject,
            lstUpdateTime,
            base_api_url,
            tempAccount,
            token,
            selConnectionId,
            text
          );
        }
      }
    }
  );
};

const fetchProduct = (
  templateObject,
  lstUpdateTime,
  base_api_url,
  tempAccount,
  token,
  selConnectionId,
  text
) => {
  // let productCount, tempResponse;
  // let product_url = `${base_api_url}/rest/all/V1/products/?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`;
  // HTTP.call('GET', product_url, {
  //     headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //     },
  // }, (error, response) => {
  //     if (error) {
  //         console.error('Error:', error);
  //     } else {
  //         productCount = response.data.total_count;
  //         tempResponse = response.data.items;
  //         // Process the response data here
  //         // templateObject.transNote.set(JSON.stringify(response.data.items));
  //         if(!productCount){
  //             text += `There are No Products to Receive\n`;
  //             templateObject.transNote.set(text);
  //             fetchOrder(templateObject, lstUpdateTime, base_api_url, tempAccount, token, selConnectionId, text);
  //         } else {
  //             if(productCount == 1)
  //                 text += `${productCount} Product Successfully Received from Magento\n`;
  //             else
  //                 text += `${productCount} Products Successfully Received from Magento\n`;
  //         }
  //
  //         templateObject.transNote.set(text);
  //
  //         let jsonData;
  //
  //         for(let i = 0 ; i < productCount ; i ++) {
  //             jsonData = {
  //                 "type":"TProductWeb",
  //                 "fields":
  //                     {
  //                         "ProductType":"INV",
  //                         "ProductName": tempResponse[i].name,
  //                         "PurchaseDescription":tempResponse[i].name,
  //                         "SalesDescription":tempResponse[i].name,
  //                         "AssetAccount":"Inventory Asset",
  //                         "CogsAccount":"Cost of Goods Sold",
  //                         "IncomeAccount":"Sales",
  //                         "BuyQty1":tempResponse[i].UOMQtySold,
  //                         "BuyQty1Cost": tempResponse[i].price,
  //                         "BuyQty2":tempResponse[i].UOMQtySold,
  //                         "BuyQty2Cost": tempResponse[i].price,
  //                         "BuyQty3":tempResponse[i].UOMQtySold,
  //                         "BuyQty3Cost": tempResponse[i].price,
  //                         "SellQty1":tempResponse[i].UOMQtySold,
  //                         "SellQty1Price": tempResponse[i].price,
  //                         "SellQty2":tempResponse[i].UOMQtySold,
  //                         "SellQty2Price": tempResponse[i].price,
  //                         "SellQty3":tempResponse[i].UOMQtySold,
  //                         "SellQty3Price": tempResponse[i].price,
  //                         "TaxCodePurchase":"NCG",
  //                         "TaxCodeSales":"GST",
  //                         "UOMPurchases":"Units",
  //                         "UOMSales":"Units"
  //                     }
  //             }
  //
  //             HTTP.call('POST', `${tempAccount.base_url}/TProductWeb`, {
  //                 headers: {
  //                     'Username': `${tempAccount.user_name}`,
  //                     'Password': `${tempAccount.password}`,
  //                     'Database': `${tempAccount.database}`,
  //                 },
  //                 data: jsonData
  //             }, (error, response) => {
  //                 if( i == productCount - 1)
  //                     fetchOrder(templateObject, lstUpdateTime, base_api_url, tempAccount, token, selConnectionId, text);
  //                 if (error)
  //                     console.error('Error:', error);
  //                 else {
  //                     text += `1 Product Successfully Added to TrueERP with ID Number ${response.data.fields.ID}\n`
  //                     templateObject.transNote.set(text);
  //                 }
  //             });
  //         }
  //     }
  // });

  text += "\nJob TRUEERP_SYNCH_PRODUCT\n";
  text += "TrueERP send Products to Magento Queued.\n";
  templateObject.transNote.set(text);

  let productCount, tempResponse;
  let product_url =
    tempAccount.base_url +
    '/erpapi/TProduct?select=[MsTimeStamp]>"' +
    lstUpdateTime +
    '"&ListType=Detail';
  HTTP.call(
    "GET",
    product_url,
    {
      headers: {
        Username: `${tempAccount.user_name}`,
        Password: `${tempAccount.password}`,
        Database: `${tempAccount.database}`,
      },
    },
    (error, response) => {
      if (error) console.log(error);
      else {
        productCount = response.data.tproduct.length;
        tempResponse = response.data.tproduct;

        // Process the response data here
        // templateObject.transNote.set(JSON.stringify(response.data.items));
        // if (!productCount) {
        //     text += `Obtained 0 products to synch from ERP to Magento\n`;
        //     templateObject.transNote.set(text);
        //     // fetchOrder(templateObject, lstUpdateTime, base_api_url, tempAccount, token, selConnectionId, text);
        // } else {
        //     if (productCount == 1)
        //         text += `${productCount} Product Successfully Received from TrueERP\n`;
        //     else
        //         text += `${productCount} Products Successfully Received from TrueERP\n`;
        // }

        templateObject.transNote.set(text);

        let jsonData;
        let responseCount = 0;

        for (let i = 0; i < productCount; i++) {
          jsonData = {
            product: {
              sku: tempResponse[i].fields.GlobalRef,
              name: tempResponse[i].fields.ProductName,
              attribute_set_id: 4,
              price: tempResponse[i].fields.SellQty1PriceInc,
              status: tempResponse[i].fields.Active ? 1 : 0,
              visibility: 4,
              type_id: "simple",
              weight: `${tempResponse[i].fields.NetWeightKg}`,
              extension_attributes: {
                stock_item: {
                  qty: `${tempResponse[i].fields.TotalStockQty}`,
                  is_in_stock: tempResponse[i].fields.TotalStockQty
                    ? true
                    : false,
                },
              },
              custom_attributes: [
                {
                  attribute_code: "PrintName",
                  value: tempResponse[i].fields.ProductPrintName
                    ? tempResponse[i].fields.ProductPrintName
                    : "",
                },
                {
                  attribute_code: "PurchaseDescription",
                  value: tempResponse[i].fields.PurchaseDescription
                    ? tempResponse[i].fields.PurchaseDescription
                    : "",
                },
                {
                  attribute_code: "Description",
                  value: tempResponse[i].fields.SalesDescription
                    ? tempResponse[i].fields.SalesDescription
                    : "",
                },
                {
                  attribute_code: "SellQty1Price",
                  value: tempResponse[i].fields.SellQty1Price
                    ? tempResponse[i].fields.SellQty1Price
                    : 0,
                },
                {
                  attribute_code: "BuyQty1Cost",
                  value: tempResponse[i].fields.BuyQty1Cost
                    ? tempResponse[i].fields.BuyQty1Cost
                    : 0,
                },
                {
                  attribute_code: "SubGroup",
                  value: tempResponse[i].fields.ProductGroup1
                    ? tempResponse[i].fields.ProductGroup1
                    : "",
                },
                {
                  attribute_code: "Type",
                  value: tempResponse[i].fields.ProductGroup2
                    ? tempResponse[i].fields.ProductGroup2
                    : "",
                },
                {
                  attribute_code: "Dept",
                  value: tempResponse[i].fields.ProductGroup3
                    ? tempResponse[i].fields.ProductGroup3
                    : "",
                },
              ],
            },
          };

          HTTP.call(
            "POST",
            "/api/addMProduct",
            {
              data: {
                auth: `Bearer ${token}`,
                url: base_api_url,
                data: jsonData,
              },
            },
            (error, response) => {
              responseCount++;
              if (error) {
                console.error("Error:", error);
                text += `An Error Occurred While Adding a Product to Magento\n`;
                templateObject.transNote.set(text);
              } else {
                text += `Obtained ${productCount} products to synch from ERP to Magento\n`;
                templateObject.transNote.set(text);
              }
              if (responseCount == productCount) {
                // fetchOrder(templateObject, lstUpdateTime, base_api_url, tempAccount, token, selConnectionId, text);
              }
            }
          );
        }
        if (productCount == 0) {
          text += `Obtained ${productCount} products to synch from ERP to Magento\n`;
          templateObject.transNote.set(text);
        }
        fetchOrder(
          templateObject,
          lstUpdateTime,
          base_api_url,
          tempAccount,
          token,
          selConnectionId,
          text
        );
      }
    }
  );
};

const fetchOrder = (
  templateObject,
  lstUpdateTime,
  base_api_url,
  tempAccount,
  token,
  selConnectionId,
  text
) => {
  let itemCount = 0,
    tempResponse,
    tempConnection;

  text += "\nJob MAGENTO_SYNCH_ORDER\n";
  text += "Magento send Invoices to ERP Queued\n";
  templateObject.transNote.set(text);

  // let order_url = `${base_api_url}/rest/V1/orders?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=${lstUpdateTime}&searchCriteria[filter_groups][0][filters][0][condition_type]=gt`;
  HTTP.call(
    "POST",
    "/api/getMOrders",
    {
      data: {
        auth: `Bearer ${token}`,
        url: base_api_url,
        lstUpdateTime: lstUpdateTime,
      },
    },
    (error, response) => {
      if (error) {
        console.error("Error:", error);
      } else {
        itemCount = response.data.total_count;
        tempResponse = response.data.items;
        // Process the response data here
        // templateObject.transNote.set(JSON.stringify(response.data.items));
        // if (!itemCount) {
        //     text += `There are no Sales Orders to receive on your Magento website\n`;
        //     templateObject.transNote.set(text);
        // } else {
        //     if (itemCount == 1)
        //         text += `${itemCount} Sales Order successfully received from Magento\n`;
        //     else
        //         text += `${itemCount} Sales Orders successfully received from Magento\n`;
        // }

        // templateObject.transNote.set(text);

        let jsonData;

        for (let i = 0; i < itemCount; i++) {
          // jsonData = {
          //     "type": "TSalesOrder",
          //     "fields":
          //     {
          //         "Lines": [{
          //             "type": "TSalesOrderLine",
          //             "fields": {}
          //         }]
          //     }
          // }

          // jsonData.fields.CustomerName = tempResponse[i].customer_firstname + ' ' + tempResponse[i].customer_lastname || "";
          // jsonData.fields.SaleDate = tempResponse[i].created_at || "";
          // jsonData.fields.TotalAmount = tempResponse[i].base_subtotal || "";
          // if (tempResponse[i].base_subtotal == 0) return;
          // jsonData.fields.TotalAmountInc = tempResponse[i].base_grand_total || "";
          // jsonData.fields.TotalAmountInc = (tempResponse[i].base_tax_amount == 0) ? (tempResponse[i].base_grand_total - tempResponse[i].base_subtotal) : tempResponse[i].base_tax_amount;
          // jsonData.fields.Lines[0].fields.ProductName = "New Product";
          jsonData = {
            type: "TSalesOrder",
            fields: {
              GLAccountName: "Accounts Receivable",
              CustomerName:
                tempResponse[i].customer_firstname +
                  " " +
                  tempResponse[i].customer_lastname || "",
              TermsName: "COD",
              SaleClassName: "Default",
              SaleDate: tempResponse[i].created_at || "",
              ShipToDesc:
                "XYZ Pty Ltd\r\n12 Mud Drive\r\nROTTNEST ISLAND WA 6161\r\nAustralia",
              SalesCategory: "",
              Lines: [
                {
                  type: "TSalesOrderLine",
                  fields: {
                    ProductName: "$Discount",
                    UnitOfMeasure: "Units",
                    UOMQtySold: 2,
                    LinePrice: 10,
                    LineTaxCode: "GST",
                    LinePriceInc: 11,
                    TotalLineAmount: 20,
                    TotalLineAmountInc: 22,
                  },
                },
              ],
              Comments:
                "This is comment line one\r\nand this is comment line two.",
              TotalAmount: tempResponse[i].base_grand_total || "",
              TotalAmountInc:
                tempResponse[i].base_tax_amount == 0
                  ? tempResponse[i].base_grand_total -
                    tempResponse[i].base_subtotal
                  : tempResponse[i].base_tax_amount,
            },
          };
          // jsonData = {

          //     "type": "TSalesOrder",
          //     "fields":
          //     {
          //         "GLAccountName": "Accounts Receivable",
          //         "CustomerName": tempResponse[i].customer_firstname + ' ' + tempResponse[i].customer_lastname,
          //         "TermsName": "COD",
          //         "SaleClassName": "Default",
          //         "SaleDate": tempResponse[i].created_at,
          //         "Comments": `${tempResponse[i].status_histories.length ? tempResponse[i].status_histories[0].comment : ""}`,
          //         "TotalAmount": tempResponse[i].base_subtotal,
          //         "TotalAmountInc": tempResponse[i].base_total_due
          //     }
          // }
          // jsonData.fields.ShipToDesc = `${tempResponse[i].extension_attributes.shipping_assignments[0].shipping.address.street[0]}\r\n${tempResponse[i].extension_attributes.shipping_assignments[0].shipping.address.city}\r\n${tempResponse[i].extension_attributes.shipping_assignments[0].shipping.address.country_id}`;
          // let lineItems = [];
          // for (let j = 0; j < tempResponse[i].items.length; j++) {
          //     let tempItems = {
          //         "type": "TSalesOrderLine",
          //         "fields":
          //         {
          //             "ProductName": "$Discount",
          //             "UnitOfMeasure": "Units",
          //             "UOMQtySold": tempResponse[i].items[j].qty_ordered ? tempResponse[i].items[j].qty_ordered : 0,
          //             "LinePrice": tempResponse[i].items[j].base_row_total ? tempResponse[i].items[j].base_row_total : 0,
          //             "LinePriceInc": tempResponse[i].items[j].original_price ? tempResponse[i].items[j].original_price : 0,
          //             "TotalLineAmount": tempResponse[i].items[j].price ? tempResponse[i].items[j].price : 0,
          //             "TotalLineAmountInc": tempResponse[i].items[j].price_incl_tax ? tempResponse[i].items[j].price_incl_tax : 0
          //         }
          //     }
          //     lineItems.push(tempItems);
          // }
          // jsonData.fields.Lines = lineItems;

          HTTP.call(
            "POST",
            `${tempAccount.base_url}/erpapi/TSalesOrder`,
            {
              headers: {
                Username: `${tempAccount.user_name}`,
                Password: `${tempAccount.password}`,
                Database: `${tempAccount.database}`,
              },
              data: jsonData,
            },
            (error, response) => {
              if (error) console.error("Error:", error);
              else {
                text += `Obtained ${itemCount} Invoices to synch from Magento to ERP`;
                templateObject.transNote.set(text);
                // HTTP.call('POST', '/addTransaction', { data: tempResponse[i] },
                // (error, response) => {
                //     if (error) console.debug(error);
                //     text += ` Transaction saved to CoreEDI Store.`;
                //     templateObject.transNote.set(text);
                // })
              }
            }
          );
        }
        if (itemCount == 0) {
          text += `Obtained 0 Invoices to synch from Magento to ERP`;
          templateObject.transNote.set(text);
        }
      }
    }
  );
};

const fetchWooProduct = async (
  templateObject,
  lstUpdateTime,
  tempAccount,
  url,
  token,
  selConnectionId,
  transNOtes
) => {
  //getting newly added products from ERP database
  //getting newly added customer from ERP database
  transNOtes += "\nJob TRUEERP_SYNCH_PRODUCTS\n";
  transNOtes += "TrueERP send Products to WooCommerce Queued\n";
  await fetch(
    `${tempAccount.base_url}/erpapi/TProduct?select=[MsTimeStamp]>"${lstUpdateTime}"&ListType=Detail`,
    {
      method: "GET",
      headers: {
        Database: tempAccount.database,
        Username: tempAccount.user_name,
        Password: tempAccount.password,
      },
      redirect: "follow",
    }
  )
    .then((response) => response.json())
    .then(async (result) => {
      const newProductsFromERP = result.tproduct;
      if (newProductsFromERP.length === 0) {
        transNOtes += `Obtained 0 products to synch from TrueERP to WooCommerce\n`;
        templateObject.transNote.set(transNOtes);
        fetchWooOrder(
          templateObject,
          lstUpdateTime,
          tempAccount,
          url,
          token,
          selConnectionId,
          transNOtes
        );
        return;
      } else {
        // transNOtes += `Found ${newProductsFromERP.length} newly added product(s) in ERP database.\n`;
        // templateObject.transNote.set(transNOtes);
        let newProductsFromERPCount = 0;
        console.log(newProductsFromERP);

        for (const newProductFromERP of newProductsFromERP) {
          // transNOtes += `Got ${++newProductsFromERPCount}th Product data with Id: ${newProductFromERP.Id} and MsTimeStamp: ${newProductFromERP.MsTimeStamp} from ERP.\n`;
          // templateObject.transNote.set(transNOtes);
          // const uomSalesName = esult?.fields?.UOMSales
          const bodyToAddWoocommerce = {
            name: newProductFromERP?.fields?.ProductName,
            permalink: newProductFromERP?.fields?.Hyperlink,
            // type: result?.fields?.ProductType,
            description: newProductFromERP?.fields?.SalesDescription,
            short_description: newProductFromERP?.fields?.SalesDescription,
            sku: newProductFromERP?.fields?.SKU,
            price: newProductFromERP?.fields?.WHOLESALEPRICE,
            total_sales:
              newProductFromERP?.fields?.SellQTY1 +
              newProductFromERP?.fields?.SellQTY2 +
              newProductFromERP?.fields?.SellQTY3,
            weight: `"${newProductFromERP?.fields?.NetWeightKg}"`,
            // dimensions: {
            //     "length": "",
            //     "width": "",
            //     "height": ""
            // },
            // categories: [
            //     {
            //         "id": 135,
            //         "name": "Sleeping Bags, Mats &amp; Accessories",
            //         "slug": "sleeping-bags-mats-accessories"
            //     }
            // ]
          };
          const axios = require("axios");
          // transNOtes += `(Detail) Product name: ${bodyToAddWoocommerce?.name}, Price: ${bodyToAddWoocommerce?.price}, Description: ${bodyToAddWoocommerce?.description}.\n`;
          // transNOtes += `Adding ${newProductsFromERPCount}th Product to Woocommerce.\n`;
          // templateObject.transNote.set(transNOtes);
          await axios
            .post(url + "/wp-json/wc/v3/products", bodyToAddWoocommerce, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then(async (response) => {
              const id = response.data.id;
              newProductsFromERPCount++;
            })
            .catch((err) => {
              // transNOtes += `[Error] Already existing product..\n`;
              // templateObject.transNote.set(transNOtes);
            });
        }
        transNOtes += `Obtained ${newProductsFromERPCount} products to synch from TrueERP to WooCommerce\n`;
        templateObject.transNote.set(transNOtes);
        fetchWooOrder(
          templateObject,
          lstUpdateTime,
          tempAccount,
          url,
          token,
          selConnectionId,
          transNOtes
        );
      }
    })
    .catch(() => {
      transNOtes += `Obtained 0 products to synch from TrueERP to WooCommerce\n`;
      templateObject.transNote.set(transNOtes);
    });
  // let productCount, tempResponse;
  // let product_url = `${tempAccount.base_url}/TProduct?select=[MsTimeStamp]>"` + `${lstUpdateTime}"&ListType=Detail`;
  // HTTP.call('GET', product_url, {
  //     headers: {
  //         'Username': `${tempAccount.user_name}`,
  //         'Password': `${tempAccount.password}`,
  //         'Database': `${tempAccount.database}`,
  //     },
  // }, (error, response) => {
  //     if (error)
  //         console.log(error);
  //     else {
  //         productCount = response.data.tproduct.length;
  //         tempResponse = response.data.tproduct;

  //         // Process the response data here
  //         // templateObject.transNote.set(JSON.stringify(response.data.items));
  //         if (!productCount) {
  //             text += `There are No Products to Receive\n`;
  //             templateObject.transNote.set(text);
  //             fetchWooOrder(templateObject, lstUpdateTime, tempAccount, base_url, key, secret, selConnectionId, text);
  //         } else {
  //             if (productCount == 1)
  //                 text += `${productCount} Product Successfully Received from TrueERP\n`;
  //             else
  //                 text += `${productCount} Products Successfully Received from TrueERP\n`;
  //         }

  //         templateObject.transNote.set(text);

  //         let jsonData;
  //         let responseCount = 0;

  //         for (let i = 0; i < productCount; i++) {
  //             jsonData = {
  //                 name: tempResponse[i].fields.ProductName,
  //                 type: "simple",
  //                 regular_price: `${tempResponse[i].fields.SellQty1Price}`,
  //                 description: tempResponse[i].fields.ProductPrintName,
  //                 short_description: tempResponse[i].fields.SalesDescription,
  //             }

  //             HTTP.call('POST', `${base_url}/wp-json/wc/v3/products`, {
  //                 headers: {
  //                     'Authorization': 'Basic ' + btoa(`${key}:${secret}`),
  //                 },
  //                 data: jsonData
  //             }, (error, response) => {
  //                 responseCount++;
  //                 if (error) {
  //                     console.error('Error:', error);
  //                     text += `An Error Occurred While Adding a Product to WooCommerce\n`
  //                     templateObject.transNote.set(text);
  //                 }
  //                 else {
  //                     text += `1 Product Successfully Added to WooCommerce with ID Number ${response.data.id}\n`
  //                     templateObject.transNote.set(text);
  //                 }
  //                 if (responseCount == productCount) {
  //                     fetchWooOrder(templateObject, lstUpdateTime, tempAccount, base_url, key, secret, selConnectionId, text);
  //                 }
  //             });
  //         }
  //     }
  // });
};

const fetchWooOrder = async (
  templateObject,
  lstUpdateTimeUTC,
  tempAccount,
  url,
  token,
  selConnectionId,
  transNOtes
) => {
  let itemCount = 0,
    tempResponse,
    tempConnection;
  transNOtes += "\nJob WOOCOMMERCE_SYNCH_ORDER\n";
  transNOtes += "WooCommerce send Invoices to ERP Queued\n";
  const axios = require("axios");
  // let order_url = `${base_url}/wp-json/wc/v3/orders?modified_after=${lstUpdateTime}`;
  // HTTP.call('GET', order_url, {
  //     headers: {
  //         'Authorization': `Bearer ${token}`,
  //     },
  // }, (error, response) => {
  //     if (error) {
  //         console.error('Error:', error);
  //     } else {
  //         if (response.data.length === 0) {
  //             transNOtes += `Obtained 0 invoices to synch from WooCommerce to ERP\n`;
  //             templateObject.transNote.set(transNOtes);
  //             return;
  //         }
  //         const filteredOrders = response.data.filter(order => {
  //             const updatedDate = new Date(order.updated_at);
  //             const last = new Date(`${lstUpdateTime}Z`)
  //             return updatedDate > last;
  //         });
  //         itemCount = filteredOrders.length;
  //         tempResponse = filteredOrders;
  //         // Process the response data here
  //         // templateObject.transNote.set(JSON.stringify(response.data.items));
  //         if (!itemCount) {
  //             transNOtes += `Obtained 0 invoices to synch from WooCommerce to ERP\n`;
  //             templateObject.transNote.set(transNOtes);
  //         } else {
  //             if (itemCount == 1) {
  //                 transNOtes += `Obtained One invoice to synch from WooCommerce to ERP\n`;
  //                 templateObject.transNote.set(transNOtes);
  //             }
  //             else {
  //                 transNOtes += `Obtained ${itemCount} invoices to synch from WooCommerce to ERP\n`;
  //                 templateObject.transNote.set(transNOtes);
  //             }
  //         }

  //         templateObject.transNote.set(text);

  //         let jsonData;

  //         for (let i = 0; i < itemCount; i++) {
  //             jsonData = {
  //                 "type": "TSalesOrder",
  //                 "fields":
  //                 {
  //                     "GLAccountName": "Accounts Receivable",
  //                     "CustomerName": tempResponse[i].billing_address.first_name + ' ' + tempResponse[i].billing_address.last_name,
  //                     "TermsName": "COD",
  //                     "SaleClassName": "Default",
  //                     "SaleDate": tempResponse[i].created_at,
  //                     "Comments": tempResponse[i].note,
  //                     "TotalAmount": parseFloat(tempResponse[i].total),
  //                     "TotalAmountInc": parseFloat(tempResponse[i].subtotal)
  //                 }
  //             }
  //             let lineItems = [];
  //             for (let j = 0; j < tempResponse[i].line_items.length; j++) {
  //                 let tempItems = {
  //                     "type": "TSalesOrderLine",
  //                     "fields":
  //                     {
  //                         "ProductName": tempResponse[i].line_items[j].name.split(' - ')[0],
  //                         "UnitOfMeasure": "Units",
  //                         "UOMQtySold": parseFloat(tempResponse[i].line_items[j].quantity),
  //                         "LinePrice": parseFloat(tempResponse[i].line_items[j].subtotal),
  //                         "LinePriceInc": parseFloat(tempResponse[i].line_items[j].total),
  //                         "TotalLineAmount": parseFloat(tempResponse[i].line_items[j].subtotal),
  //                         "TotalLineAmountInc": parseFloat(tempResponse[i].line_items[j].total)
  //                     }
  //                 }
  //                 lineItems.push(tempItems);
  //             }
  //             jsonData.fields.Lines = lineItems;

  //             HTTP.call('POST', `${tempAccount.base_url}/TSalesOrder`, {
  //                 headers: {
  //                     'Username': `${tempAccount.user_name}`,
  //                     'Password': `${tempAccount.password}`,
  //                     'Database': `${tempAccount.database}`,
  //                 },
  //                 data: jsonData
  //             }, (error, response) => {
  //                 if (error)
  //                     console.error('Error:', error);
  //                 else {
  //                     text += `1 Sales Order Successfully Added to TrueERP with ID Number ${response.data.fields.ID}\n`
  //                     templateObject.transNote.set(text);
  //                 }
  //             });
  //         }
  //     }
  // });

  await axios
    .get(`${url}/wp-json/wc/v3/orders?modified_after=${lstUpdateTimeUTC}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (response) => {
      const ordersFromWoocommerce = response.data;
      if (ordersFromWoocommerce.length === 0) {
        transNOtes += `Obtained 0 invoices to synch from WooCommerce to ERP\n`;
        templateObject.transNote.set(transNOtes);
      } else {
        // transNOtes += `Found ${ordersFromWoocommerce.length} newly added order(s) in the Woocommerce Website.\n`;
        // templateObject.transNote.set(transNOtes);
        let count = 0;
        for (const orderFromWoocommerce of ordersFromWoocommerce) {
          // transNOtes += `Checking ${++count}th Order from the Woocommerce Website\n`;
          // transNOtes += `(Billing Detail) First name: ${orderFromWoocommerce?.billing?.first_name}, Last name: ${orderFromWoocommerce?.billing?.last_name}, Postcode: ${orderFromWoocommerce?.billing?.postcode}.\n`;
          // for (const line of orderFromWoocommerce?.line_items) {
          //     transNOtes += `(Line Detail)    Product Id: ${line?.product_id}, Product Name: "${line?.name}", Product Price: ${line?.price}\n`;
          // }
          // transNOtes += `Adding ${count}th Order to ERP database.\n`;
          // templateObject.transNote.set(transNOtes);

          //check if the customer exists and add if not
          const clientName =
            orderFromWoocommerce?.billing?.first_name +
            " " +
            orderFromWoocommerce?.billing?.last_name;
          let clientId;
          // transNOtes += `Checking Customer in the ERP database for ClientName : ${clientName}...\n`;
          // templateObject.transNote.set(transNOtes);
          await fetch(
            `${tempAccount.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
            {
              method: "GET",
              headers: myHeaders,
              redirect: "follow",
            }
          )
            .then((response) => response.json())
            .then(async (result) => {
              if (result?.tcustomer.length > 0) {
                clientId = result?.tcustomer[0]?.Id;
                // transNOtes += `Found the Customer as ID : ${clientId}\n`;
                // templateObject.transNote.set(transNOtes);
              } else {
                // transNOtes += `Not Existing Customer, creating...\n`;
                // templateObject.transNote.set(transNOtes);
                const tempCustomerDetailtoERP = {
                  type: "TCustomer",
                  fields: {
                    ClientTypeName: "Camplist",
                    ClientName:
                      orderFromWoocommerce?.billing?.first_name +
                      " " +
                      orderFromWoocommerce?.billing?.last_name,
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
                await fetch(`${tempAccount.base_url}/TCustomer`, {
                  method: "POST",
                  headers: myHeaders,
                  redirect: "follow",
                  body: JSON.stringify(tempCustomerDetailtoERP),
                })
                  .then((response) => response.json())
                  .then(async (result) => {
                    clientId = result?.fields?.ID;
                    // transNOtes += `Added a new customer to ERP database with ID : ${clientId}.\n`;
                    // templateObject.transNote.set(transNOtes);
                  })
                  .catch((error) => console.log("error", error));
              }
            })
            .catch(() => {
              // transNOtes += `Error while getting client Id from the ERP database.\n`;
              // templateObject.transNote.set(transNOtes);
            });

          //check if the product exists and add if not
          const productList = orderFromWoocommerce?.line_items;
          const productIdList = [];
          const productQtyList = [];
          // transNOtes += `There are ${productList.length} products in the Invoice line.\n`;
          // templateObject.transNote.set(transNOtes);

          for (const product of productList) {
            // transNOtes += `Checking Product in the ERP database for ProductName : ${product?.name}...\n`;
            // templateObject.transNote.set(transNOtes);
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
                  // transNOtes += `Found the Product as ID : ${productId}\n`;
                  // templateObject.transNote.set(transNOtes);
                  productIdList.push(productId);
                  productQtyList.push(product?.quantity);
                } else {
                  // transNOtes += `Not Existing Product, creating...\n`;
                  // templateObject.transNote.set(transNOtes);

                  //getting product by id from
                  await axios
                    .get(
                      `${url}/wp-json/wc/v3/products/${product.product_id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    )
                    .then(async (response) => {
                      const productFromWoo = response.data;

                      const tempProductDetailtoERP = {
                        type: "TProductWeb",
                        fields: {
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
                          UOMSales: "Units",
                        },
                      };

                      await fetch(`${tempAccount.base_url}/TProductWeb`, {
                        method: "POST",
                        headers: myHeaders,
                        redirect: "follow",
                        body: JSON.stringify(tempProductDetailtoERP),
                      })
                        .then((response) => response.json())
                        .then(async (result) => {
                          const tempProductId = result?.fields?.ID;
                          // transNOtes += `Added a new product to ERP database with ID : ${tempProductId}.\n`;
                          // templateObject.transNote.set(transNOtes);
                          productIdList.push(tempProductId);
                          productQtyList.push(product?.quantity);
                        })
                        .catch((error) => console.log("error", error));
                    });
                }
                // productQtyList.push(product?.quantity)
              })
              .catch(() => {
                // transNOtes += `Error while getting client Id from the ERP database.\n`;
                // templateObject.transNote.set(transNOtes);
              });
          }

          // create a new invoice in ERP.
          const invoiceLines = [];
          productIdList.forEach((item, index) => {
            invoiceLines.push({
              type: "TInvoiceLine",
              fields: {
                ProductID: item,
                OrderQty: productQtyList[index],
              },
            });
          });
          if (invoiceLines.length === 0) {
            continue;
          }
          const backOrderInvoiceToERP = {
            type: "TInvoiceEx",
            fields: {
              CustomerID: clientId,
              Lines: invoiceLines,
              IsBackOrder: true,
            },
          };
          await fetch(`${tempAccount.base_url}/TinvoiceEx`, {
            method: "POST",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify(backOrderInvoiceToERP),
          })
            .then((response) => response.json())
            .then(async (result) => {
              const addedId = result?.fields?.ID;
              count++;
              transNOtes += `Added a new Invoice to ERP database with ID: ${addedId}.\n`;
              templateObject.transNote.set(transNOtes);
            })
            .catch((error) => console.log("error", error));
        }

        transNOtes += `Obtained ${count} invoices to synch from WooCommerce to ERP\n`;
        templateObject.transNote.set(transNOtes);
      }
    })
    .catch(() => {
      transNOtes += `Obtained 0 invoices to synch from WooCommerce to ERP\n`;
      templateObject.transNote.set(transNOtes);
    });

  //update the last sync time
  // transNOtes += `-----------------------------------------------------------\n`;
  // templateObject.transNote.set(transNOtes);

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
      transNOtes += `\nUpdated Last Sync Time as ${nowInSydney}.\n`;
      templateObject.transNote.set(transNOtes);
    })
    .catch((err) => console.log(err));
};

const fetchMagentoCustomerJob = (
  templateObject,
  lstUpdateTime,
  base_api_url,
  tempConnection,
  tempConnectionSoftware,
  tempAccount,
  token,
  selConnectionId,
  transNOtes
) => {
  transNOtes += "Job MAGENTO_SYNCH_CUSTOMERS\n";
  transNOtes += "Magento send Customers to TrueERP Queued\n";
  templateObject.transNote.set(transNOtes);

  let customerCount;
  let customer_url = "/api/getMCustomers";
  HTTP.call(
    "POST",
    customer_url,
    {
      data: {
        auth: `Bearer ${token}`,
        url: base_api_url,
        lstUpdateTime: lstUpdateTime,
      },
    },
    (error, response) => {
      if (error) {
        console.error("Error:", error);
        templateObject.transNote.set(
          transNOtes +
            "\n" +
            error +
            ":: Error Occurred While Attempting to get the Magento Customers\n"
        );
      } else {
        customerCount = response.data.total_count;
        tempResponse = response.data.items;

        const postData = {
          id: tempConnection.account_id,
        };

        fetch("/api/softwareByID", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        })
          .then((response) => response.json())
          .then(async (result) => {
            const postData = {
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
                let jsonData;

                if (!customerCount) {
                  transNOtes += `Obtained 0 Customers to synch from Magento to TrueERP.\n`;
                  templateObject.transNote.set(transNOtes);
                  // fetchMProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, transNOtes);
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
                  let args = {
                    id: selConnectionId,
                    last_ran_date: dateString,
                  };
                  fetch(`/api/updateLastRanDate`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(args),
                  })
                    .then((response) => response.json())
                    .then(async (result) => {})
                    .catch((err) => console.log(err));
                } else {
                  if (customerCount == 1) {
                    transNOtes =
                      transNOtes +
                      "Obtained one Customer to synch from Magento to TrueERP.\n";
                    templateObject.transNote.set(transNOtes);
                    transNOtes +=
                      "Customer Data: (" +
                      tempResponse[0].firstname +
                      " " +
                      tempResponse[0].lastname +
                      ", " +
                      tempResponse[0].email +
                      "), Updated At: " +
                      tempResponse[0].updated_at +
                      "\n";
                    templateObject.transNote.set(transNOtes);
                    // fetchMProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, transNOtes);
                  } else {
                    transNOtes +=
                      "Obtained " +
                      customerCount +
                      " Customers to synch from Magento to TrueERP.\n";
                    templateObject.transNote.set(transNOtes);
                    // fetchMProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, transNOtes);
                  }
                }

                let responseCount = 0;
                transNOtes += "\nJob TRUEERP_SYNCH_CUSTOMERS\n";
                transNOtes += "TrueERP send Customers to Magento Queued\n";
                templateObject.transNote.set(transNOtes);

                for (let i = 0; i < customerCount; i++) {
                  jsonData = {
                    type: "TCustomer",
                    fields: {
                      ClientTypeName: "Default",
                      SourceName: "Radio",
                    },
                  };

                  // await sleep(500);
                  // var tempNote = transNOtes;
                  jsonData.fields.ClientName =
                    tempResponse[i].firstname +
                      " " +
                      tempResponse[i].lastname || "";
                  // transNOtes = tempNote + 'Full-Name formating.... \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);
                  jsonData.fields.Title =
                    tempResponse[i].gender == 1 ? "Mrs" : "Mr" || "";
                  // transNOtes = tempNote + 'Converting Title .............. \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);
                  jsonData.fields.FirstName = tempResponse[i].firstname || "";
                  // transNOtes = tempNote + 'Converting FirstName ..... \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);
                  jsonData.fields.LastName = tempResponse[i].lastname || "";
                  // transNOtes = tempNote + 'Converting LastName .................. \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);
                  jsonData.fields.Street = tempResponse[i].addresses[0]
                    ? tempResponse[i].addresses[0].street[0]
                    : "";
                  // transNOtes = tempNote + 'Converting Street Address1 ............... \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);
                  jsonData.fields.Street2 = tempResponse[i].addresses[0]
                    ? tempResponse[i].addresses[0].street[1]
                    : "";
                  // transNOtes = tempNote + 'Converting Street Address2 ...... \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);
                  jsonData.fields.Postcode = tempResponse[i].addresses[0]
                    ? tempResponse[i].addresses[0].postcode
                    : "";
                  // transNOtes = tempNote + 'Converting Post Code ............................... \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);
                  jsonData.fields.State = tempResponse[i].addresses[0]
                    ? tempResponse[i].addresses[0].region.region_code
                      ? tempResponse[i].addresses[0].region.region_code
                      : ""
                    : "";
                  // transNOtes = tempNote + 'Converting State Address ....... \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);
                  jsonData.fields.Country = tempResponse[i].addresses[0]
                    ? tempResponse[i].addresses[0].country_id
                    : "";
                  // transNOtes = tempNote + 'Converting Country .............................. \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);
                  jsonData.fields.Phone = tempResponse[i].addresses[0]
                    ? tempResponse[i].addresses[0].telephone
                    : "";
                  // transNOtes = tempNote + 'Converting Phone Number .................... \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);
                  jsonData.fields.Email = tempResponse[i].email;
                  // transNOtes = tempNote + 'Converting Email Address ................................. \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);

                  // transNOtes = tempNote + 'Successfully converted customer-' + i + ' to TrueERP format. \n';
                  // await sleep(300);
                  // templateObject.transNote.set(transNOtes);

                  fetch(tempAccount.base_url + "/erpapi/TCustomer", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Username: `${tempAccount.user_name}`,
                      Password: `${tempAccount.password}`,
                      Database: `${tempAccount.database}`,
                    },
                    body: JSON.stringify(jsonData),
                  })
                    .then((response) => response.json())
                    .then(async (result) => {
                      responseCount++;
                      // transNOtes += `Customer(${jsonData.fields.ClientName}, ${jsonData.fields.Email}) Successfully Added to TrueERP -  ID: ${result.fields.ID}, GlobalRef: ${result.fields.GlobalRef})\n`
                      // templateObject.transNote.set(transNOtes);
                      if (responseCount == updatedCustomer.length) {
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
                        let args = {
                          id: selConnectionId,
                          last_ran_date: dateString,
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
                            // console.log(result);
                          })
                          .catch((err) => console.log(err));
                        // fetchMProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, transNOtes);
                      }
                    })
                    .catch((error) => {
                      // transNOtes += `An Error Occurred While Adding a Customer( ` + tempResponse[i].firstname + ' ' + tempResponse[i].lastname + ` ) to TrueERP\n`
                      // templateObject.transNote.set(transNOtes);
                    });
                }

                fetch(
                  tempAccount.base_url +
                    '/erpapi/TCustomer?select=[MsTimeStamp]>"' +
                    lstUpdateTime +
                    '"&ListType=Detail',
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      Username: `${tempAccount.user_name}`,
                      Password: `${tempAccount.password}`,
                      Database: `${tempAccount.database}`,
                    },
                  }
                )
                  .then((response) => response.json())
                  .then(async (result) => {
                    transNOtes = templateObject.transNote.get();
                    // transNOtes = templateObject.transNote.get();
                    var updatedCustomer = new Array();
                    responseCount = result.tcustomer.length;
                    var resultData = result.tcustomer;
                    // transNOtes += `Successfully received ` + responseCount + ` customer data from TrueERP. \nCustomer data: \n`;
                    // templateObject.transNote.set(transNOtes);
                    for (let i = 0; i < responseCount; i++) {
                      // transNOtes += "[ " + Number(i + 1) + " ]:  {\" " + resultData[i]['ClientName'] + ", " + resultData[i]['GlobalRef'] + " \", Updated At: " + resultData[i]['MsTimeStamp'] + " }\n";
                      // await sleep(50);
                      // templateObject.transNote.set(transNOtes);

                      if (
                        new Date(resultData[i]["MsTimeStamp"]).valueOf() >=
                        new Date(lstUpdateTime).valueOf()
                      ) {
                        updatedCustomer.push(i);
                      }
                    }

                    if (updatedCustomer.length != 0) {
                      // for (let i = 0; i < updatedCustomer.length; i++) {
                      //     transNOtes += "[ " + Number(updatedCustomer[i] + 1) + " ]:  {\" " + resultData[updatedCustomer[i]]['ClientName'] + ", " + resultData[updatedCustomer[i]]['GlobalRef'] + " \", Updated At: " + resultData[updatedCustomer[i]]['MsTimeStamp'] + " }\n";
                      //     await sleep(100);
                      //     templateObject.transNote.set(transNOtes);
                      // }

                      for (let i = 0; i < updatedCustomer.length; i++) {
                        const jsonData = {
                          customer: {
                            addresses: [
                              {
                                street: [],
                              },
                            ],
                          },
                        };

                        jsonData.customer.email =
                          resultData[updatedCustomer[i]].Email || "";
                        jsonData.customer.firstname =
                          resultData[updatedCustomer[i]].FirstName || "";
                        jsonData.customer.lastname =
                          resultData[updatedCustomer[i]].LastName || "";
                        jsonData.customer.addresses[0].firstname =
                          resultData[updatedCustomer[i]].FirstName || "";
                        jsonData.customer.addresses[0].lastname =
                          resultData[updatedCustomer[i]].LastName || "";
                        jsonData.customer.addresses[0].postcode =
                          resultData[updatedCustomer[i]].Postcode || "";
                        jsonData.customer.addresses[0].street[0] =
                          resultData[updatedCustomer[i]].Street || "";
                        jsonData.customer.addresses[0].countryId =
                          resultData[updatedCustomer[i]].Country || "";
                        jsonData.customer.addresses[0].city =
                          resultData[updatedCustomer[i]].State || "city";
                        jsonData.customer.addresses[0].telephone =
                          resultData[updatedCustomer[i]].Phone || "";

                        HTTP.call(
                          "POST",
                          "/api/addMCustomers",
                          {
                            data: {
                              auth: `Bearer ${token}`,
                              url: tempConnectionSoftware.base_api_url,
                              data: JSON.stringify(jsonData),
                            },
                          },
                          async (error, response) => {
                            if (error) console.log(error);
                            else {
                              transNOtes +=
                                "Obtained " +
                                updatedCustomer.length +
                                " Customers to synch from TrueERP to Magento.\n";
                              templateObject.transNote.set(transNOtes);
                              // Process the response data here
                              // templateObject.transNote.set(JSON.stringify(response.data.items));
                              await sleep(100);
                            }
                            // customerCount = response.data;
                            // const tempResponse = JSON.stringify(response.data.items);
                            // token = JSON.stringify(response.data.items);
                          }
                        );
                      }
                      // fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, transNOtes);
                    } else {
                      transNOtes +=
                        "Obtained 0 Customers to synch from TrueERP to Magento.\n";
                      templateObject.transNote.set(transNOtes);
                      // fetchProduct(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempAccount, token, selConnectionId, transNOtes);
                    }

                    transNOtes = templateObject.transNote.get();
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
                    let args = {
                      id: selConnectionId,
                      last_ran_date: dateString,
                    };
                    fetchMProduct(
                      templateObject,
                      lstUpdateTime,
                      tempConnectionSoftware.base_api_url,
                      tempAccount,
                      token,
                      selConnectionId,
                      transNOtes
                    );
                    fetch(`/api/updateLastRanDate`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(args),
                    })
                      .then((response) => response.json())
                      .then(async (result) => {
                        // transNOtes += `Connection Datebase updated!\n`;
                        // transNOtes += `SUCCESS!!!`;
                        // templateObject.transNote.set(transNOtes);
                      })
                      .catch((err) => console.log(err));
                  })
                  .catch((error) => {
                    console.log(error);
                    transNOtes += `An Error occurred while add TrueERP customer data to Magento Website.\n`;
                    templateObject.transNote.set(transNOtes);
                  });
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    }
  );
};

const fetchWooProduct2 = async (
  templateObject,
  lstUpdateTime,
  tempAccount,
  url,
  token,
  selConnectionId,
  transNOtes
) => {
  //getting newly added products from ERP database
  transNOtes += "\nJob WOOCOMMERCE_SYNCH_PRODUCTS\n";
  transNOtes += "WooCommerce send Products to TrueERP Queued\n";
  // fetchWooProduct(templateObject, lstUpdateTime, tempAccount, tempConnectionSoftware.base_url, token, selConnectionId, transNOtes)

  let productCount, tempResponse1;
  let product_url = `${url}/wp-json/wc/v3/products?modified_after=${lstUpdateTime}`;
  HTTP.call(
    "GET",
    product_url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    (error, response) => {
      if (error) {
        console.error("Error:", error);
      } else {
        if (response.data.length === 0) {
          transNOtes +=
            "Obtained 0 products to synch from WooCommerce to ERP\n";
          templateObject.transNote.set(transNOtes);
          fetchWooProduct(
            templateObject,
            lstUpdateTime,
            tempAccount,
            url,
            token,
            selConnectionId,
            transNOtes
          );
          return;
        }
        const filteredProducts = response.data.filter((product) => {
          const updatedDate = new Date(product.updated_at);
          const last = new Date(lstUpdateTime);
          return updatedDate > last;
        });
        productCount = filteredProducts.length;
        tempResponse1 = filteredProducts;
        // Process the response data here
        // templateObject.transNote.set(JSON.stringify(response.data.items));
        if (!productCount) {
          transNOtes +=
            "Obtained 0 products to synch from WooCommerce to ERP\n";
          templateObject.transNote.set(transNOtes);
          fetchWooProduct(
            templateObject,
            lstUpdateTime,
            tempAccount,
            url,
            token,
            selConnectionId,
            transNOtes
          );
          return;
        } else {
        }

        let jsonData;

        for (let i = 0; i < productCount; i++) {
          jsonData = {
            type: "TProductWeb",
            fields: {
              ProductType: "INV",
              ProductName: tempResponse1[i].title,
              PurchaseDescription: tempResponse1[i].description,
              SalesDescription: tempResponse1[i].short_description,
              AssetAccount: "Inventory Asset",
              CogsAccount: "Cost of Goods Sold",
              IncomeAccount: "Sales",
              BuyQty1: 1,
              BuyQty1Cost: parseFloat(tempResponse1[i].price),
              BuyQty2: 1,
              BuyQty2Cost: parseFloat(tempResponse1[i].price),
              BuyQty3: 1,
              BuyQty3Cost: parseFloat(tempResponse1[i].price),
              SellQty1: 1,
              SellQty1Price: parseFloat(tempResponse1[i].price),
              SellQty2: 1,
              SellQty2Price: parseFloat(tempResponse1[i].price),
              SellQty3: 1,
              SellQty3Price: parseFloat(tempResponse1[i].price),
              TaxCodePurchase: "NCG",
              TaxCodeSales: "GST",
              UOMPurchases: "Units",
              UOMSales: "Units",
            },
          };
          fetchWooProduct(
            templateObject,
            lstUpdateTime,
            tempAccount,
            url,
            token,
            selConnectionId,
            transNOtes
          );

          // HTTP.call('POST', `${tempAccount.base_url}/erpapi/TProductWeb`, {
          //     headers: {
          //         'Username': `${tempAccount.user_name}`,
          //         'Password': `${tempAccount.password}`,
          //         'Database': `${tempAccount.database}`,
          //     },
          //     data: jsonData
          // }, (error, response) => {
          //     if (i == productCount - 1)
          //         fetchWooProduct(templateObject, lstUpdateTime, tempAccount, url, token, selConnectionId, transNOtes)
          //     if (error)
          //         console.error('Error:', error);
          //     else {
          //         transNOtes += `Obtained ${productCount} products to synch from WooCommerce to ERP\n`;
          //         templateObject.transNote.set(transNOtes);
          //         fetchWooProduct(templateObject, lstUpdateTime, tempAccount, url, token, selConnectionId, transNOtes)
          //     }
          // });
        }
      }
    }
  );
};

const fetchWooCustomer = async (
  templateObject,
  lstUpdateTime,
  tempAccount,
  url,
  token,
  selConnectionId,
  transNOtes
) => {
  transNOtes += "\nJob TRUEERP_SYNCH_CUSTOMERS\n";
  transNOtes += "TrueERP send Customers to WooCommerce Queued\n";
  await fetch(
    tempAccount.base_url +
      '/erpapi/TCustomer?select=[MsTimeStamp]>"' +
      lstUpdateTime +
      '"&ListType=Detail',
    {
      method: "GET",
      headers: {
        Database: tempAccount.database,
        Username: tempAccount.user_name,
        Password: tempAccount.password,
      },
      redirect: "follow",
    }
  )
    .then((response) => response.json())
    .then(async (result) => {
      const newCustomerFromERP = result.tcustomer;
      if (newCustomerFromERP.length === 0) {
        transNOtes += `Obtained 0 Customers to synch from TrueERP to WooCommerce.\n`;
        templateObject.transNote.set(transNOtes);
        fetchWooProduct2(
          templateObject,
          lstUpdateTime,
          tempAccount,
          url,
          token,
          selConnectionId,
          transNOtes
        );
      } else {
        let newCustomersFromERPCount = 0;
        const axios = require("axios");

        for (let i = 0; i < newCustomerFromERP.length; i++) {
          const bodyToAddWoocommerce = {
            email: newCustomerFromERP[i]?.fields?.Email,
            first_name: newCustomerFromERP[i]?.fields?.FirstName,
            last_name: newCustomerFromERP[i]?.fields?.LastName,
            role: "customer",
            username:
              newCustomerFromERP[i]?.fields?.FirstName +
              " " +
              newCustomerFromERP[i]?.fields?.LastName,
            billing: {
              first_name: newCustomerFromERP[i]?.fields?.FirstName,
              last_name: newCustomerFromERP[i]?.fields?.LastName,
              postcode: newCustomerFromERP[i]?.fields?.Postcode,
              country: newCustomerFromERP[i]?.fields?.Country,
              state: newCustomerFromERP[i]?.fields?.State,
              email: newCustomerFromERP[i]?.fields?.Email,
              phone: newCustomerFromERP[i]?.fields?.Phone,
            },
            billing: {
              first_name: newCustomerFromERP[i]?.fields?.FirstName,
              last_name: newCustomerFromERP[i]?.fields?.LastName,
              postcode: newCustomerFromERP[i]?.fields?.Postcode,
              country: newCustomerFromERP[i]?.fields?.Country,
              state: newCustomerFromERP[i]?.fields?.State,
              phone: newCustomerFromERP[i]?.fields?.Phone,
            },
          };
          await axios
            .post(`${url}/wp-json/wc/v3/customers`, bodyToAddWoocommerce, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then(async (response) => {
              const id = response.id;
              newCustomersFromERPCount++;
              console.log(response);
            })
            .catch((err) => {
              console.log(err);
            });
        }
        transNOtes += `Obtained ${newCustomersFromERPCount++} Customers to synch from TrueERP to WooCommerce.\n`;
        templateObject.transNote.set(transNOtes);
        fetchWooProduct2(
          templateObject,
          lstUpdateTime,
          tempAccount,
          url,
          token,
          selConnectionId,
          transNOtes
        );
      }
    })
    .catch((error) => {
      transNOtes += `${error}\n`;
      templateObject.transNote.set(transNOtes);
    });
};

const fetchWooCustomerJob = async (
  templateObject,
  lstUpdateTime,
  url,
  tempConnection,
  tempConnectionSoftware,
  tempAccount,
  token,
  selConnectionId,
  transNOtes
) => {
  transNOtes += "Job WOOCOMMERCE_SYNCH_CUSTOMERS\n";
  transNOtes += "WooCommerce send Customers to TrueERP Queued\n";

  let customerCount, tempResponse;
  let customer_url = `${tempConnectionSoftware.base_url}/wp-json/wc/v3/customers?modified_after=${lstUpdateTime}`;
  HTTP.call(
    "GET",
    customer_url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    (error, response) => {
      if (error) {
        console.error("Error:", error);
      } else {
        if (response.data.length === 0) {
          transNOtes +=
            "Obtained 0 customers to synch from WooCommerce to ERP\n";
          templateObject.transNote.set(transNOtes);
          fetchWooCustomer(
            templateObject,
            lstUpdateTime,
            tempAccount,
            tempConnectionSoftware.base_url,
            token,
            selConnectionId,
            transNOtes
          );
          return;
        }
        const filteredCustomer = response.data.filter((customer) => {
          const updatedDate = new Date(customer.date_modified);
          const last = new Date(lstUpdateTime);
          return updatedDate > last;
        });
        customerCount = filteredCustomer.length;
        tempResponse = filteredCustomer;
        // Process the response data here
        // templateObject.transNote.set(JSON.stringify(response.data.items));
        if (customerCount === 0) {
          transNOtes +=
            "Obtained 0 customers to synch from WooCommerce to ERP\n";
          templateObject.transNote.set(transNOtes);
          fetchWooCustomer(
            templateObject,
            lstUpdateTime,
            tempAccount,
            tempConnectionSoftware.base_url,
            token,
            selConnectionId,
            transNOtes
          );
          return;
          // fetchWooOrder(templateObject, lstUpdateTime, tempAccount, base_url, key, secret, selConnectionId, text);
        }

        let jsonData;

        for (let i = 0; i < customerCount; i++) {
          jsonData = {
            type: "TCusomer",
            fields: {
              ProductType: "INV",
              ProductName: tempResponse[i].title,
              PurchaseDescription: tempResponse[i].description,
              SalesDescription: tempResponse[i].short_description,
              AssetAccount: "Inventory Asset",
              CogsAccount: "Cost of Goods Sold",
              IncomeAccount: "Sales",
              BuyQty1: 1,
              BuyQty1Cost: parseFloat(tempResponse[i].price),
              BuyQty2: 1,
              BuyQty2Cost: parseFloat(tempResponse[i].price),
              BuyQty3: 1,
              BuyQty3Cost: parseFloat(tempResponse[i].price),
              SellQty1: 1,
              SellQty1Price: parseFloat(tempResponse[i].price),
              SellQty2: 1,
              SellQty2Price: parseFloat(tempResponse[i].price),
              SellQty3: 1,
              SellQty3Price: parseFloat(tempResponse[i].price),
              TaxCodePurchase: "NCG",
              TaxCodeSales: "GST",
              UOMPurchases: "Units",
              UOMSales: "Units",
            },
          };

          // HTTP.call('POST', `${tempAccount.base_url}/erpapi/TCustomer`, {
          //     headers: {
          //         'Username': `${tempAccount.user_name}`,
          //         'Password': `${tempAccount.password}`,
          //         'Database': `${tempAccount.database}`,
          //     },
          //     data: jsonData
          // }, (error, response) => {
          //     if (i == customerCount - 1)
          //         // fetchWooOrder(templateObject, lstUpdateTime, tempAc, base_url, key, secret, selConnectionId, text);
          //         fetchWooCustomer(templateObject, lstUpdateTime, tempAccount, tempConnectionSoftware.base_url, token, selConnectionId, transNOtes)
          //     if (error)
          //         console.error('Error:', error);
          //     else {
          //         transNOtes += `Obtained ${customerCount} customers to synch from WooCommerce to ERP\n`;
          //         templateObject.transNote.set(transNOtes);
          //         fetchWooCustomer(templateObject, lstUpdateTime, tempAccount, tempConnectionSoftware.base_url, token, selConnectionId, transNOtes)
          //     }
          // });
        }
        transNOtes += `Obtained ${customerCount} customers to synch from WooCommerce to ERP\n`;
        templateObject.transNote.set(transNOtes);
        fetchWooCustomer(
          templateObject,
          lstUpdateTime,
          tempAccount,
          tempConnectionSoftware.base_url,
          token,
          selConnectionId,
          transNOtes
        );
      }
    }
  );
  // transNOtes += "Obtained 0 customers to synch from WooCommerce to ERP\n"
  // templateObject.transNote.set(transNOtes);

  //getting newly added customer from ERP database
};

export const pullRecords = (
  employeeId,
  onSuccess = async () => {
    const result = await swal({
      title: "Update completed",
      //text: "Do you wish to add an account ?",
      type: "success",
      showCancelButton: false,
      confirmButtonText: "Ok",
    });

    if (result.value) {
    }
  },
  onError = async () => {
    const result = await swal({
      title: "Oooops...",
      text: "Couldn't update currencies",
      type: "error",
      showCancelButton: true,
      confirmButtonText: "Try Again",
    });

    if (result.value) {
      $(".synbutton").trigger("click");
    } else if (result.dismiss === "cancel") {
    }
  }
) => {
  // let completeCount = 0;
  // let completeCountEnd = 1;

  // LoadingOverlay.show();
  const loadingUpdate = swal({
    title: "Update in progress",
    text: "Downloading currencies",
    // text: "Do you wish to add an account ?",
    allowEscapeKey: false,
    allowOutsideClick: false,
    onOpen: () => {
      swal.showLoading();
    },
  });

  // we need to get all currencies and update them all
  const taxRateService = new TaxRateService();
  // taxRateService.getCurrencies().then(data => {
  //   completeCountEnd = data.tcurrency.length;
  //   if (data.tcurrency.length > 0)
  //     data = data.tcurrency;

  //   data.forEach(currencyData => {
  //     updateCurrency(currencyData, () => {
  //       if (completeCount == 0) {
  //         LoadingOverlay.show();
  //       } else if (completeCount == completeCountEnd) {
  //         LoadingOverlay.hide();
  //       }
  //       completeCount++;
  //     });
  //   });
  // });

  // Get all currencies from remote database
  taxRateService.getCurrencies().then((result) => {
    /**
     * Db currencies
     */
    let currencies = result.tcurrencylist;

    //swal.getContent().textContent = "Syncing to XE.com";
    swal.getContent().textContent = "Syncing to financialmodelingprep.com";

    // get all rates from xe currency
    FxApi.getAllRates({
      from: defaultCurrencyCode,
      callback: async (response) => {
        if (response === false) {
          swal.close();
          return;
        }
        /**
         * List of Xe currencies
         */
        // const xeCurrencies = response.to;
        // // if (result.value) {
        // // } else if (result.dismiss === "cancel") {
        // // }
        //
        // currencies.forEach((currency, index) => {
        //  currencies[index].BuyRate = FxApi.findBuyRate(currency.Code, xeCurrencies);
        //  currencies[index].SellRate = FxApi.findSellRate(currency.Code, xeCurrencies);
        // });
        //
        let formatedList = [];
        //
        // currencies.forEach((currency) => {
        //   formatedList.push({
        //     type: "TCurrency",
        //     fields: currency
        //   });
        // });

        let currencyRate = {};
        response.forEach((cur, index) => {
          if (cur.ticker.includes(defaultCurrencyCode)) {
            let src = cur.ticker.substring(0, 3);
            let dst = cur.ticker.slice(-3);
            if (src == defaultCurrencyCode) {
              currencyRate[dst] = {
                currencyCode: dst,
                buyRate: cur.bid,
                sellRate: (1 / cur.bid).toFixed(5),
                RateLastModified: cur.date,
              };
            } else {
              currencyRate[src] = {
                currencyCode: src,
                buyRate: (1 / cur.bid).toFixed(5),
                sellRate: cur.bid,
                RateLastModified: cur.date,
              };
            }
          }
        });

        currencies.forEach((currency, index) => {
          if (currencyRate[currency.Code] != undefined) {
            formatedList.push({
              type: "TCurrency",
              fields: {
                ID: currency.CurrencyID,
                BuyRate: Number(currencyRate[currency.Code].buyRate),
                SellRate: Number(currencyRate[currency.Code].sellRate),
                RateLastModified: currencyRate[currency.Code].RateLastModified,
              },
            });
          }
        });

        swal.getContent().textContent = "Save currencies";

        // Now we need to save this
        await FxApi.saveCurrencies(formatedList, async (response, error) => {
          swal.close();
          if (response) {
            LoadingOverlay.hide();
            await onSuccess();
            $(".btnRefresh").trigger("click");
          } else if (error) {
            LoadingOverlay.hide();
            await onError();
          }
        });
      },
    });
  });
};

export const RunNow = (customDate, selConnectionId = "") => {
  Template.instance().transNote.set("");
  var templateObject = Template.instance();
  templateObject.transNote.set("");
  var transNOtes = "";
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
    id: selConnectionId,
  };
  fetch("/api/connectionsByID", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then(async (connectionResult) => {
      lstUpdateTime = moment(connectionResult[0].last_ran_date)
        .tz("Australia/Brisbane")
        .subtract(1, "hours")
        .format("YYYY-MM-DD HH:mm:ss");
      var lstUpdateTimeUTC = moment(connectionResult[0].last_ran_date)
        .tz("Australia/Brisbane")
        .format("YYYY-MM-DDTHH:mm:ss");
      if (customDate != "") {
        lstUpdateTime = customDate;
        lstUpdateTimeUTC = customDate;
      }
      tempConnection = connectionResult[0];
      const postData = {
        id: tempConnection.connection_id,
      };

      fetch("/api/softwareByID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })
        .then((response) => response.json())
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
                        myHeaders.append(
                          "Username",
                          `${tempAccount.user_name}`
                        );
                        myHeaders.append("Password", `${tempAccount.password}`);

                        // Getting Wocommerce token
                        let url = tempConnectionSoftware.base_api_url;
                        let username = tempConnectionSoftware.admin_user_name;
                        let password =
                          tempConnectionSoftware.admin_user_password;

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

                        const axios = require("axios");

                        transNOtes += "Got token for Magento.\n";
                        templateObject.transNote.set(transNOtes);
                        // Make the second POST request using the obtained token
                        const trueERPResponse = await fetch(
                          `/api/TrueERPByID`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify(postData),
                          }
                        );

                        const tempResult = await trueERPResponse.json();
                        tempAccount = tempResult[0];

                        // fetchMagentoCustomerJob(templateObject, lstUpdateTime, tempConnectionSoftware.base_api_url, tempConnection, tempConnectionSoftware, tempAccount, magentoTokenResponse.data, selConnectionId, transNOtes);

                        transNOtes += `Last Sync Time: ${moment(
                          lstUpdateTime
                        ).format("DD/MM/YYYY HH:mm:ss")}\n`;
                        // transNOtes += `Last Sync Time: 01/01/2024\n`;
                        templateObject.transNote.set(transNOtes);
                        async function runPerFiveMinutes() {
                          //getting newly added customer from ERP database
                          transNOtes += `-----------------------------------------------------------\n`;
                          templateObject.transNote.set(transNOtes);
                          await fetch(
                            `${tempAccount.base_url}/TCustomer?select=[MsTimeStamp]>"${lstUpdateTime}"`,
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
                                templateObject.transNote.set(transNOtes);
                              } else {
                                transNOtes += `Found ${newCustomersFromERP.length} newly added customer(s) in TrueERP database.\n`;
                                templateObject.transNote.set(transNOtes);
                                let newCustomersFromERPCount = 0;

                                for (const newCustomerFromERP of newCustomersFromERP) {
                                  await fetch(
                                    `${tempAccount.base_url}/TCustomer/${newCustomerFromERP.Id}`,
                                    {
                                      method: "GET",
                                      headers: myHeaders,
                                      redirect: "follow",
                                    }
                                  )
                                    .then((response) => response.json())
                                    .then(async (result) => {
                                      transNOtes += `Got ${++newCustomersFromERPCount} Customer data with Id: ${
                                        newCustomerFromERP.Id
                                      } and MsTimeStamp: ${
                                        newCustomerFromERP.MsTimeStamp
                                      } from TrueERP.\n`;
                                      templateObject.transNote.set(transNOtes);
                                      const bodyToAddMagento = {
                                        email: result?.fields?.Email,
                                        first_name: result?.fields?.FirstName,
                                        last_name: result?.fields?.LastName,
                                        role: "customer",
                                        username:
                                          result?.fields?.FirstName +
                                          " " +
                                          result?.fields?.LastName,
                                        billing: {
                                          first_name:
                                            result?.fields?.FirstName || "",
                                          last_name:
                                            result?.fields?.LastName || "",
                                          company:
                                            result?.fields?.Company || "",
                                          address_1:
                                            result?.fields?.Street || "",
                                          address_2:
                                            result?.fields?.Street2 || "",
                                          // city: result?.fields?.Contacts[0]?.fields?.ContactCity,
                                          postcode:
                                            result?.fields?.Postcode || "",
                                          country:
                                            result?.fields?.Country || "",
                                          state: result?.fields?.State || "",
                                          email: result?.fields?.Email || "",
                                          phone: result?.fields?.Phone || "",
                                        },
                                        shipping: {
                                          first_name:
                                            result?.fields?.FirstName || "",
                                          last_name:
                                            result?.fields?.LastName || "",
                                          company:
                                            result?.fields?.Company || "",
                                          address_1:
                                            result?.fields?.Street || "",
                                          address_2:
                                            result?.fields?.Street2 || "",
                                          // city: result?.fields?.Contacts[0]?.fields?.ContactCity,
                                          postcode:
                                            result?.fields?.Postcode || "",
                                          country:
                                            result?.fields?.Country || "",
                                          state: result?.fields?.State || "",
                                          phone: result?.fields?.Phone || "",
                                        },
                                      };
                                      transNOtes += `(Detail) First name: ${bodyToAddMagento?.first_name}, Last name: ${bodyToAddMagento?.last_name}, Email: ${bodyToAddMagento?.email}.\n`;
                                      transNOtes += `Adding ${newCustomersFromERPCount} Customer to Magento.\n`;
                                      templateObject.transNote.set(transNOtes);

                                      await axios
                                        .post(
                                          `${url}/rest/V1/customers`,
                                          bodyToAddMagento,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                              "Content-Type":
                                                "application/json",
                                              "Access-Control-Allow-Origin":
                                                "https://login.coreedi.com", // Update with your client's URL
                                              "Access-Control-Allow-Headers":
                                                "Origin, X-Requested-With, Content-Type, Accept",
                                              "Access-Control-Allow-Credentials":
                                                "true",
                                            },
                                            withCredentials: true,
                                          }
                                        )
                                        .then(async (response) => {
                                          const id = response.data.id;
                                          if (id) {
                                            transNOtes += `Successfully added ${newCustomersFromERPCount} Customer to Magento with ID: ${id}.\n`;
                                            templateObject.transNote.set(
                                              transNOtes
                                            );
                                          } else {
                                            transNOtes += `[Error] Already existing user..\n`;
                                            templateObject.transNote.set(
                                              transNOtes
                                            );
                                          }
                                        })
                                        .catch((err) => {
                                          // transNOtes += `[Error] Already existing user..\n`;
                                          transNOtes += `Added a new customer to Magento.\n`;
                                          templateObject.transNote.set(
                                            transNOtes
                                          );
                                        });
                                    });
                                }
                              }
                            })
                            .catch(() => {
                              // transNOtes += `There is no newly added Customer.\n`;
                              transNOtes += `Added a new customer to Magento.\n`;
                              templateObject.transNote.set(transNOtes);
                            });
                          //getting newly added products from ERP database
                          transNOtes += `-----------------------------------------------------------\n`;
                          templateObject.transNote.set(transNOtes);
                          await fetch(
                            `${tempAccount.base_url}/TProduct?select=[MsTimeStamp]>"${lstUpdateTime}"`,
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
                                templateObject.transNote.set(transNOtes);
                              } else {
                                transNOtes += `Found ${newProductsFromERP.length} newly added product(s) in TrueERP database.\n`;
                                templateObject.transNote.set(transNOtes);
                                let newProductsFromERPCount = 0;

                                for (const newProductFromERP of newProductsFromERP) {
                                  await fetch(
                                    `${tempAccount.base_url}/TProduct/${newProductFromERP.Id}`,
                                    {
                                      method: "GET",
                                      headers: myHeaders,
                                      redirect: "follow",
                                    }
                                  )
                                    .then((response) => response.json())
                                    .then(async (result) => {
                                      transNOtes += `Got ${++newProductsFromERPCount} Product data with Id: ${
                                        newProductFromERP.Id
                                      } and MsTimeStamp: ${
                                        newProductFromERP.MsTimeStamp
                                      } from TrueERP.\n`;
                                      templateObject.transNote.set(transNOtes);
                                      // const uomSalesName = esult?.fields?.UOMSales
                                      const bodyToAddMagento = {
                                        name: result?.fields?.ProductName,
                                        permalink: result?.fields?.Hyperlink,
                                        // type: result?.fields?.ProductType,
                                        description:
                                          result?.fields?.SalesDescription,
                                        short_description:
                                          result?.fields?.SalesDescription,
                                        sku: result?.fields?.SKU,
                                        price: result?.fields?.WHOLESALEPRICE,
                                        total_sales:
                                          result?.fields?.SellQTY1 +
                                          result?.fields?.SellQTY2 +
                                          result?.fields?.SellQTY3,
                                        weight: `"${result?.fields?.NetWeightKg}"`,
                                      };
                                      transNOtes += `(Detail) Product name: ${bodyToAddMagento?.name}, Price: ${bodyToAddMagento?.price}, Description: ${bodyToAddMagento?.description}.\n`;
                                      transNOtes += `Adding ${newProductsFromERPCount} Product to Magento.\n`;
                                      templateObject.transNote.set(transNOtes);
                                      await axios
                                        .post(
                                          `${url}/rest/V1/products`,
                                          bodyToAddMagento,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                          }
                                        )
                                        .then(async (response) => {
                                          const id = response.data.id;
                                          if (id) {
                                            transNOtes += `Successfully added ${newProductsFromERPCount} Product to Magento with ID: ${id}.\n`;
                                            templateObject.transNote.set(
                                              transNOtes
                                            );
                                          } else {
                                            transNOtes += `[Error] Already existing product..\n`;
                                            templateObject.transNote.set(
                                              transNOtes
                                            );
                                          }
                                        })
                                        .catch((err) => {
                                          transNOtes += `[Error] Already existing product..\n`;
                                          templateObject.transNote.set(
                                            transNOtes
                                          );
                                        });
                                    });
                                }
                              }
                            })
                            .catch(() => {
                              transNOtes += `There is no newly added product.\n`;
                              templateObject.transNote.set(transNOtes);
                            });
                          //Getting newly added orders from woocommerce
                          transNOtes += `-----------------------------------------------------------\n`;
                          templateObject.transNote.set(transNOtes);
                          await axios
                            .get(
                              `${url}/wp-json/wc/v3/orders?modified_after=${lstUpdateTimeUTC}`,
                              {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            )
                            .then(async (response) => {
                              const ordersFromWoocommerce = response.data;
                              if (ordersFromWoocommerce.length === 0) {
                                transNOtes += `There is no newly added Order in the Woocommerce Website.\n`;
                                templateObject.transNote.set(transNOtes);
                              } else {
                                transNOtes += `Found ${ordersFromWoocommerce.length} newly added order(s) in the Woocommerce Website.\n`;
                                templateObject.transNote.set(transNOtes);
                                let count = 0;
                                for (const orderFromWoocommerce of ordersFromWoocommerce) {
                                  transNOtes += `Checking ${++count} Order from the Woocommerce Website\n`;
                                  transNOtes += `(Billing Detail) First name: ${orderFromWoocommerce?.billing?.first_name}, Last name: ${orderFromWoocommerce?.billing?.last_name}, Postcode: ${orderFromWoocommerce?.billing?.postcode}.\n`;
                                  for (const line of orderFromWoocommerce?.line_items) {
                                    transNOtes += `(Line Detail)    Product Id: ${line?.product_id}, Product Name: "${line?.name}", Product Price: ${line?.price}\n`;
                                  }
                                  // transNOtes += `Adding ${count}th Order to ERP database.\n`;
                                  templateObject.transNote.set(transNOtes);

                                  //check if the customer exists and add if not
                                  const clientName =
                                    orderFromWoocommerce?.billing?.first_name +
                                    " " +
                                    orderFromWoocommerce?.billing?.last_name;
                                  let clientId;
                                  transNOtes += `Checking Customer in the TrueERP database for ClientName : ${clientName}...\n`;
                                  templateObject.transNote.set(transNOtes);
                                  await fetch(
                                    `${tempAccount.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
                                    {
                                      method: "GET",
                                      headers: myHeaders,
                                      redirect: "follow",
                                    }
                                  )
                                    .then((response) => response.json())
                                    .then(async (result) => {
                                      if (result?.tcustomer.length > 0) {
                                        clientId = result?.tcustomer[0]?.Id;
                                        transNOtes += `Found the Customer as ID : ${clientId}\n`;
                                        templateObject.transNote.set(
                                          transNOtes
                                        );
                                      } else {
                                        transNOtes += `Not Existing Customer, creating...\n`;
                                        templateObject.transNote.set(
                                          transNOtes
                                        );
                                        const tempCustomerDetailtoERP = {
                                          type: "TCustomer",
                                          fields: {
                                            ClientTypeName: "Camplist",
                                            ClientName:
                                              orderFromWoocommerce?.billing
                                                ?.first_name +
                                              " " +
                                              orderFromWoocommerce?.billing
                                                ?.last_name,
                                            Companyname:
                                              orderFromWoocommerce?.billing
                                                ?.company,
                                            Email:
                                              orderFromWoocommerce?.billing
                                                ?.email,
                                            FirstName:
                                              orderFromWoocommerce?.billing
                                                ?.first_name,
                                            LastName:
                                              orderFromWoocommerce?.billing
                                                ?.last_name,
                                            Phone:
                                              orderFromWoocommerce?.billing
                                                ?.phone,
                                            Country:
                                              orderFromWoocommerce?.billing
                                                ?.country,
                                            State:
                                              orderFromWoocommerce?.billing
                                                ?.state,
                                            Street:
                                              orderFromWoocommerce?.billing
                                                ?.address_1,
                                            Street2:
                                              orderFromWoocommerce?.billing
                                                ?.address_2,
                                            Postcode:
                                              orderFromWoocommerce?.billing
                                                ?.postcode,
                                          },
                                        };
                                        await fetch(
                                          `${tempAccount.base_url}/TCustomer`,
                                          {
                                            method: "POST",
                                            headers: myHeaders,
                                            redirect: "follow",
                                            body: JSON.stringify(
                                              tempCustomerDetailtoERP
                                            ),
                                          }
                                        )
                                          .then((response) => response.json())
                                          .then(async (result) => {
                                            clientId = result?.fields?.ID;
                                            transNOtes += `Added a new customer to TrueERP database with ID : ${clientId}.\n`;
                                            templateObject.transNote.set(
                                              transNOtes
                                            );
                                          })
                                          .catch((error) =>
                                            console.log("error", error)
                                          );
                                      }
                                    })
                                    .catch(() => {
                                      transNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                      templateObject.transNote.set(transNOtes);
                                    });

                                  //check if the product exists and add if not
                                  const productList =
                                    orderFromWoocommerce?.line_items;
                                  const productIdList = [];
                                  const productQtyList = [];
                                  transNOtes += `There are ${productList.length} products in the Invoice line.\n`;
                                  templateObject.transNote.set(transNOtes);

                                  for (const product of productList) {
                                    transNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.name}...\n`;
                                    templateObject.transNote.set(transNOtes);
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
                                          const productId =
                                            result?.tproduct[0]?.Id;
                                          transNOtes += `Found the Product as ID : ${productId}\n`;
                                          templateObject.transNote.set(
                                            transNOtes
                                          );
                                          productIdList.push(productId);
                                          productQtyList.push(
                                            product?.quantity
                                          );
                                        } else {
                                          transNOtes += `Not Existing Product, creating...\n`;
                                          templateObject.transNote.set(
                                            transNOtes
                                          );

                                          //getting product by id from
                                          await axios
                                            .get(
                                              `${url}/wp-json/wc/v3/products/${product.product_id}`,
                                              {
                                                headers: {
                                                  Authorization: `Bearer ${token}`,
                                                },
                                              }
                                            )
                                            .then(async (response) => {
                                              const productFromWoo =
                                                response.data;

                                              const tempProductDetailtoERP = {
                                                type: "TProductWeb",
                                                fields: {
                                                  ProductType: "INV",
                                                  ProductName:
                                                    productFromWoo?.name,
                                                  PurchaseDescription:
                                                    productFromWoo?.description,
                                                  SalesDescription:
                                                    productFromWoo?.short_description,
                                                  AssetAccount:
                                                    "Inventory Asset",
                                                  CogsAccount:
                                                    "Cost of Goods Sold",
                                                  IncomeAccount: "Sales",
                                                  BuyQty1: 1,
                                                  BuyQty1Cost:
                                                    productFromWoo?.price,
                                                  BuyQty2: 1,
                                                  BuyQty2Cost:
                                                    productFromWoo?.price,
                                                  BuyQty3: 1,
                                                  BuyQty3Cost:
                                                    productFromWoo?.price,
                                                  SellQty1: 1,
                                                  SellQty1Price:
                                                    productFromWoo?.price,
                                                  SellQty2: 1,
                                                  SellQty2Price:
                                                    productFromWoo?.price,
                                                  SellQty3: 1,
                                                  SellQty3Price:
                                                    productFromWoo?.price,
                                                  TaxCodePurchase: "NCG",
                                                  TaxCodeSales: "GST",
                                                  UOMPurchases: "Units",
                                                  UOMSales: "Units",
                                                },
                                              };

                                              await fetch(
                                                `${tempAccount.base_url}/TProductWeb`,
                                                {
                                                  method: "POST",
                                                  headers: myHeaders,
                                                  redirect: "follow",
                                                  body: JSON.stringify(
                                                    tempProductDetailtoERP
                                                  ),
                                                }
                                              )
                                                .then((response) =>
                                                  response.json()
                                                )
                                                .then(async (result) => {
                                                  const tempProductId =
                                                    result?.fields?.ID;
                                                  transNOtes += `Added a new product to TrueERP database with ID : ${tempProductId}.\n`;
                                                  templateObject.transNote.set(
                                                    transNOtes
                                                  );
                                                  productIdList.push(
                                                    tempProductId
                                                  );
                                                  productQtyList.push(
                                                    product?.quantity
                                                  );
                                                })
                                                .catch((error) =>
                                                  console.log("error", error)
                                                );
                                            });
                                        }
                                        // productQtyList.push(product?.quantity)
                                      })
                                      .catch(() => {
                                        transNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                        templateObject.transNote.set(
                                          transNOtes
                                        );
                                      });
                                  }

                                  // create a new invoice in ERP.
                                  const invoiceLines = [];
                                  productIdList.forEach((item, index) => {
                                    invoiceLines.push({
                                      type: "TInvoiceLine",
                                      fields: {
                                        ProductID: item,
                                        OrderQty: productQtyList[index],
                                      },
                                    });
                                  });
                                  if (invoiceLines.length === 0) {
                                    continue;
                                  }
                                  const backOrderInvoiceToERP = {
                                    type: "TInvoiceEx",
                                    fields: {
                                      CustomerID: clientId,
                                      Lines: invoiceLines,
                                      IsBackOrder: true,
                                    },
                                  };
                                  await fetch(
                                    `${tempAccount.base_url}/TinvoiceEx`,
                                    {
                                      method: "POST",
                                      headers: myHeaders,
                                      redirect: "follow",
                                      body: JSON.stringify(
                                        backOrderInvoiceToERP
                                      ),
                                    }
                                  )
                                    .then((response) => response.json())
                                    .then(async (result) => {
                                      const addedId = result?.fields?.ID;
                                      transNOtes += `Added a new Invoice to TrueERP database with ID: ${addedId}.\n`;
                                      templateObject.transNote.set(transNOtes);
                                    })
                                    .catch((error) =>
                                      console.log("error", error)
                                    );
                                }
                              }
                            })
                            .catch(() => {
                              transNOtes += `There is no newly added Orders in the Woocommerce Website.\n`;
                              templateObject.transNote.set(transNOtes);
                            });

                          //update the last sync time
                          transNOtes += `-----------------------------------------------------------\n`;
                          templateObject.transNote.set(transNOtes);

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
                              ).format("DD/MMYYYY HH:mm:ss")}.\n`;
                              templateObject.transNote.set(transNOtes);
                            })
                            .catch((err) => console.log(err));
                        }
                        runPerFiveMinutes();
                      });
                  });
              })
              .catch((error) => console.log(error));
          } else if (connectionType == "WooCommerce") {
            let postData = {
              id: tempConnection.customer_id,
            };
            fetch(`/api/WooCommerceByID`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(postData),
            })
              .then((response) => response.json())
              .then(async (result) => {
                let customerCount;
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
                        myHeaders.append(
                          "Username",
                          `${tempAccount.user_name}`
                        );
                        myHeaders.append("Password", `${tempAccount.password}`);

                        // Getting Wocommerce token
                        let url = tempConnectionSoftware.base_url;
                        let username = tempConnectionSoftware.key;
                        let password = tempConnectionSoftware.secret;

                        const axios = require("axios");
                        const FormData = require("form-data");
                        let data = new FormData();
                        data.append("username", username);
                        data.append("password", password);

                        let config = {
                          method: "post",
                          maxBodyLength: Infinity,
                          url: url + "/wp-json/jwt-auth/v1/token",
                          headers: {
                            Authorization: `Basic ${btoa(
                              `${username}:${password}`
                            )}`,
                          },
                          data: data,
                        };
                        var token;
                        await axios.request(config).then(async (response) => {
                          token = response.data.token;

                          transNOtes += "Got token for WooCommerce.\n";
                          templateObject.transNote.set(transNOtes);
                        });

                        transNOtes += `Last Sync Time: ${lstUpdateTime}\n`;
                        templateObject.transNote.set(transNOtes);
                        async function runPerFiveMinutes() {
                          //getting newly added customer from ERP database
                          transNOtes += `-----------------------------------------------------------\n`;
                          templateObject.transNote.set(transNOtes);
                          await fetch(
                            `${tempAccount.base_url}/TCustomer?select=[MsTimeStamp]>"${lstUpdateTime}"`,
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
                                templateObject.transNote.set(transNOtes);
                              } else {
                                transNOtes += `Found ${newCustomersFromERP.length} newly added customer(s) in TrueERP database.\n`;
                                templateObject.transNote.set(transNOtes);
                                let newCustomersFromERPCount = 0;

                                for (const newCustomerFromERP of newCustomersFromERP) {
                                  await fetch(
                                    `${tempAccount.base_url}/TCustomer/${newCustomerFromERP.Id}`,
                                    {
                                      method: "GET",
                                      headers: myHeaders,
                                      redirect: "follow",
                                    }
                                  )
                                    .then((response) => response.json())
                                    .then(async (result) => {
                                      transNOtes += `Got ${++newCustomersFromERPCount} Customer data with Id: ${
                                        newCustomerFromERP.Id
                                      } and MsTimeStamp: ${
                                        newCustomerFromERP.MsTimeStamp
                                      } from TrueERP.\n`;
                                      templateObject.transNote.set(transNOtes);
                                      const bodyToAddWoocommerce = {
                                        email: result?.fields?.Email,
                                        first_name: result?.fields?.FirstName,
                                        last_name: result?.fields?.LastName,
                                        role: "customer",
                                        username:
                                          result?.fields?.FirstName +
                                          " " +
                                          result?.fields?.LastName,
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
                                          phone: result?.fields?.Phone,
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
                                          phone: result?.fields?.Phone,
                                        },
                                      };
                                      transNOtes += `(Detail) First name: ${bodyToAddWoocommerce?.first_name}, Last name: ${bodyToAddWoocommerce?.last_name}, Email: ${bodyToAddWoocommerce?.email}.\n`;
                                      transNOtes += `Adding ${newCustomersFromERPCount} Customer to Woocommerce.\n`;
                                      templateObject.transNote.set(transNOtes);
                                      await axios
                                        .post(
                                          `${url}/wp-json/wc/v3/customers`,
                                          bodyToAddWoocommerce,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                          }
                                        )
                                        .then(async (response) => {
                                          const id = response.data.id;
                                          if (id) {
                                            transNOtes += `Successfully added ${newCustomersFromERPCount} Customer to Woocommerce with ID: ${id}.\n`;
                                            templateObject.transNote.set(
                                              transNOtes
                                            );
                                          } else {
                                            transNOtes += `[Error] Already existing user..\n`;
                                            templateObject.transNote.set(
                                              transNOtes
                                            );
                                          }
                                        })
                                        .catch((err) => {
                                          transNOtes += `[Error] Already existing user..\n`;
                                          templateObject.transNote.set(
                                            transNOtes
                                          );
                                        });
                                    });
                                }
                              }
                            })
                            .catch(() => {
                              transNOtes += `There is no newly added Customer.\n`;
                              templateObject.transNote.set(transNOtes);
                            });
                          //getting newly added products from ERP database
                          transNOtes += `-----------------------------------------------------------\n`;
                          templateObject.transNote.set(transNOtes);
                          await fetch(
                            `${tempAccount.base_url}/TProduct?select=[MsTimeStamp]>"${lstUpdateTime}"`,
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
                                templateObject.transNote.set(transNOtes);
                              } else {
                                transNOtes += `Found ${newProductsFromERP.length} newly added product(s) in TrueERP database.\n`;
                                templateObject.transNote.set(transNOtes);
                                let newProductsFromERPCount = 0;

                                for (const newProductFromERP of newProductsFromERP) {
                                  await fetch(
                                    `${tempAccount.base_url}/TProduct/${newProductFromERP.Id}`,
                                    {
                                      method: "GET",
                                      headers: myHeaders,
                                      redirect: "follow",
                                    }
                                  )
                                    .then((response) => response.json())
                                    .then(async (result) => {
                                      transNOtes += `Got ${++newProductsFromERPCount} Product data with Id: ${
                                        newProductFromERP.Id
                                      } and MsTimeStamp: ${
                                        newProductFromERP.MsTimeStamp
                                      } from TrueERP.\n`;
                                      templateObject.transNote.set(transNOtes);
                                      // const uomSalesName = esult?.fields?.UOMSales
                                      const bodyToAddWoocommerce = {
                                        name: result?.fields?.ProductName,
                                        permalink: result?.fields?.Hyperlink,
                                        // type: result?.fields?.ProductType,
                                        description:
                                          result?.fields?.SalesDescription,
                                        short_description:
                                          result?.fields?.SalesDescription,
                                        sku: result?.fields?.SKU,
                                        price: result?.fields?.WHOLESALEPRICE,
                                        total_sales:
                                          result?.fields?.SellQTY1 +
                                          result?.fields?.SellQTY2 +
                                          result?.fields?.SellQTY3,
                                        weight: `"${result?.fields?.NetWeightKg}"`,
                                      };
                                      transNOtes += `(Detail) Product name: ${bodyToAddWoocommerce?.name}, Price: ${bodyToAddWoocommerce?.price}, Description: ${bodyToAddWoocommerce?.description}.\n`;
                                      transNOtes += `Adding ${newProductsFromERPCount} Product to Woocommerce.\n`;
                                      templateObject.transNote.set(transNOtes);
                                      await axios
                                        .post(
                                          `${url}/wp-json/wc/v3/products`,
                                          bodyToAddWoocommerce,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                          }
                                        )
                                        .then(async (response) => {
                                          const id = response.data.id;
                                          if (id) {
                                            transNOtes += `Successfully added ${newProductsFromERPCount} Product to Woocommerce with ID: ${id}.\n`;
                                            templateObject.transNote.set(
                                              transNOtes
                                            );
                                          } else {
                                            transNOtes += `[Error] Already existing product..\n`;
                                            templateObject.transNote.set(
                                              transNOtes
                                            );
                                          }
                                        })
                                        .catch((err) => {
                                          transNOtes += `[Error] Already existing product..\n`;
                                          templateObject.transNote.set(
                                            transNOtes
                                          );
                                        });
                                    });
                                }
                              }
                            })
                            .catch(() => {
                              transNOtes += `There is no newly added product.\n`;
                              templateObject.transNote.set(transNOtes);
                            });
                          //Getting newly added orders from woocommerce
                          transNOtes += `-----------------------------------------------------------\n`;
                          templateObject.transNote.set(transNOtes);
                          await axios
                            .get(
                              `${url}/wp-json/wc/v3/orders?modified_after=${lstUpdateTimeUTC}`,
                              {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            )
                            .then(async (response) => {
                              const ordersFromWoocommerce = response.data;
                              if (ordersFromWoocommerce.length === 0) {
                                transNOtes += `There is no newly added Order in the Woocommerce Website.\n`;
                                templateObject.transNote.set(transNOtes);
                              } else {
                                transNOtes += `Found ${ordersFromWoocommerce.length} newly added order(s) in the Woocommerce Website.\n`;
                                templateObject.transNote.set(transNOtes);
                                let count = 0;
                                for (const orderFromWoocommerce of ordersFromWoocommerce) {
                                  transNOtes += `Checking ${++count} Order from the Woocommerce Website\n`;
                                  transNOtes += `(Billing Detail) First name: ${orderFromWoocommerce?.billing?.first_name}, Last name: ${orderFromWoocommerce?.billing?.last_name}, Postcode: ${orderFromWoocommerce?.billing?.postcode}.\n`;
                                  for (const line of orderFromWoocommerce?.line_items) {
                                    transNOtes += `(Line Detail)    Product Id: ${line?.product_id}, Product Name: "${line?.name}", Product Price: ${line?.price}\n`;
                                  }
                                  // transNOtes += `Adding ${count}th Order to ERP database.\n`;
                                  templateObject.transNote.set(transNOtes);

                                  //check if the customer exists and add if not
                                  const clientName =
                                    orderFromWoocommerce?.billing?.first_name +
                                    " " +
                                    orderFromWoocommerce?.billing?.last_name;
                                  let clientId;
                                  transNOtes += `Checking Customer in the TrueERP database for ClientName : ${clientName}...\n`;
                                  templateObject.transNote.set(transNOtes);
                                  await fetch(
                                    `${tempAccount.base_url}/TCustomer?select=[ClientName]="${clientName}"`,
                                    {
                                      method: "GET",
                                      headers: myHeaders,
                                      redirect: "follow",
                                    }
                                  )
                                    .then((response) => response.json())
                                    .then(async (result) => {
                                      if (result?.tcustomer.length > 0) {
                                        clientId = result?.tcustomer[0]?.Id;
                                        transNOtes += `Found the Customer as ID : ${clientId}\n`;
                                        templateObject.transNote.set(
                                          transNOtes
                                        );
                                      } else {
                                        transNOtes += `Not Existing Customer, creating...\n`;
                                        templateObject.transNote.set(
                                          transNOtes
                                        );
                                        const tempCustomerDetailtoERP = {
                                          type: "TCustomer",
                                          fields: {
                                            ClientTypeName: "Camplist",
                                            ClientName:
                                              orderFromWoocommerce?.billing
                                                ?.first_name +
                                              " " +
                                              orderFromWoocommerce?.billing
                                                ?.last_name,
                                            Companyname:
                                              orderFromWoocommerce?.billing
                                                ?.company,
                                            Email:
                                              orderFromWoocommerce?.billing
                                                ?.email,
                                            FirstName:
                                              orderFromWoocommerce?.billing
                                                ?.first_name,
                                            LastName:
                                              orderFromWoocommerce?.billing
                                                ?.last_name,
                                            Phone:
                                              orderFromWoocommerce?.billing
                                                ?.phone,
                                            Country:
                                              orderFromWoocommerce?.billing
                                                ?.country,
                                            State:
                                              orderFromWoocommerce?.billing
                                                ?.state,
                                            Street:
                                              orderFromWoocommerce?.billing
                                                ?.address_1,
                                            Street2:
                                              orderFromWoocommerce?.billing
                                                ?.address_2,
                                            Postcode:
                                              orderFromWoocommerce?.billing
                                                ?.postcode,
                                          },
                                        };
                                        await fetch(
                                          `${tempAccount.base_url}/TCustomer`,
                                          {
                                            method: "POST",
                                            headers: myHeaders,
                                            redirect: "follow",
                                            body: JSON.stringify(
                                              tempCustomerDetailtoERP
                                            ),
                                          }
                                        )
                                          .then((response) => response.json())
                                          .then(async (result) => {
                                            clientId = result?.fields?.ID;
                                            transNOtes += `Added a new customer to TrueERP database with ID : ${clientId}.\n`;
                                            templateObject.transNote.set(
                                              transNOtes
                                            );
                                          })
                                          .catch((error) =>
                                            console.log("error", error)
                                          );
                                      }
                                    })
                                    .catch(() => {
                                      transNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                      templateObject.transNote.set(transNOtes);
                                    });

                                  //check if the product exists and add if not
                                  const productList =
                                    orderFromWoocommerce?.line_items;
                                  const productIdList = [];
                                  const productQtyList = [];
                                  transNOtes += `There are ${productList.length} products in the Invoice line.\n`;
                                  templateObject.transNote.set(transNOtes);

                                  for (const product of productList) {
                                    transNOtes += `Checking Product in the TrueERP database for ProductName : ${product?.name}...\n`;
                                    templateObject.transNote.set(transNOtes);
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
                                          const productId =
                                            result?.tproduct[0]?.Id;
                                          transNOtes += `Found the Product as ID : ${productId}\n`;
                                          templateObject.transNote.set(
                                            transNOtes
                                          );
                                          productIdList.push(productId);
                                          productQtyList.push(
                                            product?.quantity
                                          );
                                        } else {
                                          transNOtes += `Not Existing Product, creating...\n`;
                                          templateObject.transNote.set(
                                            transNOtes
                                          );

                                          //getting product by id from
                                          await axios
                                            .get(
                                              `${url}/wp-json/wc/v3/products/${product.product_id}`,
                                              {
                                                headers: {
                                                  Authorization: `Bearer ${token}`,
                                                },
                                              }
                                            )
                                            .then(async (response) => {
                                              const productFromWoo =
                                                response.data;

                                              const tempProductDetailtoERP = {
                                                type: "TProductWeb",
                                                fields: {
                                                  ProductType: "INV",
                                                  ProductName:
                                                    productFromWoo?.name,
                                                  PurchaseDescription:
                                                    productFromWoo?.description,
                                                  SalesDescription:
                                                    productFromWoo?.short_description,
                                                  AssetAccount:
                                                    "Inventory Asset",
                                                  CogsAccount:
                                                    "Cost of Goods Sold",
                                                  IncomeAccount: "Sales",
                                                  BuyQty1: 1,
                                                  BuyQty1Cost:
                                                    productFromWoo?.price,
                                                  BuyQty2: 1,
                                                  BuyQty2Cost:
                                                    productFromWoo?.price,
                                                  BuyQty3: 1,
                                                  BuyQty3Cost:
                                                    productFromWoo?.price,
                                                  SellQty1: 1,
                                                  SellQty1Price:
                                                    productFromWoo?.price,
                                                  SellQty2: 1,
                                                  SellQty2Price:
                                                    productFromWoo?.price,
                                                  SellQty3: 1,
                                                  SellQty3Price:
                                                    productFromWoo?.price,
                                                  TaxCodePurchase: "NCG",
                                                  TaxCodeSales: "GST",
                                                  UOMPurchases: "Units",
                                                  UOMSales: "Units",
                                                },
                                              };

                                              await fetch(
                                                `${tempAccount.base_url}/TProductWeb`,
                                                {
                                                  method: "POST",
                                                  headers: myHeaders,
                                                  redirect: "follow",
                                                  body: JSON.stringify(
                                                    tempProductDetailtoERP
                                                  ),
                                                }
                                              )
                                                .then((response) =>
                                                  response.json()
                                                )
                                                .then(async (result) => {
                                                  const tempProductId =
                                                    result?.fields?.ID;
                                                  transNOtes += `Added a new product to TrueERP database with ID : ${tempProductId}.\n`;
                                                  templateObject.transNote.set(
                                                    transNOtes
                                                  );
                                                  productIdList.push(
                                                    tempProductId
                                                  );
                                                  productQtyList.push(
                                                    product?.quantity
                                                  );
                                                })
                                                .catch((error) =>
                                                  console.log("error", error)
                                                );
                                            });
                                        }
                                        // productQtyList.push(product?.quantity)
                                      })
                                      .catch(() => {
                                        transNOtes += `Error while getting client Id from the TrueERP database.\n`;
                                        templateObject.transNote.set(
                                          transNOtes
                                        );
                                      });
                                  }

                                  // create a new invoice in ERP.
                                  const invoiceLines = [];
                                  productIdList.forEach((item, index) => {
                                    invoiceLines.push({
                                      type: "TInvoiceLine",
                                      fields: {
                                        ProductID: item,
                                        OrderQty: productQtyList[index],
                                      },
                                    });
                                  });
                                  if (invoiceLines.length === 0) {
                                    continue;
                                  }
                                  const backOrderInvoiceToERP = {
                                    type: "TInvoiceEx",
                                    fields: {
                                      CustomerID: clientId,
                                      Lines: invoiceLines,
                                      IsBackOrder: true,
                                    },
                                  };
                                  await fetch(
                                    `${tempAccount.base_url}/TinvoiceEx`,
                                    {
                                      method: "POST",
                                      headers: myHeaders,
                                      redirect: "follow",
                                      body: JSON.stringify(
                                        backOrderInvoiceToERP
                                      ),
                                    }
                                  )
                                    .then((response) => response.json())
                                    .then(async (result) => {
                                      const addedId = result?.fields?.ID;
                                      transNOtes += `Added a new Invoice to TrueERP database with ID: ${addedId}.\n`;
                                      templateObject.transNote.set(transNOtes);
                                    })
                                    .catch((error) =>
                                      console.log("error", error)
                                    );
                                }
                              }
                            })
                            .catch(() => {
                              transNOtes += `There is no newly added Orders in the Woocommerce Website.\n`;
                              templateObject.transNote.set(transNOtes);
                            });

                          //update the last sync time
                          transNOtes += `-----------------------------------------------------------\n`;
                          templateObject.transNote.set(transNOtes);

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
                              transNOtes += `Updated Last Sync Time as ${nowInSydney}.\n`;
                              templateObject.transNote.set(transNOtes);
                            })
                            .catch((err) => console.log(err));
                        }
                        runPerFiveMinutes();
                      })
                      .catch((err) => console.log(err));
                  })
                  .catch((err) => console.log(err));
              })
              .catch((err) => console.log(err));
          } else if (connectionType == "AustraliaPOST") {
            let postData = {
              id: tempConnection.customer_id,
            };
            fetch(`/api/AustraliaPOSTByID`, {
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

                        var myHeaders = new Headers();
                        myHeaders.append("Database", `${tempAccount.database}`);
                        myHeaders.append(
                          "Username",
                          `${tempAccount.user_name}`
                        );
                        myHeaders.append("Password", `${tempAccount.password}`);

                        transNOtes += `Last Sync Time: ${lstUpdateTime}\n`;
                        templateObject.transNote.set(transNOtes);
                        // Getting backorders invoice from ERP machine
                        transNOtes += `-----------------------------------------------------------\n`;
                        templateObject.transNote.set(transNOtes);
                        await fetch(
                          `${tempAccount.base_url}/Tinvoice?select=[MsTimeStamp]>"${lstUpdateTime}"`,
                          {
                            method: "GET",
                            headers: myHeaders,
                            redirect: "follow",
                          }
                        )
                          .then((response) => response.json())
                          .then(async (result) => {
                            let backOrderInvoiceCount = 0;
                            const tempInvoiceList = result?.tinvoice;
                            if (tempInvoiceList?.length === 0) {
                              transNOtes += `There is no newly added Back Order Invoice in the ERP database.\n`;
                              templateObject.transNote.set(transNOtes);
                            } else {
                              for (const tempInvoice of tempInvoiceList) {
                                await fetch(
                                  `${tempAccount.base_url}/Tinvoice/${tempInvoice?.Id}`,
                                  {
                                    method: "GET",
                                    headers: myHeaders,
                                    redirect: "follow",
                                  }
                                )
                                  .then((response) => response.json())
                                  .then(async (result) => {
                                    if (result?.fields?.IsBackOrder) {
                                      if (
                                        result?.fields?.Shipping !== "Aust Post"
                                      ) {
                                        transNOtes += `${++backOrderInvoiceCount} Back Order Invoice from TrueERP Database with InvoiceID : ${
                                          result?.fields?.ID
                                        } Isn't through Australia POST, skipping...\n`;
                                        templateObject.transNote.set(
                                          transNOtes
                                        );
                                      } else {
                                        transNOtes += `${++backOrderInvoiceCount} Back Order Invoice from TrueERP Database with InvoiceID : ${
                                          result?.fields?.ID
                                        }.\n`;
                                        templateObject.transNote.set(
                                          transNOtes
                                        );

                                        const invoiceDetail = result?.fields;

                                        const shipPostcode =
                                          result?.fields?.ShipPostcode || 7010;
                                        const invoicePostcode =
                                          result?.fields?.InvoicePostcode ||
                                          7010;

                                        const tempInvoiceLines =
                                          result?.fields?.Lines;

                                        for (const tempInvoiceLine of tempInvoiceLines) {
                                          // if (tempInvoiceLine?.fields?.QtyShipped === 0) {
                                          //     transNOtes += `No QtyShipped, skipping...\n`;
                                          //     templateObject.transNote.set(transNOtes);
                                          //     continue
                                          // }
                                          const uomNameProductKey =
                                            tempInvoiceLine?.fields
                                              ?.UOMNameProductKey;
                                          const lineTaxCode =
                                            tempInvoiceLine?.fields
                                              ?.LineTaxCode;

                                          transNOtes += `Unit of Measure : ${uomNameProductKey}\n`;
                                          templateObject.transNote.set(
                                            transNOtes
                                          );
                                          await fetch(
                                            `${tempAccount.base_url}/TUnitOfMeasure?listtype=detail&select=[KeyValue]="${uomNameProductKey}"`,
                                            {
                                              method: "GET",
                                              headers: myHeaders,
                                              redirect: "follow",
                                            }
                                          )
                                            .then((response) => response.json())
                                            .then(async (result) => {
                                              const length =
                                                result?.tunitofmeasure[0]
                                                  ?.fields?.Length;
                                              const weight =
                                                result?.tunitofmeasure[0]
                                                  ?.fields?.Weight;
                                              const width =
                                                result?.tunitofmeasure[0]
                                                  ?.fields?.Width;
                                              const height =
                                                result?.tunitofmeasure[0]
                                                  ?.fields?.Height;
                                              const multiplier =
                                                result?.tunitofmeasure[0]
                                                  ?.fields?.Multiplier || 1;

                                              const testBedObjSample = {
                                                shipments: [
                                                  {
                                                    shipment_reference:
                                                      "shipment reference 1",
                                                    from: {
                                                      country: "AU",
                                                      email:
                                                        "larry.citizen@citizen.com",
                                                      lines: [
                                                        "123 Main Street",
                                                      ],
                                                      name: "Larry Smith",
                                                      phone: "0412345678",
                                                      postcode: "3000",
                                                      state: "VIC",
                                                      suburb: "Melbourne",
                                                    },
                                                    to: {
                                                      email:
                                                        "jane.buyer@citizen.com",
                                                      lines: ["5 Main Street"],
                                                      name: "Jane Buyer",
                                                      phone: "1234567890",
                                                      postcode: "6012",
                                                      state: "WLG",
                                                      suburb: "Karori",
                                                      country: "NZ",
                                                    },
                                                    items: [
                                                      {
                                                        classification_type:
                                                          "OTHER",
                                                        commercial_value: true,
                                                        description_of_other:
                                                          "This is a classification description",
                                                        export_declaration_number:
                                                          "1234567890",
                                                        import_reference_number:
                                                          "111222333",
                                                        item_contents: [
                                                          {
                                                            country_of_origin:
                                                              "AU",
                                                            description:
                                                              "description",
                                                            sku: "ABC1243567",
                                                            quantity: 1,
                                                            tariff_code:
                                                              "123456",
                                                            value: 55.55,
                                                            weight: 0.5,
                                                            item_contents_reference:
                                                              "IC123456",
                                                          },
                                                        ],
                                                        item_description:
                                                          "This is a description of the item",
                                                        item_reference:
                                                          "TD1234567",
                                                        length: 10,
                                                        height: 10,
                                                        weight: 2,
                                                        product_id: "PTI8",
                                                        width: 10,
                                                      },
                                                    ],
                                                  },
                                                ],
                                              };
                                              const testBedObj = {
                                                shipments: [
                                                  {
                                                    shipment_reference:
                                                      invoiceDetail?.GlobalRef,
                                                    from: {
                                                      country:
                                                        invoiceDetail?.InvoiceCountry ||
                                                        "AU",
                                                      email:
                                                        invoiceDetail?.ContactEmail,
                                                      lines: [
                                                        invoiceDetail?.InvoiceStreet1,
                                                        invoiceDetail?.InvoiceStreet2,
                                                        invoiceDetail?.InvoiceStreet3,
                                                      ],
                                                      name: invoiceDetail?.ContactName,
                                                      phone:
                                                        invoiceDetail?.ContactMobile,
                                                      postcode:
                                                        invoiceDetail?.InvoicePostcode,
                                                      state:
                                                        invoiceDetail?.InvoiceState ||
                                                        "VIC",
                                                      suburb:
                                                        invoiceDetail?.InvoiceSuburb,
                                                    },
                                                    to: {
                                                      email:
                                                        invoiceDetail?.ContactEmail,
                                                      lines: [
                                                        invoiceDetail?.ShipStreet1,
                                                        invoiceDetail?.ShipStreet2,
                                                        invoiceDetail?.ShipStreet3,
                                                      ],
                                                      name: invoiceDetail?.CustomerName,
                                                      phone:
                                                        invoiceDetail?.ContactMobile,
                                                      postcode:
                                                        invoiceDetail?.ShipPostcode,
                                                      state:
                                                        invoiceDetail?.ShipState ||
                                                        "VIC",
                                                      suburb:
                                                        invoiceDetail?.ShipSuburb,
                                                      country:
                                                        invoiceDetail?.ShipCountry ||
                                                        "AU",
                                                    },
                                                    items: [
                                                      {
                                                        classification_type:
                                                          invoiceDetail
                                                            ?.Lines[0]?.fields
                                                            ?.ProductType,
                                                        commercial_value: true,
                                                        description_of_other:
                                                          invoiceDetail
                                                            ?.Lines[0]?.fields
                                                            ?.ProductDescription,
                                                        export_declaration_number:
                                                          invoiceDetail
                                                            ?.Lines[0]?.fields
                                                            ?.GlobalRef,
                                                        import_reference_number:
                                                          invoiceDetail
                                                            ?.Lines[0]?.fields
                                                            ?.GlobalRef,
                                                        item_contents: [
                                                          {
                                                            country_of_origin:
                                                              "AU",
                                                            // "description": "",
                                                            // "sku": "ABC1243567",
                                                            quantity:
                                                              invoiceDetail
                                                                ?.Lines[0]
                                                                ?.fields
                                                                ?.OrderQty,
                                                            // "tariff_code": "123456",
                                                            value:
                                                              invoiceDetail
                                                                ?.Lines[0]
                                                                ?.fields
                                                                ?.LinePriceInc,
                                                            weight: weight,
                                                            item_contents_reference:
                                                              invoiceDetail
                                                                ?.Lines[0]
                                                                ?.fields
                                                                ?.GlobalRef,
                                                          },
                                                        ],
                                                        item_description:
                                                          invoiceDetail
                                                            ?.Lines[0]?.fields
                                                            ?.ProductDescription,
                                                        item_reference:
                                                          invoiceDetail
                                                            ?.Lines[0]?.fields
                                                            ?.GlobalRef,
                                                        length: length,
                                                        height: height,
                                                        weight: weight,
                                                        product_id:
                                                          invoiceDetail
                                                            ?.Lines[0]?.fields
                                                            ?.ID,
                                                        width: width,
                                                      },
                                                    ],
                                                  },
                                                ],
                                              };

                                              const starTrackShippingJSON = {
                                                shipments: [
                                                  {
                                                    from: {
                                                      name: invoiceDetail?.ContactName,
                                                      lines: [
                                                        invoiceDetail?.InvoiceStreet1,
                                                        invoiceDetail?.InvoiceStreet2,
                                                        invoiceDetail?.InvoiceStreet3,
                                                      ],
                                                      suburb:
                                                        invoiceDetail?.InvoiceSuburb ||
                                                        "Strawberry Hills",
                                                      postcode:
                                                        invoiceDetail?.InvoicePostcode ||
                                                        "2012",
                                                      state:
                                                        invoiceDetail?.InvoiceState ||
                                                        "NSW",
                                                    },
                                                    to: {
                                                      name: invoiceDetail?.CustomerName,
                                                      lines: [
                                                        invoiceDetail?.ShipStreet1,
                                                        invoiceDetail?.ShipStreet2,
                                                        invoiceDetail?.ShipStreet3,
                                                      ],
                                                      suburb:
                                                        invoiceDetail?.ShipSuburb ||
                                                        "Yarraville",
                                                      state:
                                                        invoiceDetail?.ShipState ||
                                                        "VIC",
                                                      postcode:
                                                        invoiceDetail?.ShipPostcode ||
                                                        "3013",
                                                    },
                                                    items: [
                                                      {
                                                        length:
                                                          parseInt(length) || 1,
                                                        height: height || "20",
                                                        width: width || "15",
                                                        weight:
                                                          parseFloat(weight) ||
                                                          2,
                                                        packaging_type: "CTN",
                                                        product_id: "FPP",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              };

                                              // var austHeaders = new Headers();
                                              // austHeaders.append("Content-Type", `application/json`);
                                              // austHeaders.append("Accept", `application/json`);
                                              // austHeaders.append("Account-Number", `${tempConnectionSoftware.name}`);
                                              // austHeaders.append("Authorization", "Basic " + btoa(`${tempConnectionSoftware.api_key}:${tempConnectionSoftware.password}`));

                                              let baseUrl =
                                                tempConnectionSoftware.base_url;
                                              let accountNumber =
                                                tempConnectionSoftware.name;
                                              let userAutorization = `Basic ${btoa(
                                                `${tempConnectionSoftware.api_key}:${tempConnectionSoftware.password}`
                                              )}`;

                                              await Meteor.call(
                                                "checkAUSPOSTshipments",
                                                baseUrl,
                                                accountNumber,
                                                userAutorization,
                                                starTrackShippingJSON,
                                                async function (error, result) {
                                                  if (error) {
                                                    // console.log(error);
                                                  } else {
                                                    const deliverCost =
                                                      result.data?.shipments[0]
                                                        ?.shipment_summary
                                                        ?.total_cost *
                                                      multiplier;
                                                    const trackingNumber =
                                                      result.data.shipments[0]
                                                        ?.items[0]
                                                        ?.tracking_details
                                                        ?.article_id;
                                                    transNOtes += `Deliver cost : ${deliverCost}AUD\n`;
                                                    transNOtes += `Tracking Number : ${trackingNumber}\n`;
                                                    templateObject.transNote.set(
                                                      transNOtes
                                                    );
                                                    console.log(tempInvoice);
                                                    const updateObj = {
                                                      type: "TInvoice",
                                                      fields: {
                                                        ID:
                                                          tempInvoice?.Id || 0,
                                                        Shipping: "Aust Post",
                                                        ShippingCost:
                                                          deliverCost,
                                                        ConNote: trackingNumber,
                                                      },
                                                    };
                                                    await fetch(
                                                      `${tempAccount.base_url}/Tinvoice`,
                                                      {
                                                        method: "POST",
                                                        headers: myHeaders,
                                                        redirect: "follow",
                                                        body: JSON.stringify(
                                                          updateObj
                                                        ),
                                                      }
                                                    )
                                                      .then((response) =>
                                                        response.json()
                                                      )
                                                      .then(async (result) => {
                                                        transNOtes += `Updated the Invoice with ID : ${tempInvoice?.Id}\n`;
                                                        templateObject.transNote.set(
                                                          transNOtes
                                                        );
                                                        // Create Bill
                                                        let billTotal =
                                                          deliverCost * 1.1;

                                                        const billObj = {
                                                          type: "TBill",
                                                          fields: {
                                                            SupplierName:
                                                              "Australia Post 6894736",
                                                            Lines: [
                                                              {
                                                                type: "TBillLine",
                                                                fields: {
                                                                  AccountName:
                                                                    "Australia Post",
                                                                  ProductDescription:
                                                                    "",
                                                                  CustomerJob:
                                                                    "",
                                                                  LineCost:
                                                                    deliverCost,
                                                                  LineTaxCode:
                                                                    "NCG",
                                                                  LineClassName:
                                                                    "Default",
                                                                  CustomField10:
                                                                    "",
                                                                  CustomField9:
                                                                    "",
                                                                  CustomerJobID:
                                                                    invoiceDetail?.CustomerID,
                                                                },
                                                              },
                                                            ],
                                                            OrderTo: `${invoiceDetail?.CustomerName}\n${invoiceDetail?.ShipStreet1}\n${invoiceDetail?.ShipStreet2}\n${invoiceDetail?.ShipState} ${invoiceDetail?.InvoicePostcode}\nAustralia`,
                                                            // "OrderDate": "2023-12-21",
                                                            Deleted: false,
                                                            SupplierInvoiceNumber: `${tempInvoice?.Id}`,
                                                            ConNote: `${trackingNumber}`,
                                                            TermsName:
                                                              "30 Days",
                                                            Shipping:
                                                              "Australia Post",
                                                            Comments: "",
                                                            SalesComments: "",
                                                            OrderStatus: "",
                                                            BillTotal:
                                                              parseFloat(
                                                                billTotal.toFixed(
                                                                  2
                                                                )
                                                              ),
                                                            TotalAmountInc:
                                                              parseFloat(
                                                                billTotal.toFixed(
                                                                  2
                                                                )
                                                              ),
                                                          },
                                                        };

                                                        console.log(
                                                          "billObj",
                                                          JSON.stringify(
                                                            billObj
                                                          )
                                                        );

                                                        await fetch(
                                                          `${tempAccount.base_url}/TBill`,
                                                          {
                                                            method: "POST",
                                                            headers: myHeaders,
                                                            redirect: "follow",
                                                            body: JSON.stringify(
                                                              billObj
                                                            ),
                                                          }
                                                        )
                                                          .then((response) =>
                                                            response.json()
                                                          )
                                                          .then(
                                                            async (result) => {
                                                              if (
                                                                result?.fields
                                                                  ?.ID
                                                              ) {
                                                                transNOtes += `Created a Bill with ID : ${result?.fields?.ID}\n`;
                                                                templateObject.transNote.set(
                                                                  transNOtes
                                                                );
                                                              }
                                                            }
                                                          );
                                                      });
                                                  }
                                                }
                                              );

                                              /*
                                                                  await fetch("https://digitalapi.auspost.com.au/test/shipping/v1/shipments", {
                                                                      method: 'POST',
                                                                      headers: austHeaders,
                                                                      body: JSON.stringify(testBedObj)
                                                                  }).then(response => response.json()).then(async result => {
                                                                          console.log(result);
                                                                          const deliverCost = result?.shipments[0]?.shipment_summary?.total_cost * multiplier
                                                                          const trackingNumber = result.shipments[0]?.items[0]?.tracking_details?.article_id
                                                                          transNOtes += `Deliver cost : ${deliverCost}AUD\n`;
                                                                          transNOtes += `Tracking Number : ${trackingNumber}\n`;
                                                                          templateObject.transNote.set(transNOtes);
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
                                                                                  templateObject.transNote.set(transNOtes);
                                                                                  // Create Bill
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
                                                                                          "OrderTo": "Accountant 101 Pty Ltd\n101 Accounting Lane\nHoustin\nTexas 789123\nUnited States",
                                                                                          // "OrderDate": "2023-12-21",
                                                                                          "Deleted": false,
                                                                                          "SupplierInvoiceNumber": `${tempInvoice?.Id}`,
                                                                                          "ConNote": `${trackingNumber}`,
                                                                                          "TermsName": "30 Days",
                                                                                          "Shipping": "Australia Post",
                                                                                          "Comments": "",
                                                                                          "SalesComments": "",
                                                                                          "OrderStatus": "",
                                                                                          "BillTotal": deliverCost * 1.1,
                                                                                          "TotalAmountInc": deliverCost * 1.1
                                                                                      }
                                                                                  }

                                                                                  console.log("billObj", JSON.stringify(billObj))

                                                                                  await fetch(`${tempAccount.base_url}/TBill`,
                                                                                      {
                                                                                          method: 'POST',
                                                                                          headers: myHeaders,
                                                                                          redirect: 'follow',
                                                                                          body: JSON.stringify(billObj)
                                                                                      })
                                                                                      .then(response => response.json())
                                                                                      .then(async result => {
                                                                                          if (result?.fields?.ID) {
                                                                                              transNOtes += `Created a Bill with ID : ${result?.fields?.ID}\n`;
                                                                                              templateObject.transNote.set(transNOtes);
                                                                                          }
                                                                                      })
                                                                              })
                                                                      })
                                                                      */
                                              // //////////////////////////////////////////
                                              // const apiKey = tempConnectionSoftware?.api_key;
                                              // const baseUrl = tempConnectionSoftware?.base_url;
                                              // const apiUrl = baseUrl + '/postage/parcel/domestic/calculate.json';
                                              // const params = {
                                              //     "length": length / 10,
                                              //     "width": width / 10,
                                              //     "height": height / 10,
                                              //     "weight": weight,
                                              //     "from_postcode": shipPostcode,
                                              //     "to_postcode": invoicePostcode,
                                              //     "service_code": "AUS_PARCEL_REGULAR"
                                              // };
                                              // // Convert the parameters to a query string
                                              // const queryString = new URLSearchParams(params).toString();
                                              // // Append the query string to the URL
                                              // const fullUrl = `${apiUrl}?${queryString}`;
                                              // const headers = new Headers({
                                              //     "Auth-key": apiKey
                                              // });
                                              // await fetch(fullUrl, {
                                              //     method: 'GET',
                                              //     headers: headers,
                                              // })
                                              //     .then(response => response.json())
                                              //     .then(async result => {
                                              //         const deliverCost = result.postage_result.total_cost * multiplier
                                              //         transNOtes += `Deliver cost : ${deliverCost}AUD\n`;
                                              //         transNOtes += `Tracking Number : LH106650404AU\n`;
                                              //         templateObject.transNote.set(transNOtes);
                                              //         console.log("Hello")
                                              //         // Create Bill
                                              //         const billObj = {
                                              //             "type": "TBill",
                                              //             "fields": {
                                              //                 "SupplierName": "Australia Post 6894736",
                                              //                 "Lines": [
                                              //                     {
                                              //                         "type": "TBillLine",
                                              //                         "fields": {
                                              //                             "AccountName": "Australia Post",
                                              //                             "ProductDescription": "",
                                              //                             "CustomerJob": "",
                                              //                             "LineCost": deliverCost,
                                              //                             "LineTaxCode": "NCG",
                                              //                             "LineClassName": "Default",
                                              //                             "CustomField10": "",
                                              //                             "CustomField9": "",
                                              //                             "CustomerJobID": invoiceDetail?.CustomerID,
                                              //                         }
                                              //                     }
                                              //                 ],
                                              //                 "OrderTo": "Accountant 101 Pty Ltd\n101 Accounting Lane\nHoustin\nTexas 789123\nUnited States",
                                              //                 // "OrderDate": "2023-12-21",
                                              //                 "Deleted": false,
                                              //                 "SupplierInvoiceNumber": `${tempInvoice?.Id}`,
                                              //                 "ConNote": "LH106650404AU",
                                              //                 "TermsName": "30 Days",
                                              //                 "Shipping": "Australia Post",
                                              //                 "Comments": "",
                                              //                 "SalesComments": "",
                                              //                 "OrderStatus": "",
                                              //                 "BillTotal": deliverCost * 1.1,
                                              //                 "TotalAmountInc": deliverCost * 1.1
                                              //             }
                                              //         }

                                              //         console.log("billObj", billObj)
                                              //         await fetch(`${tempAccount.base_url}/TBill`,
                                              //             {
                                              //                 method: 'POST',
                                              //                 headers: myHeaders,
                                              //                 redirect: 'follow',
                                              //                 body: JSON.stringify(billObj)
                                              //             })
                                              //             .then(response => response.json())
                                              //             .then(async result => {
                                              //                 if (result?.fields?.ID) {
                                              //                     transNOtes += `Created a Bill with ID : ${result?.fields?.ID}\n`;
                                              //                     templateObject.transNote.set(transNOtes);
                                              //                 }
                                              //             })
                                              //     })
                                            });
                                        }
                                      }
                                    }
                                  });
                              }
                            }
                          })
                          .catch(() => {
                            transNOtes += `There is no newly added Back Order Invoice.\n`;
                            templateObject.transNote.set(transNOtes);
                          });

                        // //update the last sync time
                        // transNOtes += `-----------------------------------------------------------\n`;
                        // templateObject.transNote.set(transNOtes);

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
                        //         templateObject.transNote.set(transNOtes);
                        //     })
                        //     .catch((err) => console.log(err))
                      })
                      .catch((err) => console.log(err));
                  })
                  .catch((err) => console.log(err));
              })
              .catch((err) => console.log(err));
          } else if (connectionType == "zoho") {
          } else {
            swal(
              `Error Occurred While Attempting to Connect to the ${result[0].name} Server`,
              `Head to Connection Details and Check if ${result[0].name} Server Configuration is Correct`,
              "error"
            );
          }
        })
        .catch((error) => {
          templateObject.transNote.set(error);
        });
    })
    .catch((error) => {
      templateObject.transNote.set(error);
    });
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms || DEF_DELAY));
}