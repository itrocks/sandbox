import Template from '../template'

const template       = new Template()
template.doTranslate = false
template.parsePath   = (name: string) => ({

	'.': 'dot',

	againValueThing: 'foo',
	array:           ['one', 'two'],
	fooRecursion:    'bar',
	Name:            'Value',
	name:            'value',
	object:          { test: 1 },
	value:           'valuable',
	valueRecursion:  'result',

	"'simple'":                 'simple',
	'"simple"':                 'simple',
	'"escaped}".toUpperCase':   'ESCAPED}',
	"'escaped}'.toUpperCase":   'ESCAPED}',
	'"escaped)".toUpperCase':   'ESCAPED)',
	"'escaped)'.toUpperCase":   'ESCAPED)',
	"'escape\\'d'.toUpperCase": "ESCAPE'D",
	'"escape\\"d".toUpperCase': 'ESCAPE"D'

}[name])

const parseExpression = (expression: string, close: string, finalClose: string = '') => {
	template.setSource(expression)
	template.parseExpression(undefined, close, finalClose)
	return template.getPosition()
}

describe('bad', () => {
	it('close', () => {
		expect(parseExpression('<!--{{name-->', '}', '-->'))
			.toEqual({ index: 13, start: 13, target: 'value' })
		expect(parseExpression('<!--no{real{name-->', '}', '-->'))
			.toEqual({ index: 19, start: 19, target: 'norealvalue' })
		expect(parseExpression('<!--no{real{name{deep-->', '}', '-->'))
			.toEqual({ index: 24, start: 24, target: 'norealnameundefined' })
	})
	it('end', () => {
		expect(parseExpression('{name', '}'))
			.toEqual({ index: 5, start: 1, target: '{' })
		expect(parseExpression('(name', ')'))
			.toEqual({ index: 5, start: 1, target: '(' })
		expect(parseExpression('<!--name', '}', '-->'))
			.toEqual({ index: 8, start: 4, target: '<!--' })
	})
	it('endRecurse', () => {
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
})

describe('condition', () => {
	it('array', () => {
		expect(parseExpression('<!--array-->', '}', '-->'))
			.toEqual({ index: 12, start: 12, target: ['one', 'two'] })
	})
	it('expression1', () => {
		expect(parseExpression('<!--{name}-->', '}', '-->'))
			.toEqual({ index: 13, start: 13, target: 'valuable' })
	})
	it('expression2', () => {
		expect(parseExpression('<!--{name}Recursion-->', '}', '-->'))
			.toEqual({ index: 22, start: 22, target: 'result' })
	})
	it('expressionRecurse', () => {
		expect(parseExpression('<!--{again{Name}Thing}Recursion-->', '}', '-->'))
			.toEqual({ index: 34, start: 34, target: 'bar'})
	})
	it('object', () => {
		expect(parseExpression('<!--object-->', '}', '-->'))
			.toEqual({ index: 13, start: 13, target: { test: 1 } })
	})
	it('value', () => {
		expect(parseExpression('<!--name-->', '}', '-->'))
			.toEqual({ index: 11, start: 11, target: 'value' })
	})
})

describe('cross', () => {
	it('braceInParentheses', () => {
		expect(parseExpression('({name}Recursion)', ')'))
			.toEqual({ index: 1, start: 0, target: '' })
	})
	it('parenthesisInBlock', () => {
		expect(parseExpression('<!--(name)-->', '}', '-->'))
			.toEqual({index: 4, start: 0, target: ''})
	})
	it('parenthesisInBrace', () => {
		expect(parseExpression('{(name)Recursion}', '}'))
			.toEqual({ index: 1, start: 0, target: '' })
	})
})

describe('misc', () => {
	it('targetTransmit', () => {
		template.setSource('{name} transmit {name}{next}', 16, 12, 'done trans')
		template.parseExpression({ name: 'value' }, '}')
		expect(template.getPosition())
			.toEqual({ index: 22, start: 22, target: 'done transmit value' })
	})
})

describe('quotes', () => {
	it('doubleQuote', () => {
		expect(parseExpression('{"simple"}', '}'))
			.toEqual({ index: 10, start: 10, target: 'simple' })
	})
	it('doubleQuoteEscapesBrace', () => {
		expect(parseExpression('{"escaped}".toUpperCase}', '}'))
			.toEqual({ index: 24, start: 24, target: 'ESCAPED}' })
	})
	it('doubleQuoteEscapesParenthesis', () => {
		expect(parseExpression('("escaped)".toUpperCase)', ')'))
			.toEqual({ index: 24, start: 24, target: 'ESCAPED)' })
	})
	it('escapeDoubleQuote', () => {
		expect(parseExpression('("escape\\"d".toUpperCase)', ')'))
			.toEqual({ index: 25, start: 25, target: 'ESCAPE"D' })
	})
	it('escapeSingleQuote', () => {
		expect(parseExpression("('escape\\'d'.toUpperCase)", ')'))
			.toEqual({ index: 25, start: 25, target: "ESCAPE'D" })
	})
	it('singleQuote', () => {
		expect(parseExpression("{'simple'}", '}'))
			.toEqual({ index: 10, start: 10, target: 'simple' })
	})
	it('singleQuoteEscapesBrace', () => {
		expect(parseExpression("{'escaped}'.toUpperCase}", '}'))
			.toEqual({ index: 24, start: 24, target: 'ESCAPED}' })
	})
	it('singleQuoteEscapesParenthesis', () => {
		expect(parseExpression("('escaped)'.toUpperCase)", ')'))
			.toEqual({ index: 24, start: 24, target: 'ESCAPED)' })
	})
})

describe('recurse', () => {
	it('braces', () => {
		expect(parseExpression('{{name}Recursion}', '}'))
			.toEqual({ index: 17, start: 17, target: 'result' })
	})
	it('parentheses', () => {
		expect(parseExpression('((name)Recursion)', ')'))
			.toEqual({ index: 17, start: 17, target: 'result' })
	})
})

describe('script', () => {
	it('ignore', () => {
		expect(parseExpression('{ name }', '}'))
			.toEqual({index: 1, start: 0, target: '' })
	})
})

describe('short', () => {
	it('dot', () => {
		expect(parseExpression('{.}', '}'))
			.toEqual({ index: 3, start: 3, target: 'dot' })
	})
	it('empty', () => {
		expect(parseExpression('{}', '}'))
			.toEqual({ index: 2, start: 2, target: undefined })
	})
})

describe('stop', () => {
	it('block', () => {
		expect(parseExpression('<!--name--> continuation', '}', '-->'))
			.toEqual({ index: 11, start: 11, target: 'value' })
	})
	it('expression', () => {
		expect(parseExpression('{name} continuation', '}'))
			.toEqual({ index: 6, start: 6, target: 'value' })
	})
})

describe('value', () => {
	it('array', () => {
		expect(parseExpression('{array}', '}', '}'))
			.toEqual({ index: 7, start: 7, target: ['one', 'two'] })
	})
	it('object', () => {
		expect(parseExpression('{object}', '}', '}'))
			.toEqual({ index: 8, start: 8, target: { test: 1 } })
	})
	it('string', () => {
		expect(parseExpression('{name}', '}'))
			.toEqual({ index: 6, start: 6, target: 'value' })
		expect(parseExpression('(name)', ')'))
			.toEqual({ index: 6, start: 6, target: 'value' })
	})
})
