import dataSource from '@itrocks/storage'
import Action     from '../../../action/action'
import Need       from '../../../action/need'
import Request    from '../../../action/request'
import tr         from '../../../locale/translate'
import Confirm    from '../confirm/confirm'

@Need('object')
export default class Delete extends Action
{

	async html(request: Request)
	{
		const confirm   = new Confirm()
		const confirmed = confirm.confirmed(request)
		if (!confirmed) {
			return confirm.html(request, tr('Do you confirm deletion') + tr('?') + '\n' + tr('All data will be lost') + '.')
		}
		request = confirmed

		const objects = request.objects
		for (const object of objects) {
			await dataSource().delete(object)
		}
		return this.htmlTemplateResponse({ objects, type: request.type }, request, __dirname + '/delete.html')
	}

	async json(request: Request)
	{
		const objects = request.objects
		for (const object of objects) {
			await dataSource().delete(object)
		}
		return this.jsonResponse(objects)
	}

}
