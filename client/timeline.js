/**
 * Created by Damiaan on 15/02/16.
 */

Template.timeline.onRendered(function() {
	const timeline = d3.select(this.find('svg'))
	const template = this
	const lineGroup = timeline.select('g')

	Tracker.autorun(function() {
		const events = template.data.query().fetch()

		if (events.length > 1) {
			const dom = [events[0].date.getTime(), events[events.length-1].date.getTime()]
			const scale = d3.scale.linear().domain(dom).range([10,990])
			template.data.scale(scale)

			const lines = lineGroup.selectAll('line').data(events)

			lines.exit().remove()
			lines.enter().append('line')
			lines.attr('x1', event => scale(event.date.getTime()))
			lines.attr('x2', event => scale(event.date.getTime()))
			lines.attr('y1', 0)
			lines.attr('y2', 100)
			lines.attr('stroke', 'white')
			lines.attr('stroke-width', 1)
		}
	})
})
