import { Questions } from '../../../api/questions.js';
import { Answers } from '../../../api/answers.js';
import Toast from '../toaster/toaster.js';
import './reviewRow.html';

Template.reviewRow.onCreated(function() {
  Meteor.subscribe('questions');
  Meteor.subscribe('answers');

  const context = Template.currentData();
  this.showMore = new ReactiveVar(false);
});

Template.reviewRow.helpers({
  firstName() {
    return this.name.split(' ')[0];
  },
  statusClass() {
    const status = this.status;
    if (status === 'accepted' || status == 'waitlisted' || status === 'rejected' || status === 'no-show') {
      return status;
    } else {
      return '';
    }
  },
  formattedScores() {
    var ret = '';
    _.each(this.scores, function(score) {
      ret += score + ', ';
    });
    return ret.substring(0, ret.length - 2);
  },
  showMore() {
    return Template.instance().showMore.get();
  },
  notecards() {
    const cards = [];
    for(var i = 0; i < this.interviewers.length; i++) {
      cards.push({interviewer: this.interviewers[i],
                  interviewer_name: this.interviewer_names[i],
                  interviewer_notes: this.notes[i].replace(/\n/g, "<br />"),
                  interviewer_score: this.scores[i]});
    }
    return cards;
  },
  answers() {
    return Answers.find({applicant_id: this._id}).map(function(answer) {
      const question = Questions.findOne({_id: answer.question_id});
      if (question) {
        answer.question = question.text;
      }
      answer.text = answer.text.replace(/\n/g, "<br />");
      return answer;
    });
  },
});

Template.reviewRow.events({
  'click .table-row'(event, instance) {
    instance.showMore.set(!instance.showMore.get());
  },
  'click .skip'(event, instance) {
    instance.showMore.set(false);
  },
  'click .accept'(event, instance) {
    Meteor.call('applicants.setStatus', {
      id: this._id,
      role: this.role,
      status: 'accepted'
    }, function(err) {
      if (err) {
        Toast(err.reason, 4000);
      } else {
        Toast('Saved acceptance', 4000);
      }
    });
    instance.showMore.set(false);
  },
  'click .waitlist'(event, instance) {
    Meteor.call('applicants.setStatus', {
      id: this._id,
      role: this.role,
      status: 'waitlisted'
    }, function(err) {
      if (err) {
        Toast(err.reason, 4000);
      } else {
        Toast('Saved waitlist', 4000);
      }
    });
    instance.showMore.set(false);
  },
  'click .reject'(event, instance) {
    Meteor.call('applicants.setStatus', {
      id: this._id,
      role: this.role,
      status: 'rejected'
    }, function(err) {
      if (err) {
        Toast(err.reason, 4000);
      } else {
        Toast('Saved rejection', 4000);
      }
    });
    instance.showMore.set(false);
  },
  'click .reset'(event, instance) {
    Meteor.call('applicants.setStatus', {
      id: this._id,
      role: this.role,
      status: 'pending'
    }, function(err) {
      if (err) {
        Toast(err.reason, 4000);
      } else {
        Toast('Succesfully Reset', 4000);
      }
    });
    instance.showMore.set(false);
  }
});
