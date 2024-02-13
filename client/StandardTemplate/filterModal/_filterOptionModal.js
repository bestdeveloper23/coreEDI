import { ReactiveVar } from "meteor/reactive-var";
import "./_filterOptionModal.html";
import LoadingOverlay from "../../LoadingOverlay";
import CachedHttp from "../../CachedHttp";
import erpObject from "../../erp-objects";
import CurrencyApi from "../../API/CurrencyApi";
// import {updateAllCurrencies} from "./currencies";
import CronSetting from "../../CronSetting";
import moment from "moment";
import { filter } from "lodash";


let currentDate = new Date();
let currentFormatedDate = currentDate.getDay() + "/" + currentDate.getMonth() + "/" + currentDate.getFullYear();
const addProductStatus = false;
let fxUpdateObject;

Template._filterOptionModal.onCreated(function () {

  const templateObject = Template.instance();

  this.rowsData = new ReactiveVar([]);
  this.fieldsData = new ReactiveVar([]);
  this.operatorArray = new ReactiveVar([]);
  this.operatorValues = new ReactiveVar([]);
  this.inputValuesGroup = new ReactiveVar([]);
  this.selectedOption = new ReactiveVar("");
  templateObject.appliedFlag = new ReactiveVar(false);

});

Template._filterOptionModal.onRendered(function () {
  let templateObject = Template.instance();
});

