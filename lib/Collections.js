Boxes = new Mongo.Collection('boxes', {
	transform(box) {
		// Merge the box geometry into the box object
		Object.defineProperty(box, 'geometry', {
			get() { return Geometries.findOne(box.geometryId) }
		})

		for (let object of box.objects) {
			// Merge the object's geometry into the 'object' object
			Object.defineProperty(object, 'geometry', {
				get() { return Geometries.findOne(object.geometryId) }
			})
		}
		return box
	}
})

Geometries = new Mongo.Collection('geometries')

ObjectsHistory = new Mongo.Collection('objectsHistory')

Jobs = new Mongo.Collection('jobs')