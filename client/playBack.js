/**
 * Created by Damiaan on 15/02/16.
 */

Template.playBack.helpers({
	size() {
		startTime = ObjectsHistory.findOne({}, {sort: {date: -1}}).date
		const width = startTime - ObjectsHistory.findOne({}, {sort: {date: 1}}).date;
		return width + ' ' + width/10
	},

	box() {
		return Boxes.findOne()
	},
	frame() {
		var template = Template.instance()
		return function(instanceIndex, objectIndex, boxId) {
			const playHead = template.playHead.get()
			var index = Math.abs(events.binaryIndexOf(playHead, index => events[index].date)) - 1
			var bundleIndex = Math.abs(bundledEvents.binaryIndexOf(playHead, index => bundledEvents[index].end))
			while (events[index].instanceIndex != instanceIndex || events[index].objectIndex != objectIndex || events[index].boxId != boxId) {
				index = bundledEvents[--bundleIndex].end - 1
			}
			return events[index]

			//return ObjectsHistory.findOne({
			//	instanceIndex, objectIndex, boxId,
			//	date: {$lte: template.playHead.get()}
			//}, {sort: {date: -1}})
		}
	},
	scale() {
		const template = Template.instance()
		return function(scale) {
			template.scale = scale
		}
	},
	detailScale() {
		const template = Template.instance()
		return function(scale) {
			template.detailScale = scale
		}
	},

	allEvents() {
		return () => ObjectsHistory.find()
	},

	selectedEvents() {
		const template = Template.instance()
		return () => ObjectsHistory.find({date: {$gt: template.selectionStart.get(), $lt: template.selectionEnd.get()}})
	},

	ready: function() {
		return subscription.ready()
	}
})

Template.playBack.onCreated(function() {
	this.playHead = new ReactiveVar(new Date())
	this.selectionStart = new ReactiveVar()
	this.selectionEnd = new ReactiveVar()
})

Template.playBack.events({
	'mousemove .timeLineDetail'(event, template) {
		template.playHead.set(new Date(template.detailScale.invert((event.offsetX) / event.currentTarget.clientWidth * 1000)))
	},
	'mousedown .timeLine'(event, template) {
		template.selectionStart.set(new Date(template.scale.invert((event.offsetX) / event.currentTarget.clientWidth * 1000)))
	},
	'mouseup .timeLine'(event, template) {
		template.selectionEnd.set(new Date(template.scale.invert((event.offsetX) / event.currentTarget.clientWidth * 1000)))
	},
	'click button'(mouseEvent, template) {
		const events = ObjectsHistory.find({date: {$gt: template.playHead.get()}}).fetch()
		cursor = 0

		clearTimeout(template.playbackTimer)

		function updateFrame() {
			const event = events[cursor++]
			const svgElement = document.querySelector(`svg .objects .instances:nth-child(${event.objectIndex+1}) g:nth-child(${event.instanceIndex+1})`)
			const rotationTail = svgElement.getAttribute('transform').split('rotate(')[1].split(' ').slice(1)
			svgElement.setAttribute('transform', `translate(${event.position[0]} ${event.position[1]}) rotate(${event.rotation/Math.PI*180} ${rotationTail.join(' ')}`)
			template.playbackTimer = setTimeout(updateFrame, events[cursor].date - event.date)
		}

		updateFrame()
	}
})

Template.playBack.onRendered(function() {
	const template = this
	Tracker.autorun(function() {
		const selectionBox = d3.select('.timeLine path.selection')

		const start = template.selectionStart.get()
		const end = template.selectionEnd.get()
		if (start && end) {
			const s = template.scale
			selectionBox.attr('d', line([
				[s(start),   0],
				[s(end),     0],
				[s(end),   100],
				[s(start), 100]
			]))
		}
	})
})

var subscription, events, bundledEvents

FlowRouter.route('/playback', {
	action() {
		subscription = Meteor.subscribe('boxHistory')
		BlazeLayout.render('layout', { main: "playBack" });
		Tracker.autorun(() => {
			if (subscription.ready()){
				events = ObjectsHistory.find().fetch()
				bundledEvents = [{
					end: 1,
					boxId: events[0].boxId,
					object: events[0].objectIndex,
					instance: events[0].instanceIndex
				}]
				var bundleCursor = 0;
				var lastBundle = bundledEvents[bundleCursor]
				events.slice(1).forEach(function(event, index) {
					if (event.instanceIndex == lastBundle.instance && event.objectIndex == lastBundle.object && event.boxId == lastBundle.boxId) {
						bundledEvents[bundleCursor].end = index + 1
					} else {
						bundledEvents.push({
							end: index+1,
							boxId: event.boxId,
							object: event.objectIndex,
							instance: event.instanceIndex
						})
						++bundleCursor
						lastBundle = bundledEvents[bundleCursor]
					}
				})
			}
		})
	}
})