import { SortedArray } from './sorted-array'

describe('orderedIncludes', () => {
	it('empty',          () => expect(new SortedArray().includes('a')).toEqual(false))
	it('fourFound1',     () => expect(new SortedArray('e', 'k', 'p', 'v').includes('e')).toEqual(true))
	it('fourFound2',     () => expect(new SortedArray('e', 'k', 'p', 'v').includes('k')).toEqual(true))
	it('fourFound3',     () => expect(new SortedArray('e', 'k', 'p', 'v').includes('p')).toEqual(true))
	it('fourFound4',     () => expect(new SortedArray('e', 'k', 'p', 'v').includes('v')).toEqual(true))
	it('fourNotFound1',  () => expect(new SortedArray('e', 'k', 'p', 'v').includes('a')).toEqual(false))
	it('fourNotFound2',  () => expect(new SortedArray('e', 'k', 'p', 'v').includes('h')).toEqual(false))
	it('fourNotFound3',  () => expect(new SortedArray('e', 'k', 'p', 'v').includes('n')).toEqual(false))
	it('fourNotFound4',  () => expect(new SortedArray('e', 'k', 'p', 'v').includes('s')).toEqual(false))
	it('fourNotFound5',  () => expect(new SortedArray('e', 'k', 'p', 'v').includes('z')).toEqual(false))
	it('oneFound',       () => expect(new SortedArray('m').includes('m')).toEqual(true))
	it('oneNotFound1',   () => expect(new SortedArray('m').includes('a')).toEqual(false))
	it('oneNotFound2',   () => expect(new SortedArray('m').includes('z')).toEqual(false))
	it('threeFound1',    () => expect(new SortedArray('f', 'n', 't').includes('f')).toEqual(true))
	it('threeFound2',    () => expect(new SortedArray('f', 'n', 't').includes('n')).toEqual(true))
	it('threeFound3',    () => expect(new SortedArray('f', 'n', 't').includes('t')).toEqual(true))
	it('threeNotFound1', () => expect(new SortedArray('f', 'n', 't').includes('a')).toEqual(false))
	it('threeNotFound2', () => expect(new SortedArray('f', 'n', 't').includes('i')).toEqual(false))
	it('threeNotFound3', () => expect(new SortedArray('f', 'n', 't').includes('q')).toEqual(false))
	it('threeNotFound4', () => expect(new SortedArray('f', 'n', 't').includes('z')).toEqual(false))
	it('twoFound1',      () => expect(new SortedArray('h', 'r').includes('h')).toEqual(true))
	it('twoFound2',      () => expect(new SortedArray('h', 'r').includes('r')).toEqual(true))
	it('twoNotFound1',   () => expect(new SortedArray('h', 'r').includes('a')).toEqual(false))
	it('twoNotFound2',   () => expect(new SortedArray('h', 'r').includes('m')).toEqual(false))
	it('twoNotFound3',   () => expect(new SortedArray('h', 'r').includes('z')).toEqual(false))
})

