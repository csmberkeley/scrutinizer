import './scorecard.html';

Template.scorecard.onRendered(() => {
  const data = Template.currentData();
  $('input[value="' + data.score.toString() + '"]').prop('checked', true);
  $('.interview-notes').val(data.notes);
});

Template.scorecard.events({
  'click .save-scorecard'(event, instance) {
    const score = parseInt($('input[name=scoreValue]:radio:checked').val());
    const notes = $('.interview-notes').val();
    this.onUpdate(score, notes);
  }
});
