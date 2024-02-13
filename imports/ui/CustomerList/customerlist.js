
import { ReactiveVar } from 'meteor/reactive-var';

import XLSX from 'xlsx';

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './customerlist.html';


Template.customerlist.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
    templateObject.setupFinished = new ReactiveVar();

    templateObject.transactiondatatablerecords = new ReactiveVar([]);

    templateObject.getDataTableList = function (data) {
        let dataList = [
            data.ClientID || '',
            data.CompanyName || '-',
            data.connection || '',
            data.Email || '',
            data.Phone || '',
            data.Mobile || '',
            data.Address || '',
            data.Country || '',
            data.FirstName + " " + data.MiddleName + " " + data.LastName || "",
            data.FirstName || '',
            data.MiddleName || '',
            data.LastName || '',
            data.Fax || '',
            data.SkypeID || '',
            data.WebSite || '',
            data.LogonName || '',
            data.LogonPassword || '',
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: 'ID', class: 'colCustomerID', active: false, display: true, width: "10" },
        { index: 2, label: "Company Name", class: "colCompany", active: true, display: true, width: "100" },
        { index: 1, label: "Connection", class: "colConnection", active: true, display: true, width: "80" },
        { index: 3, label: "Email", class: "colEmail", active: true, display: true, width: "60" },
        { index: 4, label: "Phone", class: "colPhone", active: true, display: true, width: "110" },
        { index: 5, label: "Mobile", class: "colMobile", active: false, display: true, width: "110" },
        { index: 6, label: "Street Address", class: "colStreetAddress", active: false, display: true, width: "110" },
        { index: 7, label: "Country", class: "colCountry", active: false, display: true, width: "110" },
        { index: 8, label: "Full Name", class: "colCustomerTermName", active: true, display: true, width: "200" },
        { index: 9, label: "First Name", class: "colCustomerFirstName", active: false, display: true, width: "100" },
        { index: 10, label: "Middle Name", class: "colCustomerMiddleName", active: false, display: true, width: "100" },
        { index: 11, label: "Last Name", class: "colCustomerLastName", active: false, display: true, width: "100" },
        { index: 12, label: "Fax", class: "colCustomerFaxCode", active: true, display: true, width: "60" },
        { index: 13, label: "SkypeID", class: "colSkypeId", active: true, display: true, width: "300" },
        { index: 14, label: "WebSite", class: "colWebSite", active: true, display: true, width: "120" }
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.customerlist.onRendered(function () {
    $('.fullScreenSpin').css('display', 'inline-block');
    const templateObject = Template.instance();
    let currenttablename = 'tblCustomerlist';
    const customerList = [];
    let salesOrderTable;
    var splashArray = [];
    const dataTableList = [];
    const tableHeaderList = [];

    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    $('#tblCustomerlist tbody').on('click', 'td:nth-child(n)', function () {
        var listData = $(this).closest('tr').attr("id");

        localStorage.setItem('customerActiveNumber', listData);
        if ($(this)[0].classList[0] == 'colConnection')
            FlowRouter.go('/customerscard?id=' + listData + "&TransTab=connection");
        else
            FlowRouter.go('/customerscard?id=' + listData);
    });
});


Template.customerlist.events({

    'click #btnNewCustomer': function (event) {
        FlowRouter.go('/customerscard');
    },

    'keyup #tblCustomerlist_filter input': function (event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshCustomer").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshCustomer").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshCustomer").trigger("click");
        }
    },

    // 'click .exportbtn': function () {
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     jQuery('#tblCustomerlist_wrapper .dt-buttons .btntabletocsv').click();
    //     $('.fullScreenSpin').css('display', 'none');
    // },

    //   'click .exportbtnExcel': function () {
    //       $('.fullScreenSpin').css('display','inline-block');
    //       jQuery('#tblCustomerlist_wrapper .dt-buttons .btntabletoexcel').click();
    //       $('.fullScreenSpin').css('display','none');
    //   },

    // 'click .printConfirm': function (event) {
    //     // playPrintAudio();
    //     // setTimeout(function () {
    //         $('.fullScreenSpin').css('display', 'inline-block');
    //         jQuery('#tblCustomerlist_wrapper .dt-buttons .btntabletopdf').click();
    //         $('.fullScreenSpin').css('display', 'none');
    //     // }, delayTimeAfterSound);
    // },

    'click .btnRefresh': function () {
        window.open('/customerlist', '_self')
    },
});

Template.customerlist.helpers({

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
