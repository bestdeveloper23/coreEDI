import { Template } from 'meteor/templating';
import './_frequencyModal.html';

Template._frequencyModal.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.id = new ReactiveVar();
});

Template._frequencyModal.onRendered(function() {
  let templateObject = Template.instance();
    let custid =templateObject.data.custid;

    $("#date-input,#edtWeeklyStartDate,#edtWeeklyFinishDate,#dtDueDate,#customdateone,#edtMonthlyStartDate,#edtMonthlyFinishDate,#edtDailyStartDate,#edtDailyFinishDate,#edtOneTimeOnlyDate").datepicker({
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

});

Template._frequencyModal.events({
  'click .formCheck-AllMonths': function (event) {
      if ($(event.target).is(':checked')) {
          $('.chkMonths').prop("checked", true);
      } else {
          $('.chkMonths').prop("checked", false);
      }
  }
});

Template._frequencyModal.helpers({
  id:()=> {
    return Template.instance().id.get()
  }
});
