// @ts-nocheck
import {ReactiveVar} from 'meteor/reactive-var';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import {Template} from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


import './employeescard.html';

Template.employeescard.onCreated(function () {
    const templateObject = Template.instance();

    templateObject.currentTab = new ReactiveVar("tab-1");

});

Template.employeescard.onRendered(function() {
    if ( FlowRouter.current().queryParams.id ) {

        // Meteor.call('getEmployeesFromId', FlowRouter.current().queryParams, (err, result) => {
        //     if (err) swal("","Oooooops something went wrong!", 'error')
        //     else {
        //         $('#edtEmployeeName').val(result[0].employeeName)
        //         $("#edtEmployeeEmail").val(result[0].employeeEmail)
        //         $('#edtTitleName').val(result[0].title)
        //         $("#edtFirstName").val(result[0].firstName)
        //         $("#edtMiddleName").val(result[0].middleName)
        //         $("#edtLastName").val(result[0].lastName)
        //         $('#edtSuffix').val(result[0].suffix)
        //         $('#edtEmployeePhone').val(result[0].phone)
        //         $('#edtEmployeeMobile').val(result[0].Mobile)
        //         $('#edtEmployeeFax').val(result[0].fax)
        //         $("#edtEmployeeSkypeID").val(result[0].skypeId)
        //         $("#edtGender").val(result[0].gender)
        //
        //         $("#updateEmployee").show();
        //         $("#saveEmployee").hide();
        //     }
        // })
        const postData = {
            id: FlowRouter.current().queryParams.id
        };
        fetch('/api/employeesByID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })
            .then(response => response.json())
            .then(async (result) => {
                $('#edtEmployeeName').val(result[0].employeeName);
                $("#edtEmployeeEmail").val(result[0].employeeEmail);
                $('#edtTitleName').val(result[0].title);
                $("#edtFirstName").val(result[0].firstName);
                $("#edtMiddleName").val(result[0].middleName);
                $("#edtLastName").val(result[0].lastName);
                $('#edtSuffix').val(result[0].suffix);
                $('#edtEmployeePhone').val(result[0].phone);
                $('#edtEmployeeMobile').val(result[0].Mobile);
                $('#edtEmployeeFax').val(result[0].fax);
                $("#edtEmployeeSkypeID").val(result[0].skypeId);
                $("#edtGender").val(result[0].gender);

                $("#txaNotes").val(result[0].note);
                $("#cloudEmpEmailAddress").val(result[0].username);
                $("#cloudEmpUserPassword").val(result[0].password);

                $("#updateEmployee").show();
                $("#saveEmployee").hide();
            })
            .catch(error => swal("","Oooooops something went wrong!", 'error'));
    }

})

Template.employeescard.events({
    "click .mainTab": function (event) {
        const tabID = $(event.target).data('id');
        Template.instance().currentTab.set(tabID);
    },

    'click .btnBack': function (event) {
        event.preventDefault();
            history.back(1);
    },

    "click #saveEmployee": function () {
        const employeeData = {
            employeeName: $('#edtEmployeeName').val(),
            email: $("#edtEmployeeEmail").val(),
            title: $("#edtTitleName").val(),
            firstName: $("#edtFirstName").val(),
            middleName: $("#edtMiddleName").val(),
            lastName: $("#edtLastName").val(),
            phone: $('#edtEmployeePhone').val(),
            mobile: $('#edtEmployeeMobile').val(),
            suffix: $('#edtSuffix').val(),
            skypeID: $("#edtEmployeeSkypeID").val(),
            fax: $("#edtEmployeeFax").val(),
            gender: $("#edtGender").val(),
            note: $("#txaNotes").val(),
            username: $("#cloudEmpEmailAddress").val()||'',
            password: $("#cloudEmpUserPassword").val()||''
        }

        // Meteor.call('addEmployee', employeeData, (err, result) => {
        //     if (err) console.log(err)
        //     else {
        //         swal("",'successfully added!',"success")
        //     }
        // })

        fetch('/api/addEmployee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        })
            .then(response => response.json())
            .then(async (result) => {
                if(result == 'success')
                    swal({
                      title: "Employee successfully added!",
                      text: "",
                      type: "success",
                      showCancelButton: false,
                      confirmButtonText: "OK",
                    }).then((result) => {
                      if (result.value) {
                        window.open("/employeelist", "_self");
                      } else if (result.dismiss === "cancel") {
                      }
                    });
            })
            .catch(error => console.log(error));
    },

    "click #updateEmployee": function () {
        const employeeData = {
            id: FlowRouter.current().queryParams.id,
            employeeName: $('#edtEmployeeName').val(),
            email: $("#edtEmployeeEmail").val(),
            title: $("#edtTitleName").val(),
            firstName: $("#edtFirstName").val(),
            middleName: $("#edtMiddleName").val(),
            lastName: $("#edtLastName").val(),
            phone: $('#edtEmployeePhone').val(),
            mobile: $('#edtEmployeeMobile').val(),
            suffix: $('#edtSuffix').val(),
            skypeID: $("#edtEmployeeSkypeID").val(),
            fax: $("#edtEmployeeFax").val(),
            gender: $("#edtGender").val(),
            note: $("#txaNotes").val(),
            username: $("#cloudEmpEmailAddress").val()||'',
            password: $("#cloudEmpUserPassword").val()||''
        }

        // Meteor.call('updateEmployee', employeeData, (err, result) => {
        //     if (err) console.log(err)
        //     else {
        //         if (result == "success") swal("",'Employee Successfully updated', "success");
        //     }
        // })

        fetch('/api/updateEmployee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        })
            .then(response => response.json())
            .then(async (result) => {
                if(result == 'success')
                    swal({
                      title: "Employee successfully updated!",
                      text: "",
                      type: "success",
                      showCancelButton: false,
                      confirmButtonText: "OK",
                    }).then((result) => {
                      if (result.value) {
                        window.open("/employeelist", "_self");
                      } else if (result.dismiss === "cancel") {
                      }
                    });
            })
            .catch(error => console.log(error));
    },

    "click #deleteEmployee": function () {
        if (FlowRouter.current().queryParams.id) {
            // Meteor.call('reomoveEmployee', FlowRouter.current().queryParams, (err, result) => {
            //     if (err) console.log(err)
            //     else {
            //         swal("",result, "error")
            //     }
            // })

            const postData = {
                id: FlowRouter.current().queryParams.id
            }

            fetch('/api/removeEmployee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            })
                .then(response => response.json())
                .then(async (result) => {
                    if(result == 'success')
                        swal("",result, "success");
                })
                .catch(error => console.log(error));
        }
    }
});

Template.employeescard.helpers({

    currentTab: () => {
        const tab = Template.instance().currentTab.get();
        if (tab == "") return "tab-2";
        return tab;
    },

});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
Template.registerHelper('notEquals', function (a, b) {
    return a != b;
});
