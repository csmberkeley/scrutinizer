import { Template } from 'meteor/templating';
import { Approved } from '../../../api/utils.js';
import './access.html';
import './access.css';

Template.access.onCreated(function() {
  Meteor.subscribe('approved');
});

Template.access.helpers({
  approved() {
    return Approved.find({});
  }
});

Template.access.events({
  'click .access-submit'(event, instance) {
    event.preventDefault();
    const email = $('.access-input').val();

    Meteor.call('approved.new', email, function(err) {
      if (err) {
        Toast(err.reason, 4000);
      }
    });
    $('.access-input').val('');
  },
});
