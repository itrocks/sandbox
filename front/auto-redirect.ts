
export default (element: HTMLAnchorElement) => {
	element.addEventListener('click', event => event.stopPropagation())
	setTimeout(() => element.click())
}
