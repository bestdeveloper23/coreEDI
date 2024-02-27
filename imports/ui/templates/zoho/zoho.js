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
  'click #getZohoCode': function () {
    let zohoData = {};
    zohoData.clientid = jQuery('#zoho_client_id').val();
    zohoData.clientsecret = jQuery('#zoho_client_secret').val();
    zohoData.redirect_uri = jQuery('#zoho_redirect_uri').val();
    const CLIENT_ID = zohoData.clientid;
    const REDIRECT_URI = zohoData.redirect_uri;
    const RESPONSE_TYPE = 'token';
    const SCOPE = 'ZohoCRM.modules.ALL,ZohoCRM.settings.ALL';

    const authorizationUrl = `https://accounts.zoho.com/oauth/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=token`;
    window.location.href = authorizationUrl;
  },
});

Template.zohocard.helpers({});

Template.registerHelper('equals', function (a, b) {
  return a === b;
});
Template.registerHelper('notEquals', function (a, b) {
  return a != b;
});
