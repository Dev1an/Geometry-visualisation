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
	return [Boxes.find(), Geometries.find(), ObjectsHistory.find({}, {sort: {date: 1}})]
})