# scrutinizer
A fancier name for "Interviewer". Intended to be used internally for CSM leadership to manage and record the interview and acceptance phases of our applicants.

Scrutinizer was designed to be as intuitive to use and easy to pick up as possible, without any need for an onboarding tutorial.

### What's new (so far) in v2.0?
* Different UI theme for less mouse clicks and more visual appeal
* Frequent auto-saving during interviews
* Each interviewer now records their own set of answers to questions
* Changes in acceptance / rejection status should update in real time on every user's screen

## Setup
1. Get [Meteor](https://www.meteor.com/install)
2. Run `meteor npm install`
3. Run `meteor`. You can keep this running as you make changes; Meteor automatically refreshes the web server.

## File Structure
- `imports/api` - Models
- `imports/ui/components` - directories divided by feature name
- `imports/ui/layout` defines overall layout and wraps individual feature templates
- `imports/ui/routes.js` - Routes
- `client` - Nothing should really go here
- `server` - imports
- [More notes from Meteor docs](https://guide.meteor.com/structure.html)

## Misc.
- [The Blaze docs are here now](http://blazejs.org/guide/introduction.html)
- v2.0 is using [Bulma](http://bulma.io/documentation/overview/start/), a CSS-only framework that takes advantage of flexbox
- v1.0 used [Materialize](http://materializecss.com/) for our front-end
