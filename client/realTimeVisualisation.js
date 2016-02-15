Template.realTime.helpers({
	box() {
		return Boxes.findOne()
	},
	frame() {
		return function(instanceIndex, objectIndex, boxId) {
			return RealTimeObjects.findOne(
					boxId+objectIndex.toString(16)+instanceIndex.toString(16),
					{sort: {date: -1}}
			)
		}
	}
})

FlowRouter.route('/', {action() {
	Meteor.subscribe('realTimeBox')
	BlazeLayout.render('layout', { main: "realTime" });
}})