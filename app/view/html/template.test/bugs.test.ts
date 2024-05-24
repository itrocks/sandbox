import Template from '../template'

describe('translation', () => {
	const template = new Template
	template.tr = (text, parts) => {
		if (parts && text.includes('$2')) {
			return text.replace('$1', parts[0]).replace('$2', parts[1])
		}
		switch (text) {
			case 'search':        return 'recherche'
			case 'make it crash': return 'fait planter ça'
			case 'or not':        return 'ou pas'
			default:              return '!'
		}
	}

	it('translateLabelAttributeAfterLabel', async () => {
		template.setSource(`<label>search</label><label title="or not">make it crash</label>`)
		expect(await template.parseVars()).toEqual(`<label>recherche</label><label title="ou pas">fait planter ça</label>`)
	})

	it('translateInputAttributeAfterLabel', async () => {
		template.setSource(`<label>search</label><input title="make it crash">`)
		expect(await template.parseVars()).toEqual(`<label>recherche</label><input title="fait planter ça">`)
	})
})
