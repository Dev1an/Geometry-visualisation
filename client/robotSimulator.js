var closed = true
var primitiveCursor = 0
var instanceCursor = -1

var previousPalmPosition = [200,0,100]

FlowRouter.route('/robot', {
	name: "robot",
	action(params, queryParams) {
		Meteor.subscribe('realTimeBox')
		BlazeLayout.render('layout', { main: "realTime" });

		controller = Leap.loop(function() {})

		Tracker.autorun(function() {
			const box = Boxes.findOne()

			if (box) {

				controller.removeAllListeners('animationFrame')
				controller.on('animationFrame', function (frame) {
					const hand = frame.hands[0]

					if (hand) {
						if (!closed) {
							const oldPosition = RealTimeObjects.findOne(box._id + primitiveCursor.toString(16) + instanceCursor.toString(16)).position
							ObjectsHistory.insert({
								boxId: box._id,
								objectIndex: primitiveCursor,
								instanceIndex: instanceCursor,
								position: [
									(hand.palmPosition[0]-previousPalmPosition[0])*5 + oldPosition[0],
									(hand.palmPosition[2]-previousPalmPosition[2])*5 + oldPosition[1]
								],
								rotation: hand.yaw(),
								date: new Date()
							})
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

nextIndexesFor = function(box, primitive, instance) {
	if (instance < box.objects[primitive].instances.length-1) {
		instance++
	} else {
		instance = 0

		if (primitive < box.objects.length -1) primitive++
		else primitive = 0
	}
	return [primitive, instance]
}

function advance(box) {
	[primitiveCursor, instanceCursor] = nextIndexesFor(box, primitiveCursor, instanceCursor)
	const [nextPrimitive, nextInstance] = nextIndexesFor(box, primitiveCursor, instanceCursor)
	Jobs.insert({boxId: box._id, object: nextPrimitive, instance: nextInstance, date: new Date()})
}

resetBox = function() {
	const boxId = Boxes.findOne()._id
	const now = new Date();

	[
		{
			"position": [
				20,
				20
			],
			"rotation": 0,
			"instanceIndex": 0,
			"objectIndex": 0
		},
		{
			"position": [
				180,
				20
			],
			"rotation": 0,
			"instanceIndex": 1,
			"objectIndex": 0
		},
		{
			"position": [
				340,
				20
			],
			"rotation": 0,
			"instanceIndex": 2,
			"objectIndex": 0
		},
		{
			"position": [
				100,
				120
			],
			"rotation": 0,
			"instanceIndex": 3,
			"objectIndex": 0
		},
		{
			"position": [
				260,
				120
			],
			"rotation": 0,
			"instanceIndex": 4,
			"objectIndex": 0
		},
		{
			"position": [
				100,
				25
			],
			"rotation": 0,
			"instanceIndex": 0,
			"objectIndex": 1
		},
		{
			"position": [
				260,
				25
			],
			"rotation": 0,
			"instanceIndex": 1,
			"objectIndex": 1
		},
		{
			"position": [
				20,
				125
			],
			"rotation": 0,
			"instanceIndex": 2,
			"objectIndex": 1
		},
		{
			"position": [
				180,
				125
			],
			"rotation": 0,
			"instanceIndex": 3,
			"objectIndex": 1
		},
		{
			"position": [
				340,
				125
			],
			"rotation": 0,
			"instanceIndex": 4,
			"objectIndex": 1
		}
	].forEach(object => ObjectsHistory.insert(_.extend(object, {date: now, boxId})))
}

Template.realTime.events({
	'click button': resetBox
})