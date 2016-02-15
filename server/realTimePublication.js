/**
 * Created by Damiaan on 15/02/16.
 */

Meteor.publish('realTimeBox', function() {
	Boxes.find()._publishCursor(this)
	Geometries.find()._publishCursor(this)

	const boxesHandle = Boxes.find().observe({
		added: box => {
			box.objects.forEach((object, objectIndex) => {
				object.instances.forEach((instanceIndex, instanceIndex) => {
					this.added(
						'realTimeObjects',
						box._id + objectIndex.toString(16) + instanceIndex.toString(16),
						ObjectsHistory.findOne({boxId: box._id, objectIndex, instanceIndex}, {
							sort: {date: -1},
							fields: {position: 1, rotation: 1}
						})
					)
				})
			})
		}
	})

	var initiation = true
	const realTimeHandle = ObjectsHistory.find().observe({
		added: object => {
			if (!initiation) this.changed(
				'realTimeObjects',
				object.boxId + object.objectIndex.toString(16) + object.instanceIndex.toString(16),
				_.pick(object, ['position', 'rotation'])
			)
		}
	})
	initiation = false
	this.onStop(() => {realTimeHandle.stop(); boxesHandle.stop()})

	this.ready()
})

Meteor.startup(function () {
	ObjectsHistory._ensureIndex({ "date": 1});
});