import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Approved = new Mongo.Collection('approved');
export const Guidelines = new Mongo.Collection('guidelines');

if (Meteor.isServer) {
  Meteor.publish('approved', function() {
    return Approved.find({});
  });
  Meteor.publish('guidelines', function() {
    return Guidelines.find({});
  });
  Meteor.publish('allUserData', function() {
    return Meteor.users.find({});
  });

}

export const requireLogin = function(userId) {
  if (!userId) {
    throw new Meteor.Error('unauthorized');
  }
};

Meteor.methods({
  'approved.new'(email) {
    requireLogin(this.userId);
    check(email, String);

    Approved.insert({ email });
  },
});
