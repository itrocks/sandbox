import '../../expand'

import * as translate from '../../locale/translate'
import Template       from './template'

describe('parseExpression', () => {
	const template     = new Template()
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
	const template           = new Template()
	template.doTranslate     = false
	template.parseExpression = () => ({ index: 0, start: 0, target: '' })

	it('empty', () => {
		template.setSource('')
		expect(template.parseVars()).toEqual('')
	})
})

describe('tr', () => {
	const template = new Template()
	jest.spyOn(translate, 'tr').mockImplementation((text: string) => {
		switch (text) {
			case 'example': return 'translated'
		}
		return '!'
	})

	it('simple', () => {
		expect(template.tr('example')).toEqual('translated')
	})
	it('spacesAfter',() => {
		expect(template.tr('example \n\t  ')).toEqual('translated \n\t  ')
	})
	it('spacesAround', () => {
		expect(template.tr(' \n\t  example \n\t  ')).toEqual(' \n\t  translated \n\t  ')
	})
	it('spacesBefore', () => {
		expect(template.tr(' \n\t  example')).toEqual(' \n\t  translated')
	})
})

class TemplateMockTranslate extends Template
{

	parseVariable(name: string)
	{
		switch (name) {
			case 'name':           return 'value'
			case 'what':           return 'sama'
			case 'valueRecursion': return 'valueExpressed'
		}
		return '?'
	}

	tr = (text: string, translateParts: string[] = []) =>
	{
		if (!text.trim()) return ''
		switch (text) {
			case 'a $1 here':   return `some ${translateParts[0]} there`
			case 'example':     return 'translated'
			case 'I am $1-san': return `You are ${translateParts[0]}-sama`
			case 'I AM $1-$2':  return `You ARE ${translateParts[0]}-${translateParts[1]}`
			case 'Text 1':      return 'Phrase one'
			case 'Text 2':      return 'Phrase two'
			case 'Text 3':      return 'Phrase three'
			case 'Text 1 ':     return 'Phrase one '
			case ' Text 3':     return ' Phrase three'
		}
		return '!'
	}

}

describe('translateAttribute', () => {
	const template = new TemplateMockTranslate()

	it('no', () => {
		expect(template.parseBuffer('<article class="example"></article>'))
			.toEqual('<article class="example"></article>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('noExpression', () => {
		expect(template.parseBuffer('<article class="I am {name}-san"></article>'))
			.toEqual('<article class="I am value-san"></article>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('containsExpression', () => {
		expect(template.parseBuffer('<article title="I am {name}-san"></article>'))
			.toEqual('<article title="You are value-sama"></article>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('containsExpressions', () => {
		expect(template.parseBuffer('<article title="I AM {name}-{what}"></article>'))
			.toEqual('<article title="You ARE value-sama"></article>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('containsSubExpression', () => {
		expect(template.parseBuffer('<article title="I am {{name}Recursion}-san"></article>'))
			.toEqual('<article title="You are valueExpressed-sama"></article>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('isExpression', () => {
		expect(template.parseBuffer('<article title="{name}"></article>'))
			.toEqual('<article title="value"></article>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('isSubExpression', () => {
		expect(template.parseBuffer('<article title="{{name}Recursion}"></article>'))
			.toEqual('<article title="valueExpressed"></article>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('pureText', () => {
		expect(template.parseBuffer('<article title="example"></article>'))
			.toEqual('<article title="translated"></article>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
})

describe('translateBlock', () => {
	const template = new TemplateMockTranslate()

	it('blockComment', () => {
		expect(template.parseBuffer('<body>Text 1<!-- comment 1 -->Text 2<!-- comment 2 -->Text 3</body>'))
			.toEqual('<body>Phrase one<!-- comment 1 -->Phrase two<!-- comment 2 -->Phrase three</body>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('blockExpression', () => {
		expect(template.parseBuffer('<body>Text 1 <!--BEGIN-->Text 2<!--END--> Text 3</body>'))
			.toEqual('<body>Phrase one Phrase two Phrase three</body>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('containsExpression', () => {
		expect(template.parseBuffer('<head><title>I am {name}-san</title></head>'))
			.toEqual('<head><title>You are value-sama</title></head>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('containsSubExpression', () => {
		expect(template.parseBuffer('<head><title>I am {{name}Recursion}-san</title></head>'))
			.toEqual('<head><title>You are valueExpressed-sama</title></head>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('isExpression', () => {
		expect(template.parseBuffer('<head><title>{name}</title></head>'))
			.toEqual('<head><title>value</title></head>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('isSubExpression', () => {
		expect(template.parseBuffer('<head><title>{{name}Recursion}</title></head>'))
			.toEqual('<head><title>valueExpressed</title></head>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('multipleBlocks', () => {
		expect(template.parseBuffer('<body><header>Text 1</header><main>Text 2</main><footer>Text 3</footer></body>'))
			.toEqual('<body><header>Phrase one</header><main>Phrase two</main><footer>Phrase three</footer></body>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('sameBlocks', () => {
		expect(template.parseBuffer('<ul><li>Text 1</li><li>Text 2</li><li>Text 3</li></ul>'))
			.toEqual('<ul><li>Phrase one</li><li>Phrase two</li><li>Phrase three</li></ul>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('simple', () => {
		expect(template.parseBuffer('<head><title>example</title></head>'))
			.toEqual('<head><title>translated</title></head>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
})

describe('translateMixes', () => {
	const template = new TemplateMockTranslate()

	it('attributeExpressionBlockExpression', () => {
		const buffer = '<article title="I am {name}-san">a {name} here</article>'
		expect(template.parseBuffer(buffer))
			.toEqual('<article title="You are value-sama">some value there</article>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('attributeExpressionBlockExpressionInBlock', () => {
		const buffer = '<main><article title="I am {name}-san">a {name} here</article></main>'
		expect(template.parseBuffer(buffer))
			.toEqual('<main><article title="You are value-sama">some value there</article></main>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
	it('attributeExpressionBlockInBlock', () => {
		const buffer = '<main><article title="I am {name}-san"></article></main>'
		expect(template.parseBuffer(buffer))
			.toEqual('<main><article title="You are value-sama"></article></main>')
		expect(template.getContext()).toEqual(template.getCleanContext())
	})
})
