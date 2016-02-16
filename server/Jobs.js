/**
 * Created by Damiaan on 16/02/16.
 */

Meteor.publish('jobs', function() {return Jobs.find()})