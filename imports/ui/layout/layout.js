import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './layout.html';
import './layout.css';
import './loginForm.js';
import '../components/toaster/toaster.js';

Template.layout.onCreated(() => {
  Session.set('role', '');
  Session.set('lastQuestionCategory', '');
  Session.set('toasts', []);
  Session.set('historyName', '');
  Session.set('historyRole', '');
});

Template.layout.helpers({
  name() {
    // Hacky solution to wait-on-user-subscription
    let route = Router.current().route.getName();
    if (!route) {
      route = 'review';
    }
    $('a[href="/' + route + '"]').addClass('is-active');
    return Meteor.userId() && Meteor.user() && Meteor.user().username ? '(' + Meteor.user().username.split(' ')[0] + ')' : '';
  },
});

Template.layout.events({
  'click #signout'(event) {
    Meteor.logout();
  },
  'click .is-tab'(event) {
    Session.set('toasts', []);
    $('.is-tab').removeClass('is-active');
    $(event.target).addClass('is-active');
  }
});
