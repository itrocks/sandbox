
export default function modalForm(form: HTMLFormElement)
{
	const modal = form.closest('#modal')
	if (!modal) return
	form.addEventListener('submit', () => modal.remove())
	form.querySelectorAll('a[href="about:blank"]').forEach(anchor => {
		anchor.addEventListener('click', () => { anchor.closest('#modal')?.remove() })
	})
}
