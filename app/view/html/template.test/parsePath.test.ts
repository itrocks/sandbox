import Template from '../template';

const template = new Template()
template.parseVariable = (variable: string, data: any): any =>
{
	return (variable === '')
		? data
		: (data[variable] ?? '!')
}

describe('parsePath', () => {
	it('dot', () => {
		expect(template.parsePath('.', 'data')).toEqual('data')
	})
	it('empty', () => {
		expect(template.parsePath('', 'data')).toEqual(undefined)
	})
	it('member', () => {
		expect(template.parsePath('object.name', { object: { name: 'value' } })).toEqual('value')
	})
	it('variable', () => {
		expect(template.parsePath('name', { name: 'value' })).toEqual('value')
	})
})
