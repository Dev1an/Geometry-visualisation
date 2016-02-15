/**
 * Created by Damiaan on 15/02/16.
 */

Template.playBack.helpers({
	width() {
		return 200
	},

	height() {
		return 10
	}
})

FlowRouter.route('/playback', {action() {
	Meteor.subscribe('boxHistory')
	BlazeLayout.render('layout', { main: "playBack" });
}})