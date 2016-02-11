FlowRouter.route('/robot', {
	name: "robot",
	action(params, queryParams) {
		controller = Leap.loop(function() {})

		Tracker.autorun(function() {
			const box = Boxes.findOne()
			if (box) {
				controller.removeAllListeners('animationFrame')
				controller.on('animationFrame', function (frame) {
					const hand = frame.hands[0]

					if (hand) {
						Boxes.update(box._id, {$set: {"objects.0.instances.0.position": [hand.palmPosition[0]*5, hand.palmPosition[2]*5]}})
						//d3.select('.objects>use').attr('transform', `translate(${hand.palmPosition[0]*5}, ${hand.palmPosition[2]*5})`)
					}
				})
			}
		})
	}
});

FlowRouter.route('/', {action() {}})