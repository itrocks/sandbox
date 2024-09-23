import Template from '../template';

describe('parseVars', () => {
	const template = new Template({
		id1:     1,
		numLoop: [1, 2],
		one:     'found'
	})
	template.doTranslate = false

	it('conditionFalse', async () => {
		template.setSource('<article data-id="{?id0}" data-another="{one}"></article>')
		expect(await template.parseVars()).toEqual('<article data-another="found"></article>')
	})
	it('conditionTrue', async () => {
		template.setSource('<article data-id="{?id1}" data-another="{one}"></article>')
		expect(await template.parseVars()).toEqual('<article data-id="1" data-another="found"></article>')
	})
	it('empty', async () => {
		template.setSource('')
		expect(await template.parseVars()).toEqual('')
	})
	it('numLoop', async () => {
		template.setSource(`
			<ul>
				<!--numLoop-->
				<li>Hello{.}</li>
				<!--end-->
			</ul>
		`)
		expect(await template.parseVars()).toEqual(`
			<ul>
				<li>Hello1</li>
				<li>Hello2</li>
			</ul>
		`)
	})
})
