
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

	container.childNodes.forEach(element => {
		if (element.nodeType !== Node.TEXT_NODE) return
		element.remove()
	})

	const input = container.firstElementChild as HTMLInputElement

	const textContent = () => input.value.length ? input.value : ((input.placeholder === '') ? ' ' : input.placeholder)
	const copyTextContent = () => { textNode.textContent = textContent() }

	const textNode = document.createTextNode(textContent())
	container.append(textNode)

	input.addEventListener('change', copyTextContent)
	input.addEventListener('input',  copyTextContent)
}
