import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Questions } from '../../../api/questions.js';
import { Roles } from '../../../api/roles.js';
import { Applicants } from '../../../api/applicants.js';
import { Interviewing } from '../../../api/interviewing.js';
import Toast from '../toaster/toaster.js';
import './review.html';
import './review.css';
import './reviewRow.js';
import './emailsCopyable.js';

Template.review.onCreated(function() {
  Meteor.subscribe('applicants');
  Meteor.subscribe('roles');
  Meteor.subscribe('questions');
  Meteor.subscribe('interviewing.all');
  Meteor.subscribe('allUserData');

  this.role = new ReactiveVar('');
  this.showAccepted = new ReactiveVar(true);
  this.showWaitlisted = new ReactiveVar(true);
  this.showRejected = new ReactiveVar(true);
  this.showEmails = new ReactiveVar(false);
  this.emails = new ReactiveVar([]);
});

Template.review.onRendered(function() {
  $('.loading').hide();
});

Template.review.helpers({
  role() {
    return Template.instance().role.get();
  },
  roles() {
    return Roles.find({});
  },
  showEmails() {
    return Template.instance().showEmails.get();
  },
  emails() {
    return Template.instance().emails.get().join(', ');
  },
  applicants() {
    const instance = Template.instance();
    const hideAccepted = !instance.showAccepted.get();
    const hideWaitlisted = !instance.showWaitlisted.get();
    const hideRejected = !instance.showRejected.get();

    const all = Applicants.find({roles: instance.role.get()}).map(function(applicant) {
      applicant.role = instance.role.get();
      const idx = applicant.roles.indexOf(applicant.role);
      applicant.status = applicant.statuses[idx];
      if (hideAccepted && applicant.status === 'accepted' || hideWaitlisted && applicant.status === 'waitlisted' || hideRejected && applicant.status === 'rejected') {
        return;
      }

      const interviewings = Interviewing.find({applicant_id: applicant._id, role: instance.role.get()}).fetch();
      applicant.interviewers = [];
      applicant.scores = [];
      applicant.weight = 0;
      applicant.notes = [];
      applicant.interviewer_names = [];
      _.each(interviewings, function(i) {
        const usernameToPush = Meteor.users.findOne({ emails: { $elemMatch: { address: i.user_email } } }).username
        applicant.interviewer_names.push(usernameToPush);
        applicant.interviewers.push(i.user_email);
        applicant.scores.push(i.score);
        applicant.weight += i.score;
        applicant.notes.push(i.notes);
      });
      if (interviewings.length > 0) {
        applicant.weight /= interviewings.length;
      }
      return applicant;
    });

    return all.sort(function(a, b) {
      if (a.weight === b.weight) {
        return a.name.localeCompare(b.name);
      }
      return b.weight - a.weight;
    });
  },
});

Template.review.events({
  'click .role-select'(event, instance) {
    const role = $(event.target).text();
    $('.role-tab').removeClass('is-active');
    $(event.target).parent().addClass('is-active');
    instance.role.set(role);
  },
  'click .show-accepted'(event, instance) {
    event.preventDefault();
    $(event.target).text(instance.showAccepted.get() ? 'Show accepted' : 'Hide accepted');
    instance.showAccepted.set(!instance.showAccepted.get());
  },
  'click .show-waitlisted'(event, instance) {
    event.preventDefault();
    $(event.target).text(instance.showWaitlisted.get() ? 'Show waitlisted' : 'Hide waitlisted');
    instance.showWaitlisted.set(!instance.showWaitlisted.get());
  },
  'click .show-rejected'(event, instance) {
    event.preventDefault();
    $(event.target).text(instance.showRejected.get() ? 'Show rejected' : 'Hide rejected');
    instance.showRejected.set(!instance.showRejected.get());
  },
  'click .collect-accepted'(event, instance) {
    var emails = [];
    var names = []
    const role = instance.role.get();
    var count = 0;

    Applicants.find({roles: role}).forEach(function(applicant) {
      const idx = applicant.roles.indexOf(role);
      if (applicant.statuses[idx] === 'accepted') {
        emails.push(applicant._id);
        names.push(applicant.name);
        count++;
      }
    });
    const name_and_emails = emails.concat(names)
    instance.emails.set(name_and_emails);
    instance.showEmails.set(true);
    Toast('Collecting ' + count + ' acceptances', 4000);
  },
  'click .collect-wl'(event, instance) {
    var emails = [];
    var names = []
    const role = instance.role.get();
    var count = 0;

    Applicants.find({roles: role}).forEach(function(applicant) {
      const idx = applicant.roles.indexOf(role);
      if (applicant.statuses[idx] === 'waitlisted') {
        emails.push(applicant._id);
        names.push(applicant.name);
        count++;
      }
    });
    const name_and_emails = emails.concat(names)
    instance.emails.set(name_and_emails);
    instance.showEmails.set(true);
    Toast('Collecting ' + count + ' waitlists', 4000);
  },
  'click .collect-non'(event, instance) {
    var emails = [];
    var names = []
    const role = instance.role.get();
    var count = 0;

    Applicants.find({roles: role}).forEach(function(applicant) {
      const idx = applicant.roles.indexOf(role);
      if (applicant.statuses[idx] === 'rejected') {
        emails.push(applicant._id);
        names.push(applicant.name);
        count++;
      }
    });
    const name_and_emails = emails.concat(names)
    instance.emails.set(name_and_emails);
    instance.showEmails.set(true);
    Toast('Collecting ' + count + ' rejections', 4000);
  },
  'click .exit-emails'(event, instance) {
    instance.showEmails.set(false);
  },
});
