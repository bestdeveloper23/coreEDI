// import '../../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import './vs1_popup.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { cloneDeep } from "lodash";

Template.vs1_popup.onCreated(function () {

})

Template.vs1_popup.onRendered(function() {
    let templateObject = Template.instance();
    let attrs = templateObject.data.attributes;
    let modal = $('.modal.fade#'+templateObject.data.modalid);
    if(attrs && attrs.length>0) {
        attrs.map((item)=> {
            $(modal).attr(item.name, item.value)
        })
    }
    let modalid = templateObject.data.modalid;
    let headerclosebutton = $("#"+  modalid + " > .modal-dialog >.modal-content > .modal-header > button[data-dismiss='modal']")
    let footerclosebutton = $("#"+  modalid + " > .modal-dialog >.modal-content > .modal-footer > button[data-dismiss='modal']")
    $(headerclosebutton).removeAttr("data-dismiss").addClass("btnClose"+ modalid);
    $(footerclosebutton).removeAttr("data-dismiss").addClass("btnClose"+ modalid);

    $(document).on('click', ".btnClose"+templateObject.data.modalid, function(event) {
        $("#"+templateObject.data.modalid).modal("hide")
    })
})

Template.vs1_popup.helpers({

})

Template.vs1_popup.events({

})