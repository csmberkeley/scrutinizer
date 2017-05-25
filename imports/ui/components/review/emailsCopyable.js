import { Template } from 'meteor/templating';
import Clipboard from 'clipboard';
import './emailsCopyable.html';

Template.emailsCopyable.onRendered(function() {
  const clipboard = new Clipboard('#copy-emails');

  clipboard.on('success', function(e) {
    e.clearSelection();
  });
});
