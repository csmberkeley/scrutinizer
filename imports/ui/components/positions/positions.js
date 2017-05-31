import { Roles } from '../../../api/roles.js';
import Toast from '../toaster/toaster.js';
import './positions.html';
import './positions.css';

Template.positions.onCreated(function() {
  Meteor.subscribe('roles');

  this.selectedRole = new ReactiveVar('');
});

Template.positions.helpers({
  selectedRole() {
    return Template.instance().selectedRole.get();
  },
  roles() {
    return Roles.find({})
  },
});

Template.positions.events({
  'click .delete-role'(event, instance) {
    var role = $(event.target).parent().parent().attr('position');
    instance.selectedRole.set(role);
    $('.confirm-delete-modal').addClass('is-active');
  },
  'click .confirm-delete'(event, instance) {
    Meteor.call('roles.remove', instance.selectedRole.get(), function(err) {
      if (err) {
        Toast(err.reason, 4000);
      }
      instance.selectedRole.set('');
    });
    $('.confirm-delete-modal').removeClass('is-active');
  },
  'click .cancel-delete'(event, instance) {
    $('.confirm-delete-modal').removeClass('is-active');
    instance.selectedRole.set('');
  },
  'click .role-submit'(event, instance) {
    event.preventDefault();
    const role = $('.role-input').val();
    var limit = parseInt($('.limit-input').val());
    if (isNaN(limit)) {
      limit = undefined;
    }

    Meteor.call('roles.new', {id: role, limit: limit}, function(err) {
      if (err) {
        Toast(err.reason, 4000);
      }
    });
    $('.role-input').val('');
    $('.limit-input').val('')
  },
})
