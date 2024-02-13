import { Template } from 'meteor/templating';
import { SideBarService } from '../../../sidebar-services';
import './customfiltersmodal.html';

let sideBarService = new SideBarService();
Template.customfiltersmodal.onCreated(function() {
  let templateObject = Template.instance();
  templateObject.savedRowsData = new ReactiveVar([]);
  templateObject.savedRowsFieldsData = new ReactiveVar([]);
  templateObject.editRowsData = new ReactiveVar([]);
  templateObject.editFieldsData = new ReactiveVar([]);
  templateObject.selectedOperator = new ReactiveVar('');
  templateObject.state = new ReactiveVar();
  templateObject.operatorArray = new ReactiveVar([]);
  templateObject.operatorValues = new ReactiveVar([]);
  templateObject.inputValuesGroup = new ReactiveVar([]);

  Meteor.setInterval(() => {
    templateObject.editRowsData.set(templateObject.data.editTableData);
    templateObject.editFieldsData.set(templateObject.data.editTableField);
    templateObject.savedRowsData.set(templateObject.data.rows);
    templateObject.savedRowsFieldsData.set(templateObject.data.rowsField);
  }, 200);
});

Template.customfiltersmodal.events({
    'change .savedSelectOption'(event, instance) {
      let parent = $(event.target).closest('div.savedSelectContainer');
      let parentID = parent.attr('id');
      let index = parseInt(parentID.replace('savedSelectContainer_', ''));

      let selectValue = $(`#savedSelectContainer_${index} .savedSelectOption`).val();

      if (selectValue === 'like' || selectValue === '=') {
        $(`#savedFilterInputValue_${index}`).css('display', 'none');
      } else if (selectValue === '>' || selectValue === '<') {
        $(`#savedFilterInputValue_${index}`).css('display', 'block');
      }
    },
    'click .removeSavedRowBtn': async function(event, instance) {
      const rowIndex = $(event.target).closest('.first-section').index();
      let targetReportName = instance.data.indexeddbname;
      let data = {};
      let targetObj = {};

      function arrayToString(arr) {
        return arr.join(", ");
      }
      try {
          const dataObject = await getVS1Data("FiterSaveFunctionData");
          if (dataObject && dataObject.length !== 0) {
              data = JSON.parse(dataObject[0].data);
              const dataArr = data.tcustomfiltervs1;
              targetObj = dataArr.find(item => item.fields.ReportName === targetReportName);
          }
      } catch (error) {
      }

      let rows = [];
      let fields = [];
      if(displayEditFilterFlag == 0){
         rows = instance.savedRowsData.get();
         fields = instance.savedRowsFieldsData.get();
      }
      if(displayEditFilterFlag == 1){
         rows = instance.editRowsData.get();
         fields = instance.editFieldsData.get();
      }
      rows.splice(rowIndex, 1);
      fields.splice(rowIndex, 1);

      instance.editRowsData.set(rows);
      instance.editFieldsData.set(fields);
      
      if(localStorage.getItem('SaveBtnFlag') == 0){
        targetObj.fields.RowSaveOne = arrayToString(rows);
        targetObj.fields.RowSaveFieldOne = arrayToString(fields);
      }else if(localStorage.getItem('SaveBtnFlag') == 1){
        targetObj.fields.RowSaveTwo = arrayToString(rows);
        targetObj.fields.RowSaveFieldTwo = arrayToString(fields);
      }
      addVS1Data("FiterSaveFunctionData", JSON.stringify(data));
    },
    'click .btnEditSaveFilter': async function() {
      function arrayToString(arr) {
        return arr.join(", ");
      }

      let templateObject = Template.instance();
      let rowsSaveData = "";
      let rowsSaveFields = "";
      const editFilterFlag = window.displayEditFilterFlag;
      $('.fullScreenSpin').css('display', 'inline-block');
      if(editFilterFlag == 0){
        rowsSaveData = arrayToString(templateObject.savedRowsData.get());
        rowsSaveFields = arrayToString(templateObject.savedRowsFieldsData.get());
      }else if(editFilterFlag == 1){
        rowsSaveData = arrayToString(templateObject.editRowsData.get());
        rowsSaveFields = arrayToString(templateObject.editFieldsData.get());
      }
      let headerline = $(".savedHeaderline").val();

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

        for (let i =0; i < rowsSaveData.length; i++) {
          let operator = $(`#savedSelectContainer_${i} select.savedSelectOption option:selected`).text();
          let operatorValue = $(`#savedSelectContainer_${i} select.savedSelectOption`).val();
          let newVal = $(`#savedFilterInputValue_${i}`).val();

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
        let targetReportName = templateObject.data.indexeddbname;
        
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

        if(localStorage.getItem('SaveBtnFlag') == 0){
          let OverdueThirtyCheckOne = false;
          let OverdueSixtyCheckOne = false;
          let overdueSixtyoneCheckOne = false;
          let TermsCheckOne = false;
          let RdoDueThisMonthOne = false;
          let RdoDueLastMonthOne = false;
          let saveEditDueDays = $(".loadDueDays").val();
          let SaveEditDueOne = "";

          if($(".savedOverdueThirtyCheck").is(":checked")) {
            OverdueThirtyCheckOne = true;
          }else if($(".savedOverdueSixtyCheck").is(":checked")) {
            OverdueSixtyCheckOne = true;
          }else if($(".savedOverdueSixtyoneCheck").is(":checked")) {
            overdueSixtyoneCheckOne = true;
          }else if($(".savedTermsCheck").is(":checked")) {
            TermsCheckOne = true;
          }else if($(".savedRdoDueThisMonth").is(":checked")){
            RdoDueThisMonthOne = true;
          }else if($(".savedRdoDueLastMonth").is(":checked")){
            RdoDueLastMonthOne = true;
          }else if(saveEditDueDays){
            SaveEditDueOne = saveEditDueDays;
          }
          data = {
            type: "TCustomFilterVS1",
            fields: {
              "Active":true,
              "AllUsers":false,
              "DefaultFilter":false,
              "FilterNameOne":headerline || "",
              "FilterNameTwo":filterNameTwo,
              "GlobalRef":"",
              "ID":editID,
              "InputValueArrayOne": inputValuesArray || "",
              "InputVAlueArrayTwo": inputVAlueArrayTwo,
              "ISEmpty":false,
              "KeyStringFieldName":"",
              "KeyValue":"",
              "MsTimeStamp":"2023-09-27 03:57:19",
              "MsUpdateSiteCode":"DEF",
              "OperatorArrayOne": operatorArray || "",
              "OperatorArrayTwo":operatorArrayTwo,
              "OperatorValueArrayOne": operatorValueArray || "",
              "OperatorValueArrayTwo":operatorValueArrayTwo,
              "OverdueSixtyCheckOne":OverdueSixtyCheckOne,
              "OverdueSixtyCheckTwo":overdueSixtyCheckTwo,
              "OverdueSixtyOneCheckOne":overdueSixtyoneCheckOne,
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
          await sideBarService.postFilterVs1Data(data).then((res) => {
            sideBarService.getFilterVs1Data().then(function(dataReload){
              addVS1Data("FiterSaveFunctionData", JSON.stringify(dataReload));
            }).catch(function(err) {
            });
          }).catch(function (err) {
            swal({
              title: "Oooops...",
              text: err,
              type: "error",
              showCancelButton: false,
              confirmButtonText: "Try Again",
            }).then((result) => {
                if (result.value) {
                    Meteor._reload.reload();
                } else if (result.dismiss === "cancel") {
                }
            });
          });
        }else if(localStorage.getItem('SaveBtnFlag') == 1){
          let OverdueThirtyCheckTwo = false;
          let OverdueSixtyCheckTwo = false;
          let OverdueSixtyoneCheckTwo = false;
          let TermsCheckTwo = false;
          let RdoDueThisMonthTwo = false;
          let RdoDueLastMonthTwo = false;
          let saveEditDueDays = $(".loadDueDays").val();
          let SaveEditDueTwo = "";

          if($(".savedOverdueThirtyCheck").is(":checked")) {
            OverdueThirtyCheckTwo = true;
          }else if($(".savedOverdueSixtyCheck").is(":checked")) {
            OverdueSixtyCheckTwo = true;
          }else if($(".savedOverdueSixtyoneCheck").is(":checked")) {
            OverdueSixtyoneCheckTwo = true;
          }else if($(".savedTermsCheck").is(":checked")) {
            TermsCheckTwo = true;
          }else if($(".savedRdoDueThisMonth").is(":checked")){
            RdoDueThisMonthTwo = true;
          }else if($(".savedRdoDueLastMonth").is(":checked")){
            RdoDueLastMonthTwo = true;
          }else if(saveEditDueDays){
            SaveEditDueTwo = saveEditDueDays;
          }
          localStorage.setItem('SaveBtnFlag', 0);
          data = {
            type: "TCustomFilterVS1",
            fields: {
              "Active":true,
              "AllUsers":false,
              "DefaultFilter":false,
              "FilterNameOne":filterNameOne,
              "FilterNameTwo": headerline || "",
              "GlobalRef":"",
              "ID": editID || "",
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
          await sideBarService.postFilterVs1Data(data).then((data) => {
            sideBarService.getFilterVs1Data().then(function(dataReload){
              addVS1Data("FiterSaveFunctionData", JSON.stringify(dataReload));
            }).catch(function(err) {
            });
          }).catch(function (err) {
            swal({
              title: "Oooops...",
              text: err,
              type: "error",
              showCancelButton: false,
              confirmButtonText: "Try Again",
            }).then((result) => {
                if (result.value) {
                    Meteor._reload.reload();
                } else if (result.dismiss === "cancel") {
                }
            });
            $(".fullScreenSpin").css("display", "none");
          });
        }
        $('.fullScreenSpin').css('display', 'none');
        swal({
          title: 'It has been successfully saved.',
          type: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK'
        }).then((result) => {
          $('.fullScreenSpin').css('display', 'inline-block');
          window.location.reload();
        });
      }
    },
    'click .savedBtnFilterApply': async function (event) {
      event.preventDefault()
      event.stopPropagation()
      let templateObject = Template.instance();

      var currentDateCal = new Date();
      var year = currentDateCal.getFullYear();
      var month = currentDateCal.getMonth();
      var editDueDays = $(".loadDueDays").val();

      const dataTableList = [];
      $('.fullScreenSpin').css('display', 'inline-block');
      let tablename = templateObject.data.tablename;
      if(templateObject.data.custid) {
          tablename = tablename + "_" + templateObject.data.custid
      }
      let savedRowsArray = [];
      let savedFieldsArray = [];
      const editFilterFlag = window.displayEditFilterFlag;
      if(editFilterFlag == 0){
        savedRowsArray = templateObject.data.rows;
        savedFieldsArray = templateObject.data.rowsField;
      }else if(editFilterFlag == 1){
        savedRowsArray = templateObject.data.editTableData;
        savedFieldsArray = templateObject.data.editTableField;
      }

      let paramArray = [];
      for (let i =0; i < savedRowsArray.length; i++) {
        let operator = $(`#savedSelectContainer_${i} select.savedSelectOption`).val();
        let originVal = savedRowsArray[i];
        let field = savedFieldsArray[i];
        let newVal = $(`#savedFilterInputValue_${i}`).val();

        let paramObj = {
          Name: field,
          Operator: operator,
          Value: newVal === "" ? originVal : newVal
        };
        paramArray.push(paramObj);
      }

      if($(".savedOverdueThirtyCheck").is(":checked")) {
        let firstDue = 2;
        let overDueDays = $(".savedOverdueThirtyCheck").val();
        var overdueMilliseconds = overDueDays * 24 * 60 * 60 * 1000;
        var firstDueMilliseconds = firstDue * 24 * 60 * 60 * 1000;

        var pastDate = new Date(currentDateCal - overdueMilliseconds);
        var firstDate = new Date(currentDateCal - firstDueMilliseconds);
        var finalDueDateStr = pastDate.toISOString().split('T')[0];
        var firstDueDateStr = firstDate.toISOString().split('T')[0];

      }else if($(".savedOverdueSixtyCheck").is(":checked")) {
        let firstDue = 32;
        let overDueDays = $(".savedOverdueSixtyCheck").val();
        var overdueMilliseconds = overDueDays * 24 * 60 * 60 * 1000;
        var firstDueMilliseconds = firstDue * 24 * 60 * 60 * 1000;

        var pastDate = new Date(currentDateCal - overdueMilliseconds);
        var firstDate = new Date(currentDateCal - firstDueMilliseconds);
        var finalDueDateStr = pastDate.toISOString().split('T')[0];
        var firstDueDateStr = firstDate.toISOString().split('T')[0];
      }else if($(".savedOverdueSixtyoneCheck").is(":checked")) {
        let overDueDays = $(".savedOverdueSixtyoneCheck").val();
        var overdueMilliseconds = overDueDays * 24 * 60 * 60 * 1000;

        var pastDate = new Date(currentDateCal - overdueMilliseconds);
        var overDueDateStr = pastDate.toISOString().split('T')[0];
      }else if($(".savedTermsCheck").is(":checked")) {
        var oneDueDateStr = currentDateCal.toISOString().split('T')[0];
      }else if($(".savedRdoDueThisMonth").is(":checked")){
        var lastDay = new Date(year, month + 1, 0).getDate();
        var currentMonth = new Date(year, month, lastDay);
        var oneDueDateStr = currentMonth.toISOString().split('T')[0];
      }else if($(".savedRdoDueLastMonth").is(":checked")){
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
                if(data.tbillreport.length == 0){
                  swal({
                    title: 'Do You Wish to Add New?',
                    text: '',
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, proceed',
                    cancelButtonText: 'No, cancel'
                  }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {
                    }
                  });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
      }
    },
    'click .savedFilterModalClose'() {
      displayFilterFlag = 0;
    },
});
Template.customfiltersmodal.helpers({

  filterValueDisplayStyle() {
    const inputValueArray = this.inputValueArray;

    if (!inputValueArray || /^\s*$/.test(inputValueArray)) {
      return "display: none;";
    } else {
      return "";
    }
  },
  filterInvoice: ()=>{
    return Template.instance().data.filterInvoice;
  },
  headerline: () => {
    let templateObject = Template.instance();
    let indexDB = templateObject.data.indexdbSavedData;
    let titleOne = "";
    let titleTwo = "";
    if (indexDB.length != 0){
      titleOne = indexDB.fields.FilterNameOne;
      titleTwo = indexDB.fields.FilterNameTwo;
    }
    

    if(localStorage.getItem('SaveBtnFlag') == 0){
      return titleOne;
    }else if(localStorage.getItem('SaveBtnFlag') == 1){
      return titleTwo;
    }
  },

  combinedData() {
    const templateObject = Template.instance();
    let rows = [];
    const editFilterFlag = window.displayEditFilterFlag;
    if(editFilterFlag == 0){
      rows = templateObject.savedRowsData.get();
    }else if(editFilterFlag == 1){
      rows = templateObject.editRowsData.get();
    }
    const operatorArray = templateObject.data.operators;
    const operatorValueArray = templateObject.data.operatorValues;
    const inputValuesArray = templateObject.data.inputValuesData;
    return rows.map((row, index) => ({
      row: row,
      operator: operatorArray[index],
      operatorValueArray: operatorValueArray[index],
      inputValueArray: inputValuesArray[index]
    }));
  },
  isSelected: function(actualValue, optionValue) {
    return actualValue === optionValue ? 'selected' : '';
  },
  placeholderValue() {
    let rowsData = [];
    const editFilterFlag = window.displayEditFilterFlag;
    if(editFilterFlag == 0){
      rowsData = Template.instance().savedRowsData.get();
    }else if(editFilterFlag == 1){
      rowsData = Template.instance().editRowsData.get();
    }

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
    let rowsData = [];
    const editFilterFlag = window.displayEditFilterFlag;
    if(editFilterFlag == 0){
      rowsData = Template.instance().savedRowsData.get();
    }else if(editFilterFlag == 1){
      rowsData = Template.instance().editRowsData.get();
    }
    let length = rowsData.length;
    return length < 5;
  },
  overdueThirtyCheck: () => {
    let templateObject = Template.instance();
    const indexDB = templateObject.data.indexdbSavedData;
    let sendOne = false;
    let sendTwo = false;
    if (indexDB.length != 0){
      sendOne = indexDB.fields.OverdueThirtyCheckOne;
      sendTwo = indexDB.fields.OverdueThirtyCheckTwo;
    }
    if(localStorage.getItem('SaveBtnFlag') == 0){
      return sendOne == true ? 'checked' : '';
    }else if(localStorage.getItem('SaveBtnFlag') == 1){
      return sendTwo == true ? 'checked' : '';
    }

  },
  overdueSixtyCheck: () => {
    let templateObject = Template.instance();
    let indexDB = templateObject.data.indexdbSavedData;
    let sendOne = false;
    let sendTwo = false;
    if (indexDB.length != 0){
      sendOne = indexDB.fields.OverdueSixtyCheckOne;
      sendTwo = indexDB.fields.OverdueSixtyCheckTwo;
    }
    if(localStorage.getItem('SaveBtnFlag') == 0){
      return sendOne == true ? 'checked' : '';
    }else if(localStorage.getItem('SaveBtnFlag') == 1){
      return sendTwo == true ? 'checked' : '';
    }
  },
  overdueSixtyoneCheck: () => {
    let templateObject = Template.instance();
    let indexDB = templateObject.data.indexdbSavedData;
    let sendOne = false;
    let sendTwo = false;
    if (indexDB.length != 0){
      sendOne = indexDB.fields.OverdueSixtyOneCheckOne;
      sendTwo = indexDB.fields.OverdueSixtyOneCheckTwo;
    }
    if(localStorage.getItem('SaveBtnFlag') == 0){
      return sendOne == true ? 'checked' : '';
    }else if(localStorage.getItem('SaveBtnFlag') == 1){
      return sendTwo == true ? 'checked' : '';
    }
  },
  termsCheck: () => {
    let templateObject = Template.instance();
    let indexDB = templateObject.data.indexdbSavedData;
    let sendOne = false;
    let sendTwo = false;
    if (indexDB.length != 0){
      sendOne = indexDB.fields.TermsCheckOne;
      sendTwo = indexDB.fields.TermsCheckTwo;
    }
    if(localStorage.getItem('SaveBtnFlag') == 0){
      return sendOne == true ? 'checked' : '';
    }else if(localStorage.getItem('SaveBtnFlag') == 1){
      return sendTwo == true ? 'checked' : '';
    }
  },
  rdoDueThisMonth: () => {
    let templateObject = Template.instance();
    let indexDB = templateObject.data.indexdbSavedData;
    let sendOne = false;
    let sendTwo = false;
    if (indexDB.length != 0){
      sendOne = indexDB.fields.RdoDueThisMonthOne;
      sendTwo = indexDB.fields.RdoDueThisMonthTwo;
    }
    if(localStorage.getItem('SaveBtnFlag') == 0){
      return sendOne == true ? 'checked' : '';
    }else if(localStorage.getItem('SaveBtnFlag') == 1){
      return sendTwo == true ? 'checked' : '';
    }
  },
  rdoDueLastMonth: () => {
    let templateObject = Template.instance();
    let indexDB = templateObject.data.indexdbSavedData;
    let sendOne = false;
    let sendTwo = false;
    if (indexDB.length != 0){
      sendOne = indexDB.fields.RdoDueLastMonthOne;
      sendTwo = indexDB.fields.RdoDueLastMonthTwo;
    }
    if(localStorage.getItem('SaveBtnFlag') == 0){
      return sendOne == true ? 'checked' : '';
    }else if(localStorage.getItem('SaveBtnFlag') == 1){
      return sendTwo == true ? 'checked' : '';
    }
  },
  saveEditDueDays: () => {
    let templateObject = Template.instance();
    let indexDB = templateObject.data.indexdbSavedData;
    let sendOne = false;
    let sendTwo = false;
    if (indexDB.length != 0){
      sendOne = indexDB.fields.SaveEditDueOne;
      sendTwo = indexDB.fields.SaveEditDueTwo;
    }
    if(localStorage.getItem('SaveBtnFlag') == 0){
      return sendOne;
    }else if(localStorage.getItem('SaveBtnFlag') == 1){
      return sendTwo;
    }
  },
});
