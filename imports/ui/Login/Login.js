import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './Login.html';

Template.login.onCreated

Template.login.events({

  //================  Login function Handler =============//
  'submit .loginForm'(e) {
    e.preventDefault();
    $('.loginSpinner').show()

    const target = e.target;

    const username = target.username.value;
    const password = target.erppassword.value;

    const rememberme = target.remember_me.value;

    const userdata = { username: username, userpassword: password }

    if ($('#remember_me').is(':checked')) {

        localStorage.usremail = username;
        localStorage.usrpassword = password;
        localStorage.chkbx = rememberme;
    } else {
        localStorage.usremail = '';
        localStorage.usrpassword = '';
        localStorage.chkbx = '';
    };

    const postData = {
      email: username
    };
    fetch('/api/admin/verify/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })
      .then(response => response.json())
      .then(result => {
        if (result.result.length > 0) {
          if (result.super && result.result[0].password.toUpperCase() == password.toUpperCase()){
            window.localStorage.super = true
            window.localStorage.customerId = -1
            FlowRouter.go('/customerlist')
          }
          else if (result.result[0].logon_password.toUpperCase() == password.toUpperCase()) {
            window.localStorage.super = false
            window.localStorage.customerId = result.result[0].id
            FlowRouter.go('/customerscard?id=' + result.result[0].id)
            document.getElementById('sidenavemployees').style.display = 'none'
            document.getElementById('sidenavconnections').style.display = 'none'
          }
          else {
            swal("Invalid CoreEDI Password", "Entered password is not correct. \n Re-enter your password and try again!", "error");
            $('.loginSpinner').hide()
          }
        } else {
          swal("Invalid CoreEDI User", "Entered user is not correct. \n Re-enter your email and try again!", "error");
          $('.loginSpinner').hide()
        }
      })
      .catch(error => console.log(error));
  },

});
