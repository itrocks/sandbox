
export function formFetch(form: HTMLFormElement, action?: string, init: RequestInit = {})
{
	const formData     = new FormData(form)
	const searchParams = new URLSearchParams(formData as any)
	const url          = new URL(action ?? form.action)

	init.method = formMethod(form, init)
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
	element:     HTMLButtonElement | HTMLFormElement | HTMLInputElement,
	setResponse: (response: Response, targetString: string, form: HTMLFormElement) => void,
	init:        RequestInit = {}
) {
	const form = (element.form ?? element) as HTMLFormElement
	if (!form || form.formFetchOnSubmit) return
	form.formFetchOnSubmit = true
	form.addEventListener('submit', async event => {
		const submitter = event.submitter
		if (!(submitter instanceof HTMLButtonElement) && !(submitter instanceof HTMLInputElement)) return
		event.preventDefault()
		const action = submitter.getAttribute('formaction') ? submitter.formAction : undefined
		const response = await formFetch(form, action, init)
		setResponse(response, submitter.formTarget ? submitter.formTarget : form.target, form)
	})
}

export function formMethod(form: HTMLFormElement, init: RequestInit = {})
{
	if (!init.method) {
		init.method = form.getAttribute('data-method') ?? ''
		if (!init.method) {
			init.method = form.method
		}
	}
	return init.method
}
