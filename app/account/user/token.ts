import { randomBytes } from 'node:crypto'
import Store           from '../../dao/store'
import User            from '../user'

@Store('password_reset_token')
export default class Token
{

	date  = new Date()
	token = randomBytes(32).toString('hex')
	user?: User

	constructor(user?: User)
	{
		this.user = user
	}

}
