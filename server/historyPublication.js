/**
 * Created by Damiaan on 15/02/16.
 */

//Meteor.publish('boxHistory', function() {
//	const observer = ObjectsHistory.find().observe({
//		added: object => {
//			this.added('objectsHistory', object._id, object)
//		}
//	})
//
//	this.ready()
//
//	this.onStop(() => observer.stop())
//})

Meteor.publish('boxHistory', function() {
	const today = new Date()
	today.setHours(0)
	today.setMinutes(0)
	today.setSeconds(0)
	today.setMilliseconds(0)
	return [Boxes.find(), Geometries.find(), ObjectsHistory.find({date: {$gt: today}}, {sort: {date: 1}})]
})