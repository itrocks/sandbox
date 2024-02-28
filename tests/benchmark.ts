let b
let s = 'salut'

console.time('===')
for (let i = 0; i < 100000000; i ++) {
	s === ''
}
console.timeEnd('===')

console.time('==')
for (let i = 0; i < 100000000; i ++) {
	s == ''
}
console.timeEnd('==')

console.time('length')
for (let i = 0; i < 100000000; i ++) {
	s.length
}
console.timeEnd('length')

console.time('===')
for (let i = 0; i < 100000000; i ++) {
	s === ''
}
console.timeEnd('===')

console.time('==')
for (let i = 0; i < 100000000; i ++) {
	s == ''
}
console.timeEnd('==')

console.time('length')
for (let i = 0; i < 100000000; i ++) {
	s.length
}
console.timeEnd('length')
