
class Template
{

	data: any

	file: string

	protected index = 0

	protected source = ''

	protected target = ''

	constructor(file: string, data: any)
	{
		this.data = data
		this.file = file
	}

	parseBuffer(source: string): string
	{
		this.index  = 0
		this.source = source
		this.target = ''
		this.parseVar()
		return this.target
	}

	async parseFile(): Promise<string>
	{
		return Bun.file(this.file).text().then(source => this.parseBuffer(source))
	}

	protected parseVar()
	{
		let   accepts_parenthesis = false
		let   stack: Array<{ close: string, start: number }> = []
		let   start  = 0
		let   close  = ''
		let   index  = 0
		const source = this.source
		const length = source.length
		while (index < length) {
			const char = source[index]

			if (
				(char === '{')
				&& source[index + 1].match(/[a-z@%A-Z0-9]/)
			) {
				index ++
				stack.push({ close: close, start: start })
				close = '}'
				start = index
				continue
			}

			if (
				(char === '<')
				&& (source.substring(index, index + 4) === '<!--')
				&& source[index + 4].match(/[a-z@%A-Z0-9]/)
			) {
				index += 4
				stack.push({ close: close, start: start })
				close = '-->'
				start = index
				continue
			}

			if (
				(char === 'h')
				&& (source.substring(index, index + 6) === 'href="')
			) {
				index += 6
				stack.push({ close: close, start: start })
				close = '"'
				start = index
				accepts_parenthesis = true
				continue
			}

			if (
				(char === '(')
				&& accepts_parenthesis
				&& source[index + 1].match(/[a-z@%A-Z0-9]/)
			) {
				index ++
				stack.push({ close: close, start: start })
				close = ')'
				start = index
				continue
			}

			if (
				close.startsWith(char)
				&& (source.substring(index, index + close.length) === close)
			) {
				let expr = source.substring(start, index)
				console.log('evaluate', expr, 'after', close)
				index += close.length
				if (close === '"') {
					accepts_parenthesis = false
				}
				({ close, start } = stack.pop() ?? { close: '', start: 0 })
				continue
			}

			index ++
		}
	}

}

export default Template
