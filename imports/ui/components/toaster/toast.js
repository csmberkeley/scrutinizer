import './toast.html';

Template.toast.onRendered(() => {
  const data = Template.currentData();
  $(Template.instance().firstNode).delay(data.delay).fadeOut(300);
});

Template.toast.events({
  'click .delete'(event) {
    $(event.target).parent().hide();
  }
});
