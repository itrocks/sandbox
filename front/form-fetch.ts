
export function formFetch(form: HTMLFormElement, action?: string, init: RequestInit = {})
{
	const formData     = new FormData(form)
	const searchParams = new URLSearchParams(formData as any)
	const url          = new URL(action ?? form.action)

	if (!init.method) {
		init.method = form.method
	}
	if (init.method.toLowerCase() === 'post') {
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
	form:     HTMLFormElement,
	callback: (response: Response) => void,
	init:     RequestInit = {}
) {
	form.addEventListener('submit', (event: Event) => {
		const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | HTMLInputElement | null
		formFetch(event.currentTarget as HTMLFormElement, submitter?.formAction, init).then(callback)
		event.preventDefault()
	})
}
