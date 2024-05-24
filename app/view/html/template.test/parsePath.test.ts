import Template from '../template';

const template = new Template
template.parseVariable = (variable: string, data: any): any =>
{
	return (variable === '')
		? data
		: (data[variable] ?? '!')
}

describe('parsePath', () => {
	it('dot', async () => {
		expect(await template.parsePath('.', 'data')).toEqual('data')
	})
	it('empty', async () => {
		expect(await template.parsePath('', 'data')).toEqual(undefined)
	})
	it('member', async () => {
		expect(await template.parsePath('object.name', { object: { name: 'value' } })).toEqual('value')
	})
	it('variable', async () => {
		expect(await template.parsePath('name', { name: 'value' })).toEqual('value')
	})
})
