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
				boxPath.attr('d', line(box.geometry.coordinates))

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

	Template.body.helpers({
		left() {
			const box = Boxes.findOne()
			if (box && box.geometry) {
				const coordinates = box.geometry.coordinates
				return Math.min(...coordinates.map(coordinates => coordinates[0]))
			}
		},

		top() {
			const box = Boxes.findOne()
			if (box && box.geometry) {
				const coordinates = box.geometry.coordinates
				return Math.min(...coordinates.map(coordinates => coordinates[1]))
			}
		},

		width() {
			const box = Boxes.findOne()
			if (box && box.geometry) {
				const xCoordinates = box.geometry.coordinates.map(coordinates => coordinates[0])
				const min = Math.min(...xCoordinates)
				const max = Math.max(...xCoordinates)
				return max - min
			}
		},

		height() {
			const box = Boxes.findOne()
			if (box && box.geometry) {
				const xCoordinates = box.geometry.coordinates.map(coordinates => coordinates[1])
				const min = Math.min(...xCoordinates)
				const max = Math.max(...xCoordinates)
				return max - min
			}
		}
	})
}