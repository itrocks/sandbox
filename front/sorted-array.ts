
abstract class ASortedArray<T> extends Array<T>
{

	abstract insert(insertElement: T): number

	abstract isSorted(): boolean

	push(...items: any[]): number
	{
		for (const item of items)
			this.insert(item)
		return this.length
	}

}

export class SortedArray<T> extends ASortedArray<T>
{

	includes(searchElement: T)
	{
		let left = 0
		let middle: number
		let right = this.length
		while (left < right) {
			middle = ((left + right) >>> 1)
			if (this[middle] < searchElement)
				left = middle + 1
			else
				right = middle
		}
		return this[left] === searchElement
	}

	indexOf(searchElement: T)
	{
		let left = 0
		let middle: number
		let right = this.length
		while (left < right) {
			middle = ((left + right) >>> 1)
			if (this[middle] < searchElement)
				left = middle + 1
			else
				right = middle
		}
		return (this[left] === searchElement) ? left : -1
	}

	insert(insertElement: T)
	{
		let left = 0
		let middle: number
		let right = this.length
		while (left < right) {
			middle = ((left + right) >>> 1)
			if (this[middle] < insertElement)
				left = middle + 1
			else
				right = middle
		}
		this.splice(left, 0, insertElement)
		return left
	}

	isSorted()
	{
		const length = this.length
		for (let index = 1; index < length; index ++) {
			if (this[index] < this[index - 1]) return false
		}
		return true
	}

}

export class SortedArrayCompareFn<T> extends ASortedArray<T>
{

	constructor(public compareFn: (a: T, b: T) => number, ...items: T[])
	{
		super(...items)
	}

	includes(searchElement: T)
	{
		let left = 0
		let middle: number
		let right = this.length
		while (left < right) {
			middle = ((left + right) >>> 1)
			if (this.compareFn(this[middle], searchElement) < 0)
				left = middle + 1
			else
				right = middle
		}
		return !this.compareFn(this[left], searchElement)
	}

	indexOf(searchElement: T)
	{
		let left = 0
		let middle: number
		let right = this.length
		while (left < right) {
			middle = ((left + right) >>> 1)
			if (this.compareFn(this[middle], searchElement) < 0)
				left = middle + 1
			else
				right = middle
		}
		return this.compareFn(this[left], searchElement) ? -1 : left
	}

	insert(insertElement: T)
	{
		let left = 0
		let middle: number
		let right = this.length
		while (left < right) {
			middle = ((left + right) >>> 1)
			if (this.compareFn(this[middle], insertElement) < 0)
				left = middle + 1
			else
				right = middle
		}
		this.splice(left, 0, insertElement)
		return left
	}

	isSorted()
	{
		const length = this.length
		for (let index = 1; index < length; index ++) {
			if (this.compareFn(this[index], this[index - 1]) < 0) return false
		}
		return true
	}

}

export class SortedArrayKey<T extends { [index: number | string]: any }> extends ASortedArray<T>
{

	constructor(public compareKey: number | string, ...items: T[])
	{
		super(...items)
	}

	includes(searchElement: T)
	{
		const compareKey = this.compareKey
		let left = 0
		let middle: number
		let right = this.length
		while (left < right) {
			middle = ((left + right) >>> 1)
			if (this[middle][compareKey] < searchElement[compareKey])
				left = middle + 1
			else
				right = middle
		}
		return this[left] === searchElement
	}

	indexOf(searchElement: any)
	{
		const compareKey = this.compareKey
		let left = 0
		let middle: number
		let right = this.length
		while (left < right) {
			middle = ((left + right) >>> 1)
			if (this[middle][compareKey] < searchElement[compareKey])
				left = middle + 1
			else
				right = middle
		}
		return (this[left] === searchElement) ? left : -1
	}

	insert(insertElement: any)
	{
		const compareKey = this.compareKey
		let left = 0
		let middle: number
		let right = this.length
		while (left < right) {
			middle = ((left + right) >>> 1)
			if (this[middle][compareKey] < insertElement[compareKey])
				left = middle + 1
			else
				right = middle
		}
		this.splice(left, 0, insertElement)
		return left
	}

	isSorted()
	{
		const compareKey = this.compareKey
		const length = this.length
		for (let index = 1; index < length; index ++) {
			if (this[index][compareKey] < this[index - 1][compareKey]) return false
		}
		return true
	}

}
