import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './newsidenav.html';

Template.newsidenav.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.sideBarPositionClass = new ReactiveVar();
  templateObject.adminStatus = new ReactiveVar();
  templateObject.adminStatus.set(window.localStorage.super);
  templateObject.sideBarPositionClass.set('top');
});

Template.newsidenav.onRendered(function () {
  let templateObject = Template.instance();
});

Template.newsidenav.events({
  'click #sidebarToggleBtn': function (event) {

    if ($('#sidebar').hasClass("top")) {
      // sideBarService.updateVS1MenuConfig('SideMenu', employeeId);
      $('#sidebar').removeClass('top');
      $('#bodyContainer').removeClass('top');
      $('#sidebarToggleBtn .text').text('Top');
    } else {
      // sideBarService.updateVS1MenuConfig('TopMenu', employeeId);
      $('#sidebar').addClass('top');
      $('#bodyContainer').addClass('top');
      $('#sidebarToggleBtn .text').text('Side');
    }

  },

  'click #customerlist': function (event) {
    event.preventDefault();
    if (window.localStorage.super == 'false') FlowRouter.go('/customerscard?id=' + window.localStorage.customerId)
    else {
      FlowRouter.go('/customerlist');
      $('.customerLi').addClass('opacityActive');
      $('.employeeLi').removeClass('opacityActive');
      $('.connectionLi').removeClass('opacityActive');
      $('.logoutLi').removeClass('opacityActive');
    }

  },
 'click #transactionlist': function (event) {
    event.preventDefault();
    FlowRouter.go(`/customerscard?id=${window.localStorage.customerId}&TransTab=transaction`);
      $('.transactionPanelTab').trigger('click');
  },
  'click #employeelist': function (event) {
    event.preventDefault();
    FlowRouter.go('/employeelist');
    $('.customerLi').removeClass('opacityActive');
    $('.employeeLi').addClass('opacityActive');
    $('.connectionLi').removeClass('opacityActive');
    $('.logoutLi').removeClass('opacityActive');
  },
  'click #connectionlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/connectionlist');
    $('.employeeLi').removeClass('opacityActive');
    $('.customerLi').removeClass('opacityActive');
    $('.connectionLi').addClass('opacityActive');
    $('.logoutLi').removeClass('opacityActive');
  },
});

Template.newsidenav.helpers({
  isSuperUSer: function () {
    return localStorage.getItem('super') || false;
  }
});
