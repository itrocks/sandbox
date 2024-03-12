import Action  from '../../../action/action'
import Need    from '../../../action/need'
import Request from '../../../action/request'
import dump    from '../../../debug/dump'

@Need('objects')
export default class Delete extends Action
{

	html(request: Request)
	{
		return this.htmlResponse(`<html lang="en">
<head><meta charset="utf-8"><title>HTML delete</title></head>
<body>${dump(request.objects)}</body>
</html>`)
	}

	json(request: Request)
	{
		return this.jsonResponse(request.objects)
	}

}
