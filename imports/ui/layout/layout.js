import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './layout.html';
import './layout.scss';
import './loginForm.js';

Template.layout.onCreated(() => {
  Session.set('role', '');
  Session.set('lastQuestionCategory', '');
});

Template.layout.helpers({
  name() {
    // Hacky solution to wait-on-user-subscription
    let route = Router.current().route.getName();
    if (!route) {
      route = 'review';
    }
    $('a[href="/' + route + '"]').addClass('is-active');
    return Meteor.userId() && Meteor.user() && Meteor.user().username ? '(' + Meteor.user().username + ')' : '';
  },
});

Template.layout.events({
  'click #signout'(event) {
    Meteor.logout();
  },
  'click .is-tab'(event) {
    $('.is-tab').removeClass('is-active');
    $(event.target).addClass('is-active');
  }
});
