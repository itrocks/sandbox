import { sep }                    from 'path'
import Action                     from '../../../action/action'
import Need                       from '../../../action/need'
import Request                    from '../../../action/request'
import ReflectClass               from '../../../class/reflect'
import dao                        from '../../../dao/dao'
import tr                         from '../../../locale/translate'
import { applyFilter, UNCHANGED } from '../../../property/filter/filter'
import Template                   from '../../../view/html/template'

@Need('?object')
export default class Save extends Action
{

	dataToObject(object: { [index: string]: any }, data: { [index: string]: string })
	{
		const reflectClass  = new ReflectClass(object)
		const propertyTypes = reflectClass.propertyTypes
		for (const propertyName in propertyTypes) {
			const propertyType = propertyTypes[propertyName]
			switch (propertyType) {
				case 'bigint':
					object[propertyName] = BigInt(data[propertyName])
					break
				case 'boolean':
					object[propertyName] = !['', '0', 'false', 'no', tr('false'), tr('no')].includes(data[propertyName])
					break
				case 'number':
					object[propertyName] = Number(data[propertyName])
					break
				case 'string':
					const value = applyFilter(data[propertyName], reflectClass.type, propertyName, 'html', 'input')
					if (value !== UNCHANGED) {
						object[propertyName] = value
						break
					}
					break
				default:
					object[propertyName] = data[propertyName]
					break
			}
		}
	}

	async html(request: Request)
	{
		const object = request.object ?? new (request.getType())
		this.dataToObject(object, request.request.data)
		await dao.save(object)

		const template    = new Template(object)
		template.included = (request.request.headers['sec-fetch-dest'] === 'empty')
		return this.htmlResponse(await template.parseFile(
			__dirname + sep + 'save.html',
			__dirname + sep + '../../../home/output.html'
		))
	}

	async json(request: Request)
	{
		const object = request.object ?? new (request.getType())
		this.dataToObject(object, request.request.data)
		await dao.save(object)
		return this.jsonResponse(object)
	}

}
