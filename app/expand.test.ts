import './expand'

describe('orderedIncludes', () => {
	it('empty',          () => expect([].orderedIncludes('a')).toEqual(false))
	it('fourFound1',     () => expect(['e', 'k', 'p', 'v'].orderedIncludes('e')).toEqual(true))
	it('fourFound2',     () => expect(['e', 'k', 'p', 'v'].orderedIncludes('k')).toEqual(true))
	it('fourFound3',     () => expect(['e', 'k', 'p', 'v'].orderedIncludes('p')).toEqual(true))
	it('fourFound4',     () => expect(['e', 'k', 'p', 'v'].orderedIncludes('v')).toEqual(true))
	it('fourNotFound1',  () => expect(['e', 'k', 'p', 'v'].orderedIncludes('a')).toEqual(false))
	it('fourNotFound2',  () => expect(['e', 'k', 'p', 'v'].orderedIncludes('h')).toEqual(false))
	it('fourNotFound3',  () => expect(['e', 'k', 'p', 'v'].orderedIncludes('n')).toEqual(false))
	it('fourNotFound4',  () => expect(['e', 'k', 'p', 'v'].orderedIncludes('s')).toEqual(false))
	it('fourNotFound5',  () => expect(['e', 'k', 'p', 'v'].orderedIncludes('z')).toEqual(false))
	it('oneFound',       () => expect(['m'].orderedIncludes('m')).toEqual(true))
	it('oneNotFound1',   () => expect(['m'].orderedIncludes('a')).toEqual(false))
	it('oneNotFound2',   () => expect(['m'].orderedIncludes('z')).toEqual(false))
	it('threeFound1',    () => expect(['f', 'n', 't'].orderedIncludes('f')).toEqual(true))
	it('threeFound2',    () => expect(['f', 'n', 't'].orderedIncludes('n')).toEqual(true))
	it('threeFound3',    () => expect(['f', 'n', 't'].orderedIncludes('t')).toEqual(true))
	it('threeNotFound1', () => expect(['f', 'n', 't'].orderedIncludes('a')).toEqual(false))
	it('threeNotFound2', () => expect(['f', 'n', 't'].orderedIncludes('i')).toEqual(false))
	it('threeNotFound3', () => expect(['f', 'n', 't'].orderedIncludes('q')).toEqual(false))
	it('threeNotFound4', () => expect(['f', 'n', 't'].orderedIncludes('z')).toEqual(false))
	it('twoFound1',      () => expect(['h', 'r'].orderedIncludes('h')).toEqual(true))
	it('twoFound2',      () => expect(['h', 'r'].orderedIncludes('r')).toEqual(true))
	it('twoNotFound1',   () => expect(['h', 'r'].orderedIncludes('a')).toEqual(false))
	it('twoNotFound2',   () => expect(['h', 'r'].orderedIncludes('m')).toEqual(false))
	it('twoNotFound3',   () => expect(['h', 'r'].orderedIncludes('z')).toEqual(false))
})

