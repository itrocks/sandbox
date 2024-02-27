import 'reflect-metadata'
import Uses from '../../uses'

class Mixin1Mixin1 {
}

@Uses(Mixin1Mixin1)
class Mixin1 {
	mixin1Method() { return 'mixin1Method' }
}

@Uses(Mixin1)
class Class {
}

describe('mixinUses', () => {
	it('mixin1Method', () => {
		const object = new Class as Class & Mixin1 & Mixin1Mixin1
		expect(object.mixin1Method()).toEqual('mixin1Method')
	})
})
