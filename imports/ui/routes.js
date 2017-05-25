import { Router } from 'meteor/iron:router';
import './components/history/history.js';
import './components/interview/interview.js';
import './components/manage/manage.js';
import './components/questions/questions.js';
import './components/review/review.js';

Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', function() {
  this.render('review')
});

Router.route('/review', function() {
  this.render('review');
});

Router.route('/manage', function() {
  this.render('manage');
});

Router.route('/interview', function() {
  this.render('interview');
});

Router.route('/questions', function() {
  this.render('questions');
});

Router.route('/history', function() {
  this.render('history');
});
