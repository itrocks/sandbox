
export default (element: HTMLAnchorElement) => {
	setTimeout(() => {
		if (!element.closest('body')) return
		element.dataset.stopPropagation = '1'
		element.click()
	})
}
