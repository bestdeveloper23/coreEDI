import { Template } from 'meteor/templating';
import './filtersmodal.html';
import { SideBarService } from '../../../sidebar-service.js';
import { UtilityService } from "../../utility-service.js";
let utilityService = new UtilityService();
let sideBarService = new SideBarService();
Template.filtersmodal.onCreated(function() {
    this.rowsData = new ReactiveVar([]);
    this.fieldsData = new ReactiveVar([]);
    this.operatorArray = new ReactiveVar([]);
    this.operatorValues = new ReactiveVar([]);
    this.inputValuesGroup = new ReactiveVar([]);
    this.selectedOption = new ReactiveVar("");
});

Template.filtersmodal.onRendered(function() {
    let templateObject = Template.instance();
    templateObject.rowsData.set(templateObject.data.selectedTableData);
    templateObject.fieldsData.set(templateObject.data.selectedTableField);
});

Template.filtersmodal.events({

    'input .tableDataValue'(event, template) {
        let value = event.target.value.trim();
        if (!value) {
          // Remove the row from data if the input is empty
          let rows = template.rowsData.get();
          let fields = template.fieldsData.get();
          let index = $(event.target).closest('.first-section').index();
          rows.splice(index, 1);
          fields.splice(index, 1);
          template.rowsData.set(rows);
          template.fieldsData.set(fields);
        }
    },
    'change select.edtSelectOption'(event, instance) {
      let parent = $(event.target).closest('div.selectContainer');
      let parentID = parent.attr('id');
      let index = parseInt(parentID.replace('selectContainer_', ''));

      let selectValue = $(`#selectContainer_${index} select.edtSelectOption`).val();

      if (selectValue === 'like' || selectValue === '=') {
        $(`#filterValueInput_${index}`).css('display', 'none');
      } else if (selectValue === '>' || selectValue === '<') {
        $(`#filterValueInput_${index}`).css('display', 'block');
      }
    },

    'change .defaultSelectOption select.form-control'(event, instance) {
      let userSelectValue = $(".defaultSelectOption select.form-control").val();

      if (userSelectValue === 'like' || userSelectValue === '=') {
        $("#filterValueInput").css('display', 'none');
      } else if (userSelectValue === '>' || userSelectValue === '<') {
        $("#filterValueInput").css('display', 'block');
      }
    },

    'input #tableDataInput'(event, template) {
      // let templateObject = Template.instance();
      const enteredValue = event.target.value;
      var select = template.find('.defaultSelectOption select.form-control');

      if (enteredValue === '') {
        select.value = 'selected';
        $("#filterValueInput").css('display', 'block');
      } else {
        select.value = 'like';
        $("#filterValueInput").css('display', 'none');
      }
    },

    'click .inputValRemove'(event, instance) {
      event.preventDefault();

      $('#tableDataInput').val('');
      $('#tableDataInput').focus();
      $('.defaultSelectValue').val('selected');

      let userSelectValue = $(".defaultSelectOption select.form-control").val();
      if (userSelectValue === null) {
        $("#filterValueInput").css('display', 'block');
      }
    },

    'click .removeRowBtn'(event, instance) {
      const rowIndex = $(event.target).closest('.first-section').index();

      let rows = instance.rowsData.get();
      let fields = instance.fieldsData.get();
      rows.splice(rowIndex, 1);
      fields.splice(rowIndex, 1);
      instance.rowsData.set(rows);
      instance.fieldsData.set(fields);
    },

    'click .btnFilterApply': async function (event) {
        event.preventDefault()
        event.stopPropagation()
        let templateObject = Template.instance();

        var currentDateCal = new Date();
        var year = currentDateCal.getFullYear();
        var month = currentDateCal.getMonth();
        var editDueDays = $(".editDueDays").val();
        var foundElementIndex = 0;
        let displayTableDatas = templateObject.data.transactiondatatablerecords;
        let userInputValue = "";
        let userInputValueField = "";

        for (let i = 0; i < displayTableDatas.length; i++) {
          userInputValue = $("#tableDataInput").val();
          const index = displayTableDatas[i].indexOf(userInputValue);
          if (index !== -1) {
            foundElementIndex = index;
            userInputValueField = templateObject.data.tableheaderfeilds[index];
            break;
          }
        }
        const dataTableList = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let tablename = templateObject.data.tablename;
        if(templateObject.data.custid) {
            tablename = tablename + "_" + templateObject.data.custid
        }

        let rowsArray = templateObject.rowsData.get();
        let fieldsArray = templateObject.fieldsData.get();
        let paramArray = [];

        for (let i =0; i < rowsArray.length; i++) {
          let operator = $(`#selectContainer_${i} select.edtSelectOption`).val();
          let originVal = rowsArray[i];
          let field = fieldsArray[i];
          let newVal = $(`#filterValueInput_${i}`).val();

          let paramObj = {
            Name: field,
            Operator: operator,
            Value: newVal === "" ? originVal : newVal
          };
          paramArray.push(paramObj);
        }

        if(userInputValue != ""){
          let userInputOperator = $(".defaultSelectOption select.form-control").val();
          let userInputField = userInputValueField;

          let userParamObj = {
            Name: userInputField,
            Operator: userInputOperator,
            Value: userInputValue
          };
          paramArray.push(userParamObj);
        }

        if($(".overdueThirtyCheck").is(":checked")) {
          let firstDue = 2;
          let overDueDays = $(".overdueThirtyCheck").val();
          var overdueMilliseconds = overDueDays * 24 * 60 * 60 * 1000;
          var firstDueMilliseconds = firstDue * 24 * 60 * 60 * 1000;

          var pastDate = new Date(currentDateCal - overdueMilliseconds);
          var firstDate = new Date(currentDateCal - firstDueMilliseconds);
          var finalDueDateStr = pastDate.toISOString().split('T')[0];
          var firstDueDateStr = firstDate.toISOString().split('T')[0];

        }else if($(".overdueSixtyCheck").is(":checked")) {
          let firstDue = 32;
          let overDueDays = $(".overdueSixtyCheck").val();
          var overdueMilliseconds = overDueDays * 24 * 60 * 60 * 1000;
          var firstDueMilliseconds = firstDue * 24 * 60 * 60 * 1000;

          var pastDate = new Date(currentDateCal - overdueMilliseconds);
          var firstDate = new Date(currentDateCal - firstDueMilliseconds);
          var finalDueDateStr = pastDate.toISOString().split('T')[0];
          var firstDueDateStr = firstDate.toISOString().split('T')[0];
        }else if($(".overdueSixtyoneCheck").is(":checked")) {
          let overDueDays = $(".overdueSixtyoneCheck").val();
          var overdueMilliseconds = overDueDays * 24 * 60 * 60 * 1000;

          var pastDate = new Date(currentDateCal - overdueMilliseconds);
          var overDueDateStr = pastDate.toISOString().split('T')[0];
        }else if($(".termsCheck").is(":checked")) {
          var oneDueDateStr = currentDateCal.toISOString().split('T')[0];
        }else if($(".rdoDueThisMonth").is(":checked")){
          var lastDay = new Date(year, month + 1, 0).getDate();
          var currentMonth = new Date(year, month, lastDay);
          var oneDueDateStr = currentMonth.toISOString().split('T')[0];
        }else if($(".rdoDueLastMonth").is(":checked")){
          var lastDayOfPreviousMonth = new Date(year, month, 0).getDate();
          var endOfLastMonth = new Date(year, month - 1, lastDayOfPreviousMonth);
          var oneDueDateStr = endOfLastMonth.toISOString().split('T')[0];
        }else if(editDueDays){
          var overdueMilliseconds = editDueDays * 24 * 60 * 60 * 1000;
          var pastDate = new Date(currentDateCal - overdueMilliseconds);
          var editDueDateStr = pastDate.toISOString().split('T')[0];
        }

        if(templateObject.data.productID){
                let that = templateObject.data.service;
                if (that == undefined) {
                    $('.fullScreenSpin').css('display', 'none');
                    return;
                }
                templateObject.data.filterAPI.apply(that, paramArray).then(function (data) {
                    window.displayTableData(data, true)
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
        }
        else if(templateObject.data.contactid){
                  let that = templateObject.data.service;
                  if (that == undefined) {
                      $('.fullScreenSpin').css('display', 'none');
                      return;
                  }
                  templateObject.data.filterAPI.apply(that, paramArray).then(function (data) {
                      window.displayTableData(data, true)
                  }).catch(function (err) {
                      $('.fullScreenSpin').css('display', 'none');
                  });
        }
        else{
              let that = templateObject.data.service;
              if (that == undefined) {
                  $('.fullScreenSpin').css('display', 'none');
                  return;
              }

              templateObject.data.filterAPI.apply(that, [paramArray, oneDueDateStr, firstDueDateStr, finalDueDateStr, overDueDateStr, editDueDateStr]).then(function (data) {
                  window.displayTableData(data, true);
              }).catch(function (err) {
                  $('.fullScreenSpin').css('display', 'none');
              });
        }
    },

    'click .filterModalClose'() {
      displayFilterFlag = 0;
      $('.modal-backdrop').css('display','none');
    },

    'click .btnSaveFilter': async function() {
      function arrayToString(arr) {
        return arr.join(", ");
      }
      let templateObject = Template.instance();
      let rowsSaveLength = templateObject.rowsData.get();
      let rowsSaveData = arrayToString(templateObject.rowsData.get());
      let rowsSaveFields = arrayToString(templateObject.fieldsData.get());
      let headerline = $(".headerline").val();
      // $('.fullScreenSpin').css('display', 'inline-block');
      $('.fullScreenSpin').css('display', 'inline-block');
      if(headerline === ""){
        $('.fullScreenSpin').css('display', 'none');
        swal({
          title: 'Oooops...',
          text: "Filter Name has not been defined.",
          type: 'error',
          showCancelButton: false,
          confirmButtonText: 'Try Again'
        }).then((result) => {
            if (result.value) {
            } else if (result.dismiss === 'cancel') {

            }
        });
      }else{
        let operators = [];
        let valueArray = [];
        let operatorValues = [];
        let inputValues = [];

        for (let i =0; i < rowsSaveLength.length; i++) {
          let operator = $(`#selectContainer_${i} select.edtSelectOption option:selected`).text();
          let operatorValue = $(`#selectContainer_${i} select.edtSelectOption`).val();
          let newVal = $(`#filterValueInput_${i}`).val();

          operators.push(operator);
          valueArray.push(newVal);
          operatorValues.push(operatorValue);
          inputValues.push(newVal);
        }
        templateObject.operatorArray.set(operators);
        templateObject.operatorValues.set(operatorValues);
        templateObject.inputValuesGroup.set(inputValues);
        let operatorArray = arrayToString(templateObject.operatorArray.get());
        let operatorValueArray = arrayToString(templateObject.operatorValues.get());
        let inputValuesArray = arrayToString(templateObject.inputValuesGroup.get());

        let data = {};
        let editID = "";
        let filterNameOne = "";
        let filterNameTwo = "";
        let inputValueArrayOne = "";
        let inputVAlueArrayTwo = "";
        let operatorArrayOne = "";
        let operatorArrayTwo = "";
        let operatorValueArrayOne = "";
        let operatorValueArrayTwo = "";
        let overdueSixtyCheckOne = false;
        let overdueSixtyCheckTwo = false;
        let overdueSixtyOneCheckOne = false;
        let overdueSixtyOneCheckTwo = false;
        let overdueThirtyCheckOne = false;
        let overdueThirtyCheckTwo = false;
        let rdoDueLastMonthOne = false;
        let rdoDueLastMonthTwo = false;
        let rdoDueThisMonthOne = false;
        let rdoDueThisMonthTwo = false;
        let rowSaveFieldOne = "";
        let rowSaveFieldTwo = "";
        let rowSaveOne = "";
        let rowSaveTwo = "";
        let saveEditDueOne = "";
        let saveEditDueTwo = "";
        let termsCheckOne = false;
        let termsCheckTwo = false;


        let saveFilterFlag = 0;
        let targetReportName = templateObject.data.indexeddbname;
        // try {
        //   const dataObject = await getVS1Data("FiterSaveFunctionData");
        //   if (dataObject && dataObject.length !== 0) {
        //       data = JSON.parse(dataObject[0].data);
        //   }
        // } catch (error) {

        // }
        await sideBarService.getFilterVs1Data().then(function (dataObject) {
          const dataArr = dataObject.tcustomfiltervs1;
          const targetObj = dataArr.find(item => item.fields.ReportName === targetReportName);

          if(targetObj) {
            editID = targetObj.fields.ID;
            filterNameOne = targetObj.fields.FilterNameOne;
            filterNameTwo = targetObj.fields.FilterNameTwo;
            inputValueArrayOne = targetObj.fields.InputValueArrayOne;
            inputVAlueArrayTwo = targetObj.fields.InputVAlueArrayTwo;
            operatorArrayOne = targetObj.fields.OperatorArrayOne;
            operatorArrayTwo = targetObj.fields.OperatorArrayTwo;
            operatorValueArrayOne = targetObj.fields.OperatorValueArrayOne;
            operatorValueArrayTwo = targetObj.fields.OperatorValueArrayTwo;
            overdueSixtyCheckOne = targetObj.fields.OverdueSixtyCheckOne;
            overdueSixtyCheckTwo = targetObj.fields.OverdueSixtyCheckTwo;
            overdueSixtyOneCheckOne = targetObj.fields.OverdueSixtyOneCheckOne;
            overdueSixtyOneCheckTwo = targetObj.fields.OverdueSixtyOneCheckTwo;
            overdueThirtyCheckOne = targetObj.fields.OverdueThirtyCheckOne;
            overdueThirtyCheckTwo = targetObj.fields.OverdueThirtyCheckTwo;
            rdoDueLastMonthOne = targetObj.fields.RdoDueLastMonthOne;
            rdoDueLastMonthTwo = targetObj.fields.RdoDueLastMonthTwo;
            rdoDueThisMonthOne = targetObj.fields.RdoDueThisMonthOne;
            rdoDueThisMonthTwo = targetObj.fields.RdoDueThisMonthTwo;
            rowSaveFieldOne = targetObj.fields.RowSaveFieldOne;
            rowSaveFieldTwo = targetObj.fields.RowSaveFieldTwo;
            rowSaveOne = targetObj.fields.RowSaveOne;
            rowSaveTwo = targetObj.fields.RowSaveTwo;
            saveEditDueOne = targetObj.fields.SaveEditDueOne;
            saveEditDueTwo = targetObj.fields.SaveEditDueTwo;
            termsCheckOne = targetObj.fields.TermsCheckOne;
            termsCheckTwo = targetObj.fields.TermsCheckTwo;
            saveFilterFlag = targetObj.fields.SaveFilterFlag;

          } else {
          }
        }).catch(function (err) {
        });
        if(saveFilterFlag == 0){
          let OverdueThirtyCheckOne = false;
          let OverdueSixtyCheckOne = false;
          let OverdueSixtyoneCheckOne = false;
          let TermsCheckOne = false;
          let RdoDueThisMonthOne = false;
          let RdoDueLastMonthOne = false;
          let saveEditDueDays = $(".editDueDays").val();
          let SaveEditDueOne = "";

          if($(".overdueThirtyCheck").is(":checked")) {
            OverdueThirtyCheckOne = true;
          }else if($(".overdueSixtyCheck").is(":checked")) {
            OverdueSixtyCheckOne = true;
          }else if($(".overdueSixtyoneCheck").is(":checked")) {
            OverdueSixtyoneCheckOne = true;
          }else if($(".termsCheck").is(":checked")) {
            TermsCheckOne = true;
          }else if($(".rdoDueThisMonth").is(":checked")){
            RdoDueThisMonthOne = true;
          }else if($(".rdoDueLastMonth").is(":checked")){
            RdoDueLastMonthOne = true;
          }else if(saveEditDueDays){
            SaveEditDueOne = saveEditDueDays;
          }
          localStorage.setItem('SaveBtnFlag', 1);
          if(editID == ""){
            data = {
              type: "TCustomFilterVS1",
              fields: {
                "Active":true,
                "AllUsers":false,
                "DefaultFilter":true,
                "FilterNameOne":headerline || "",
                "FilterNameTwo":filterNameTwo,
                "InputValueArrayOne": inputValuesArray || "",
                "InputVAlueArrayTwo": inputVAlueArrayTwo,
                "OperatorArrayOne": operatorArray || "",
                "OperatorArrayTwo":operatorArrayTwo,
                "OperatorValueArrayOne": operatorValueArray || "",
                "OperatorValueArrayTwo":operatorValueArrayTwo,
                "OverdueSixtyCheckOne":OverdueSixtyCheckOne,
                "OverdueSixtyCheckTwo":overdueSixtyCheckTwo,
                "OverdueSixtyOneCheckOne":OverdueSixtyoneCheckOne,
                "OverdueSixtyOneCheckTwo":overdueSixtyOneCheckTwo,
                "OverdueThirtyCheckOne": OverdueThirtyCheckOne,
                "OverdueThirtyCheckTwo":overdueThirtyCheckTwo,
                "RdoDueLastMonthOne":RdoDueLastMonthOne,
                "RdoDueLastMonthTwo":rdoDueLastMonthTwo,
                "RdoDueThisMonthOne":RdoDueThisMonthOne,
                "RdoDueThisMonthTwo":rdoDueThisMonthTwo,
                "ReportName":targetReportName,
                "RowSaveFieldOne": rowsSaveFields || "",
                "RowSaveFieldTwo":rowSaveFieldTwo,
                "RowSaveOne": rowsSaveData || "",
                "RowSaveTwo":rowSaveTwo,
                "SaveBtnFlag":0,
                "SaveEditDueOne":SaveEditDueOne,
                "SaveEditDueTwo":saveEditDueTwo,
                "SaveFilterFlag":1,
                "TermsCheckOne":TermsCheckOne,
                "TermsCheckTwo":termsCheckTwo,
                "UserID":1
              },
            };
          }else{
            data = {
              type: "TCustomFilterVS1",
              fields: {
                "Active":true,
                "AllUsers":false,
                "DefaultFilter":false,
                "FilterNameOne":headerline || "",
                "FilterNameTwo":filterNameTwo,
                "GlobalRef":"",
                "ID": editID,
                "InputValueArrayOne": inputValuesArray || "",
                "InputVAlueArrayTwo": inputVAlueArrayTwo,
                "OperatorArrayOne": operatorArray || "",
                "OperatorArrayTwo":operatorArrayTwo,
                "OperatorValueArrayOne": operatorValueArray || "",
                "OperatorValueArrayTwo":operatorValueArrayTwo,
                "OverdueSixtyCheckOne":OverdueSixtyCheckOne,
                "OverdueSixtyCheckTwo":overdueSixtyCheckTwo,
                "OverdueSixtyOneCheckOne":OverdueSixtyoneCheckOne,
                "OverdueSixtyOneCheckTwo":overdueSixtyOneCheckTwo,
                "OverdueThirtyCheckOne": OverdueThirtyCheckOne,
                "OverdueThirtyCheckTwo":overdueThirtyCheckTwo,
                "RdoDueLastMonthOne":RdoDueLastMonthOne,
                "RdoDueLastMonthTwo":rdoDueLastMonthTwo,
                "RdoDueThisMonthOne":RdoDueThisMonthOne,
                "RdoDueThisMonthTwo":rdoDueThisMonthTwo,
                "Recno":1,
                "ReportName":targetReportName,
                "RowSaveFieldOne": rowsSaveFields || "",
                "RowSaveFieldTwo":rowSaveFieldTwo,
                "RowSaveOne": rowsSaveData || "",
                "RowSaveTwo":rowSaveTwo,
                "SaveBtnFlag":0,
                "SaveEditDueOne":SaveEditDueOne,
                "SaveEditDueTwo":saveEditDueTwo,
                "SaveFilterFlag":1,
                "TermsCheckOne":TermsCheckOne,
                "TermsCheckTwo":termsCheckTwo,
                "UserID":1
              },
            };
          }

          await utilityService.globalSaveData('FiterSaveFunctionDataTemp', data, 'TCustomFilterVS1', 'SaveButton');
          // await sideBarService.postFilterVs1Data(data).then((res) => {
          //   sideBarService.getFilterVs1Data().then(function(dataReload){
          //     addVS1Data("FiterSaveFunctionData", JSON.stringify(dataReload));
          //   }).catch(function(err) {
          //   });
          // }).catch(function (err) {
          //   swal({
          //     title: "Oooops...",
          //     text: err,
          //     type: "error",
          //     showCancelButton: false,
          //     confirmButtonText: "Try Again",
          //   }).then((result) => {
          //       if (result.value) {
          //           Meteor._reload.reload();
          //       } else if (result.dismiss === "cancel") {
          //       }
          //   });
          // });
        }else if(saveFilterFlag == 1){
          let OverdueThirtyCheckTwo = false;
          let OverdueSixtyCheckTwo = false;
          let OverdueSixtyoneCheckTwo = false;
          let TermsCheckTwo = false;
          let RdoDueThisMonthTwo = false;
          let RdoDueLastMonthTwo = false;
          let saveEditDueDays = $(".editDueDays").val();
          let SaveEditDueTwo = "";

          if($(".overdueThirtyCheck").is(":checked")) {
            OverdueThirtyCheckTwo = true;
          }else if($(".overdueSixtyCheck").is(":checked")) {
            OverdueSixtyCheckTwo = true;
          }else if($(".overdueSixtyoneCheck").is(":checked")) {
            OverdueSixtyoneCheckTwo = true;
          }else if($(".termsCheck").is(":checked")) {
            TermsCheckTwo = true;
          }else if($(".rdoDueThisMonth").is(":checked")){
            RdoDueThisMonthTwo = true;
          }else if($(".rdoDueLastMonth").is(":checked")){
            RdoDueLastMonthTwo = true;
          }else if(saveEditDueDays){
            SaveEditDueTwo = saveEditDueDays;
          }
          localStorage.setItem('SaveBtnFlag', 0);
          if(editID == ""){
            data = {
              type: "TCustomFilterVS1",
              fields: {
                "Active":true,
                "AllUsers":false,
                "DefaultFilter":true,
                "FilterNameOne":filterNameOne,
                "FilterNameTwo": headerline || "",
                "InputValueArrayOne": inputValueArrayOne,
                "InputVAlueArrayTwo": inputValuesArray || "",
                "OperatorArrayOne": operatorArrayOne,
                "OperatorArrayTwo":operatorArray || "",
                "OperatorValueArrayOne": operatorValueArrayOne,
                "OperatorValueArrayTwo":operatorValueArray || "",
                "OverdueSixtyCheckOne":overdueSixtyCheckOne,
                "OverdueSixtyCheckTwo":OverdueSixtyCheckTwo,
                "OverdueSixtyOneCheckOne":overdueSixtyOneCheckOne,
                "OverdueSixtyOneCheckTwo":OverdueSixtyoneCheckTwo,
                "OverdueThirtyCheckOne": overdueThirtyCheckOne,
                "OverdueThirtyCheckTwo":OverdueThirtyCheckTwo,
                "RdoDueLastMonthOne":rdoDueLastMonthOne,
                "RdoDueLastMonthTwo":RdoDueLastMonthTwo,
                "RdoDueThisMonthOne":rdoDueThisMonthOne,
                "RdoDueThisMonthTwo":RdoDueThisMonthTwo,
                "ReportName":targetReportName,
                "RowSaveFieldOne": rowSaveFieldOne,
                "RowSaveFieldTwo":rowsSaveFields || "",
                "RowSaveOne": rowSaveOne,
                "RowSaveTwo":rowsSaveData || "",
                "SaveBtnFlag":0,
                "SaveEditDueOne":saveEditDueOne,
                "SaveEditDueTwo":SaveEditDueTwo,
                "SaveFilterFlag":0,
                "TermsCheckOne":termsCheckOne,
                "TermsCheckTwo":TermsCheckTwo,
                "UserID":0
              },
            };
          }else{
            data = {
              type: "TCustomFilterVS1",
              fields: {
                "Active":true,
                "AllUsers":false,
                "DefaultFilter":false,
                "FilterNameOne":filterNameOne,
                "FilterNameTwo": headerline || "",
                "GlobalRef":"",
                "ID": editID,
                "InputValueArrayOne": inputValueArrayOne,
                "InputVAlueArrayTwo": inputValuesArray || "",
                "ISEmpty":false,
                "KeyStringFieldName":"",
                "KeyValue":"",
                "MsTimeStamp":"2023-09-27 03:57:19",
                "MsUpdateSiteCode":"DEF",
                "OperatorArrayOne": operatorArrayOne,
                "OperatorArrayTwo":operatorArray || "",
                "OperatorValueArrayOne": operatorValueArrayOne,
                "OperatorValueArrayTwo":operatorValueArray || "",
                "OverdueSixtyCheckOne":overdueSixtyCheckOne,
                "OverdueSixtyCheckTwo":OverdueSixtyCheckTwo,
                "OverdueSixtyOneCheckOne":overdueSixtyOneCheckOne,
                "OverdueSixtyOneCheckTwo":OverdueSixtyoneCheckTwo,
                "OverdueThirtyCheckOne": overdueThirtyCheckOne,
                "OverdueThirtyCheckTwo":OverdueThirtyCheckTwo,
                "RdoDueLastMonthOne":rdoDueLastMonthOne,
                "RdoDueLastMonthTwo":RdoDueLastMonthTwo,
                "RdoDueThisMonthOne":rdoDueThisMonthOne,
                "RdoDueThisMonthTwo":RdoDueThisMonthTwo,
                "Recno":1,
                "ReportName":targetReportName,
                "RowSaveFieldOne": rowSaveFieldOne,
                "RowSaveFieldTwo":rowsSaveFields || "",
                "RowSaveOne": rowSaveOne,
                "RowSaveTwo":rowsSaveData || "",
                "SaveBtnFlag":0,
                "SaveEditDueOne":saveEditDueOne,
                "SaveEditDueTwo":SaveEditDueTwo,
                "SaveFilterFlag":0,
                "TermsCheckOne":termsCheckOne,
                "TermsCheckTwo":TermsCheckTwo,
                "UserID":0
              },
            };
          }
          await utilityService.globalSaveData('FiterSaveFunctionDataTemp', data, 'TCustomFilterVS1', 'SaveButton');
          // .then((data) => {
          // // await sideBarService.postFilterVs1Data(data).then((data) => {
          //   sideBarService.getFilterVs1Data().then(function(dataReload){
          //     addVS1Data("FiterSaveFunctionData", JSON.stringify(dataReload));
          //   }).catch(function(err) {
          //   });
          // }).catch(function (err) {
          //   swal({
          //     title: "Oooops...",
          //     text: err,
          //     type: "error",
          //     showCancelButton: false,
          //     confirmButtonText: "Try Again",
          //   }).then((result) => {
          //       if (result.value) {
          //           Meteor._reload.reload();
          //       } else if (result.dismiss === "cancel") {
          //       }
          //   });
          //   $(".fullScreenSpin").css("display", "none");
          // });
        }
        $('.fullScreenSpin').css('display', 'none');
        $(`#filterModal_${templateObject.data.tablename}`).modal('hide');
        swal({
          title: 'It was saved successfully.',
          type: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK'
        }).then((result) => {
          // $('.fullScreenSpin').css('display', 'inline-block');
          // window.location.reload();
          $(".btnRefresh").addClass("btnRefreshAlert");
        });
      }
    },
});

Template.filtersmodal.helpers({

    switchRuleOptions: () => {
        let switchRuleOptions = [
        {
          value: "",
          name: "Select",
          disabled: true,
          selected: true
        },{
          value: "like",
          name: "Or"
        },{
          value: '=',
          name: "And"
        },{
          value: ">",
          name: "Greater Than"
        },{
          value: "<",
          name: "Less Than"
        }
      ];
      const templateObject = Template.instance();

      if (templateObject.rowsData.get().length !== 0) {
          // Setting "Or" as the default selected option
          switchRuleOptions.forEach(option => {
              if (option.value === "like") {
                  option.selected = true;
                  templateObject.selectedOption.set("like");
              } else {
                  delete option.selected;
              }
          });
      }
      return switchRuleOptions;
    },

    filterValueDisplayStyle() {
      const templateObject = Template.instance();
      if (["like", "="].includes(templateObject.selectedOption.get())) {
          return "display: none;";
      }
      return "display: block;";
    },

    rows: function() {
      return Template.instance().rowsData.get();
    },

    placeholderValue() {
      let rowsData = Template.instance().rowsData.get();
      let length = rowsData.length;

      if (length === 0) {
        return "First selection";
      } else if (length === 1) {
        return "Second selection";
      } else if (length === 2) {
        return "Third selection";
      } else if (length === 3) {
        return "Forth selection";
      } else if (length === 4) {
        return "Fifth selection";
      } else {
        return "";
      }
    },

    flagePresent() {
      let rowsData = Template.instance().rowsData.get();
      let length = rowsData.length;
      return length < 5;
    },

    exportfilename: ()=>{
      return Template.instance().data.exportfilename;
    },

    filterInvoice: ()=>{
      return Template.instance().data.filterInvoice;
    }
});
