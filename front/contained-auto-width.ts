
export default function containedAutoWidth(container: HTMLElement)
{
	if (['OL', 'UL'].includes(container.nodeName)) {
		for (
			const childContainer
			of Array.from(container.children).filter(childContainer => childContainer instanceof HTMLElement)
		) {
			containedAutoWidth(childContainer)
		}
		return
	}

	const containerStyle = getComputedStyle(container) as CSSStyleDeclaration & { [p: string]: string }

	const input      = container.firstElementChild as HTMLInputElement
	const inputStyle = getComputedStyle(input) as CSSStyleDeclaration & { [p: string]: string }

	const setInputStyle = input.style
	setInputStyle.boxSizing = 'border-box'
	setInputStyle.left      = '0'
	setInputStyle.position  = 'absolute'
	setInputStyle.top       = '0'
	setInputStyle.width     = '100%'

	const setContainerStyle = container.style as CSSStyleDeclaration & { [p: string]: string }

	setContainerStyle.boxSizing = inputStyle.boxSizing
	for (const side of ['Bottom', 'Left', 'Right', 'Top']) {
		const paddingSide     = 'padding' + side
		const borderSideWidth = 'border' + side + 'Width'
		setContainerStyle[paddingSide] = (
			parseFloat(containerStyle[paddingSide])
			+ parseFloat(inputStyle[paddingSide])
			+ parseFloat(inputStyle[borderSideWidth])
		) + 'px'
	}
	setContainerStyle.position   = 'relative'
	setContainerStyle.whiteSpace = 'pre';

	const textContent = () => (input.value === '') ? ((input.placeholder === '') ? ' ' : input.placeholder) : input.value
	const copyTextContent = () => { textNode.textContent = textContent() }

	const textNode = document.createTextNode(textContent())
	container.append(textNode)

	input.addEventListener('change', copyTextContent)
	input.addEventListener('input',  copyTextContent)
}
