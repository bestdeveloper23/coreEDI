import './colResizable.js';
import moment from "moment";

modalDraggable = function () {

$(document).ready(function(){
  $(document).on('click', '.highlightInput', function () {
    $(this).select();
  });

  $(document).on('click', "input[type='text']", function () {
    $(this).select();
  });

  $(document).on('click', "input[type='email']", function () {
    $(this).select();
  });

  $(document).on('click', "input[type='number']", function () {
    $(this).select();
  });

  $(document).on('click', "input[type='password']", function () {
    $(this).select();
  });
  $("input[type='text']").on("click", function () {
   $(this).select();
 });

 $(".highlightInput").on("click", function () {
  $(this).select();
});

 $("input[type='number']").on("click", function () {
  $(this).select();
});

$("input[type='text']").click(function () {
   $(this).select();
});

$("input[type='number']").click(function () {
   $(this).select();
});

setTimeout(function () {
var usedNames = {};
$("select[name='edtBankAccountName'] > option").each(function () {
    if(usedNames[this.text]) {
        $(this).remove();
    } else {
        usedNames[this.text] = this.value;
    }
});
}, 3000);

// $(".hasDatepicker").on("blur", function () {

  $(document).on('blur', '.hasDatepicker', function () {
         let dateEntered = $(event.target).val();
         let parts = [];
         if(dateEntered.length > 6){

             let isReceiptDateValid = moment($(event.target).val()).isValid();
             let symbolArr = ['/', '-', '.', ' ',','];
             symbolArr.forEach(function (e, i) {
                 if ($(event.target).val().indexOf(symbolArr[i]) > -1) {
                     parts = $(event.target).val().split(symbolArr[i]);
                 }
             });
             if(parts.length){
                 if(!isReceiptDateValid) {
                     if (!(parts[0] && (parts[1] < 13) && (parts[2] > 999 && parts[2] < 9999 ))) {
                       //let parts = dateEntered.match(/.{1,2}/g);
                       tempDay = parseInt(parts[0]);
                       tempMonth = parseInt(parts[1])-1;
                       tempYear = parseInt(parts[2])+2000;
                       if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
                           $(event.target).val(moment().format('DD/MM/YYYY'));
                       }else {
                           let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                           $(event.target).val(tempDate);
                       }
                     } else {
                         let myDate = moment(new Date(parts[2], parts[1] - 1, parts[0])).format("DD/MM/YYYY");
                         $(event.target).val(myDate);
                     }
                 }else{
                     if (!(parts[0] && (parts[1] < 13) && (parts[2] > 999 && parts[2] < 9999 ))) {
                       //let parts = dateEntered.match(/.{1,2}/g);
                       tempDay = parseInt(parts[0]);
                       tempMonth = parseInt(parts[1])-1;
                       tempYear = parseInt(parts[2])+2000;
                       if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
                           $(event.target).val(moment().format('DD/MM/YYYY'));
                       }else {
                           let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                           $(event.target).val(tempDate);
                       }
                     } else {
                         let myDate = moment(new Date(parts[2], parts[1] - 1, parts[0])).format("DD/MM/YYYY");
                         $(event.target).val(myDate);
                     }
                 }
             }else{
                 $(event.target).val(moment().format('DD/MM/YYYY'));

             }

         }else if(dateEntered.length === 6){
             let parts = dateEntered.match(/.{1,2}/g);
             tempDay = parseInt(parts[0]);
             tempMonth = parseInt(parts[1])-1;
             tempYear = parseInt(parts[2])+2000;
             if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
                 $(event.target).val(moment().format('DD/MM/YYYY'));
             }else {
                 let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                 $(event.target).val(tempDate);
             }
         }else {
           let symbolArr = ['/', '-', '.', ' ',','];
           symbolArr.forEach(function (e, i) {
               if ($(event.target).val().indexOf(symbolArr[i]) > -1) {
                   parts = $(event.target).val().split(symbolArr[i]);
               }
           });
           if(parts.length > 1){
             tempDay = parseInt(parts[0]);
             tempMonth = parseInt(parts[1])-1;
             tempYear = new Date().getFullYear();  // returns the current year
             if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
                 $(event.target).val(moment().format('DD/MM/YYYY'));
             }else {
                 let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                 $(event.target).val(tempDate);
             }
           }else{
             $(event.target).val(moment().format('DD/MM/YYYY'));
           }
         }
});

