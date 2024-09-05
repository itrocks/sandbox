import { translations } from '../../../locale/translate';
import Template         from '../template';

class TemplateMockTranslate extends Template
{

	async parseVariable(name: string)
	{
		switch (name) {
			case 'name':           return 'value'
			case 'what':           return 'sama'
			case 'valueRecursion': return 'valueExpressed'
			case 'verb':           return 'am'
		}
		return '?'
	}

	tr = (text: string, translateParts: string[] = []) =>
	{
		if (!text.trim()) return ''
		switch (text) {
			case ' $1 ':        return ` ${translateParts[0]} `
			case '$1':          return translateParts[0]
			case '$1 is $2 me': return `${translateParts[0]} will ${translateParts[1]} you`
			case 'a $1 here':   return `some ${translateParts[0]} there`
			case 'am':          return 'are'
			case 'example':     return 'translated'
			case 'I am $1-san': return `You are ${translateParts[0]}-sama`
			case 'I AM $1-$2':  return `You ARE ${translateParts[0]}-${translateParts[1]}`
			case 'I $1 a $2-san': return `You ${translateParts[0]} a ${translateParts[1]}-sama`
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

async function testBuffer(template: Template, source: string, target: string)
{
	expect(await template.parseBuffer(source)).toEqual(target)
	expect(template.getContext()).toEqual(template.getCleanContext())
}

describe('tr', () => {
	const template = new Template
	translations.set('example', 'translated')

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

describe('translateAttribute', () => {
	const template = new TemplateMockTranslate

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
	const template = new TemplateMockTranslate

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
	it('inlineNoTranslate', () => {
		testBuffer(template,
			'<div>I am <code>example</code>-san</div>',
			'<div>You are <code>example</code>-sama</div>')
	})
	it('inlineNoTranslate2', () => {
		testBuffer(template,
			'<div>I <code>am</code> a <code>example</code>-san</div>',
			'<div>You <code>am</code> a <code>example</code>-sama</div>')
	})
	it('inlineTranslate', () => {
		testBuffer(template,
			'<div>I am <b>example</b>-san</div>',
			'<div>You are <b>translated</b>-sama</div>')
	})
	it('inlineTranslate2', () => {
		testBuffer(template,
			'<div>I <b>am</b> a <b>example</b>-san</div>',
			'<div>You <b>are</b> a <b>translated</b>-sama</div>')
	})
	it('inlineYesThenNo', () => {
		testBuffer(template,
			'<div>Text 1</div><code>Text 2</code><div>Text 3</div><code>Text 4</code>',
			'<div>Phrase one</div><code>Text 2</code><div>Phrase three</div><code>Text 4</code>')
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
	it('stackExpressionsAfter', () => {
		testBuffer(template,
			'I {verb} a {{name}Recursion}-san',
			'You am a valueExpressed-sama')
	})
	it('stackExpressionsBefore', () => {
		testBuffer(template,
			'<div>{{name}Recursion} is {verb} me</div>',
			'<div>valueExpressed will am you</div>')
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
	const template = new TemplateMockTranslate

	it('noInYes', () => {
		testBuffer(template,
			'<div>Text 1<address>Text 2</address>Text 3</div>',
			'<div>Phrase one<address>Text 2</address>Phrase three</div>')
	})
	it('yesInNo', () => {
		testBuffer(template,
			'<head><title>Text 2</title></head>',
			'<head><title>Phrase two</title></head>')
	})
	it('noThenYesThenNoThenYes', () => {
		testBuffer(template,
			'<address>Text 1</address><div>Text 2</div><address>Text 3</address><div>Text 4</div>',
			'<address>Text 1</address><div>Phrase two</div><address>Text 3</address><div>Phrase four</div>')
	})
	it('yesThenNoThenYesThenNo', () => {
		testBuffer(template,
			'<div>Text 1</div><address>Text 2</address><div>Text 3</div><address>Text 4</address>',
			'<div>Phrase one</div><address>Text 2</address><div>Phrase three</div><address>Text 4</address>')
	})
})

describe('translateMixes', () => {
	const template = new TemplateMockTranslate

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
	const template = new TemplateMockTranslate

	it('inputSubmitValue', () => {
		testBuffer(template,
			' <input type="submit" value="send"> ',
			' <input type="submit" value="do it!"> ')
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
