interface Employee {
	firstName: string
	lastName: string
	salary: number
}

const increaseSalary = (employee: Employee, percent: number) => {
	const amount = employee.salary * (percent / 100)
	employee.salary += amount
}

const employee: Employee = {
	firstName: 'Evelyn',
	lastName: 'Miller',
	salary: 2000
}

increaseSalary(employee, 5)

console.log(employee)

const implicitEmployee = {
	firstName: 'John',
	lastName: 'Riley',
	salary: 2000
}

increaseSalary(implicitEmployee, 5)

console.log(implicitEmployee)
