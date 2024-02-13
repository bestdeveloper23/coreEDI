import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
FlowRouter.decodeQueryParamsOnce = true;

const publicRedirect = () => {

};

const publicRoutes = FlowRouter.group({
    name: 'public',
    triggersEnter: [publicRedirect]
});

FlowRouter.route('*', {
    action() {
      // Show 404 error page using Blaze
      this.render('notFound');
    }
});

publicRoutes.route('/', {
    name: 'login',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'login'
        });
    }
});

publicRoutes.route('/forgot', {
    name: 'forgotforgot',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'forgotforgot'
        });
    }
});

publicRoutes.route('/register', {
    name: 'register',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'register'
        });
    }
});


const authenticatedRedirect = () => {

};

const authenticatedRoutes = FlowRouter.group({
    name: 'authenticated',
    triggersEnter: [authenticatedRedirect]
});

authenticatedRoutes.route('/customerlist', {
    name: 'customerlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'customerlist'
        });
    }
});

authenticatedRoutes.route('/employeelist', {
    name: 'employeelist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'employeelist'
        });
    }
});

authenticatedRoutes.route('/connectionlist', {
    name: 'connectionlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'connectionlist'
        });
    }
});

authenticatedRoutes.route('/customerscard', {
    name: 'customerscard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'customerscard'
        });
    }
});

authenticatedRoutes.route('/employeescard', {
    name: 'employeescard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'employeescard'
        });
    }
});

authenticatedRoutes.route('/connectionscard', {
    name: 'connectionscard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'connectionscard'
        });
    }
});
