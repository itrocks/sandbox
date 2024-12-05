
let ol: HTMLOListElement | undefined

export default function breadcrumb(heading: HTMLHeadingElement)
{
	const article = heading.closest<HTMLElement>('main > [data-action]')
	if (!article) return

	if (!ol) ol = document.body.querySelector<HTMLOListElement>('ol.breadcrumb') ?? undefined
	if (!ol) return

	const anchor = document.createElement('a')
	anchor.setAttribute('href', window.location.href)
	anchor.setAttribute('target', 'main')
	anchor.textContent = heading.textContent

	const action = (article.dataset.action === 'list') ? 'list' : 'view'

	if (action === 'list') {
		ol.querySelector<HTMLLIElement>(`li[data-action=view]`)?.remove()
	}

	const li = ol.querySelector<HTMLLIElement>(`li[data-action=${action}]`) ?? document.createElement('li')
	li.innerHTML = ''
	li.appendChild(anchor)
	li.setAttribute('data-action', action)

	if (!li.parentElement) {
		ol.appendChild(li)
	}
}
