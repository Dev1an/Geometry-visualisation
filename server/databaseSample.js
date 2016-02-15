if (Boxes.find().count() == 0) {
	const boxGeometry = Geometries.insert({
		type: "polygon",
		coordinates: [
			[0, 0],
			[420, 0],
			[420, 220],
			[0, 220]
		]
	})

	const rectangleObjectGeometry = Geometries.insert({
		type: "polygon",
		coordinates: [
			[0, 0],
			[60, 0],
			[60, 80],
			[0, 80]
		]
	})

	const polygonObjectGeometry = Geometries.insert({
		type: "polygon",
		coordinates: [
			[0, 17.32],
			[30, 0],
			[60, 17.32],
			[60, 51.96],
			[30, 69.28],
			[0, 51.96]
		]
	})

	Boxes.insert({
		"geometryId": boxGeometry,
		"objects": [
			{
				"geometryId": rectangleObjectGeometry,
				"instances": [
					{
						handled: false
					},
					{
						handled: false
					},
					{
						handled: false
					},
					{
						handled: false
					},
					{
						handled: false
					}
				]
			},
			{
				"geometryId": polygonObjectGeometry,
				"instances": [
					{
						handled: false
					},
					{
						handled: false
					},
					{
						handled: false
					},
					{
						handled: false
					},
					{
						handled: false
					}
				]
			}
		]
	})
}