describe('orderedIndexOf', () => {
	it('empty',          () => expect([].orderedIndexOf('a')).toEqual(-1))
	it('fourFound1',     () => expect(['e', 'k', 'p', 'v'].orderedIndexOf('e')).toEqual(0))
	it('fourFound2',     () => expect(['e', 'k', 'p', 'v'].orderedIndexOf('k')).toEqual(1))
	it('fourFound3',     () => expect(['e', 'k', 'p', 'v'].orderedIndexOf('p')).toEqual(2))
	it('fourFound4',     () => expect(['e', 'k', 'p', 'v'].orderedIndexOf('v')).toEqual(3))
	it('fourNotFound1',  () => expect(['e', 'k', 'p', 'v'].orderedIndexOf('a')).toEqual(-1))
	it('fourNotFound2',  () => expect(['e', 'k', 'p', 'v'].orderedIndexOf('h')).toEqual(-1))
	it('fourNotFound3',  () => expect(['e', 'k', 'p', 'v'].orderedIndexOf('n')).toEqual(-1))
	it('fourNotFound4',  () => expect(['e', 'k', 'p', 'v'].orderedIndexOf('s')).toEqual(-1))
	it('fourNotFound5',  () => expect(['e', 'k', 'p', 'v'].orderedIndexOf('z')).toEqual(-1))
	it('oneFound',       () => expect(['m'].orderedIndexOf('m')).toEqual(0))
	it('oneNotFound1',   () => expect(['m'].orderedIndexOf('a')).toEqual(-1))
	it('oneNotFound2',   () => expect(['m'].orderedIndexOf('z')).toEqual(-1))
	it('threeFound1',    () => expect(['f', 'n', 't'].orderedIndexOf('f')).toEqual(0))
	it('threeFound2',    () => expect(['f', 'n', 't'].orderedIndexOf('n')).toEqual(1))
	it('threeFound3',    () => expect(['f', 'n', 't'].orderedIndexOf('t')).toEqual(2))
	it('threeNotFound1', () => expect(['f', 'n', 't'].orderedIndexOf('a')).toEqual(-1))
	it('threeNotFound2', () => expect(['f', 'n', 't'].orderedIndexOf('i')).toEqual(-1))
	it('threeNotFound3', () => expect(['f', 'n', 't'].orderedIndexOf('q')).toEqual(-1))
	it('threeNotFound4', () => expect(['f', 'n', 't'].orderedIndexOf('z')).toEqual(-1))
	it('twoFound1',      () => expect(['h', 'r'].orderedIndexOf('h')).toEqual(0))
	it('twoFound2',      () => expect(['h', 'r'].orderedIndexOf('r')).toEqual(1))
	it('twoNotFound1',   () => expect(['h', 'r'].orderedIndexOf('a')).toEqual(-1))
	it('twoNotFound2',   () => expect(['h', 'r'].orderedIndexOf('m')).toEqual(-1))
	it('twoNotFound3',   () => expect(['h', 'r'].orderedIndexOf('z')).toEqual(-1))
})

describe('orderedInsert', () => {
	it('first', () => {
		const array = [] as string[]
		expect(array.orderedInsert('a')).toEqual(0)
		expect(array).toEqual(['a'])
	})
	it('fourthAfter', () => {
		const array = ['f', 'n', 't']
		expect(array.orderedInsert('z')).toEqual(3)
		expect(array).toEqual(['f', 'n', 't', 'z'])
	})
	it('fourthBefore', () => {
		const array = ['f', 'n', 't']
		expect(array.orderedInsert('a')).toEqual(0)
		expect(array).toEqual(['a', 'f', 'n', 't'])
	})
	it('fourthMiddle1', () => {
		const array = ['f', 'n', 't']
		expect(array.orderedInsert('i')).toEqual(1)
		expect(array).toEqual(['f', 'i', 'n', 't'])
	})
	it('fourthMiddle2', () => {
		const array = ['f', 'n', 't']
		expect(array.orderedInsert('q')).toEqual(2)
		expect(array).toEqual(['f', 'n', 'q', 't'])
	})
	it('secondAfter', () => {
		const array = ['m']
		expect(array.orderedInsert('z')).toEqual(1)
		expect(array).toEqual(['m', 'z'])
	})
	it('secondBefore', () => {
		const array = ['m']
		expect(array.orderedInsert('a')).toEqual(0)
		expect(array).toEqual(['a', 'm'])
	})
	it('thirdAfter', () => {
		const array = ['h', 'r']
		expect(array.orderedInsert('z')).toEqual(2)
		expect(array).toEqual(['h', 'r', 'z'])
	})
	it('thirdBefore', () => {
		const array = ['h', 'r']
		expect(array.orderedInsert('a')).toEqual(0)
		expect(array).toEqual(['a', 'h', 'r'])
	})
	it('thirdMiddle', () => {
		const array = ['h', 'r']
		expect(array.orderedInsert('m')).toEqual(1)
		expect(array).toEqual(['h', 'm', 'r'])
	})
})
