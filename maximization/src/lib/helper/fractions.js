export function toFraction(decimal, tolerance = 1.0E-10) {
  if (Number.isInteger(decimal)) return decimal.toString()

  let numerator = 1
  let denominator = 1
  let lower_n = 0
  let lower_d = 1
  let upper_n = 1
  let upper_d = 0

  while (true) {
    const mediant_n = lower_n + upper_n
    const mediant_d = lower_d + upper_d
    const mediant = mediant_n / mediant_d

    if (Math.abs(mediant - decimal) < tolerance) {
      numerator = mediant_n
      denominator = mediant_d
      break
    } else if (mediant < decimal) {
      lower_n = mediant_n
      lower_d = mediant_d
    } else {
      upper_n = mediant_n
      upper_d = mediant_d
    }
  }

  return `${numerator}/${denominator}`
}
