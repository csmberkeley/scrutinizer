import { Template } from 'meteor/templating';
import { Questions } from '../../../api/questions.js';
import { Answers } from '../../../api/answers.js';
import { Roles } from '../../../api/roles.js';
import { Applicants } from '../../../api/applicants.js';
import { Interviewing } from '../../../api/interviewing.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import Toast from '../toaster/toaster.js';
import './interview.html';
import './interview.css';
import './qna.js';
import './scorecard.js';
import './guidelines.js';

Template.interview.onCreated(function() {
  Meteor.subscribe('roles');
  Meteor.subscribe('questions');
  Meteor.subscribe('interviewing.mine');

  this.choosingApplicant = new ReactiveVar(true);
  this.applicant = new ReactiveDict();
  this.role = new ReactiveVar('');
  this.interviewing = new ReactiveDict();
  this.interviewing.setDefault({
    score: 3,
    notes: ''
  });

  this.nameInput = new ReactiveVar('');
  this.nameSelected = false;
  this.roleSelected = new ReactiveVar(false);

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
  scorecardData() {
    const instance = Template.instance();
    return {
      score: instance.interviewing.get('score'),
      notes: instance.interviewing.get('notes'),
      onUpdate(score, notes) {
        Meteor.call('interviewing.upsert', {
          applicant_id: instance.applicant.get('id'),
          role: instance.role.get(),
          score,
          notes
        }, function(err) {
          if (err) {
            Toast(err.reason, 4000);
          } else {
            Toast('Saved score and notes', 2000);
          }
        });
      }
    }
  },
  name() {
    return Template.instance().applicant.get('name');
  },
  applicant_id() {
    return Template.instance().applicant.get('id');
  },
  roleSelected() {
    return Template.instance().roleSelected.get();
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

    instance.choosingApplicant.set(false);
    instance.nameInput.set('');

    const interviewing = Interviewing.findOne({
      user_email: Meteor.user().emails[0].address,
      applicant_id: instance.applicant.get('id'),
      role: instance.role.get()
    });

    if (interviewing) {
      instance.interviewing.set('score', interviewing.score);
      instance.interviewing.set('notes', interviewing.notes);
    } else {
      instance.interviewing.set('score', 3);
      instance.interviewing.set('notes', '');
    }
  },
  'change .role-select'(event, instance) {
    const name = $(event.target).val();
    instance.role.set(name);
    instance.roleSelected.set(true);
  },
  'click .noShow'(event, instance) {
    Meteor.call('interviewing.upsert', {
      applicant_id: instance.applicant.get('id'),
      role: instance.role.get(),
      score: 0,
      notes: $('#notes').val(),
    }, function(err) {
      if (err) {
        Toast(err.reason, 4000);
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
        Toast(err.reason, 4000);
      } else {
        Toast('Marked as no-show', 3000);
      }
    });
  },
  'input #score'(event, instance) {
    instance.interviewing.set('score', parseFloat(event.target.value));
  },
});

function doneSelecting(instance) {

}
