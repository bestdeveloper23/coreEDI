
import { ReactiveVar } from 'meteor/reactive-var';
import XLSX from 'xlsx';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './connectionlist.html';
import moment from "moment";

Template.connectionlist.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
    templateObject.setupFinished = new ReactiveVar();

    templateObject.getDataTableList = function (data) {

      let nextRunDate = '';
      let lastRunDate = '';
      let currentDate = new Date();
      // Check if nextRunDate is a valid date
      if(Date.parse(data.NextRunDate)) {
        nextRunDate = data.NextRunDate;
      } else {
        nextRunDate = currentDate;
      };

      if(Date.parse(data.LastRanDate)) {
        lastRunDate = data.LastRanDate;
      } else {
        lastRunDate = currentDate;
      };
        let dataList = [
            data.ID || '',
            data.CustomerName || '',
            data.CustomerID || '',
            data.DBName || '-',
            data.AccName || '',
            data.ConnName || '',
            '<span style="display:none;">' + (lastRunDate != '' ? moment(lastRunDate).format("YYYY/MM/DD HH:mm:ss") : lastRunDate) + '</span>' + (lastRunDate != '' ? moment(lastRunDate).format("DD/MM/YYYY HH:mm:ss") : lastRunDate),
            data.RunCycle ? data.RunCycle + ' hour' : '',
            '<span style="display:none;">' + (nextRunDate != '' ? moment(nextRunDate).format("YYYY/MM/DD HH:mm:ss") : nextRunDate) + '</span>' + (nextRunDate != '' ? moment(nextRunDate).format("DD/MM/YYYY HH:mm:ss") : nextRunDate),
            data.Enabled ? 'Y' : 'N'
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: 'ID', class: 'colID', active: false, display: true, width: "80" },
        { index: 1, label: 'Customer Name', class: 'colCustomerName', active: true, display: true, width: "200" },
        { index: 2, label: 'Customer ID', class: 'colCustomerID', active: false, display: true, width: "200" },
        { index: 3, label: "Database Name", class: "colDatabaseName", active: true, display: true, width: "200" },
        { index: 4, label: "Accounting Software", class: "colAccountingSoftware", active: true, display: true, width: "200" },
        { index: 5, label: "Connection Software", class: "colConnectionSoftware", active: true, display: true, width: "200" },
        { index: 6, label: "Last Scheduled Job Ran On", class: "colLastScheduledJobRanOn", active: true, display: true, width: "100" },
        { index: 7, label: "Run Every", class: "colRunEvery", active: true, display: true, width: "110" },
        { index: 8, label: "Next Scheduled Run At", class: "colNextScheduledRunAt", active: true, display: true, width: "100" },
        { index: 9, label: "Enabled", class: "colEnabled", active: true, display: true, width: "120" }
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.connectionlist.onRendered(function () {

    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    $('#tblConnectionList tbody').on('click', 'tr', function () {
        //var listData = $(this).closest('tr').find('.colEmployeeID').text();
        var listData = $(this).closest('tr').attr("id");
        var customerId = $(this).closest('tr').find('.colCustomerID').text();
        if ($(event.target)[0].className == '  colConnectionSoftware') {
            FlowRouter.go('/connectionscard?id=' + listData + '&customerId=' + customerId + '&tab=2');
        }
        else FlowRouter.go('/connectionscard?id=' + listData + "&customerId=" + customerId);
    });
});


Template.connectionlist.events({
    'click #btnNewConnection': function (event) {
        FlowRouter.go('/connectionscard');
    },

    'keyup #tblConnectionList_filter input': function (event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshEmployee").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshEmployee").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshEmployee").trigger("click");
        }
    },

    'click .colConnectionSoftware': function (event) {
        if (this.className == '  colConnectionSoftware') {
            FlowRouter.go('/connectionscard?id=' + listData + '&customerId=' + customerId + '&tab=2');
        }
        var listData = $(event.target).closest('tr').attr("id");
    },

    // 'click .exportbtn': function () {
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     jQuery('#tblConnectionList_wrapper .dt-buttons .btntabletocsv').click();
    //     $('.fullScreenSpin').css('display', 'none');
    // },

    //   'click .exportbtnExcel': function () {
    //       $('.fullScreenSpin').css('display','inline-block');
    //       jQuery('#tblConnectionList_wrapper .dt-buttons .btntabletoexcel').click();
    //       $('.fullScreenSpin').css('display','none');
    //   },

    // 'click .printConfirm': function (event) {
    //     // playPrintAudio();
    //     // setTimeout(function () {
    //         $('.fullScreenSpin').css('display', 'inline-block');
    //         jQuery('#tblConnectionList_wrapper .dt-buttons .btntabletopdf').click();
    //         $('.fullScreenSpin').css('display', 'none');
    //     // }, delayTimeAfterSound);
    // },

    'click .btnRefresh': function () {
        window.open('/connectionlist', '_self');
    }

});

Template.connectionlist.helpers({
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },

    datahandler: function () {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.getDataTableList(data)
            return dataReturn
        }
    },
});
