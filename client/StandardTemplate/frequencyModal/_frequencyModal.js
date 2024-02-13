import { Template } from 'meteor/templating';
import './_frequencyModal.html';
import LoadingOverlay from "../../LoadingOverlay.js";
import CronSetting from "../../CronSetting.js";
import {DailyFrequencyModel, MonthlyFrequencyModel, OneTimeOnlyFrequencyModel, OnEventFrequencyModel, WeeklyFrequencyModel} from "../../FrequencyModel.js";
import moment from "moment";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { pullRecords } from '../../../imports/ui/CustomerList/customerscard.js'
import { RunNow } from '../../../imports/ui/CustomerList/customerscard.js'

let currentDate = new Date();
let currentFormatedDate = currentDate.getDay() + "/" + currentDate.getMonth() + "/" + currentDate.getFullYear();
let fxUpdateObject = new OneTimeOnlyFrequencyModel({});

Template._frequencyModal.events({
    'click input[name="frequencyRadio"]': function(event) {
        if (event.target.id == "frequencyMonthly") {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            document.getElementsByClassName("month-checkbox")[today.getMonth()].checked = true;

            today = dd + '/' + mm + '/' + yyyy;

            document.getElementById('edtMonthlyStartDate').value = today;
            document.getElementById("sltDay").value = 'day' + dd;

            var finishdate = new Date();
            var dd = String(finishdate.getDate()).padStart(2, '0');
            var mm = String(finishdate.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = finishdate.getFullYear() + 1;

            finishdate = dd + '/' + mm + '/' + yyyy;

            document.getElementById('edtMonthlyFinishDate').value = finishdate;

            fxUpdateObject = new MonthlyFrequencyModel({
                startDate: currentDate.toISOString().substring(0, 10),
                startTime: "08:00:00"
            });
        } else if (event.target.id == "frequencyWeekly") {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            var todayDate = today;
            today = dd + '/' + mm + '/' + yyyy;
            $(".chkBoxDays").prop("checked", false);
            document.getElementsByClassName('chkBoxDays')[todayDate.getDay() == 0 ? 6 : todayDate.getDay() - 1].checked = true;

            document.getElementById('edtWeeklyStartDate').value = today;

            var finishdate = new Date();
            finishdate.setMonth(finishdate.getMonth() + 1);
            var dd = String(finishdate.getDate()).padStart(2, '0');
            var mm = String(finishdate.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = finishdate.getFullYear();

            finishdate = dd + '/' + mm + '/' + yyyy;

            document.getElementById('edtWeeklyFinishDate').value = finishdate;

            fxUpdateObject = new WeeklyFrequencyModel({
                startDate: currentDate.toISOString().substring(0, 10),
                startTime: "08:00:00"
            });
        } else if (event.target.id == "frequencyDaily") {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = dd + '/' + mm + '/' + yyyy;

            document.getElementById('edtDailyStartDate').value = today;
            $("#dailyEveryDay").click();

            var finishdate = new Date();
            finishdate.setMonth(finishdate.getMonth() + 1);
            var dd = String(finishdate.getDate()).padStart(2, '0');
            var mm = String(finishdate.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = finishdate.getFullYear();

            finishdate = dd + '/' + mm + '/' + yyyy;

            document.getElementById('edtDailyFinishDate').value = finishdate;

            fxUpdateObject = new DailyFrequencyModel({
                startDate: currentDate.toISOString().substring(0, 10),
                startTime: "08:00:00"
            });
        } else if (event.target.id == "frequencyOnetimeonly") {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = dd + '/' + mm + '/' + yyyy;

            document.getElementById('edtOneTimeOnlyDate').value = today;

            fxUpdateObject = new OneTimeOnlyFrequencyModel({
                startDate: currentDate.toISOString().substring(0, 10),
                startTime: "08:00:00"
            });
        }
    },

    "click .weeklySettings .chkBoxDays": function (event) {
        var checkboxes = document.querySelectorAll(".weeklySettings .chkBoxDays");
        checkboxes.forEach(item => {
            if (item !== event.target) {
                item.checked = false;
            }
        });
    },

    'click input[name="dailyRadio"]': event => {
        if (event.target.id == "dailyEveryDay") {
            $(".dailyEveryXDays").attr("disabled", true);
        } else if (event.target.id == "dailyWeekdays") {
            $(".dailyEveryXDays").attr("disabled", true);
        } else if (event.target.id == "dailyEvery") {
            $(".dailyEveryXDays").attr("disabled", false);
        } else {
            $("#frequencyModal").modal("toggle");
        }
    },

    "change input[name=dailyRadio]": e => {
        $(".week-days-js input[type=checkbox].chkBoxDays").attr(
            "disabled", $(e.currentTarget).attr("data-value") == "week-days"
                ? false
                : true);
    },

    "click .btnSaveFrequency": (e, ui) => {
        // setTimeout(function(){
            ui.saveShedule(ui);
        // }, delayTimeAfterSound);
    },
    'click .formCheck-AllMonths': function (event) {
        if ($(event.target).is(':checked')) {
            $('.chkMonths').prop("checked", true);
        } else {
            $('.chkMonths').prop("checked", false);
        }
    }
})
Template._frequencyModal.onRendered((e) => {
    let templateObject = Template.instance();
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    document.getElementById('edtOneTimeOnlyDate').value = today;

    templateObject.saveShedule = async e => {
        let selConnectionId = e.data.selConnectionId
        function convertDayNumberToString(number) {
            let lastNumber = number.toString().slice(-1);
            let suffixe = "st";

            if (lastNumber == 1) {
                suffixe = "st";
            } else if (lastNumber == 2) {
                suffixe = "nd";
            } else if (lastNumber == 3) {
                suffixe = "rd";
            } else {
                suffixe = "th";
            }

            return number + suffixe;
        }
        LoadingOverlay.show();
        // updateAllCurrencies();

        let cronSetting = new CronSetting({
            id: 1,
            isProcessed: 1,
            employeeId: FlowRouter.current().queryParams.id,
            startAt: new Date(),
            selConnectionId: e.data.selConnectionId,
            exceptionType: jQuery("#basic-addon3").val(),
            cronJob: () => RunNow,
            type: fxUpdateObject == undefined
                ? null
                : fxUpdateObject.type,
            //base64XeCredentials: await FxApi.getEmployeeFxCurrencyCredentials()
        });

        /**
         * If monthly
         */
        if (fxUpdateObject instanceof MonthlyFrequencyModel) {
            let checkedMonths = [];
            document.querySelectorAll(".months-input-js input[type=checkbox]:checked").forEach(element => {
                checkedMonths.push(element.getAttribute("value"));
            });

            fxUpdateObject.ofMonths = checkedMonths;
            fxUpdateObject.everyDay = $("#sltDay").val();
            fxUpdateObject.startDate = $("#edtMonthlyStartDate").val();
            fxUpdateObject.startTime = "08:00:00";


            cronSetting.startAt = fxUpdateObject.getDate();
            cronSetting.months = checkedMonths;
            cronSetting.dayNumberOfMonth = convertDayNumberToString(fxUpdateObject.everyDay);

            if ($(".months-input-js input.chkBox:checked").length == 0) {
                LoadingOverlay.hide();
                handleValidationError("You must select at least one month", "Cron Settings");
                return false;
            }

            //cronSetting.parsed = later.recur()
        } else if (fxUpdateObject instanceof WeeklyFrequencyModel) {
            if ($(".weekly-input-js input.chkBoxDays:checked").length == 0) {
                LoadingOverlay.hide();
                handleValidationError("You must select at least one day", "Cron Settings");
                return false;
            }

            const selectedDay = document.querySelector(".weekly-input-js input[type=checkbox]:checked").value;

            fxUpdateObject.selectedDays = selectedDay;
            fxUpdateObject.everyWeeks = $("#weeklyEveryXWeeks").val();
            fxUpdateObject.startDate = $("#edtWeeklyStartDate").val();
            fxUpdateObject.startTime = "08:00:00";

            // cronSetting.type = "Weekly";
            cronSetting.days = fxUpdateObject.selectedDays;
            cronSetting.every = fxUpdateObject.everyWeeks;
            cronSetting.startAt = fxUpdateObject.getDate();

        } else if (fxUpdateObject instanceof DailyFrequencyModel) {

            if ($("#dailyWeekdays").prop("checked")) {
                let selectedDays = [];
                let selectedDayNumbers = [];

                if ($(".daily-input-js input.chkBoxDays:checked").length == 0) {
                    LoadingOverlay.hide();
                    handleValidationError("You must select at least one day", "Cron Settings");
                    return false;
                }

                document.querySelectorAll(".daily-input-js input[type=checkbox]:checked").forEach(element => {
                    selectedDays.push(element.getAttribute("value"));
                    selectedDayNumbers.push(parseInt(element.getAttribute("data-value")));
                });

                fxUpdateObject.weekDays = selectedDays;
                cronSetting.dayInNumbers = selectedDayNumbers;
                fxUpdateObject.every = null;

                cronSetting.days = selectedDays;

            } else if ($("#dailyEveryDay").prop("checked")) {
                cronSetting.dayInNumbers = [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                ];
                fxUpdateObject.weekDays = [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday"
                ];
                fxUpdateObject.every = 1;

                cronSetting.every = 1;
                cronSetting.days = fxUpdateObject.weekDays;

            } else if ($("#dailyEvery").prop("checked")) {
                fxUpdateObject.weekDays = null;
                fxUpdateObject.every = parseInt($("#dailyEveryXDays").val());
                cronSetting.every = fxUpdateObject.every;

            }

            fxUpdateObject.startDate = $("#edtDailyStartDate").val();
            fxUpdateObject.startTime = "08:00:00";
            cronSetting.startAt = fxUpdateObject.getDate();

        } else if (fxUpdateObject instanceof OneTimeOnlyFrequencyModel) {
            fxUpdateObject.startDate = $("#edtOneTimeOnlyDate").val();
            fxUpdateObject.startTime = "08:00:00";


            cronSetting.startAt = fxUpdateObject.getDate();

        } else if (fxUpdateObject instanceof OnEventFrequencyModel) {
            fxUpdateObject.onLogin = $("#settingsOnLogon").prop("checked");
            fxUpdateObject.onLogout = $("#settingsOnLogout").prop("checked");
        }

        if (fxUpdateObject.startDate && fxUpdateObject.startTime) {
            if (moment(fxUpdateObject.getDate()).isBefore(new Date())) {
                LoadingOverlay.hide();
                handleValidationError("You cannot schedule before your current time", "Cron Settings");
                return false;
            }
        }


        cronSetting.isProcessed = 1;
        cronSetting.type = fxUpdateObject.type;

        cronSetting.buildParsedText();
        try {
            Meteor.call("pullRecordCron", cronSetting);
            LoadingOverlay.hide(0);
            swal({title: "Success", text: "Updating TrueERP from Magento was scheduled successfully", type: "success", showCancelButton: false, confirmButtonText: "OK"}).then(() => {
                $('#frequencyModal').modal('hide')
            });
        } catch (exception) {
            LoadingOverlay.hide(0);

            swal({title: "Oooops...", text: "Couldn't save schedule", type: "error", showCancelButton: true, confirmButtonText: "Try Again"}).then(result => {
                if (result.value) {
                    $(".btnSaveFrequency").click();
                    // Meteor._reload.reload();
                } else if (result.dismiss === "cancel") {}
            });
        }
        console.log(cronSetting)

        LoadingOverlay.hide();
    };

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
})
