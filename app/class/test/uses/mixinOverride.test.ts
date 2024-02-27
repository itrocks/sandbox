import 'reflect-metadata'
import { Super, Uses } from '../../uses'

class MixinParent {
	a = 1

	method() {
		if (this instanceof Mixin) {
			console.log('this instanceOf Class')
		}
		// TODO Sugar: return Super<Class>().method() + '-mixinParentMethod' + this.a
		return Super<Class>(this).method.call(this) + '-mixinParentMethod' + this.a
	}
}

class Mixin extends MixinParent {
	a = 2
	method() {
		return super.method() + '-mixinMethod' + this.a
	}
}

class Parent {
	a = 3
	method() {
		return 'parentMethod' + this.a
	}
}

@Uses(Mixin)
class Class extends Parent {
	a = 4
	method() {
		return super.method() + '-method' + this.a
	}
}

describe('mixinOverride', () => {
	it('mixinOverrideIt', () => {
		const object = new Class() as Class & Mixin
		expect(object.method()).toEqual('parentMethod2-method2-mixinParentMethod2-mixinMethod2')
	})
})
