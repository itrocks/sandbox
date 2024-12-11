import 'reflect-metadata'
import Uses from '../../uses'

class Mixin1Parent {
	mixin1ParentMethod() { return 'mixin1ParentMethod' }
}

class Mixin1 extends Mixin1Parent {
}

interface Class extends Mixin1 {}
@Uses(Mixin1)
class Class {
}

describe('mixinExtends', () => {
	it('mixin1ParentMethod', () => {
		const object = new Class
		expect(object.mixin1ParentMethod()).toEqual('mixin1ParentMethod')
	})
})
