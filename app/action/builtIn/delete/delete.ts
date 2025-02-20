import { Action }     from '@itrocks/action'
import { Need }       from '@itrocks/action'
import { Request }    from '@itrocks/action-request'
import { Confirm }    from '@itrocks/confirm'
import { Route }      from '@itrocks/route'
import { dataSource } from '@itrocks/storage'
import { tr }         from '@itrocks/translate'

@Need('object')
@Route('/delete')
export class Delete extends Action
{

	async html(request: Request)
	{
		const confirm   = new Confirm()
		const confirmed = confirm.confirmed(request)
		if (!confirmed) {
			return confirm.html(request, tr('Do you confirm deletion') + tr('?') + '\n' + tr('All data will be lost') + '.')
		}
		request = confirmed

		const objects = await request.getObjects()
		for (const object of objects) {
			await dataSource().delete(object)
		}
		return this.htmlTemplateResponse({ objects, type: request.type }, request, __dirname + '/delete.html')
	}

	async json(request: Request)
	{
		const objects = await request.getObjects()
		for (const object of objects) {
			await dataSource().delete(object)
		}
		return this.jsonResponse(objects)
	}

}