$(document).on('keypress', '.hasDatepicker', function (e) {
    if(e.which == 13) {
       let dateEntered = $(event.target).val();
       let parts = [];
       if(dateEntered.length > 6){

           let isReceiptDateValid = moment($(event.target).val()).isValid();
           let symbolArr = ['/', '-', '.', ' ',','];
           symbolArr.forEach(function (e, i) {
               if ($(event.target).val().indexOf(symbolArr[i]) > -1) {
                   parts = $(event.target).val().split(symbolArr[i]);
               }
           });
           if(parts.length){
               if(!isReceiptDateValid) {

                   if (!(parts[0] && (parts[1] < 13) && (parts[2] > 999 && parts[2] < 9999 ))) {

                     tempDay = parseInt(parts[0]);
                     tempMonth = parseInt(parts[1])-1;
                     tempYear = parseInt(parts[2])+2000;

                     if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){

                         $(event.target).val(moment().format('DD/MM/YYYY'));
                     }else {

                         let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                         $(event.target).val(tempDate);
                     }
                   } else {

                       let myDate = moment(new Date(parts[2], parts[1] - 1, parts[0])).format("DD/MM/YYYY");
                       $(event.target).val(myDate);
                   }
               }else{

                   if (!(parts[0] && (parts[1] < 13) && (parts[2] > 999 && parts[2] < 9999 ))) {

                     tempDay = parseInt(parts[0]);
                     tempMonth = parseInt(parts[1])-1;
                     tempYear = parseInt(parts[2])+2000;
                     if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
                         $(event.target).val(moment().format('DD/MM/YYYY'));
                     }else {
                         let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                         $(event.target).val(tempDate);
                     }
                   } else {
                       let myDate = moment(new Date(parts[2], parts[1] - 1, parts[0])).format("DD/MM/YYYY");
                       $(event.target).val(myDate);
                   }
               }
           }else{
               $(event.target).val(moment().format('DD/MM/YYYY'));

           }

       }else if(dateEntered.length === 6){
           let parts = dateEntered.match(/.{1,2}/g);
           tempDay = parseInt(parts[0]);
           tempMonth = parseInt(parts[1])-1;
           tempYear = parseInt(parts[2])+2000;
           if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
               $(event.target).val(moment().format('DD/MM/YYYY'));
           }else {
               let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
               $(event.target).val(tempDate);
           }
       }else {
         let symbolArr = ['/', '-', '.', ' ',','];
         symbolArr.forEach(function (e, i) {
             if ($(event.target).val().indexOf(symbolArr[i]) > -1) {
                 parts = $(event.target).val().split(symbolArr[i]);
             }
         });
         if(parts.length > 1){
           tempDay = parseInt(parts[0]);
           tempMonth = parseInt(parts[1])-1;
           tempYear = new Date().getFullYear();  // returns the current year
           if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
               $(event.target).val(moment().format('DD/MM/YYYY'));
           }else {
               let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
               $(event.target).val(tempDate);
           }
         }else{
           $(event.target).val(moment().format('DD/MM/YYYY'));
         }
       }
     }
});

$('.dropdown-toggle').on("click",function(event){

    //event.stopPropagation();
});
// $('.dropdown-toggle').click(e => e.stopPropagation());
  });


    /*
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
        */
};


  makeNegativeGlobal = function () {

    $("td.colStatus").each(function () {
        if ($(this).text() == "In-Active") $(this).addClass("text-deleted");
        if ($(this).text() == "Deleted") $(this).addClass("text-deleted");
        if ($(this).text() == "Full") $(this).addClass("text-fullyPaid");
        if ($(this).text() == "Part") $(this).addClass("text-partialPaid");
        if ($(this).text() == "Rec") $(this).addClass("text-reconciled");
        if ($(this).text() == "Converted") $(this).addClass("text-converted");
        if ($(this).text() == "Completed") $(this).addClass("text-completed");
        if ($(this).text() == "Not Converted") $(this).addClass("text-NotConverted");
        if ($(this).text() == "On-Hold") $(this).addClass("text-Yellow");
        if ($(this).text() == "Processed") $(this).addClass("text-Processed");
        if ($(this).text() == "In-Stock") $(this).addClass("text-instock");
        if ($(this).text() == "Sold") $(this).addClass("text-sold");
    });
    $("td.colFinished").each(function () {
        if ($(this).text() == "In-Active") $(this).addClass("text-deleted");
        if ($(this).text() == "Deleted") $(this).addClass("text-deleted");
        if ($(this).text() == "Full") $(this).addClass("text-fullyPaid");
        if ($(this).text() == "Part") $(this).addClass("text-partialPaid");
        if ($(this).text() == "Rec") $(this).addClass("text-reconciled");
        if ($(this).text() == "Converted") $(this).addClass("text-converted");
        if ($(this).text() == "Completed") $(this).addClass("text-completed");
        if ($(this).text() == "Not Converted") $(this).addClass("text-Yellow");
        if ($(this).text() == "On-Hold") $(this).addClass("text-Yellow");
        if ($(this).text() == "Processed") $(this).addClass("text-Processed");
    });
  };


tableResize = function() {
  setTimeout(function() {
    const tableHandler = new TableHandler();
    $('.dataTables_filter input[type="search"]').attr("placeholder", "Search List...");
    $('.dataTables_filter label:contains("Search:")').each(function(){
      $(this).html($(this).html().split("Search:").join(""));
    });
  }, 2500);
  setTimeout(function() {
    $('.dataTables_filter input[type="search"]').attr("placeholder", "Search List...");
    $('.dataTables_filter label:contains("Search:")').each(function(){
      $(this).html($(this).html().split("Search:").join(""));
    });
  }, 1000);
};

handleValidationError = async function ( errorMessage, fieldID ) {
    swal({
        title: errorMessage,
        type: 'warning',
        showCancelButton: false,
        confirmButtonText: 'OK'
    }).then((result) => {
        if (result.value) {
            if (result.value) {
                $(`#${fieldID}`).focus();
            }
        }
    });
};
