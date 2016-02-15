line = d3.svg.line()
line.interpolate('linear-closed')
var svgContainer

Template.body.helpers({
	line,
	viewBox: polygon => viewBox(polygon).join(' '),

	box() {return Boxes.findOne()},

	lastFrame(instanceIndex, objectIndex, boxId) {
		return RealTimeObjects.findOne(
			boxId+objectIndex.toString(16)+instanceIndex.toString(16),
			{sort: {date: -1}}
		)
	},

	horizontalCenter(polygon) {
		const xCoordinates = polygon.coordinates.map(coordinates => coordinates[0])
		return (Math.min(...xCoordinates) + Math.max(...xCoordinates)) / 2
	},

	verticalCenter(polygon) {
		const xCoordinates = polygon.coordinates.map(coordinates => coordinates[1])
		return (Math.min(...xCoordinates) + Math.max(...xCoordinates)) / 2
	},

	degrees: radians => radians/Math.PI*180
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

Meteor.subscribe('realTimeBox')