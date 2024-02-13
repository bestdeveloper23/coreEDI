import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import './export_import_print_display_button.html';
// Template.export_import_print_display_button.inheritsHelpersFrom('non_transactional_list');
Template.export_import_print_display_button.onCreated(function(){

});

Template.export_import_print_display_button.events({
    'click .btnOpenSettings': async function (event, template) {
      let templateObject = Template.instance();
        let currenttablename = templateObject.data.tablename||"";
        let getTableName = currenttablename||'';
        if(currenttablename != ''){
       $('.'+getTableName+'_Modal').modal('toggle');
      }
    },

    'click .exportbtn': function(event) {
      let templateObject = Template.instance();
      if(templateObject.data.tablename) {
        let tablename = templateObject.data.tablename;
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#'+tablename+'_wrapper .dt-buttons .btntabletoexcel').click();
        $('.fullScreenSpin').css('display','none');
      }
    },

    'click .printConfirm': function(event) {
      let templateObject = Template.instance();
      let tablename = templateObject.data.tablename || '';
      if(tablename != '') {
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#' + tablename + '_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display','none');
      }
    }
});

Template.export_import_print_display_button.helpers({

});
