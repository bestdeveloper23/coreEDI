
import { ReactiveVar } from 'meteor/reactive-var';
import XLSX from 'xlsx';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './importagain_button.html';
const moment = require('moment-timezone');
Template.importagain_button.onCreated(function () {
    const templateObject = Template.instance();
});

Template.importagain_button.onRendered(async function () {
  await $(".edtDailyStartDate").datepicker({
      showOn: "button",
      buttonText: "Show Date",
      buttonImageOnly: true,
      buttonImage: "/img/imgCal2.png",
      constrainInput: false,
      dateFormat: "d/mm/yy",
      showOtherMonths: true,
      selectOtherMonths: true,
      changeMonth: true,
      changeYear: true,
      yearRange: "-90:+10",
  });
  const currentDate = new Date();
  const begunDate = moment(currentDate).format("DD/MM/YYYY");
  $(".edtDailyStartDate").val(begunDate);
});


Template.importagain_button.events({


});

Template.importagain_button.helpers({
 currentDate: () => {
    const currentDate = new Date();
    const begunDate = moment(currentDate).format("DD/MM/YYYY");
    console.log(begunDate);
    return begunDate;
  }
});
