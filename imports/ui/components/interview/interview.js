import { Template } from 'meteor/templating';
import { Questions } from '../../../api/questions.js';
import { Answers } from '../../../api/answers.js';
import { Roles } from '../../../api/roles.js';
import { Applicants } from '../../../api/applicants.js';
import { Interviewing } from '../../../api/interviewing.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Materialize } from 'meteor/materialize:materialize';
import './interview.html';
import './interview.scss';
import './qna.js';
import './guidelines.js';

Template.interview.onCreated(function() {
  Meteor.subscribe('roles');
  Meteor.subscribe('questions');
  Meteor.subscribe('interviewing.mine');

  this.choosingApplicant = new ReactiveVar(true);
  this.applicant = new ReactiveDict();
  this.role = new ReactiveVar('');
  this.interviewing = new ReactiveDict();

  this.nameInput = new ReactiveVar('');
  this.nameSelected = false;
  this.roleSelected = false;

  // This is for href from /history selection

  if (Session.get('historyRole') && Session.get('historyName')) {
    this.choosingApplicant = new ReactiveVar(false);
    const self = this;

    Meteor.subscribe('applicants', function() {
      const applicant = Applicants.findOne({name: Session.get('historyName')})
      self.applicant.set('name', applicant.name);
      self.applicant.set('id', applicant._id);
      self.nameSelected = true;
      doneSelecting(self);
    });

    this.role.set(Session.get('historyRole'));
    this.roleSelected = true;
    doneSelecting(this);

  } else {
    Meteor.subscribe('applicants');
  }
});

Template.interview.helpers({
  choosingApplicant() {
    return Template.instance().choosingApplicant.get();
  },
  score() {
    return Template.instance().interviewing.get('score');
  },
  name() {
    return Template.instance().applicant.get('name');
  },
  applicant_id() {
    return Template.instance().applicant.get('id');
  },
  role() {
    return Template.instance().role.get();
  },
  roles() {
    return Roles.find({});
  },
  applicants() {
    const nameInput = Template.instance().nameInput.get();
    if (nameInput.length > 1) {
      return Applicants.find({name: {$regex: nameInput, $options: 'i'}});
    }
  },
  questions() {
    return Questions.find({$or: [{role: Template.instance().role.get()}, {role: ''}]}, {sort: {category: 1, priority: -1}})
              .map(function(question) {
                question.applicant_id = Template.instance().applicant.get('id');
                return question;
              });
  },
});

Template.interview.events({
  'input #name'(event, instance) {
    event.preventDefault();
    instance.nameInput.set(event.target.value);
  },
  'click .save-global'(event, instance) {
    $('.save-hidden').click();
  },
  'click .applicant-item'(event, instance) {
    const target = $(event.target);
    const name = target.text();
    instance.applicant.set('name', name);
    instance.applicant.set('id', target.attr('email'));
    $('#name').val(name);
    instance.nameSelected = true;
    doneSelecting(instance);
  },
  'click .role-item'(event, instance) {
    const name = $(event.target).text();
    $('.role-item').removeClass('active');
    $(event.target).addClass('active');
    instance.role.set(name);
    instance.roleSelected = true;
    doneSelecting(instance);
  },
  'click .change-button'(event, instance) {
    instance.choosingApplicant.set(true);
    instance.nameSelected = false;
    instance.roleSelected = false;
  },
  'click .save-interviewing'(event, instance) {
    Meteor.call('interviewing.upsert', {
      applicant_id: instance.applicant.get('id'),
      role: instance.role.get(),
      score: instance.interviewing.get('score'),
      notes: $('#notes').val()
    }, function(err) {
      if (err) {
        Materialize.toast(err.reason, 4000);
      } else {
        Materialize.toast('Saved score and notes', 2000);
      }
    });
  },
  'click .noShow'(event, instance) {
    Meteor.call('interviewing.upsert', {
      applicant_id: instance.applicant.get('id'),
      role: instance.role.get(),
      score: 0,
      notes: $('#notes').val(),
    }, function(err) {
      if (err) {
        Materialize.toast(err.reason, 4000);
      } else {
        Materialize.toast('Score Changed', 2000);
      }
    });
    // Sets the score for the Interviewer and updates bar.
    instance.interviewing.set('score', 0);
    $('#score').val(0);
    Meteor.call('applicants.setStatus', {
      id: instance.applicant.get('id'),
      role: instance.role.get(),
      status: 'no-show',
    }, function(err) {
      if (err) {
        Materialize.toast(err.reason, 4000);
      } else {
        Materialize.toast('Set status to No Show', 2000);
      }
    });
  },
  'input #score'(event, instance) {
    instance.interviewing.set('score', parseFloat(event.target.value));
  },
});

function doneSelecting(instance) {
  if (instance.nameSelected && instance.roleSelected) {
    instance.choosingApplicant.set(false);

    const interviewing = Interviewing.findOne({
      user_email: Meteor.user().emails[0].address,
      applicant_id: instance.applicant.get('id'),
      role: instance.role.get()
    });

    if (interviewing) {
      instance.interviewing.set('score', interviewing.score);
      instance.interviewing.set('notes', interviewing.notes);

      // Dumb solution to Template not updating its HTML when choosingApplicant changes
      setTimeout(function() {
        $('#score').val(interviewing.score);
        $('#notes').val(interviewing.notes);
      }, 400);
    } else {
      // Meteor.call('interviewing.upsert', {
      //   applicant_id: instance.applicant.get('id'),
      //   role: instance.role.get(),
      //   score: 3,
      //   notes: ''
      // }, function(err) {
      //   if (err) {
      //     Materialize.toast(err.reason, 4000);
      //     instance.choosingApplicant.set(true);
      //     instance.nameSelected = false;
      //     instance.roleSelected = false;
      //   }
      //   instance.interviewing.set('score', 3);
      //   instance.interviewing.set('notes', '');
      // });
      instance.interviewing.set('score', 3);
      instance.interviewing.set('notes', '');
    }
  }
}
