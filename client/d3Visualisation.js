line = d3.svg.line()
line.interpolate('linear-closed')
var svgContainer

Template.body.onRendered(function() {
	svgContainer = d3.select('svg')
	Tracker.autorun(function() {
		svgContainer.classed('controlling', FlowRouter.getRouteName() == 'robot')
	})
	const boxPath = svgContainer.insert('path', '.arrow').attr('class', 'box')

	Tracker.autorun(function() {
		const box = Boxes.findOne()

		if (box && box.geometry) {
			const boxGeometry = box.geometry

			svgContainer.attr('viewBox', viewBox(boxGeometry).join(' '))

			boxPath.attr('d', line(boxGeometry.coordinates))

			const geometryDefinitions = svgContainer.select('defs').selectAll('path').data(box.objects)
			geometryDefinitions.enter().append('path')
			geometryDefinitions.attr('d', object => line(object.geometry.coordinates))
			geometryDefinitions.attr('id', object => 'object' + object.geometryId)
			geometryDefinitions.classed('object', true)

			const objectGroups = svgContainer.selectAll('g').data(box.objects)
			objectGroups.enter().insert('g', '.arrow').classed('objects', true)

			const objectPaths = objectGroups.selectAll('use').data(function(data, primitiveIndex) {
				const geometry = data.geometry
				return data.instances.map((instance, instanceIndex) => {
					return _.extend(instance, {geometryId: data.geometryId, primitiveIndex, instanceIndex})
				})
			})

			objectPaths.enter().append('use')
			objectPaths.attr('xlink:href', object => '#object' + object.geometryId)
			objectPaths.attr('transform', object => `translate(${object.position[0]} ${object.position[1]}) rotate(${object.rotation[2]/Math.PI*180} 30 40)`)
			objectPaths.classed('handled', object => object.handled)
			objectPaths.classed('handling', object => object.handling)
			objectPaths.on('click', function(object){
				Boxes.update(box._id, {$set: {
					[`objects.${object.primitiveIndex}.instances.${object.instanceIndex}.handled`]: !object.handled
				}})
			})
		}
	})

	// Move the arrow
	const arrow = d3.select('path.arrow')
	Tracker.autorun(function() {
		const job = Jobs.findOne({}, {sort: {date: -1}})
		if (job && job.boxId) {
			const box = Boxes.findOne(job.boxId)
			var primitiveCursor = job.object, instanceCursor = job.instance

			if (instanceCursor < box.objects[primitiveCursor].instances.length-1) {
				instanceCursor++
			} else {
				instanceCursor = 0

				if (primitiveCursor < box.objects.length -1) primitiveCursor++
				else primitiveCursor = 0
			}

			const object = box.objects[primitiveCursor]
			const boxView = viewBox(object.geometry)
			arrow.attr('transform', `translate(${boxView[0]+boxView[2]/2 - 13.5 + object.instances[instanceCursor].position[0]} ${boxView[1]+boxView[3]/2 - 18 + object.instances[instanceCursor].position[1]})`)
		}
	})
})

/**
 * Calculates the svg viewbox for a GeoJSON polygon
 * @param {Object} the coordinates of the polygons' points
 * @returns String
 */
function viewBox(polygon) {
	const boxXCoordinates = polygon.coordinates.map(coordinates => coordinates[0])
	const boxYCoordinates = polygon.coordinates.map(coordinates => coordinates[1])

	const boxLeft   = Math.min(...boxXCoordinates)
	const boxTop    = Math.min(...boxYCoordinates)
	const boxRight  = Math.max(...boxXCoordinates)
	const boxBottom = Math.max(...boxYCoordinates)

	return [boxLeft, boxTop, Math.abs(boxRight-boxLeft), Math.abs(boxBottom-boxTop)]
}