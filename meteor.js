Boxes = new Mongo.Collection('boxes', {
	transform(box) {
		Object.defineProperty(box, 'geometry', {
			get() { return Geometries.findOne(box.geometryId) }
		})

		for (let object of box.objects) {
			Object.defineProperty(object, 'geometry', {
				get() { return Geometries.findOne(object.geometryId) }
			})
		}
		return box
	}
})
Geometries = new Mongo.Collection('geometries')

if (Meteor.isClient) {
	const line = d3.svg.line()
	var svgContainer

	Template.body.onRendered(function() {
		svgContainer = d3.select('svg')
		const boxPath = svgContainer.append('path').attr('class', 'box')

		Tracker.autorun(function() {
			console.log('redrawing box')
			const box = Boxes.findOne()

			if (box && box.geometry) {
				const boxGeometry = box.geometry

				const boxXCoordinates = boxGeometry.coordinates.map(coordinates => coordinates[0])
				const boxYCoordinates = boxGeometry.coordinates.map(coordinates => coordinates[1])

				const boxLeft   = Math.min(...boxXCoordinates)
				const boxTop    = Math.min(...boxYCoordinates)
				const boxRight  = Math.max(...boxXCoordinates)
				const boxBottom = Math.max(...boxYCoordinates)

				svgContainer.attr('viewBox', `${boxLeft} ${boxTop} ${Math.abs(boxRight-boxLeft)} ${Math.abs(boxBottom-boxTop)}`)

				boxPath.attr('d', line(boxGeometry.coordinates))

				var distinctObjects = svgContainer.selectAll('g').data(box.objects)
				distinctObjects.enter().append('g')

				var objectPaths = distinctObjects.selectAll('path').data(function(data) {
					const geometry = data.geometry
					return data.instances.map(translation => geometry.coordinates.map(coordinates => coordinates.map((value, index) => value+translation[index])))
				})

				objectPaths.enter().append('path').classed('object', true)
				objectPaths.attr('d', instance => line(instance))
			}
		})
	})
}