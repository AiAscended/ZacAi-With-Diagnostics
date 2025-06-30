export class BasicArithmetic {
  static add(a: number, b: number): number {
    return a + b
  }

  static subtract(a: number, b: number): number {
    return a - b
  }

  static multiply(a: number, b: number): number {
    return a * b
  }

  static divide(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero")
    return a / b
  }

  static power(base: number, exponent: number): number {
    return Math.pow(base, exponent)
  }

  static sqrt(n: number): number {
    if (n < 0) throw new Error("Cannot calculate square root of negative number")
    return Math.sqrt(n)
  }

  static factorial(n: number): number {
    if (n < 0) throw new Error("Factorial of negative number is undefined")
    if (n === 0 || n === 1) return 1

    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
  }

  static gcd(a: number, b: number): number {
    a = Math.abs(a)
    b = Math.abs(b)

    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }

  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b)
  }

  static isPrime(n: number): boolean {
    if (n < 2) return false
    if (n === 2) return true
    if (n % 2 === 0) return false

    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false
    }
    return true
  }

  static fibonacci(n: number): number {
    if (n < 0) throw new Error("Fibonacci of negative number is undefined")
    if (n === 0) return 0
    if (n === 1) return 1

    let a = 0,
      b = 1
    for (let i = 2; i <= n; i++) {
      const temp = a + b
      a = b
      b = temp
    }
    return b
  }

  static percentage(value: number, total: number): number {
    if (total === 0) throw new Error("Cannot calculate percentage with zero total")
    return (value / total) * 100
  }

  static compound(principal: number, rate: number, time: number, frequency = 1): number {
    return principal * Math.pow(1 + rate / frequency, frequency * time)
  }
}
