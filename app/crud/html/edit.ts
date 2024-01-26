import Action                    from '../../action/action'
import Need                      from '../../action/need'
import Request                   from '../../action/request'
import Response                  from '../../server/response'
import { displayOf }             from '../../view/class/display'
import { representativeValueOf } from '../../view/class/representative'

@Need('object')
export default class Edit extends Action
{

	run(request: Request): Response
	{
		const object     = request.object
		const mainTitle = `Edit ${displayOf(object)} ${representativeValueOf(object)}`
		const pageHead  = `<html lang="en">
<head><meta charset="utf-8"><title>${mainTitle}</title></head>
<body>`
		const pageFoot  = `
</body>
</html>`

		const head = `<article class="${displayOf(object)} edit" data-id="${object.id}">`
		const foot = '</article>'

		const title = `<h2>${mainTitle}</h2>`

		return this.htmlResponse(pageHead + head + title + foot + pageFoot)
	}

}
