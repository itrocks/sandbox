import { Need, NOTHING } from '@itrocks/action'
import { Route }         from '@itrocks/route'
import { Edit }          from '../edit/edit'

@Need(NOTHING)
@Route('/new')
export class New extends Edit
{

}
