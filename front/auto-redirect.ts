
export default function autoRedirect(element: HTMLAnchorElement)
{
	const click = (event: MouseEvent) => event.stopPropagation()
	element.addEventListener('click', click)
	setTimeout(() => {
		element.click()
		element.removeEventListener('click', click)
	})
}
