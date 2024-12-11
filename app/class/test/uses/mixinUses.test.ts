import 'reflect-metadata'
import Uses from '../../uses'

class Mixin1Mixin1 {
}

interface Mixin1 extends Mixin1Mixin1 {}
@Uses(Mixin1Mixin1)
class Mixin1 {
	mixin1Method() { return 'mixin1Method' }
}

interface Class extends Mixin1 {}
@Uses(Mixin1)
class Class {
}

describe('mixinUses', () => {
	it('mixin1Method', () => {
		const object = new Class
		expect(object.mixin1Method()).toEqual('mixin1Method')
	})
})
