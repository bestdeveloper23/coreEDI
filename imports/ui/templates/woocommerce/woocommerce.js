// @ts-nocheck
import { ReactiveVar } from 'meteor/reactive-var';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { HTTP } from 'meteor/http';
import { first, template } from 'lodash';
import './woocommerce.html';
const axios = require('axios');
import moment from "moment";
let cancelBtnFlag = false;

Template.woocommercecard.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.transferTypes = new ReactiveVar([]);

    const postData = {
    id: FlowRouter.current().queryParams.id
    }

    fetch('/api/transfertypesByID', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
    }).then(response => response.json()).then(async (results) => {
    let transferTypes = [];
        $.each(results, async function (i, e) {
        if(e.tab_id == 2){
            transferTypes.push(e);
        }
    });

    await templateObject.transferTypes.set(transferTypes);
    }).catch(error => console.log(error));
});

Template.woocommercecard.onRendered(function () {
    const templateObject = Template.instance();
})

Template.woocommercecard.rendered = () => {
  const templateObject = Template.instance();
}

Template.woocommercecard.events({
    'click #saveWooCommerce': function () {
    let transfer_btns = $('.transfer_tooglebtn');
    let transfer_types = [];
    for (let i = 0; i< transfer_btns.length; i++){
        let transfer_type = {};
        transfer_type_id_str = transfer_btns.eq(i).attr('id').split("_")[2];
        transfer_type.id = parseInt(transfer_type_id_str, 10);
        transfer_type.checked = transfer_btns.eq(i).prop('checked');
        transfer_types.push(transfer_type)
    }
    fetch('/api/updatetransfertypes', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(transfer_types)
        }).then(response => response.json()).then(async (result) => {
        if (result == 'success')
        swal({
          title: 'Woocommerce Data Successfully Updated',
          text: "",
          type: 'success',
          showCancelButton: false,
          confirmButtonText: 'Ok'
        }).then((resultData) => {
          if (resultData.value) {
          if (window.localStorage.super == 'false'){
            FlowRouter.go('/customerscard?id=' + window.localStorage.customerId);
          }else {
            FlowRouter.go('/connectionlist');
          };
         }
        });

        }).catch(error => console.log(error));

    },
});

Template.woocommercecard.helpers({
    transfertypes: () => {
        let templateObject = Template.instance();
        return templateObject.transferTypes.get();
    }
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
Template.registerHelper('notEquals', function (a, b) {
    return a != b;
});
