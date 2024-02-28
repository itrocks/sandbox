import '../../expand'

import * as translate from '../../locale/translate'
import Template       from './template'

describe('parseExpression', () => {
	const template       = new Template()
	template.doTranslate = false
	template.parsePath   = (name: string) => ({

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
			case 'send':        return 'do it!'
			case 'Text 1':      return 'Phrase one'
			case 'Text 2':      return 'Phrase two'
			case 'Text 3':      return 'Phrase three'
			case 'Text 4':      return 'Phrase four'
			case 'Text 1 ':     return 'Phrase one '
			case ' Text 3':     return ' Phrase three'
		}
		return '!'
	}

}

function testBuffer(template: Template, source: string, target: string)
{
	expect(template.parseBuffer(source)).toEqual(target)
	expect(template.getContext()).toEqual(template.getCleanContext())
}

describe('translateAttribute', () => {
	const template = new TemplateMockTranslate()

	it('no', () => {
		testBuffer(template,
			'<article class="example"></article>',
			'<article class="example"></article>')
	})
	it('noExpression', () => {
		testBuffer(template,
			'<article class="I am {name}-san"></article>',
			'<article class="I am value-san"></article>')
	})
	it('containsExpression', () => {
		testBuffer(template,
			'<article title="I am {name}-san"></article>',
			'<article title="You are value-sama"></article>')
	})
	it('containsExpressions', () => {
		testBuffer(template,
			'<article title="I AM {name}-{what}"></article>',
			'<article title="You ARE value-sama"></article>')
	})
	it('containsSubExpression', () => {
		testBuffer(template,
			'<article title="I am {{name}Recursion}-san"></article>',
			'<article title="You are valueExpressed-sama"></article>')
	})
	it('isExpression', () => {
		testBuffer(template,
			'<article title="{name}"></article>',
			'<article title="value"></article>')
	})
	it('isSubExpression', () => {
		testBuffer(template,
			'<article title="{{name}Recursion}"></article>',
			'<article title="valueExpressed"></article>')
	})
	it('pureText', () => {
		testBuffer(template,
			'<article title="example"></article>',
			'<article title="translated"></article>')
	})
})

describe('translateBlock', () => {
	const template = new TemplateMockTranslate()

	it('blockComment', () => {
		testBuffer(template,
			'<body>Text 1<!-- comment 1 -->Text 2<!-- comment 2 -->Text 3</body>',
			'<body>Phrase one<!-- comment 1 -->Phrase two<!-- comment 2 -->Phrase three</body>')
	})
	it('blockExpression', () => {
		testBuffer(template,
			'<body>Text 1 <!--BEGIN-->Text 2<!--END--> Text 3</body>',
			'<body>Phrase one Phrase two Phrase three</body>')
	})
	it('containsExpression', () => {
		testBuffer(template,
			'<head><title>I am {name}-san</title></head>',
			'<head><title>You are value-sama</title></head>')
	})
	it('containsSubExpression', () => {
		testBuffer(template,
			'<head><title>I am {{name}Recursion}-san</title></head>',
			'<head><title>You are valueExpressed-sama</title></head>')
	})
	it('isExpression', () => {
		testBuffer(template,
			'<head><title>{name}</title></head>',
			'<head><title>value</title></head>')
	})
	it('isSubExpression', () => {
		testBuffer(template,
			'<head><title>{{name}Recursion}</title></head>',
			'<head><title>valueExpressed</title></head>')
	})
	it('multipleBlocks', () => {
		testBuffer(template,
			'<body><header>Text 1</header><main>Text 2</main><footer>Text 3</footer></body>',
			'<body><header>Phrase one</header><main>Phrase two</main><footer>Phrase three</footer></body>')
	})
	it('sameBlocks', () => {
		testBuffer(template,
			'<ul><li>Text 1</li><li>Text 2</li><li>Text 3</li></ul>',
			'<ul><li>Phrase one</li><li>Phrase two</li><li>Phrase three</li></ul>')
	})
	it('simple', () => {
		testBuffer(template,
			'<head><title>example</title></head>',
			'<head><title>translated</title></head>')
	})
	it('unclosingElements', () => {
		testBuffer(template,
			'Text 1<hr>Text 2<hr>Text 3',
			'Phrase one<hr>Phrase two<hr>Phrase three')
	})
	it('unclosingElementsIn', () => {
		testBuffer(template,
			'<div>Text 1<hr>Text 2<hr>Text 3</div>',
			'<div>Phrase one<hr>Phrase two<hr>Phrase three</div>')
	})
	it('verySimple', () => {
		testBuffer(template,
			'<title>example</title>',
			'<title>translated</title>')
	})
})

describe('translateBlockYesNo', () => {
	const template = new TemplateMockTranslate()

	it('noInYes', () => {
		testBuffer(template,
			'<div>Text 1<code>Text 2</code>Text 3</div>',
			'<div>Phrase one<code>Text 2</code>Phrase three</div>')
	})
	it('yesInNo', () => {
		testBuffer(template,
			'<head><title>Text 2</title></head>',
			'<head><title>Phrase two</title></head>')
	})
	it('yesThenNo', () => {
		testBuffer(template,
			'<div>Text 1</div><code>Text 2</code><div>Text 3</div><code>Text 4</code>',
			'<div>Phrase one</div><code>Text 2</code><div>Phrase three</div><code>Text 4</code>')
	})
})

describe('translateMixes', () => {
	const template = new TemplateMockTranslate()

	it('attributeExpressionBlockExpression', () => {
		testBuffer(template,
			'<article title="I am {name}-san">a {name} here</article>',
			'<article title="You are value-sama">some value there</article>')
	})
	it('attributeExpressionBlockExpressionInBlock', () => {
		testBuffer(template,
			'<main><article title="I am {name}-san">a {name} here</article></main>',
			'<main><article title="You are value-sama">some value there</article></main>'
		)
	})
	it('attributeExpressionBlockInBlock', () => {
		testBuffer(template,
			'<main><article title="I am {name}-san"></article></main>',
			'<main><article title="You are value-sama"></article></main>')
	})
})

describe('translateSpecials', () => {
	const template = new TemplateMockTranslate()

	it('inputSubmitValue', () => {
		testBuffer(template,
			'<input type="submit" value="send">',
			'<input type="submit" value="do it!">')
	})
	it('inputValue', () => {
		testBuffer(template,
			'<input value="send">',
			'<input value="send">')
	})
	it('inputValueSubmit', () => {
		testBuffer(template,
			'<input value="send" type="submit">',
			'<input value="send" type="submit">')
	})
	it('lockAddress', () => {
		testBuffer(template,
			'<address>Text 1<div>Text 2</div>Text 3</address>Text 4',
			'<address>Text 1<div>Text 2</div>Text 3</address>Phrase four')
	})
	it('unlockAddress', () => {
		testBuffer(template,
			'<div>Text 1<address>Text 1<div>Text 2</div>Text 3</address>Text 4</div>',
			'<div>Phrase one<address>Text 1<div>Text 2</div>Text 3</address>Phrase four</div>')
	})
})
