
declare global
{
	interface Array<T> {
		orderedIncludes(searchElement: any): boolean
		orderedIndexOf(searchElement: any): number
		orderedInsert(insertElement: any): number
	}
}

export const orderedIncludes = Array.prototype.orderedIncludes = function(searchElement: any)
{
	let left = 0
	let middle: number
	let right = this.length
	while (left < right) {
		middle = ((left + right) >>> 1)
		if (this[middle] < searchElement) (left = middle + 1)
		else (right = middle)
	}
	return this[left] === searchElement
}

export const orderedIndexOf = Array.prototype.orderedIndexOf = function(searchElement: any)
{
	let left = 0
	let middle: number
	let right = this.length
	while (left < right) {
		middle = ((left + right) >>> 1)
		if (this[middle] < searchElement) (left = middle + 1)
		else (right = middle)
	}
	return (this[left] === searchElement) ? left : -1
}

export const orderedInsert = Array.prototype.orderedInsert = function(insertElement: any)
{
	let left = 0
	let middle: number
	let right = this.length
	while (left < right) {
		middle = ((left + right) >>> 1)
		if (this[middle] < insertElement) (left = middle + 1)
		else (right = middle)
	}
	this.splice(left, 0, insertElement)
	return left
}
