import Action from '../../action/action'
import { displayOf } from '../../view/class/display'
import Need from '../../action/need'
import { propertyNames } from '../../class/reflect'
import { representativeValueOf } from '../../view/class/representative'
import Request from '../../action/request'

const ucFirst = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

@Need('object')
class Output extends Action
{

	run(request: Request): Response
	{
		const object   = request.object
		const output   = displayOf(object) + ' ' + representativeValueOf(object)
		const pageHead = '<html lang="en"><head><meta charset="utf-8"><title>' + ucFirst(output) + '</title></head><body>'
		const pageFoot = '</body></html>'

		const head = '<article class="' + displayOf(object) + ' output" data-id="' + object.id + '">'
		const foot = '</article>'

		const actionList = [
			'<li class="list"><a href="/' + request.route + '/list">close</a></li>',
			'<li class="edit"><a href="/' + request.route + '/edit/' + object.id + '">edit</a></li>',
			'<li class="delete"><a href="/' + request.route + '/delete/' + object.id + '">delete</a></li>'
		]
		const actions = '<ul class="general actions">' + actionList.join('') + '</ul>'

		const propertyList = propertyNames(object).map(property =>
			'<tr class=' + property + '><th>' + property + '</th><td>' + object[property] + '</td></tr>'
		)
		const properties = '<table class="' + displayOf(object) + ' object">' + propertyList.join('') + '</table>'

		const title = '<h2>' + output + '</h2>'

		return this.htmlResponse(pageHead + head + title + actions + properties + foot + pageFoot)
	}

}

export default Output
