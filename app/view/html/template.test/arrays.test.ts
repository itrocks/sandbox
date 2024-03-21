import Template from '../template'

describe('arrays', () => {
	const template = new Template
	it('attributeTranslate', () => {
		expect(template.attributeTranslate.isSorted()).toBe(true)
	})
	it('elementInline', () => {
		expect(template.elementInline.isSorted()).toBe(true)
	})
	it('elementTranslate', () => {
		expect(template.elementTranslate.isSorted()).toBe(true)
	})
	it('unclosingTags', () => {
		expect(template.unclosingTags.isSorted()).toBe(true)
	})
})
