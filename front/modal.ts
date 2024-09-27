
export default class ModalForm
{

	constructor(form: HTMLFormElement)
	{
		const modal = form.closest('#modal')
		if (!modal) {
			return
		}
		form.addEventListener('submit', () => {
			(form.closest('#modal') as HTMLElement).innerHTML = ''
		})
	}

}
