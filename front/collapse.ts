
export default function collapse(element: HTMLElement, closestSelector = '')
{
	const anchors = document.body.querySelectorAll('.app.menu a')

	anchors.forEach(anchor => anchor.addEventListener('click', () => {
		if (window.innerWidth <= 600) {
			element.click()
		}
	}))

	const closestElement = (element: HTMLElement) =>
		(closestSelector.length ? element.closest(closestSelector) : null) ?? element.parentElement ?? element

	element.addEventListener('click', function() {
		const nav      = closestElement(this)
		const navClass = nav.classList
		if (navClass.contains('collapse')) {
			navClass.remove('collapse')
		}
		else {
			navClass.add('collapse')
		}
	})

	if (window.innerWidth <= 600) {
		element.click()
	}
}
