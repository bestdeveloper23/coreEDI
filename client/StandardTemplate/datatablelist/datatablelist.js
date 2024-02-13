import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import './datatablelist.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { cloneDeep, reject } from "lodash";
// import { utilityService } from "../utility-service.js";

import 'datatables.net';
import 'datatables.net-buttons';
import 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.flash';
import 'datatables.net-buttons/js/buttons.print';
import 'jszip';

Template.datatablelist.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.reset_data = ReactiveVar();
    templateObject.displayfields = ReactiveVar();
    templateObject.datahandler = new ReactiveVar(templateObject.data.datahandler);
    // templateObject.seltransactionId = new ReactiveVar(-1);
    templateObject.transactiondatatablerecords = new ReactiveVar();
    templateObject.columnDef = new ReactiveVar();

    templateObject.getTableData = async function (deleteFilter = false) {

        return new Promise((resolve, reject) => {
        })

    }
})

Template.datatablelist.onRendered(async function () {
    let initialDatatableLoad = 25;
    let templateObject = Template.instance();
    let currenttablename = templateObject.data.tablename || "";

    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    };

    let isShowSelect = false;

    function MakeNegative() {

        $("td.colConnection").each(function (i) {
            $(this).html("<button class='btn btn-success' type='button' ><i class='fas fa-link' style='padding-right: 5px;'></i>Connect</button>");
        });
    };

    tableResize = function () {
        setTimeout(function () {
            $('.dataTables_filter input[type="search"]').attr("placeholder", "Search List...");
            $('.dataTables_filter label:contains("Search:")').each(function () {
                $(this).html($(this).html().split("Search:").join(""));
            });
        }, 2500);
        setTimeout(function () {
            $('.dataTables_filter input[type="search"]').attr("placeholder", "Search List...");
            $('.dataTables_filter label:contains("Search:")').each(function () {
                $(this).html($(this).html().split("Search:").join(""));
            });
        }, 1000);
    };


    templateObject.initCustomFieldDisplaySettings = function (data, listType) {
        let reset_data = templateObject.reset_data.get();
        let savedHeaderInfo;
        // get savedHeaderInfo from api
        templateObject.showCustomFieldDisplaySettings(reset_data);
    }


    templateObject.showCustomFieldDisplaySettings = async function (savedHeaderInfo) {
        let custFields = [];
        let customData = {};
        let customFieldCount = savedHeaderInfo.length;

        for (let r = 0; r < customFieldCount; r++) {
            customData = {
                active: savedHeaderInfo[r].active,
                id: savedHeaderInfo[r].index,
                custfieldlabel: savedHeaderInfo[r].label == 'checkBoxHeader' ? checkBoxHeader : savedHeaderInfo[r].label,
                class: savedHeaderInfo[r].class,
                display: savedHeaderInfo[r].display,            //display have to set by default value
                width: savedHeaderInfo[r].width ? savedHeaderInfo[r].width : ''
            };
            custFields.push(customData);
        }
        await templateObject.displayfields.set(custFields);

        if (currenttablename == 'tblCustomerlist') {
            fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json())
                .then(async (result) => {
                    result.map((r, index) => {
                        result[index] = {
                            "GlobalRef": r.globalRef,
                            "ClientID": r.id,
                            "CompanyName": r.name,
                            "Email": r.email,
                            "Country": r.country,
                            "Address": r.address,
                            "Phone": r.phone,
                            "Mobile": r.Mobile,
                            "FirstName": r.firstName,
                            "MiddleName": r.middleName,
                            "LastName": r.lastName,
                            "Fax": r.fax,
                            "SkypeID": r.skypeID,
                            "WebSite": r.website
                        }
                    })
                    await templateObject.displayTableData(result);
                })
                .catch(error => console.log(error));
        }
        else if (currenttablename == 'tblEmployeelist') {

            // Meteor.call('getEmployees', async function (error, result) {
            //     if (error) {
            //         console.log('error');
            //     } else {
            //         result.map((r, index) => {
            //             result[index] = {
            //                 "employeeID": r.no,
            //                 "employeeName": r.employeeName,
            //                 "firstName": r.firstName,
            //                 "lastName": r.lastName,
            //                 "middleName": r.middleName,
            //                 "phone": r.phone,
            //                 "mobile": r.mobile,
            //                 "employeeEmail": r.employeeEmail,
            //                 "suffix": r.suffix,
            //                 "fax": r.fax,
            //                 "skypeId": r.skypeId,
            //                 "gender": r.gender,
            //             }
            //         })
            //         await templateObject.displayTableData(result);
            //     }
            // });
            fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json())
                .then(async (result) => {
                    result.map((r, index) => {
                        result[index] = {
                            "employeeID": r.no,
                            "employeeName": r.employeeName,
                            "firstName": r.firstName,
                            "lastName": r.lastName,
                            "middleName": r.middleName,
                            "phone": r.phone,
                            "mobile": r.mobile,
                            "employeeEmail": r.employeeEmail,
                            "suffix": r.suffix,
                            "fax": r.fax,
                            "skypeId": r.skypeId,
                            "gender": r.gender,
                        }
                    })
                    await templateObject.displayTableData(result);
                })
                .catch(error => console.log(error));
        }
        else if (currenttablename == 'tblConnectionList' || currenttablename == 'tblConnectionListInTab') {

            if (!FlowRouter.current().queryParams.id) {
                // Meteor.call('getConnections', async function (error, result) {
                //     if (error) {
                //         console.log('error');
                //     } else {
                //         result.map((r, index) => {
                //             result[index] = {
                //                 "ID": r.id,
                //                 "DBName": r.db_name,
                //                 "AccName": r.account_name,
                //                 "ConnName": r.connection_name,
                //                 "LastRanDate": r.last_ran_date,
                //                 "RunCycle": r.run_cycle,
                //                 "NextRunDate": r.next_run_date,
                //                 "Enabled": r.enabled,
                //                 "CustomerName": r.customer_id,
                //             }
                //         })
                //         await templateObject.displayTableData(result);
                //     }
                // });
                fetch('/api/connections', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                    .then(response => response.json())
                    .then(async (result) => {
                        result.map((r, index) => {
                            result[index] = {
                                "ID": r.id,
                                "DBName": r.db_name,
                                "AccName": r.account_name,
                                "ConnName": r.connection_name,
                                "LastRanDate": r.last_ran_date,
                                "RunCycle": r.run_cycle,
                                "NextRunDate": r.next_run_date,
                                "Enabled": r.enabled,
                                "CustomerName": r.customer_id,
                            }
                        })
                        if(FlowRouter.current().path === '/connectionlist'){
                          await templateObject.displayTableData(result); //Don't load connection data if NEW Customer
                        }else{
                          await templateObject.displayTableData([]); //Don't load connection data if NEW Customer
                        }

                    })
                    .catch(error => console.log(error));
            } else {
                // Meteor.call('getConnectionFromCustomerId', {id: FlowRouter.current().queryParams.id}, async function (error, result) {
                //     if (error) {
                //         console.log('error');
                //     } else {
                //         result.map((r, index) => {
                //             result[index] = {
                //                 "ID": r.id,
                //                 "DBName": r.db_name,
                //                 "AccName": r.account_name,
                //                 "ConnName": r.connection_name,
                //                 "LastRanDate": r.last_ran_date,
                //                 "RunCycle": r.run_cycle,
                //                 "NextRunDate": r.next_run_date,
                //                 "Enabled": r.enabled,
                //                 "CustomerName": r.customer_id,
                //             }
                //         })
                //         await templateObject.displayTableData(result);
                //     }
                // });
                const postData = {
                    id: FlowRouter.current().queryParams.id
                };
                fetch('/api/connectionsByCustomerID', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                })
                    .then(response => response.json())
                    .then(async (result) => {
                        result.map((r, index) => {
                            result[index] = {
                                "ID": r.id,
                                "DBName": r.db_name,
                                "AccName": r.account_name,
                                "ConnName": r.connection_name,
                                "LastRanDate": r.last_ran_date,
                                "RunCycle": r.run_cycle,
                                "NextRunDate": r.next_run_date,
                                "Enabled": r.enabled,
                                "CustomerName": r.customer_id,
                            }
                        })
                        await templateObject.displayTableData(result);
                    })
                    .catch(error => console.log(error));
            }
        }
        else if (currenttablename == 'tblTransactionsById') {
            fetch('/api/transactions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json())
                .then(async (result) => {
                    var productData = '';
                    fetch('/api/getAccSoft', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    })
                        .then(response => response.json())
                        .then(async (result1) => {
                          await fetch(result1[0].base_url + `/erpapi/TProduct?select=[ProductName]="${result[0].product_name}"&ListType=Detail`, {
                            //await fetch(result1[0].base_url + `/erpapi/TProduct?ListType=Detail`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Username': result1[0].user_name,
                                    'Password': result1[0].password,
                                    'Database': result1[0].database,
                                },
                            })
                                .then(response => response.json())
                                .then(async (result2) => {
                                    productData = result2.tproduct[0];
                                    console.log(productData);
                                    result.map(async (r, index) => {
                                        var date = r.date.split('T');
                                        var dateString = date[0].split('-');
                                        var dateForm = dateString[2] + "/" + dateString[1] + "/" + dateString[0];
                                        var timeForm = date[1].split('.');
                                        result[index] = {
                                            "Id": parseInt(r.id),
                                            "AccName": r.accounting_soft,
                                            "ConnName": r.connection_soft,
                                            "ProductName": productData?.fields?.ProductName||'',
                                            "OrderNum": r.order_num,
                                            "Date": dateForm,
                                            "Times": timeForm[0],
                                            "Total": r.products_num,
                                            "UploadedNum": r.uploaded_num,
                                            "DownloadedNum": r.downloaded_num,
                                            "productData": productData?.fields||''
                                        }
                                    })
                                    await templateObject.displayTableData(result);
                                    // re.map((r, index) => {
                                    //     // var time = r.date.toLocaleTimeString();
                                    //     re[index] = {
                                    //         "Id": parseInt(r.fields.ID),
                                    //         "ProductName": r.fields.ProductName,
                                    //         "Amount": r.fields.SellQTY1,
                                    //         "Price": `$${r.fields.SellQty1PriceInc}`
                                    //     }
                                    // })
                                })
                                .catch(error => console.log(error));
                        })
                        .catch(error => console.log(error));

                })
                .catch(error => console.log(error));

        }
        else if (currenttablename == 'tblProducts') {
            fetch('/api/getAccSoft', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json())
                .then(async (result) => {
                    await fetch(result[0].base_url + '/erpapi/TProduct?ListType=Detail&LimitCount=50', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Username': result[0].user_name,
                            'Password': result[0].password,
                            'Database': result[0].database,
                        },
                    })
                        .then(response => response.json())
                        .then(async (result) => {
                            const re = result.tproduct;
                            // re.map((r, index) => {
                            //     // var time = r.date.toLocaleTimeString();
                            //     re[index] = {
                            //         "Id": parseInt(r.fields.ID),
                            //         "ProductName": r.fields.ProductName,
                            //         "Amount": r.fields.SellQTY1,
                            //         "Price": `$${r.fields.SellQty1PriceInc}`
                            //     }
                            // })
                            await templateObject.displayTableData(re);
                        })
                        .catch(error => console.log(error));
                })
                .catch(error => console.log(error));

        }
        else if (currenttablename == 'tblTransactionListInTab') {
            fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json())
                .then(async (result) => {
                    result.map((r, index) => {
                        result[index] = {
                            "ID": r.id,
                            "AccName": r.accounting_software,
                            "ConnName": r.connection_software,
                            "Date": r.date,
                            "Count": r.transaction_count
                        }
                    })
                    await templateObject.displayTableData(result);
                })
                .catch(error => console.log(error));
        }
        else if (currenttablename == 'tblTransactionListInTabDetail') {
            fetch('/api/transactions-detail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: templateObject.data.seltransactionId})
            })
                .then(response => response.json())
                .then(async (result) => {
                    result.map((r, index) => {
                        result[index] = {
                            "TransactionId": r.transaction_id,
                            "Detail": r.detail_string,
                            "Count": r.count,
                            // "Test": templateObject.data.seltransactionId
                        }
                    })
                    await templateObject.displayTableData(result);
                })
                .catch(error => console.log(error));
        }
    }

    templateObject.init_reset_data = function () {
        let records = templateObject.data.tableheaderrecords;
        if (records && records.length > 0) {
            templateObject.reset_data.set(templateObject.data.tableheaderrecords);
            templateObject.initCustomFieldDisplaySettings("", currenttablename)
        } else {
            setTimeout(() => {
                templateObject.init_reset_data();
            }, 1000)
        }
    }

    await templateObject.init_reset_data();

    templateObject.resetData = function (dataVal) {
        location.reload();
    };

    templateObject.displayTableData = async function (data, isEx = false) {
        var splashDataArray = new Array();
        let deleteFilter = false;
        if (data != [] && data.length != 0) {
            if (data.Params) {
                if (data.Params?.Search?.replace(/\s/g, "") == "") {
                    deleteFilter = true
                } else {
                    deleteFilter = false
                }

                if (data.Params.IgnoreDates == true) {
                    $('.' + currenttablename + " #dateFrom").attr("readonly", true);
                    $('.' + currenttablename + " #dateTo").attr("readonly", true);
                } else {
                    $('.' + currenttablename + " #dateFrom").attr("readonly", false);
                    $('.' + currenttablename + " #dateTo").attr("readonly", false);
                    $('.' + currenttablename + " #dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $('.' + currenttablename + " #dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);

                }
            } else {
                function allAreEqual(array) {
                    //array.forEach(function(item) {
                    array.map((item) => {//unfinisdhed code

                    });

                    return result;
                };
                //allAreEqual(data);
            }
            if (isEx == false) {
                for (let i = 0; i < data.length; i++) {
                    let dataList = templateObject.data.datahandler(data[i])
                    if (dataList.length != 0) {
                        if (templateObject.data.isMultipleRows) {
                            dataList.map((item) => {
                                splashDataArray.push(item);
                            })
                        } else {
                            splashDataArray.push(dataList);
                        }
                    }
                    templateObject.transactiondatatablerecords.set(splashDataArray);
                }
            } else {
                let lowercaseData = templateObject.data.exIndexDBName;
                for (let i = 0; i < data[lowercaseData].length; i++) {
                    let dataList = templateObject.data.exdatahandler(data[lowercaseData][i])
                    if (dataList.length != 0) {
                        if (templateObject.data.isMultipleRows) {
                            dataList.map((item) => {
                                splashDataArray.push(item);
                            })
                        } else {
                            splashDataArray.push(dataList);
                        }
                    }
                    templateObject.transactiondatatablerecords.set(splashDataArray);
                }
            }

            if (templateObject.transactiondatatablerecords.get()) {
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            }
        }

        let colDef = [];

        let checkColumnOrderable = {};

        const tabledraw = () => {
            $('#' + currenttablename).DataTable({
                dom: 'BRlfrtip',
                data: splashDataArray,
                columnDefs: colDef,
                'select': {
                    'style': 'multi'
                },
                buttons: [{
                    extend: 'csvHtml5',
                    text: '',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: templateObject.data.exportfilename,
                    orientation: 'portrait',
                    exportOptions: {
                        columns: ':visible'
                    }
                }, {
                    extend: 'print',
                    download: 'open',
                    className: "btntabletopdf hiddenColumn",
                    text: '',
                    title: templateObject.data.exportfilename,
                    filename: templateObject.data.exportfilename,
                    exportOptions: {
                        columns: ':visible',
                        stripHtml: false
                    },

                },
                {
                    extend: 'excelHtml5',
                    title: '',
                    download: 'open',
                    className: "btntabletoexcel hiddenColumn",
                    filename: templateObject.data.exportfilename,
                    orientation: 'portrait',
                    exportOptions: {
                        columns: ':visible'
                    },

                }
                ],
                // "autoWidth": false, // might need this
                // fixedColumns: true,
                select: true,
                destroy: true,
                colReorder: true,
                ...checkColumnOrderable,
                pageLength: initialDatatableLoad,
                "bLengthChange": isShowSelect,
                lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
                info: true,
                responsive: false,
                "order": templateObject.data.orderby ? eval(templateObject.data.orderby) : [[1, "asc"]],
                "autoWidth": false,
                action: function () {
                    $('#' + currenttablename).DataTable().ajax.reload();
                },
                "fnCreatedRow": function (nRow, aData, iDataIndex) {
                    $(nRow).attr('id', templateObject.data.attRowID ? aData[templateObject.data.attRowID] : aData[0]);
                },
                "fnDrawCallback": function (oSettings) {
                    $('.paginate_button.page-item').removeClass('disabled');
                    $('#' + currenttablename + '_ellipsis').addClass('disabled');
                    if (oSettings._iDisplayLength == -1) {
                        if (oSettings.fnRecordsDisplay() > 150) {

                        }
                    } else {

                    }
                    if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                        $('.paginate_button.page-item.next').addClass('disabled');
                    }

                    $('.paginate_button.next:not(.disabled)', this.api().table().container()).on('click', function () {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        //var splashArrayCustomerListDupp = new Array();
                        let dataLenght = oSettings._iDisplayLength;
                        let customerSearch = $('#' + currenttablename + '_filter input').val();

                        var dateFrom = new Date($('.' + currenttablename + " #dateFrom").datepicker("getDate"));
                        var dateTo = new Date($('.' + currenttablename + " #dateTo").datepicker("getDate"));

                        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();


                        let params = cloneDeep(templateObject.apiParams.get());
                        for (let i = 0; i < params.length; i++) {
                            if (params[i] == 'ignoredate') {
                                params[i] = data.Params && data.Params.IgnoreDates;
                            } else if (params[i] == 'dateFrom') {
                                params[i] = formatDateFrom
                            } else if (params[i] == 'dateTo') {
                                params[i] = formatDateTo
                            } else if (params[i] == 'limitFrom') {
                                params[i] = oSettings.fnRecordsDisplay()
                            } else if (params[i] == 'limitCount') {
                                params[i] = initialDatatableLoad
                            } else if (params[i] == 'deleteFilter') {
                                params[i] = deleteFilter
                            } else if (params[i] == 'contactid') {
                                params[i] = templateObject.data.contactid;
                            }
                        }
                        let that = templateObject.data.service;
                        templateObject.data.apiName.apply(that, params).then(function (dataObjectnew) {
                            for (let j = 0; j < dataObjectnew[indexDBLowercase].length; j++) {
                                var dataList = templateObject.data.datahandler(dataObjectnew[indexDBLowercase][j])
                                splashDataArray.push(dataList);
                            }
                            let uniqueChars = [...new Set(splashDataArray)];
                            templateObject.transactiondatatablerecords.set(uniqueChars);
                            var datatable = $('#' + currenttablename).DataTable();
                            datatable.clear();
                            datatable.rows.add(uniqueChars);
                            datatable.draw(false);
                            setTimeout(function () {
                                $('#' + currenttablename).dataTable().fnPageChange('last');
                            }, 400);

                            $('.fullScreenSpin').css('display', 'none');
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                        })
                    });
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                },
                language: { search: "", searchPlaceholder: "Search List..." },
                "fnInitComplete": function (oSettings) {

                    if (templateObject.data.islistfilter == true) {
                        $(`<div class="btn-group divDropdownFilter ${currenttablename}" style="margin-left: 14px;">
                            <button type="button" class="btn btn-primary ${currenttablename} btnDropdownFilter" id="btnDropdownFilter" name="btnDropdownFilter" ><i class="fas fa-list-ul" style="margin-right: 5px;"></i>Filter</button>
                            <button class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-expanded="false" type="button"></button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item btnFilterOption1 pointer" id="">${templateObject.data.exportfilename} Filter 1</a>
                                <a class="dropdown-item btnFilterOption2 pointer" id="">${templateObject.data.exportfilename} Filter 2</a>
                            </div>
                        </div>`).insertAfter('#' + currenttablename + '_filter');
                    };

                    if (templateObject.data.showCameraButton == true) {
                        $("<a class='btn btn-primary scanProdServiceBarcodePOP' href='' id='scanProdServiceBarcodePOP' role='button' style='margin-left: 8px; height:32px;padding: 4px 10px;'><i class='fas fa-camera'></i></a>").insertAfter('#' + currenttablename + '_filter');
                    };

                    if (templateObject.data.viewConvertedButton == true) {
                        $("<button class='btn btn-primary btnViewConverted' type='button' id='btnViewConverted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;background-color: #1cc88a !important;border-color: #1cc88a!important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Converted</button>").insertAfter('#' + currenttablename + '_filter');
                    };
                    if (templateObject.data.hideConvertedButton == true) {
                        $("<button class='btn btn-danger btnHideConverted' type='button' id='btnHideConverted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;background-color: #f6c23e !important;border-color: #f6c23e!important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Converted</button>").insertAfter('#' + currenttablename + '_filter');
                    };

                    if (templateObject.data.showPlusButtonCRM == true) {
                        $(`<div class="btn-group btnNav btnAddLineGroup" style="height:35px; margin-left: 14px;">
                            <button type="button" class="btn btn-primary btnAddLine" id="btnAddLine" style="margin-right: 0px;"><i class='fas fa-plus'></i></button>
                            <button class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-expanded="false" type="button"></button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item btnAddLineTask pointer" id="btnAddLineTask">+ Task</a>
                            </div>
                        </div>`).insertAfter('#' + currenttablename + '_filter');
                    }
                    if (templateObject.data.showPlusButton == true) {
                        $("<button class='btn btn-primary " + templateObject.data.showPlusButtonClass + "' id='" + templateObject.data.showPlusButtonClass + "' name='" + templateObject.data.showPlusButtonClass + "' data-dismiss='modal' data-toggle='modal' data-target='" + templateObject.data.showModalID + "' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter('#' + currenttablename + '_filter');
                    };



                    $("<button class='btn btn-primary btnRefreshTable' type='button' id='btnRefreshTable' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter('#' + currenttablename + '_filter');
                    if (currenttablename == 'tblConnectionListInTab') $(`<button id="btnNewConnectionIntab" name="btnNewConnectionIntab" class="btn btn-primary ml-2" type="button" style="padding: 4px 10px" ><i class="icon ion-plus" style="padding-right: 5px;"></i>New Connection</button>`).insertAfter('#btnRefreshTable');
                    if (typeof templateObject.data.callBack == 'function') {//Alexei
                        templateObject.data.callBackFunc();
                    };
                },
                "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                    let countTableData = 0;
                    if (data.Params) {
                        countTableData = data.Params.Count || 0; //get count from API data
                    } else {
                        countTableData = splashDataArray.length
                    }

                    return 'Showing ' + iStart + " to " + iEnd + " of " + countTableData;
                },

            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            }).on('column-reorder', function () {

            }).on('length.dt', function (e, settings, len) {
                $(".fullScreenSpin").css("display", "inline-block");
                let dataLenght = settings._iDisplayLength;
                if (dataLenght == -1) {
                    if (settings.fnRecordsDisplay() > initialDatatableLoad) {
                        $(".fullScreenSpin").css("display", "none");
                    } else {
                        $(".fullScreenSpin").css("display", "none");
                    }
                } else {
                    $(".fullScreenSpin").css("display", "none");
                }
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            })

            $(".fullScreenSpin").css("display", "none");

            setTimeout(async function () {
                await $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#' + currenttablename + '_filter .form-control-sm').focus();
                $('#' + currenttablename + '_filter .form-control-sm').trigger("input");
            }, 0);
        }

        async function getColDef() {
            let items = await templateObject.displayfields.get();
            if (items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    let item = '';
                    item = {
                        targets: i,
                        // visible: items[i].active,
                        className: items[i].active ? items[i].class : items[i].class + " hiddenColumn",
                        orderable: items[i].display || false,
                        // className: items[i].class,
                        title: items[i].custfieldlabel,
                        width: items[i].width,
                        "createdCell": function (td, cellData, rowData, row, col) {
                            if (templateObject.data.islistfilter) {
                                let getOverDueColor = $(td).closest("tr").find('.chkBox').attr('overduetype');
                                $(td).closest("tr").find('.colOverdueDays').addClass(getOverDueColor);
                            }

                            if (templateObject.data.pan) {
                                let tableRowID = $(td).closest.closest("tr").attr("id");
                                let chkBoxId = "t-" + templateObject.data.pan + "-" + tableRowID;
                                $(td).closest("tr").find('.chkServiceCard').attr("id", chkBoxId);
                            }
                        }
                    };

                    colDef.push(item);
                }

                templateObject.columnDef.set(colDef)
                tabledraw();
                tableResize();
            } else {
                setTimeout(() => {
                    getColDef();
                }, 1000);
            }

        }
        getColDef();

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 1000);

    }

})

