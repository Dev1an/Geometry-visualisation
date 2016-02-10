const line = d3.svg.line()
line.interpolate('linear-closed')
var svgContainer

Template.body.onRendered(function() {
	svgContainer = d3.select('svg')
	const boxPath = svgContainer.append('path').attr('class', 'box')

	Tracker.autorun(function() {
		const box = Boxes.findOne()

		if (box && box.geometry) {
			const boxGeometry = box.geometry

			svgContainer.attr('viewBox', viewBox(boxGeometry))

			boxPath.attr('d', line(boxGeometry.coordinates))

			const geometryDefinitions = svgContainer.select('defs').selectAll('path').data(box.objects)
			geometryDefinitions.enter().append('path')
			geometryDefinitions.attr('d', object => line(object.geometry.coordinates))
			geometryDefinitions.attr('id', object => 'object' + object.geometryId)
			geometryDefinitions.classed('object', true)

			const objectGroups = svgContainer.selectAll('g').data(box.objects)
			objectGroups.enter().append('g').classed('objects', true)

			const objectPaths = objectGroups.selectAll('use').data(function(data, primitiveIndex) {
				const geometry = data.geometry
				return data.instances.map((object, instanceIndex) => {
					return {geometryId: data.geometryId, translation: object.position, primitiveIndex, instanceIndex, handled: object.handled}
				})
			})

			objectPaths.enter().append('use')
			objectPaths.attr('xlink:href', object => '#object' + object.geometryId)
			objectPaths.attr('transform', object => `translate(${object.translation[0]}, ${object.translation[1]})`)
			objectPaths.classed('handled', object => object.handled)
			objectPaths.on('click', function(object){
				Boxes.update(box._id, {$set: {
					[`objects.${object.primitiveIndex}.instances.${object.instanceIndex}.handled`]: !object.handled
				}})
			})
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

	return `${boxLeft} ${boxTop} ${Math.abs(boxRight-boxLeft)} ${Math.abs(boxBottom-boxTop)}`
}