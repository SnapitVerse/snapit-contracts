import { Price, Token } from '@uniswap/sdk-core'
import { TickMath } from '@uniswap/v3-sdk'
import { promises as fs } from 'fs'
import JSBI from 'jsbi'

export async function updateEnv(field: string, value: string): Promise<void> {
  const envPath = 'scripts/.temp.env'
  const fieldString = field.toUpperCase()
  try {
    console.log(process.cwd())
    // Read the existing content of the .env file
    let content = await fs.readFile(envPath, 'utf-8')

    // Check if POOL_ADDRESS line exists
    const regex = new RegExp(`^${fieldString}=.*`, 'm')
    if (regex.test(content)) {
      // Replace the existing POOL_ADDRESS value
      content = content.replace(regex, `${fieldString}=${value}`)
    } else {
      // If POOL_ADDRESS line does not exist, append it
      content += `${fieldString}=${value}\n`
    }

    // Write the modified content back to the .env file
    await fs.writeFile(envPath, content)
    console.log('POOL_ADDRESS updated in .env file successfully.')
  } catch (error) {
    console.error('Failed to update POOL_ADDRESS in .env file:', error)
  }
}

export function encodeSqrtRatioX96(amount1: BigInt, amount0: BigInt) {
  var numerator = JSBI.leftShift(JSBI.BigInt(amount1), JSBI.BigInt(192))
  var denominator = JSBI.BigInt(amount0)
  var ratioX192 = JSBI.divide(numerator, denominator)
  return sqrt(ratioX192)
}

function sqrt(value: JSBI) {
  !JSBI.greaterThanOrEqual(value, ZERO)
    ? process.env.NODE_ENV !== 'production'
      ? invariant(false, 'NEGATIVE')
      : invariant(false)
    : void 0 // rely on built in sqrt if possible

  if (JSBI.lessThan(value, MAX_SAFE_INTEGER)) {
    return JSBI.BigInt(Math.floor(Math.sqrt(JSBI.toNumber(value))))
  }

  var z
  var x
  z = value
  x = JSBI.add(JSBI.divide(value, TWO), ONE)

  while (JSBI.lessThan(x, z)) {
    z = x
    x = JSBI.divide(JSBI.add(JSBI.divide(value, x), x), TWO)
  }

  return z
}

var MAX_SAFE_INTEGER = /*#__PURE__*/ JSBI.BigInt(Number.MAX_SAFE_INTEGER)
var ZERO = /*#__PURE__*/ JSBI.BigInt(0)
var ONE = /*#__PURE__*/ JSBI.BigInt(1)
var TWO = /*#__PURE__*/ JSBI.BigInt(2)

const isProduction: boolean = process.env.NODE_ENV === 'production'
const prefix: string = 'Invariant failed'

// Throw an error if the condition fails
// Strip out error messages for production
// > Not providing an inline default argument for message as the result is smaller
export default function invariant(
  condition: any,
  // Can provide a string, or a function that returns a string for cases where
  // the message takes a fair amount of effort to compute
  message?: string | (() => string)
): asserts condition {
  if (condition) {
    return
  }
  // Condition not passed

  // In production we strip the message but still throw
  if (isProduction) {
    throw new Error(prefix)
  }

  // When not in production we allow the message to pass through
  // *This block will be removed in production builds*

  const provided: string | undefined =
    typeof message === 'function' ? message() : message

  // Options:
  // 1. message provided: `${prefix}: ${provided}`
  // 2. message not provided: prefix
  const value: string = provided ? `${prefix}: ${provided}` : prefix
  throw new Error(value)
}

var Q96 = /*#__PURE__*/ JSBI.exponentiate(
  /*#__PURE__*/ JSBI.BigInt(2),
  /*#__PURE__*/ JSBI.BigInt(96)
)

var Q192 = /*#__PURE__*/ JSBI.exponentiate(Q96, /*#__PURE__*/ JSBI.BigInt(2))

export function tickToPrice(baseToken: Token, quoteToken: Token, tick: number) {
  var sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)
  var ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96)
  return baseToken.sortsBefore(quoteToken)
    ? new Price(baseToken, quoteToken, Q192.toString(), ratioX192.toString())
    : new Price(baseToken, quoteToken, ratioX192.toString(), Q192.toString())
}

export function priceToClosestTick(price: any) {
  var sorted = price.baseCurrency.sortsBefore(price.quoteCurrency)
  var sqrtRatioX96 = sorted
    ? encodeSqrtRatioX96(price.numerator, price.denominator)
    : encodeSqrtRatioX96(price.denominator, price.numerator)
  var tick = TickMath.getTickAtSqrtRatio(sqrtRatioX96)
  var nextTickPrice = tickToPrice(
    price.baseCurrency,
    price.quoteCurrency,
    tick + 1
  )

  if (sorted) {
    if (!price.lessThan(nextTickPrice)) {
      tick++
    }
  } else {
    if (!price.greaterThan(nextTickPrice)) {
      tick++
    }
  }

  return tick
}
