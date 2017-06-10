import { Template } from 'meteor/templating';
import { Questions } from '../../../api/questions.js';
import { Roles } from '../../../api/roles.js';
import { Session } from 'meteor/session';
import Toast from '../toaster/toaster.js';
import './questions.html';
import './questions.css';
import './question.js';

Template.questions.onCreated(function() {
  Meteor.subscribe('roles');
  Meteor.subscribe('questions');

  this.role = new ReactiveVar(Session.get('role'));
});

Template.questions.onRendered(function() {
  $('.questions-role-item').first().click();
});

Template.questions.helpers({
  role() {
    const currRole = Template.instance().role.get();
    if (currRole) {
      return currRole;
    }
    return 'All';
  },
  roles() {
    return Roles.find({});
  },
  questions() {
    return Questions.find({role: Template.instance().role.get()}, {sort: {category: -1, priority: -1}});
  },
});

Template.questions.events({
  'click .questions-role-item'(event, instance) {
    const role = $(event.target).text();
    $('.questions-role-item').removeClass('is-active');
    $(event.target).addClass('is-active');

    if (role === 'All') {
      instance.role.set('');
    } else {
      instance.role.set(role);
    }
  },
  'click .add-question'(event, instance) {
    Meteor.call('questions.new', {role: instance.role.get(), category: Session.get('lastQuestionCategory')}, function(err) {
      if (err) {
        Toast(err.reason, 4000);
      }
    });
  },
});
