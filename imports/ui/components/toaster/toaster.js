import './toaster.html';
import './toaster.css';
import './toast.js';

Template.toaster.helpers({
  toasts() {
    return Session.get('toasts')
  }
});

/* String to Bulma CSS class */
const typeToClass = {
  primary: null,
  error: 'is-danger',
};

/* Use this function to make toasts */
export default function Toast(text, delay, type='primary') {
  const currToasts = Session.get('toasts')
  currToasts.push({
    text,
    delay,
    type: typeToClass[type]
  });
  Session.set('toasts', currToasts);
}
