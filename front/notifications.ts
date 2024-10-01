
export class Notification
{

	constructor(element: HTMLElement)
	{
		if (!element.innerHTML.trim().length) {
			element.remove()
			return
		}
		const elements = element.querySelectorAll('.notification')
		const list     = Notifications.instance.list
		for (const notification of (elements.length ? Array.from(elements) : [element])) {
			const li = document.createElement('li')
			notification.classList.remove('notification')
			li.classList.add('new', ...Array.from(notification.classList))
			li.innerHTML = notification.innerHTML
			notification.remove()
			list.prepend(li)
			if (list.children.length > 5) {
				list.lastElementChild?.remove()
			}
			setTimeout(() => li.classList.remove('new'), 7000)
		}
		element.remove()
	}

}
export default Notification

export class Notifications
{
	list: HTMLOListElement | HTMLUListElement
	static instance: Notifications

	constructor(list: HTMLOListElement | HTMLUListElement)
	{
		this.list = list
		Notifications.instance = this
		list.addEventListener('click', event => {
			const element = event.target as HTMLElement
			// show/hide notifications
			if ((element instanceof HTMLOListElement) || (element instanceof HTMLUListElement)) {
				const listClass = element.classList
				listClass.contains('visible') ? listClass.remove('visible') : listClass.add('visible')
				return
			}
			// mark notification as read/unread
			const li      = element.closest('ol > li, ul > li') as HTMLLIElement
			const liClass = li.classList
			if (liClass.contains('read')) {
				liClass.remove('read')
			}
			else {
				liClass.add('read')
				liClass.remove('new')
			}
		})
	}

}
