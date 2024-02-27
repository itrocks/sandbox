import Template from './template'

describe('parseExpression', () => {
	const template = new Template()
	template.parsePath = (name: string) => ({

		againValueThing: 'foo',
		array:           ['one', 'two'],
		fooRecursion:    'bar',
		Name:            'Value',
		name:            'value',
		object:          { test: 1 },
		value:           'valuable',
		valueRecursion:  'result',

		'"simple"':                 'simple',
		'"escaped}".toUpperCase':   'ESCAPED}',
		"'escaped}'.toUpperCase":   'ESCAPED}',
		'"escaped)".toUpperCase':   'ESCAPED)',
		"'escaped)'.toUpperCase":   'ESCAPED)',
		"'escape\\'d'.toUpperCase": "ESCAPE'D"

	}[name])

	const parseExpression = (expression: string, close: string, finalClose: string = '') => {
		template.setSource(expression)
		template.parseExpression(undefined, close, finalClose)
		return template.getPosition()
	}

	it('badClose', () => {
		expect(parseExpression('<!--{{name-->', '}', '-->'))
			.toEqual({ index: 13, start: 13, target: 'value' })
		expect(parseExpression('<!--no{real{name-->', '}', '-->'))
			.toEqual({ index: 19, start: 19, target: 'norealvalue' })
		expect(parseExpression('<!--no{real{name{deep-->', '}', '-->'))
			.toEqual({ index: 24, start: 24, target: 'norealnameundefined' })
	})
	it('badEnd', () => {
		expect(parseExpression('{name', '}'))
			.toEqual({ index: 5, start: 1, target: '{' })
		expect(parseExpression('(name', ')'))
			.toEqual({ index: 5, start: 1, target: '(' })
		expect(parseExpression('<!--name', '}', '-->'))
			.toEqual({ index: 8, start: 4, target: '<!--' })
	})
	it('badEndRecurse', () => {
		expect(parseExpression('{no{name', '}'))
			.toEqual({ index: 8, start: 4, target: '{no{' })
		expect(parseExpression('(no(name', ')'))
			.toEqual({ index: 8, start: 4, target: '(no(' })
		expect(parseExpression('<!--no{name', '}', '-->'))
			.toEqual({ index: 11, start: 7, target: '<!--no{' })
		expect(parseExpression('<!--no{ka{name', '}', '-->'))
			.toEqual({ index: 14, start: 10, target: '<!--no{ka{' })
		expect(parseExpression('<!--no{ka{name{deep', '}', '-->'))
			.toEqual({ index: 19, start: 15, target: '<!--no{ka{name{' })
		expect(parseExpression('<!--no{ka-{name}', '}', '-->'))
			.toEqual({ index: 16, start: 16, target: '<!--no{ka-value' })
	})
	it('beginScript', () => {
		expect(parseExpression('{ name }', '}'))
			.toEqual({ index: 1, start: 0, target: '' })
	})
	it('conditionExpression1', () => {
		expect(parseExpression('<!--{name}-->', '}', '-->'))
			.toEqual({ index: 13, start: 13, target: 'valuable' })
	})
	it('conditionExpression2', () => {
		expect(parseExpression('<!--{name}Recursion-->', '}', '-->'))
			.toEqual({ index: 22, start: 22, target: 'result'})
	})
	it('conditionExpressionRecurse', () => {
		expect(parseExpression('<!--{again{Name}Thing}Recursion-->', '}', '-->'))
			.toEqual({ index: 34, start: 34, target: 'bar'})
	})
	it('conditionArray', () => {
		expect(parseExpression('<!--array-->', '}', '-->'))
			.toEqual({ index: 12, start: 12, target: ['one', 'two'] })
	})
	it('conditionObject', () => {
		expect(parseExpression('<!--object-->', '}', '-->'))
			.toEqual({ index: 13, start: 13, target: { test: 1 } })
	})
	it('conditionValue', () => {
		expect(parseExpression('<!--name-->', '}', '-->'))
			.toEqual({ index: 11, start: 11, target: 'value'})
	})
	it('cross', () => {
		expect(parseExpression('<!--(name)-->', '}', '-->'))
			.toEqual({ index: 4, start: 0, target: ''})
		expect(parseExpression('{(name)Recursion}', '}'))
			.toEqual({ index: 1, start: 0, target: ''})
		expect(parseExpression('({name}Recursion)', ')'))
			.toEqual({ index: 1, start: 0, target: ''})
	})
	it('targetTransmit', () => {
		template.setSource('{name} transmit {name}{next}', 16, 12, 'done trans')
		template.parseExpression({ name: 'value' }, '}')
		expect(template.getPosition())
			.toEqual({ index: 22, start: 22, target: 'done transmit value'})
	})
	it('empty', () => {
		expect(parseExpression('{}', '}'))
			.toEqual({ index: 2, start: 2, target: undefined})
	})
	it('quoted', () => {
		expect(parseExpression('{"simple"}', '}'))
			.toEqual({ index: 10, start: 10, target: 'simple'})
		expect(parseExpression('{"escaped}".toUpperCase}', '}'))
			.toEqual({ index: 24, start: 24, target: 'ESCAPED}'})
		expect(parseExpression("{'escaped}'.toUpperCase}", '}'))
			.toEqual({ index: 24, start: 24, target: 'ESCAPED}'})
		expect(parseExpression('("escaped)".toUpperCase)', ')'))
			.toEqual({ index: 24, start: 24, target: 'ESCAPED)'})
		expect(parseExpression("('escaped)'.toUpperCase)", ')'))
			.toEqual({ index: 24, start: 24, target: 'ESCAPED)'})
		expect(parseExpression("('escape\\'d'.toUpperCase)", ')'))
			.toEqual({ index: 25, start: 25, target: "ESCAPE'D"})
	})
	it('recurse', () => {
		expect(parseExpression('{{name}Recursion}', '}'))
			.toEqual({ index: 17, start: 17, target: 'result'})
		expect(parseExpression('((name)Recursion)', ')'))
			.toEqual({ index: 17, start: 17, target: 'result'})
	})
	it('stop', () => {
		expect(parseExpression('{name} continuation', '}'))
			.toEqual({ index: 6, start: 6, target: 'value'})
		expect(parseExpression('<!--name--> continuation', '}', '-->'))
			.toEqual({ index: 11, start: 11, target: 'value'})
	})
	it('valueArray', () => {
		expect(parseExpression('{array}', '}', '-->'))
			.toEqual({ index: 7, start: 7, target: ['one', 'two'] })
	})
	it('valueObject', () => {
		expect(parseExpression('{object}', '}', '-->'))
			.toEqual({ index: 8, start: 8, target: { test: 1 } })
	})
	it('valueString', () => {
		expect(parseExpression('{name}', '}'))
			.toEqual({ index: 6, start: 6, target: 'value'})
		expect(parseExpression('(name)', ')'))
			.toEqual({ index: 6, start: 6, target: 'value'})
	})
})

describe('parsePath', () => {
	const template = new Template()

	it('empty', () => {
		expect(template.parsePath('', {})).toEqual(undefined)
	})
})

describe('parseVariable', () => {
	const template = new Template()
	template.parseExpression = () => ({ index: 0, start: 0, target: '' })

	it('empty', () => {
		expect(template.parseVariable('', {})).toEqual(undefined)
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

describe('parseVars', () => {
	const template = new Template()
	template.parseExpression = () => ({ index: 0, start: 0, target: '' })

	it('empty', () => {
		template.setSource('')
		expect(template.parseVars()).toEqual('')
	})
})
