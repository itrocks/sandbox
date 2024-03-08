
declare global
{
	interface Array<T> {
		isOrdered(): boolean
		ordered(sort?: boolean): void
		orderedIncludes(searchElement: any): boolean
		orderedIndexOf(searchElement: any): number
		orderedInsert(insertElement: any): number
		orderedPush(items: any[]): number
		unordered(): void
	}
}

export const isOrdered = Array.prototype.isOrdered = function()
{
	return this.hasOwnProperty('includes')
}

export const ordered = Array.prototype.ordered = function(sort = true)
{
	this.includes = orderedIncludes
	this.indexOf  = orderedIndexOf
	this.push     = orderedPush
	if (sort) this.sort()
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

export const orderedPush = Array.prototype.orderedPush = function(...items: any[]): number
{
	for (const item of items) this.orderedInsert(item)
	return this.length
}

export const unordered = Array.prototype.unordered = function()
{
	if (!this.isOrdered()) return
	for (let f of ['includes', 'indexOf', 'push']) {
		// @ts-ignore
		delete this[f]
	}
}
