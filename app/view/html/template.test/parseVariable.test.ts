import Template from '../template'

describe('parseVariable', () => {
	const template = new Template

	it('empty', async () => {
		expect(await template.parseVariable('', 'data')).toEqual('data')
	})
	it('method', async () => {
		expect(await template.parseVariable('name', { name: () => 'value' })).toEqual('value')
	})
	it('property', async () => {
		expect(await template.parseVariable('name', { name: 'value' })).toEqual('value')
		expect(await template.parseVariable('unknown', { name: 'value' })).toEqual(undefined)
	})
	it('quoted', async () => {
		expect(await template.parseVariable('"name"', { name: 'value' })).toEqual('name')
	})
})
