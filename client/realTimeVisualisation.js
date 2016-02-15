Template.realTime.helpers({
	box() {
		return _.extend(
			Boxes.findOne(),
			{
				frame(instanceIndex, objectIndex, boxId) {
					return RealTimeObjects.findOne(
						boxId+objectIndex.toString(16)+instanceIndex.toString(16),
						{sort: {date: -1}}
					)
				}
			}
		)
	}
})

FlowRouter.route('/', {action() {
	Meteor.subscribe('realTimeBox')
	BlazeLayout.render('layout', { main: "realTime" });
}})