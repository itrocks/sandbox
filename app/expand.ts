
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

	interface RegExp {
		replaceIn(text: string, replacements: string[]): string
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

export const replaceIn = RegExp.prototype.replaceIn = function(text: string, replacements: string[])
{
	let   groupAll  = ''
	let   lastIndex = 0
	const source    = this.source
	const reGroup   = /\(.*?\)/g
	let   match
	while (match = reGroup.exec(source)) {
		groupAll += '(' + source.substring(lastIndex, match.index) + ')'
		groupAll += match[0]
		lastIndex = match.index + match[0].length
	}
	return text.replace(new RegExp(groupAll), function() {
		const length = arguments.length - 2
		let   result = ''
		for (let i = 1, j = 0; i < length; i += 2, j ++) {
			result += arguments[i]
			result += replacements[j]
		}
		return result
	})
}

export const unordered = Array.prototype.unordered = function()
{
	if (!this.isOrdered()) return
	for (let f of ['includes', 'indexOf', 'push']) {
		// @ts-ignore
		delete this[f]
	}
}
