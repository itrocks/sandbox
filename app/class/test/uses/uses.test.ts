import 'reflect-metadata'
import Uses from '../../uses'

class ParentMixin2Extends {
	parentMixin2ExtendsMethod() { return 'parentMixin2ExtendsMethod' }
	parentMixin2ExtendsProperty = 'parentMixin2ExtendsProperty'
}
class ParentMixin1 {
	parentMixin1Method() { return 'parentMixin1Method' }
	parentMixin1Property = 'parentMixin1Property'
}
class ParentMixin2 extends ParentMixin2Extends {
	parentMixin2Method() { return 'parentMixin2Method' }
	parentMixin2Property = 'parentMixin2Property'
}
@Uses(ParentMixin1, ParentMixin2)
class Parent {
	parentMethod() { return 'parentMethod' }
	parentProperty = 'parentProperty'
}
class Mixin1Mixin1 {
	mixin1Mixin1Method() { return 'mixin1Mixin1Method' }
	mixin1Mixin1Property = 'mixin1Mixin1Property'
}
@Uses(Mixin1Mixin1)
class Mixin1 {
	mixin1Method() { return 'mixin1Method' }
	mixin1Property = 'mixin1Property'
}
class Mixin2 {
	mixin2Method() { return 'mixin2Method' }
	mixin2Property = 'mixin2Property'
}
@Uses(Mixin1, Mixin2)
class Class extends Parent {
	classMethod() { return 'classMethod' }
	classProperty = 'classProperty'
}

describe('build', () =>
{

	it('getAllMethods', () =>
	{
		const object: Class&Mixin1&Mixin1Mixin1&Mixin2&ParentMixin1&ParentMixin2
			= new Class as Class&Mixin1&Mixin1Mixin1&Mixin2&ParentMixin1&ParentMixin2
		expect(object.classMethod()).toEqual('classMethod')
		expect(object.parentMethod()).toEqual('parentMethod')
		expect(object.mixin1Method()).toEqual('mixin1Method')
		expect(object.mixin1Mixin1Method()).toEqual('mixin1Mixin1Method')
		expect(object.mixin2Method()).toEqual('mixin2Method')
		expect(object.parentMixin1Method()).toEqual('parentMixin1Method')
		expect(object.parentMixin2Method()).toEqual('parentMixin2Method')
		expect(object.parentMixin2ExtendsMethod()).toEqual('parentMixin2ExtendsMethod')
	})

	it('getAllProperties', () =>
	{
		const object: Class&Mixin1&Mixin1Mixin1&Mixin2&ParentMixin1&ParentMixin2
			= new Class as Class&Mixin1&Mixin1Mixin1&Mixin2&ParentMixin1&ParentMixin2
		expect(object.classProperty).toEqual('classProperty')
		expect(object.parentProperty).toEqual('parentProperty')
		expect(object.mixin1Property).toEqual('mixin1Property')
		expect(object.mixin1Mixin1Property).toEqual('mixin1Mixin1Property')
		expect(object.mixin2Property).toEqual('mixin2Property')
		expect(object.parentMixin1Property).toEqual('parentMixin1Property')
		expect(object.parentMixin2Property).toEqual('parentMixin2Property')
		expect(object.parentMixin2ExtendsProperty).toEqual('parentMixin2ExtendsProperty')
	})

})
