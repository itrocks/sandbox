
export default function collapse(element: HTMLElement, closestSelector = '')
{
	element.addEventListener('click', function() {
		const nav      = (closestSelector.length ? this.closest(closestSelector) : null) ?? this.parentElement ?? this
		const navClass = nav.classList
		if (navClass.contains('collapse')) {
			navClass.remove('collapse')
		}
		else {
			navClass.add('collapse')
		}
	})
}
