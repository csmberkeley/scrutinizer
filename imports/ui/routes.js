import { Router } from 'meteor/iron:router';
import './components/history/history.js';
import './components/access/access.js';
import './components/interview/interview.js';
import './components/import/import.js';
import './components/questions/questions.js';
import './components/review/review.js';
import './components/positions/positions.js';

Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', function() {
  this.render('review')
});

Router.route('/review', function() {
  this.render('review');
});

Router.route('/import', function() {
  this.render('import');
});

Router.route('/positions', function() {
  this.render('positions');
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

Router.route('/access', function() {
  this.render('access');
});
