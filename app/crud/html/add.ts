import Action from '../../action/action'

class Add extends Action
{

	run(): Response
	{
		return this.htmlResponse(
			'<html lang="en"><head><meta charset="utf-8"><title>HTML add</title></head><body>ADD</body></html>'
		)
	}

}

export default Add
