import Template from '../template';

describe('parseVars', () => {
	const template = new Template({
		numLoop: [1, 2]
	})
	template.doTranslate = false

	it('empty', () => {
		template.setSource('')
		expect(template.parseVars()).toEqual('')
	})
	it('numLoop', () => {
		template.setSource(`
			<ul>
				<!--numLoop-->
				<li>Hello{.}</li>
				<!--end-->
			</ul>
		`)
		expect(template.parseVars()).toEqual(`
			<ul>
				<li>Hello1</li>
				<li>Hello2</li>
			</ul>
		`)
	})
})
