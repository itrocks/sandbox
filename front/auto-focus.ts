
type AnyHTMLInputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export default function(element: HTMLFormElement)
{
	const inputs = Array.from(element.querySelectorAll<AnyHTMLInputElement>('input, select, textarea'))
		.filter(
			input => {
				const style = getComputedStyle(input)
				return (input.type !== 'submit')
					&& !input.hasAttribute('readonly')
					&& (style.display !== 'none') && (style.visibility !== 'hidden')
			}
		)
	if (inputs.length) {
		inputs[0].focus()
	}
}
