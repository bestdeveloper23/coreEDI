
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
        let dataList = [
            data.ID || '',
            data.CustomerName || '',
            data.DBName || '-',
            data.AccName || '',
            data.ConnName || '',
            '<span style="display:none;">' + (data.LastRanDate != '' ? moment(data.LastRanDate).format("YYYY/MM/DD HH:mm:ss") : data.LastRanDate) + '</span>' + (data.LastRanDate != '' ? moment(data.LastRanDate).format("DD/MM/YYYY HH:mm:ss") : data.LastRanDate),
            data.RunCycle ? data.RunCycle + ' hour' : '',
            '<span style="display:none;">' + (data.NextRunDate != '' ? moment(data.NextRunDate).format("YYYY/MM/DD HH:mm:ss") : data.NextRunDate) + '</span>' + (data.NextRunDate != '' ? moment(data.NextRunDate).format("DD/MM/YYYY HH:mm:ss") : data.NextRunDate),
            data.Enabled ? 'Y' : 'N'
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: 'ID', class: 'colID', active: false, display: true, width: "80" },
        { index: 1, label: 'Customer Name', class: 'colCustomerName', active: true, display: true, width: "200" },
        { index: 2, label: "Database Name", class: "colDatabaseName", active: true, display: true, width: "200" },
        { index: 3, label: "Accounting Software", class: "colAccountingSoftware", active: true, display: true, width: "200" },
        { index: 4, label: "Connection Software", class: "colConnectionSoftware", active: true, display: true, width: "200" },
        { index: 5, label: "Last Scheduled Job Ran On", class: "colLastScheduledJobRanOn", active: true, display: true, width: "100" },
        { index: 6, label: "Run Every", class: "colRunEvery", active: true, display: true, width: "110" },
        { index: 7, label: "Next Scheduled Run At", class: "colNextScheduledRunAt", active: true, display: true, width: "100" },
        { index: 8, label: "Enabled", class: "colEnabled", active: true, display: true, width: "120" }
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
        var customerId = $(this).closest('tr').find('.colCustomerName').text();
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
