import { ReactiveVar } from 'meteor/reactive-var';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { HTTP } from 'meteor/http';
import { first, template } from 'lodash';
import './zoho.html';
const axios = require('axios');
import moment from 'moment';
let cancelBtnFlag = false;
let datacenter = 'com';
Template.zohocard.onCreated(function () {
  const templateObject = Template.instance();
});

Template.zohocard.onRendered(function () {
  const templateObject = Template.instance();
});

Template.zohocard.rendered = () => {
  const templateObject = Template.instance();
};

Template.zohocard.events({
  'click #getZohoCode': async function () {
    let zohoData = {};
    zohoData.grant_type = "authorization_code";
    zohoData.clientid = jQuery('#zoho_client_id').val()||'';
    zohoData.clientsecret = jQuery('#zoho_client_secret').val()||'';
    zohoData.redirect_uri = jQuery('#zoho_redirect_uri').val()||"";
    zohoData.code = jQuery('#zoho_access_token').val()||"";

  const CLIENT_ID = zohoData.clientid;
  const REDIRECT_URI = zohoData.redirect_uri;
  const RESPONSE_TYPE = 'token';
  const SCOPE = 'ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.users.ALL';
  const authorizationUrlGetCode = `https://accounts.zoho.com.au/oauth/v2/auth?scope=${SCOPE}&client_id=${CLIENT_ID}&state=zzz&response_type=code&redirect_uri=${REDIRECT_URI}&access_type=offline`;

  window.location.href = authorizationUrlGetCode;

  },
  'click #getZohoToken': async function () {
    let zohoData = {};
    zohoData.grant_type = "authorization_code";
    zohoData.clientid = jQuery('#zoho_client_id').val()||'';
    zohoData.clientsecret = jQuery('#zoho_client_secret').val()||'';
    zohoData.redirect_uri = jQuery('#zoho_redirect_uri').val()||"";
    zohoData.code = jQuery('#zoho_access_token').val()||"";
  const CLIENT_ID = zohoData.clientid;
  const REDIRECT_URI = zohoData.redirect_uri;
  const RESPONSE_TYPE = 'token';
  const SCOPE = 'ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.users.ALL';

  const resultZohoToken = await new Promise((resolve, reject) => {
    Meteor.call("getZohoOauthToken", zohoData, datacenter, (error, result) => {
      if (error) {
        swal(`Invalid Code`, `Head to Zoho and check if you have copied the correct details.`, "error");
        reject(error);
      } else {
        if(result.data && result.data.error){
          swal(`Invalid Code`, `Head to Zoho and check if you have copied the correct details.`, "error");
          reject(error);
        }else{
          jQuery('#zoho_access_token').val(result.data.access_token);
          jQuery('#zoho_refresh_token').val(result.data.refresh_token);
          jQuery('#getZohoToken').css('display','none');
          resolve(result.data);
        }


      }
    });
    });
  },
});

Template.zohocard.helpers({});

Template.registerHelper('equals', function (a, b) {
  return a === b;
});
Template.registerHelper('notEquals', function (a, b) {
  return a != b;
});
