import { ReactiveVar } from 'meteor/reactive-var';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { HTTP } from 'meteor/http';
import { first, template } from 'lodash';
import './auspost.html';
const axios = require('axios');
import moment from "moment";
let cancelBtnFlag = false;

Template.auspostcard.onCreated(function () {
    const templateObject = Template.instance();

});

Template.auspostcard.onRendered(function () {
    const templateObject = Template.instance();
})

Template.auspostcard.rendered = () => {
  const templateObject = Template.instance();
}

Template.auspostcard.events({

});

Template.auspostcard.helpers({

});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
Template.registerHelper('notEquals', function (a, b) {
    return a != b;
});