Template.datatablelist.events({

    'change .chkDatatable': async function (event) {
        // change display settings ================== //

        event.preventDefault();
        event.stopImmediatePropagation();
        let templateObject = Template.instance();
        let currenttablename = $(event.target).closest(".divDisplaySettings").attr('displaytablename');
        let table = $('#' + currenttablename).DataTable();
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").attr('valueupdate');
        let dataColumnIndex = $(event.target).attr('data-column');
        var column = table.column(dataColumnIndex);

        if ($(event.target).is(':checked')) {
            column.visible(true);
            $('.' + columnDataValue).removeClass('hiddenColumn');
        } else {
            column.visible(false);
            $('#' + currenttablename + ' .' + columnDataValue).addClass('hiddenColumn');
            //$('#'+currenttablename+' .'+ columnDataValue).removeClass('showColumn');
        };

    },

    'click .colChkBoxAll': function (event) {
        const templateObject = Template.instance();
        let currenttablename = $(event.target).closest('table').attr('id') || templateObject.data.tablename;
        if (templateObject.data.custid) {
            currenttablename = currenttablename + "_" + templateObject.data.custid
        }
        if ($(event.target).is(':checked')) {
            $(".chkBox").prop("checked", true);
            $(`.${currenttablename} tbody .colCheckBox`).closest('tr').addClass('checkRowSelected');
        } else {
            $(".chkBox").prop("checked", false);
            $(`.${currenttablename} tbody .colCheckBox`).closest('tr').removeClass('checkRowSelected');
        }
    },

    'change .chkBox': async function (event) {
        event.preventDefault();
        event.stopPropagation();
        const templateObject = Template.instance();
        let currenttablename = $(event.target).closest('table').attr('id') || templateObject.data.tablename;
        if (templateObject.data.custid) {
            currenttablename = currenttablename + "_" + templateObject.data.custid
        }

        if ($(event.target).closest('tr').hasClass('selected')) {
        } else {
            $('#' + currenttablename + ' > tbody tr').removeClass('selected');
            $(event.target).closest('tr').addClass('selected');
        };

        var row = $('#' + currenttablename).find('.selected'); //$(this).parents('tr');
        var rowSelected = $('#' + currenttablename).find('.checkRowSelected'); //$(this).parents('tr');
        if (row.length === 0 && rowSelected == 0) {
            return;
        };

        if ($(event.target).is(':checked')) {
            await $(event.target).closest('tr').addClass('checkRowSelected');

            row.insertBefore($('#' + currenttablename + " > tbody tr:first"));
            // $('html, body').animate({ // Rasheed Remove scroll
            //   scrollTop: $('#'+currenttablename+"_wrapper").offset().top
            // }, 'slow');
        } else {

            await row.insertAfter($('#' + currenttablename + " > tbody tr:last"));
            $(event.target).closest('tr').removeClass('checkRowSelected');
        }
    },

    'change .custom-range': async function (event) {
        // const tableHandler = new TableHandler();
        let range = $(event.target).val() || 100;
        let colClassName = $(event.target).attr("valueclass");
        await $('.' + colClassName).css('width', range);
        // $('.dataTable').resizable();
    },

    'keyup .dataTables_filter input': function (event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshTable").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshTable").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshTable").trigger("click");
        }
    },

    "blur .divcolumn": function (event) {
        let columData = $(event.target).html();
        let columHeaderUpdate = $(event.target).attr("valueupdate");
        $("th.col" + columHeaderUpdate + "").html(columData);
    },

})

Template.datatablelist.helpers({
    displayfields: () => {
        let fields = Template.instance().displayfields.get();
        return fields;
    },
});
