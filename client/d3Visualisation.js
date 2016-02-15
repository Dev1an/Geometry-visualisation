line = d3.svg.line()
line.interpolate('linear-closed')
var svgContainer

Template.body.helpers({
	line,
	viewBox: polygon => viewBox(polygon).join(' '),

	box() {return Boxes.findOne()},

	lastFrame(instanceIndex, objectIndex, boxId) {
		return ObjectsHistory.findOne({instanceIndex, boxId, objectIndex}, {sort: {_id: -1}})
	}
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