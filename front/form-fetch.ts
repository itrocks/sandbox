
export function formFetch(form: HTMLFormElement, action?: string, init: RequestInit = {})
{
	const formData     = new FormData(form)
	const searchParams = new URLSearchParams(formData as any)
	const url          = new URL(action ?? form.action)

	if (!init.method) {
		init.method = form.getAttribute('data-method') ?? ''
		if (!init.method) {
			init.method = form.method
		}
	}
	if (['patch', 'post', 'put'].includes(init.method.toLowerCase())) {
		init.body = (form.enctype.toLowerCase() === 'multipart/form-data')
			? formData
			: searchParams
	}
	else {
		url.search = searchParams.toString()
	}

	return fetch(url, init)
}
export default formFetch

export function formFetchOnSubmit(
	element:     HTMLButtonElement | HTMLFormElement | HTMLInputElement,
	setResponse: (response: Response, targetString: string, form: HTMLFormElement) => void,
	init:        RequestInit = {}
) {
	const form = element instanceof HTMLFormElement ? element : element.form
	if (!form) return
	form.addEventListener('submit', event => {
		const submitter = event.submitter
		if (submitter !== element) return
		if (!(submitter instanceof HTMLButtonElement) && !(submitter instanceof HTMLInputElement)) return
		event.preventDefault()
		formFetch(event.currentTarget as HTMLFormElement, submitter.formAction, init)
			.then(response => setResponse(response, submitter.formTarget ?? form.target, form))
	})
}
