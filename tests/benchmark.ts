let s = 'salut les copains, ça va bien ? Je fais un texte suffisamment long pour que ce soit intéressant'
for (let n = 0; n < 10; n ++) {
	s += s
}
console.log(s.length)
let c: string

console.time('for index')
const length = s.length
for (let n = 0; n < 1000; n ++)
	for (let i = 0; i < length; i ++)
		c = s[i]
console.timeEnd('for index')

console.time('for char')
for (let n = 0; n < 1000; n ++)
	for (const x of s)
		c = x
console.timeEnd('for char')

console.time('forEach')
for (let n = 0; n < 1000; n ++)
	Array.from(s).forEach(x => c = x)
console.timeEnd('forEach')

console.time('split')
for (let n = 0; n < 1000; n ++)
	s.split('').forEach(x => c = x)
console.timeEnd('split')
