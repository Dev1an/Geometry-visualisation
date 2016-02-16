/**
 * Created by Damiaan on 16/02/16.
 */

function binaryIndexOf(searchElement, map) {
	'use strict';

	if (map === undefined) map = index => this[index]

	var minIndex = 0;
	var maxIndex = this.length - 1;
	var currentIndex;
	var currentElement;
	var resultIndex;

	while (minIndex <= maxIndex) {
		resultIndex = currentIndex = (minIndex + maxIndex) / 2 | 0;
		currentElement = map(currentIndex);

		if (currentElement < searchElement) {
			minIndex = currentIndex + 1;
		}
		else if (currentElement > searchElement) {
			maxIndex = currentIndex - 1;
		}
		else {
			return currentIndex;
		}
	}

	return ~maxIndex;
}

Array.prototype.binaryIndexOf = binaryIndexOf;