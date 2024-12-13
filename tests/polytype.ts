// needs: npm i polytype --save-optional
import { classes } from 'polytype'

type ProtoType<T> = T extends { prototype: infer U; } ? U : never;

type IntersectionOf<T extends unknown[]> =
	UnboxedIntersectionOf<{ [key in keyof T]: [T[key]]; }> extends { 0: infer U; } ? U : never;

type UnboxedIntersectionOf<T extends unknown[]> =
	UnionOf<T> extends infer U ?
		(U extends unknown ? (arg: U) => unknown : never) extends (arg: infer V) => unknown ?
			V : never :
		never;

type UnionOf<T extends unknown[]> = T[number];

type Enrich<MainType, ExtraType> = MainType & Omit<ExtraType, keyof MainType>;

interface EnrichMoreProps<MainType, ExtraTypes extends unknown[]>
{
	0: MainType;
	1:
		ExtraTypes extends [infer ExtraHead, ...infer ExtraTail] ?
			EnrichMore<Enrich<MainType, ExtraHead>, ExtraTail> : never;
}

type NonEmptyArray<T> = [T, ...T[]];

type SuperConstructor = abstract new (...args: any) => object;

type MapTupleTypesToOptionalReadonlyConstructorParameters<T extends SuperConstructor[]> =
	{ [key in keyof T]?: ReadonlySuperConstructorParameters<AsSuperConstructor<T[key]>>; };

type ReadonlySuperConstructorParameters<T extends SuperConstructor> =
	Readonly<ConstructorParameters<(new (...args: unknown[]) => unknown) & T>>;

type AsSuperConstructor<T> = Extract<T, SuperConstructor>;

type EnrichMore<MainType, ExtraTypes extends unknown[]> =
	EnrichMoreProps<MainType, ExtraTypes>[ExtraTypes extends [] ? 0 : 1];

type ClusteredConstructor<T extends SuperConstructor[]> =
	{
		readonly prototype: ProtoType<IntersectionOf<T>>;

		new (...args: MapTupleTypesToOptionalReadonlyConstructorParameters<T>):
			ClusteredPrototype<T>;

		new (...args: UnionOf<MapTupleTypesToReadonlySuperConstructorInvokeInfo<T>>[]):
			ClusteredPrototype<T>;
	}
	&
	EnrichMore<SuperConstructorSelector<UnionOf<T>>, T>;

class SuperConstructorSelector<T extends SuperConstructor>
{
	/**
	 * Allows accessing a static property or calling a static method in a specified base class,
	 * eliminating ambiguity when multiple base classes share a property with the same key.
	 *
	 * @param type
	 *
	 * The referenced base class.
	 */
	// @ts-ignore
	protected class<U extends T>(type: U): U;
}

class SuperPrototypeSelector<T extends SuperConstructor>
{
	/**
	 * Allows accessing an instance property or calling an instance method in a specified base
	 * class, eliminating ambiguity when multiple base classes share a property with the same
	 * key.
	 *
	 * @param type
	 *
	 * The referenced base class.
	 */
	// @ts-ignore
	protected class<U extends T>(type: U): InstanceType<U>;
}

export interface SuperConstructorInvokeInfo<T extends SuperConstructor>
{
	/** The base class being referenced. */
	super: T;

	/**
	 * An array specifying the arguments with which the base class constructor should be called.
	 * If undefined, the base class constructor will be called without any arguments.
	 */
	arguments?: ReadonlySuperConstructorParameters<T> | undefined;
}

type MapTupleTypesToReadonlySuperConstructorInvokeInfo<T extends SuperConstructor[]> =
	{ [key in keyof T]: Readonly<SuperConstructorInvokeInfo<AsSuperConstructor<T[key]>>>; };

type ClusteredPrototype<T extends SuperConstructor[]> =
	SuperPrototypeSelector<UnionOf<T>> &
	IntersectionOf<{ [key in keyof T]: InstanceType<T[key]>; }>;

/*
// type completion works with it: missing implementation only
function mix <T extends NonEmptyArray<SuperConstructor>>(...types: T): ClusteredConstructor<T>
{ return types as ClusteredConstructor<T> }
*/

const mix = classes

class Square
{

	constructor(public left: number, public top: number, public width: number, public height: number) {}

}

class Circle
{

	constructor(public centerX: number, public centerY: number, public radius = 1) {}

	get diameter() { return this.radius * 2 }

	set diameter(diameter) { this.radius = diameter / 2 }

	moveTo(centerX: number, centerY: number)
	{
		this.centerX = centerX
		this.centerY = centerY
	}

	reset()
	{
		this.moveTo(0, 0)
		this.radius = 1
	}

	toString()
	{
		return `circle with center (${this.centerX}, ${this.centerY}) and radius ${this.radius}`;
	}

}

class ColoredObject
{
	constructor(public color: string) {}

	static areSameColor(obj1: ColoredObject, obj2: ColoredObject) { return obj1.color === obj2.color }

	paint() { console.log(`painting in ${this.color}`) }

	reset() { this.color = 'white' }

	toString() { return `${this.color} object` }
}

class ColoredCircle extends mix(Circle, ColoredObject) {}

class ColoredSquare extends mix(Square, ColoredObject) {}

class ColoredThing extends mix(ColoredCircle, ColoredSquare) {}

const circle = new ColoredCircle

const square = new ColoredSquare

const thing = new ColoredThing

console.log('same', ColoredObject.areSameColor(circle, square))

console.log('same', ColoredObject.areSameColor(circle, thing))
console.log(thing instanceof ColoredCircle)
console.log(thing instanceof ColoredSquare)
console.log(thing instanceof ColoredThing)

square.left = 10
