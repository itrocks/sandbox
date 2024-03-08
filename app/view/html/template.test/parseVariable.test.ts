import Template from '../template';

describe('parseVariable', () => {
	const template = new Template()

	it('empty', () => {
		expect(template.parseVariable('', 'data')).toEqual('data')
	})
	it('method', () => {
		expect(template.parseVariable('name', { name: () => 'value' })).toEqual('value')
	})
	it('property', () => {
		expect(template.parseVariable('name', { name: 'value' })).toEqual('value')
		expect(template.parseVariable('unknown', { name: 'value' })).toEqual(undefined)
	})
	it('quoted', () => {
		expect(template.parseVariable('"name"', { name: 'value' })).toEqual('name')
	})
})
