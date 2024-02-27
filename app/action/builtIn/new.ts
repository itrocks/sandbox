import Action from '../../action/action'

export default class New extends Action
{

	html()
	{
		return this.htmlResponse(`<html lang="en">
<head><meta charset="utf-8"><title>HTML new</title></head>
<body>NEW</body>
</html>`
		)
	}

}
