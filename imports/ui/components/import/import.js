import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Applicants } from '../../../api/applicants.js';
import { Roles } from '../../../api/roles.js';
import Toast from '../toaster/toaster.js';
import './import.html';
import './import.css';

Template.import.onCreated(function() {
  Meteor.subscribe('roles');

  this.choseRole = new ReactiveVar(false);
  this.uploading = new ReactiveVar(false);
  this.uploadErrors = new ReactiveVar([]);
});

Template.import.helpers({
  choseRole() {
    return Template.instance().choseRole.get();
  },
  uploading() {
    return Template.instance().uploading.get();
  },
  showUploadErrors() {
    return Template.instance().uploadErrors.get().length > 0;
  },
  uploadErrors() {
    return Template.instance().uploadErrors.get();
  },
  roles() {
    return Roles.find({})
  },
});

Template.import.events({
  'change .role-select'(event, instance) {
    console.log('chagned');
    instance.choseRole.set(true);
  },
  'change .input-csv'(event, instance) {
    event.preventDefault();

    var selectElement = $('.role-select');
    var role = $('.role-select option:selected').val();

    if (!role) {
      toast('Please select a role');
      return;
    }
    instance.uploading.set(true);
    selectElement.prop('disabled', true);

    Papa.parse(event.target.files[0], {
      complete(results, file) {
        Meteor.call('parseCSV', results.data, function(err, res) {
          if (err) {
            toast(err.reason);
            instance.uploading.set(false);
            selectElement.prop('disabled', false);
          } else {
            if (res.errors.length > 0) {
              toast('Some CSV rows had errors, see below');
              instance.uploadErrors.set(res.errors);
            }
            const count = res.applicants.length;
            toast('Parsed ' + count + ' applicants successfully, starting upload');

            Meteor.call('applicants.insertWithRole', {role: role, applicants: res.applicants}, function(err, updateCount) {
              if (err) {
                toast(err.reason);
              } else {
                toast('Modified ' + updateCount + ' existing applicants, inserted ' + (count - updateCount) + ' new applicants');
              }
              instance.uploading.set(false);
              selectElement.prop('disabled', false);
            });
          }
        });
      }
    });
  }
});

function toast(s) {
  Toast(s, 4000);
}
