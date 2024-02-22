import ServerRequest from '../server/request'
import Request       from './request'

function pathTuple(path: Partial<Request>)
{
	return [path.route, path.ids, path.action, path.format]
}

describe('parsePath', () => {
	const acceptJson    = { accept: 'application/unknown,application/json' }
	const acceptUnknown = { accept: 'application/unknown' }

	it('deleteActionDefault', () => {
		const path = new Request(new ServerRequest('DELETE', 'https', 'test', '/user/1/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'delete', 'csv'])
	})
	it('deleteActionFormatAccept', () => {
		const path = new Request(new ServerRequest('DELETE', 'https', 'test', '/user/1', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'delete', 'json'])
	})
	it('deleteActionFormatDefault', () => {
		const path = new Request(new ServerRequest('DELETE', 'https', 'test', '/user/1', acceptUnknown)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'delete', 'html'])
	})
	it('deleteExplicit', () => {
		const path = new Request(new ServerRequest('DELETE', 'https', 'test', '/user/1/action/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'action', 'csv'])
	})
	it('deleteFormatAccept', () => {
		const path = new Request(new ServerRequest('DELETE', 'https', 'test', '/user/1/action', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'action', 'json'])
	})
	it('deleteFormatDefault', () => {
		const path = new Request(new ServerRequest('DELETE', 'https', 'test', '/user/1/action', acceptUnknown)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'action', 'html'])
	})
	it('getActionFormatIdAccept', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user/1', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'output', 'json'])
	})
	it('getActionFormatIdDefault', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user/1', acceptUnknown)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'output', 'html'])
	})
	it('getActionFormatNoIdAccept', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', [], 'list', 'json'])
	})
	it('getActionFormatNoIdDefault', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user', acceptUnknown)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', [], 'list', 'html'])
	})
	it('getActionFormatNoIdRoute', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user/action/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', [], 'action', 'csv'])
	})
	it('getActionIdDefault', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user/1/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'output', 'csv'])
	})
	it('getActionNoIdDefault', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', [], 'list', 'csv'])
	})
	it('getExplicit', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user/1,2/merge/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1', '2'], 'merge', 'csv'])
	})
	it('getFormatIdAccept', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user/1/magnify', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'magnify', 'json'])
	})
	it('getFormatIdDefault', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user/1/magnify', acceptUnknown)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'magnify', 'html'])
	})
	it('getFormatNoIdAccept', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user/action', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', [], 'action', 'json'])
	})
	it('getFormatNoIdDefault', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/user/action', acceptUnknown)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', [], 'action', 'html'])
	})
	it('patchActionDefault', () => {
		const path = new Request(new ServerRequest('PATCH', 'https', 'test', '/user/1/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'save', 'csv'])
	})
	it('patchActionFormatAccept', () => {
		const path = new Request(new ServerRequest('PATCH', 'https', 'test', '/user/1', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'save', 'json'])
	})
	it('patchActionFormatDefault', () => {
		const path = new Request(new ServerRequest('PATCH', 'https', 'test', '/user/1', acceptUnknown)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'save', 'html'])
	})
	it('patchExplicit', () => {
		const path = new Request(new ServerRequest('PATCH', 'https', 'test', '/user/1/action/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'action', 'csv'])
	})
	it('patchFormatAccept', () => {
		const path = new Request(new ServerRequest('PATCH', 'https', 'test', '/user/1/action', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'action', 'json'])
	})
	it('patchFormatDefault', () => {
		const path = new Request(new ServerRequest('PATCH', 'https', 'test', '/user/1/action', acceptUnknown)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', ['1'], 'action', 'html'])
	})
	it('postFormatAccept', () => {
		const path = new Request(new ServerRequest('POST', 'https', 'test', '/user', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', [], 'save', 'json'])
	})
	it('postFormatDefault', () => {
		const path = new Request(new ServerRequest('POST', 'https', 'test', '/user', acceptUnknown)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', [], 'save', 'html'])
	})
	it('postFormatRoute', () => {
		const path = new Request(new ServerRequest('POST', 'https', 'test', '/user/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user', [], 'save', 'csv'])
	})
	it('neverDeleteEmpty', () => {
		const path = new Request(new ServerRequest('DELETE', 'https', 'test', '/', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverDeleteNoId', () => {
		const path = new Request(new ServerRequest('DELETE', 'https', 'test', '/user', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverDeleteNoIdActionFormat', () => {
		const path = new Request(new ServerRequest('DELETE', 'https', 'test', '/user/action/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverGetEmpty', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverGetNoAction', () => {
		const path = new Request(new ServerRequest('GET', 'https', 'test', '/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverPatchEmpty', () => {
		const path = new Request(new ServerRequest('PATCH', 'https', 'test', '/', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverPatchNoId', () => {
		const path = new Request(new ServerRequest('PATCH', 'https', 'test', '/user', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverPatchNoIdActionFormat', () => {
		const path = new Request(new ServerRequest('PATCH', 'https', 'test', '/user/action/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverPostAction', () => {
		const path = new Request(new ServerRequest('POST', 'https', 'test', '/user/action/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual(['/user/action', [], 'save', 'csv'])
	})
	it('neverPostEmpty', () => {
		const path = new Request(new ServerRequest('POST', 'https', 'test', '/', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverPostId', () => {
		const path = new Request(new ServerRequest('POST', 'https', 'test', '/user/1', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverPostIdAction', () => {
		const path = new Request(new ServerRequest('POST', 'https', 'test', '/user/1/action', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverPostIdActionFormat', () => {
		const path = new Request(new ServerRequest('POST', 'https', 'test', '/user/1/action/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
	it('neverPostIdFormat', () => {
		const path = new Request(new ServerRequest('POST', 'https', 'test', '/user/1/csv', acceptJson)).parsePath()
		expect(pathTuple(path)).toEqual([undefined, undefined, undefined, undefined])
	})
})