Template._filterOptionModal.events({

  'click .btnAddNewCategory': () => {
    $('.fullScreenSpin').css('display', 'block');
    let templateObject = Template.instance();
    let rows = []
    if ($('#tableDataInput').val() == '') {
      $('.fullScreenSpin').css('display', 'none');
      swal({
        title: 'Oooops...',
        text: "Filter Name has not been defined.",
        type: 'error',
        showCancelButton: false,
        confirmButtonText: 'Try Again'
      }).then((result) => {
        if (result.value) {
          document.getElementById("tableDataInput").focus();
        } else if (result.dismiss === 'cancel') {

        }
      });
      document.getElementById("tableDataInput").focus();
    }
    else {
      // jQuery('#productModal').modal('toggle');

      const messageText = "Select A Product";

      const msgDiv = document.querySelector('#simple-selection-msg-text');
      msgDiv.innerText = '"' + messageText + '"';

      const transactionDiv = document.querySelector('#div-simple-msg-selection');
      transactionDiv.classList.add('show');

      setTimeout(function () {
        transactionDiv.classList.remove('show');
      }, 1000);

      $('.fullScreenSpin').css('display', 'none');

      if (templateObject.rowsData.get().length == 0) {
        rows.push({
          filterName: $("#tableDataInput").val(),
          operator: $(".defaultSelectOption select.form-control").val(),
          value: $('#filterValueInput').val()
        });
      }
      else {
        rows = templateObject.rowsData.get();
        rows.push({
          filterName: $("#tableDataInput").val(),
          operator: $(".defaultSelectOption select.form-control").val(),
          value: $('#filterValueInput').val()
        });
      }
      templateObject.rowsData.set(rows);
      $('#tableDataInput').val('');
      $('#filterValueInput').val('');
    }

  },

  'click #tableDataInput': () => {
    // jQuery('#productModal').modal('toggle');

    // const messageText = "Select A Product";

    // const msgDiv = document.querySelector('#simple-selection-msg-text');
    // msgDiv.innerText = '"' + messageText + '"';

    // const transactionDiv = document.querySelector('#div-simple-msg-selection');
    // transactionDiv.classList.add('show');

    // setTimeout(function () {
    //   transactionDiv.classList.remove('show');
    // }, 1000);
  },

  'click #tblProducts tbody td:nth-child(n)': function (event) {
    let templateObject = Template.instance();
    let listData = $(event.target).closest('tr').attr("id");

    $(event.target).closest('tr').siblings().removeClass('currentSelect');
    $(event.target).closest('tr').addClass('currentSelect');
    $(event.target).closest('tr').siblings().attr('style', 'background: node');
    $(event.target).closest('tr').attr('style', 'background: rgba(78, 115, 223, 0.31)!important;');

    jQuery("#tableDataInput").val($(event.target).closest('tr').find(".colproductName").text());
    // jQuery('#productModal').modal('toggle');
    let rows = [];
    if (templateObject.rowsData.get().length == 0) {
      rows.push({
        filterName: $("#tableDataInput").val(),
        operator: $(".defaultSelectOption select.form-control").val(),
        value: $('#filterValueInput').val()
      });
    }
    else {
      rows = templateObject.rowsData.get();
      rows.push({
        filterName: $("#tableDataInput").val(),
        operator: $(".defaultSelectOption select.form-control").val(),
        value: $('#filterValueInput').val()
      });
    }
    templateObject.rowsData.set(rows);
    $('#tableDataInput').val('');
    $('#filterValueInput').val('');
  },

  'click .btnOrderType': function (event) {
    if ($(event.target)[0].value == 'Or') {
      $(event.target)[0].value = "And";
      $($(event.target)[0]).removeClass('btn-primary');
      $($(event.target)[0]).addClass('btn-success');
    }
    else {
      $(event.target)[0].value = "Or";
      $($(event.target)[0]).addClass('btn-primary');
      $($(event.target)[0]).removeClass('btn-success');
    }
  },

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

    let filterOptionData = templateObject.rowsData.get();
    let productData = jQuery("#tblProducts tbody tr td.colproductName");

    productData.map((index, p) => {
      $(jQuery("#tblProducts tbody tr")[index]).hide();
      let indexFlag = false;
      filterOptionData.map(f => {
        if ($(p).text() == f.filterName) $(jQuery("#tblProducts tbody tr")[index]).show();
      })
    })

    jQuery("#productModal div div div h4").text('Filtered Product List');
    // jQuery('#productModal').modal('toggle');
    templateObject.appliedFlag.set(true);

  },

  'click .btnFilterReset'() {
    let templateObject = Template.instance();
    jQuery("#productModal div div div h4").text('Product List');
    let productData = jQuery("#tblProducts tbody tr td.colproductName");
    productData.map((index, p) => {
      $(jQuery("#tblProducts tbody tr")[index]).show();
    })
    // jQuery('#productModal').modal('toggle');
    templateObject.appliedFlag.set(false);
  },

  'click .filterModalClose'() {
    displayFilterFlag = 0;
    $('.modal-backdrop').css('display','none');
  },

  'click .btnSaveFilter': async function () {
    let templateObject = Template.instance();

    // if (templateObject.appliedFlag.get()) {
    //   let alertString = "FilterOption already applied! \n please reset filterOption first."
    //   swal({
    //     title: 'Sorry....',
    //     text: alertString,
    //     type: 'info',
    //     showCancelButton: false,
    //     confirmButtonText: 'Try Again'
    //   }).then((result) => {
    //     if (result.value) {
    //       return;
    //     } else if (result.dismiss === 'cancel') {

    //     }
    //   });
    //   return;
    // }
    $('.fullScreenSpin').css('display', 'block');
    let rows = []
    if (templateObject.rowsData.get().length == '') {
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
    }
    else {
      $('.fullScreenSpin').css('display', 'none');

      function arrayToString(arr) {
        return arr.join(", ");
      }
      let templateObject = Template.instance();
      // $('.fullScreenSpin').css('display', 'inline-block');
      // $('.fullScreenSpin').css('display', 'inline-block');
        $(`#_filterOptionModal`).modal('toggle');
        $(`#productModal`).modal('toggle');
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

Template._filterOptionModal.helpers({
  filterOptionItems: () => {
    return Template.instance().filterOptionItems.get();
  },

  switchRuleOptions: () => {
    let switchRuleOptions = [
      {
        value: "",
        name: "Select",
        disabled: true,
        selected: true
      }, {
        value: "like",
        name: "Or"
      }, {
        value: '=',
        name: "And"
      }, {
        value: ">",
        name: "Greater Than"
      }, {
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

  rowsData() {
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
      return "Next selection";
    }
  },

  flagePresent() {
    let rowsData = Template.instance().rowsData.get();
    let length = rowsData.length;
    return length < 100;
  },

  appliedFlag() {
    return Template.instance().appliedFlag.get();
  },

});
