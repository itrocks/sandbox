
const removeClass = (item: HTMLElement, className: string) => {
	item.classList.remove(className)
	if (!item.classList.length) {
		item.removeAttribute('class')
	}
}

export default function notification(item: HTMLElement)
{
	if (!item.innerHTML.trim().length) {
		item.remove()
		return
	}

	const list = item.parentNode
	if (!list) return

	while (list.children.length > 5) {
		list.lastElementChild?.remove()
	}
	item.classList.add('new')
	setTimeout(() => {
		removeClass(item, 'new')
	}, 7000)
}

export function notifications(list: HTMLOListElement | HTMLUListElement)
{
	list.addEventListener('click', event => {
		const item = event.target as HTMLElement
		// show/hide notifications
		if ((item instanceof HTMLOListElement) || (item instanceof HTMLUListElement)) {
			if (item.classList.contains('visible')) {
				removeClass(item, 'visible')
			}
			else {
				item.classList.add('visible')
			}
			return
		}
		// mark notification as read/unread
		const li = item.closest<HTMLLIElement>('ol > li, ul > li')
		if (!li) return
		const liClass = li.classList
		if (liClass.contains('read')) {
			removeClass(li, 'read')
		}
		else {
			liClass.add('read')
			liClass.remove('new')
		}
	})
}
