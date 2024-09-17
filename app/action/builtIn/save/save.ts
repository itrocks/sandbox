import { createHash } from 'crypto'
import { sep }        from 'path'
import Action         from '../../../action/action'
import Need           from '../../../action/need'
import Request        from '../../../action/request'
import ReflectClass   from '../../../class/reflect'
import dao            from '../../../dao/dao'
import tr             from '../../../locale/translate'
import { passwordOf } from '../../../property/filter/password'
import Template       from '../../../view/html/template'

@Need('?object')
export default class Save extends Action
{

	dataToObject(object: { [index: string]: any }, data: { [index: string]: string })
	{
		const propertyTypes = new ReflectClass(object).propertyTypes
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
					if (passwordOf(object, propertyName)) {
						if (data[propertyName] !== '¤~!~!~!~!~¤') {
							object[propertyName] = createHash('sha512').update(data[propertyName], 'utf8').digest('hex')
						}
						break
					}
					object[propertyName] = data[propertyName]
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
