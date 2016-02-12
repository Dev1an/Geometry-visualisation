var closed = true
var primitiveCursor = 0
var instanceCursor = -1

var previousPalmPosition = [200,0,100]

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
						if (!closed) {
							Boxes.update(box._id, {$set: {
								[`objects.${primitiveCursor}.instances.${instanceCursor}.position`]: [
									(hand.palmPosition[0]-previousPalmPosition[0])*5 + box.objects[primitiveCursor].instances[instanceCursor].position[0],
									(hand.palmPosition[2]-previousPalmPosition[2])*5 + box.objects[primitiveCursor].instances[instanceCursor].position[1]
								],
								[`objects.${primitiveCursor}.instances.${instanceCursor}.rotation`]: [hand.pitch(), hand.roll(), hand.yaw()]
							}})
							previousPalmPosition = hand.palmPosition
						}

						if (hand.grabStrength < 0.5 && closed) {
							previousPalmPosition = hand.palmPosition
							closed = false

							advance(box)
							Boxes.update(box._id, {$set: {
								[`objects.${primitiveCursor}.instances.${instanceCursor}.handling`]: true
							}})
						} else if (hand.grabStrength > 0.5 && !closed) {
							closed = true
							Boxes.update(box._id, {$set: {
								[`objects.${primitiveCursor}.instances.${instanceCursor}.handling`]: false
							}})
						}
					}
				})
			}
		})

		var listener = new Keypress.Listener()
		listener.simple_combo('space', function() {
			const box = Boxes.findOne()
			advance(box)
			Boxes.update(box._id, {$set: {
				[`objects.${primitiveCursor}.instances.${instanceCursor}.handling`]: true
			}})
			Meteor.setTimeout(function() {
				Boxes.update(box._id, {$set: {
					[`objects.${primitiveCursor}.instances.${instanceCursor}.handled`]: true,
					[`objects.${primitiveCursor}.instances.${instanceCursor}.handling`]: false,
				}})
			}, 1800)
		})
	}
});

FlowRouter.route('/', {action() {}})

function advance(box) {
	if (instanceCursor < box.objects[primitiveCursor].instances.length-1) {
		instanceCursor++
	} else {
		instanceCursor = 0

		if (primitiveCursor < box.objects.length -1) primitiveCursor++
		else primitiveCursor = 0
	}

	Jobs.insert({boxId: box._id, object: primitiveCursor, instance: instanceCursor, date: new Date()})
}