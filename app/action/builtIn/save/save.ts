import Action       from '../../../action/action'
import Need         from '../../../action/need'
import Request      from '../../../action/request'
import ReflectClass from '../../../class/reflect'
import dao          from '../../../dao/dao'
import dump         from '../../../debug/dump'
import tr           from '../../../locale/translate'

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
				default:
					object[propertyName] = data[propertyName]
					break
			}
		}
	}

	html(request: Request)
	{
		this.dataToObject(request.object, request.request.data)
		console.log(new ReflectClass(request.object).propertyTypes)
		//dao.save(request.object)
		return this.htmlResponse(`<html lang="en">
<head><meta charset="utf-8"><title>HTML save</title></head>
<body>${dump(request.object)}</body>
</html>`)
	}

	json(request: Request)
	{
		this.dataToObject(request.object, request.request.data)
		//dao.save(request.object)
		return this.jsonResponse(request.object)
	}

}
