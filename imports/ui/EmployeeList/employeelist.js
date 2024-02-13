
import { ReactiveVar } from 'meteor/reactive-var';
import XLSX from 'xlsx';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './employeelist.html';

Template.employeelist.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
    templateObject.setupFinished = new ReactiveVar();

    templateObject.transactiondatatablerecords = new ReactiveVar([]);

    templateObject.getDataTableList = function (data) {
        let dataList = [
            data.employeeID || '',
            data.employeeName || '-',
            data.firstName || '',
            data.middleName || "",
            data.lastName || '',
            data.phone || '',
            data.mobile || '',
            data.employeeEmail || "",
            data.suffix || "",
            data.fax || "",
            data.skypeId || "",
            data.gender || "",
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: 'Employee ID', class: 'colEmployeeID', active: true, display: true, width: "10" },
        { index: 1, label: 'Employee Name', class: 'colEmployeeName', active: true, display: true, width: "200" },
        { index: 2, label: 'First Name', class: 'colFirstName', active: true, display: true, width: "100" },
        { index: 3, label: 'Middle Name', class: 'colMiddleName', active: false, display: true, width: "100" },
        { index: 4, label: 'Last Name', class: 'colLastName', active: false, display: true, width: "100" },
        { index: 5, label: 'Phone', class: 'colPhone', active: true, display: true, width: "110" },
        { index: 6, label: 'Mobile', class: 'colMobile', active: false, display: true, width: "110" },
        { index: 7, label: 'Email', class: 'colEmail', active: true, display: true, width: "200" },
        { index: 8, label: 'Suffix', class: 'colDepartment', active: true, display: true, width: "80" },
        { index: 9, label: 'Fax', class: 'colDepartment', active: false, display: true, width: "80" },
        { index: 10, label: 'Skype ID', class: 'colAddress', active: true, display: true, width: "300" },
        { index: 11, label: 'Gender', class: 'colState', active: false, display: true, width: "110" }
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.employeelist.onRendered(function () {

    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    $('#tblEmployeelist tbody').on('click', 'tr', function () {
        //var listData = $(this).closest('tr').find('.colEmployeeID').text();
        var listData = $(this).closest('tr').attr("id");
        FlowRouter.go('/employeescard?id=' + listData);
    });
});


Template.employeelist.events({
    'click #btnNewEmployee': function (event) {
        FlowRouter.go('/employeescard');
    },

    'keyup #tblEmployeelist_filter input': function (event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshEmployee").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshEmployee").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshEmployee").trigger("click");
        }
    },

    // 'click .exportbtn': function () {
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     jQuery('#tblEmployeelist_wrapper .dt-buttons .btntabletocsv').click();
    //     $('.fullScreenSpin').css('display', 'none');
    // },

    //   'click .exportbtnExcel': function () {
    //       $('.fullScreenSpin').css('display','inline-block');
    //       jQuery('#tblEmployeelist_wrapper .dt-buttons .btntabletoexcel').click();
    //       $('.fullScreenSpin').css('display','none');
    //   },

    // 'click .printConfirm': function (event) {
    //     // playPrintAudio();
    //     // setTimeout(function () {
    //         $('.fullScreenSpin').css('display', 'inline-block');
    //         jQuery('#tblEmployeelist_wrapper .dt-buttons .btntabletopdf').click();
    //         $('.fullScreenSpin').css('display', 'none');
    //     // }, delayTimeAfterSound);
    // },

    'click .btnRefresh': function () {
        window.open('/employeelist', '_self');
    }
    
});

Template.employeelist.helpers({
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