describe('orderedIndexOf', () => {
	it('empty',          () => expect(new SortedArray().indexOf('a')).toEqual(-1))
	it('fourFound1',     () => expect(new SortedArray('e', 'k', 'p', 'v').indexOf('e')).toEqual(0))
	it('fourFound2',     () => expect(new SortedArray('e', 'k', 'p', 'v').indexOf('k')).toEqual(1))
	it('fourFound3',     () => expect(new SortedArray('e', 'k', 'p', 'v').indexOf('p')).toEqual(2))
	it('fourFound4',     () => expect(new SortedArray('e', 'k', 'p', 'v').indexOf('v')).toEqual(3))
	it('fourNotFound1',  () => expect(new SortedArray('e', 'k', 'p', 'v').indexOf('a')).toEqual(-1))
	it('fourNotFound2',  () => expect(new SortedArray('e', 'k', 'p', 'v').indexOf('h')).toEqual(-1))
	it('fourNotFound3',  () => expect(new SortedArray('e', 'k', 'p', 'v').indexOf('n')).toEqual(-1))
	it('fourNotFound4',  () => expect(new SortedArray('e', 'k', 'p', 'v').indexOf('s')).toEqual(-1))
	it('fourNotFound5',  () => expect(new SortedArray('e', 'k', 'p', 'v').indexOf('z')).toEqual(-1))
	it('oneFound',       () => expect(new SortedArray('m').indexOf('m')).toEqual(0))
	it('oneNotFound1',   () => expect(new SortedArray('m').indexOf('a')).toEqual(-1))
	it('oneNotFound2',   () => expect(new SortedArray('m').indexOf('z')).toEqual(-1))
	it('threeFound1',    () => expect(new SortedArray('f', 'n', 't').indexOf('f')).toEqual(0))
	it('threeFound2',    () => expect(new SortedArray('f', 'n', 't').indexOf('n')).toEqual(1))
	it('threeFound3',    () => expect(new SortedArray('f', 'n', 't').indexOf('t')).toEqual(2))
	it('threeNotFound1', () => expect(new SortedArray('f', 'n', 't').indexOf('a')).toEqual(-1))
	it('threeNotFound2', () => expect(new SortedArray('f', 'n', 't').indexOf('i')).toEqual(-1))
	it('threeNotFound3', () => expect(new SortedArray('f', 'n', 't').indexOf('q')).toEqual(-1))
	it('threeNotFound4', () => expect(new SortedArray('f', 'n', 't').indexOf('z')).toEqual(-1))
	it('twoFound1',      () => expect(new SortedArray('h', 'r').indexOf('h')).toEqual(0))
	it('twoFound2',      () => expect(new SortedArray('h', 'r').indexOf('r')).toEqual(1))
	it('twoNotFound1',   () => expect(new SortedArray('h', 'r').indexOf('a')).toEqual(-1))
	it('twoNotFound2',   () => expect(new SortedArray('h', 'r').indexOf('m')).toEqual(-1))
	it('twoNotFound3',   () => expect(new SortedArray('h', 'r').indexOf('z')).toEqual(-1))
})

describe('orderedInsert', () => {
	it('first', () => {
		const array = new SortedArray<string>
		expect(array.insert('a')).toEqual(0)
		expect(array).toEqual(['a'])
	})
	it('fourthAfter', () => {
		const array = new SortedArray('f', 'n', 't')
		expect(array.insert('z')).toEqual(3)
		expect(array).toEqual(['f', 'n', 't', 'z'])
	})
	it('fourthBefore', () => {
		const array = new SortedArray('f', 'n', 't')
		expect(array.insert('a')).toEqual(0)
		expect(array).toEqual(['a', 'f', 'n', 't'])
	})
	it('fourthMiddle1', () => {
		const array = new SortedArray('f', 'n', 't')
		expect(array.insert('i')).toEqual(1)
		expect(array).toEqual(['f', 'i', 'n', 't'])
	})
	it('fourthMiddle2', () => {
		const array = new SortedArray('f', 'n', 't')
		expect(array.insert('q')).toEqual(2)
		expect(array).toEqual(['f', 'n', 'q', 't'])
	})
	it('secondAfter', () => {
		const array = new SortedArray('m')
		expect(array.insert('z')).toEqual(1)
		expect(array).toEqual(['m', 'z'])
	})
	it('secondBefore', () => {
		const array = new SortedArray('m')
		expect(array.insert('a')).toEqual(0)
		expect(array).toEqual(['a', 'm'])
	})
	it('thirdAfter', () => {
		const array = new SortedArray('h', 'r')
		expect(array.insert('z')).toEqual(2)
		expect(array).toEqual(['h', 'r', 'z'])
	})
	it('thirdBefore', () => {
		const array = new SortedArray('h', 'r')
		expect(array.insert('a')).toEqual(0)
		expect(array).toEqual(['a', 'h', 'r'])
	})
	it('thirdMiddle', () => {
		const array = new SortedArray('h', 'r')
		expect(array.insert('m')).toEqual(1)
		expect(array).toEqual(['h', 'm', 'r'])
	})
})
