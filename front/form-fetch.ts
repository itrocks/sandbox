
export default (form: HTMLFormElement, callback: (response: Response) => void) =>
{
	form.addEventListener('submit', (event: Event) => {
		const form         = event.currentTarget as HTMLFormElement
		const formData     = new FormData(form)
		const searchParams = new URLSearchParams(formData as any)
		const url          = new URL(form.action)
		const fetchOptions: RequestInit = { method: form.method }

		if (form.method.toLowerCase() === 'post') {
			if (form.enctype.toLowerCase() === 'multipart/form-data') {
				fetchOptions.body = formData
			}
			else {
				fetchOptions.body = searchParams
			}
		}
		else {
			url.search = searchParams.toString()
		}

		fetch(url, fetchOptions).then(callback)

		event.preventDefault()
	})
}
