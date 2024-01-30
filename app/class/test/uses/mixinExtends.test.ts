import 'reflect-metadata'
import Uses from '../../uses'

class Mixin1Parent {
	mixin1ParentMethod() { return 'mixin1ParentMethod' }
}
class Mixin1 extends Mixin1Parent {
}
@Uses(Mixin1)
class Class {
}

describe('mixinExtends', () => {
	it('mixin1ParentMethod', () => {
		const object: Class&Mixin1 = new Class as Class&Mixin1
		expect(object.mixin1ParentMethod()).toEqual('mixin1ParentMethod')
	})
})
