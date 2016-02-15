/**
 * Created by Damiaan on 15/02/16.
 */

Meteor.methods({
	updateObject(object) {
		ObjectsHistory.insert(object)
	}
})