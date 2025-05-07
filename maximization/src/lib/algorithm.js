import { toFraction } from "../lib/helper/fractions"


export function solveBigM({ objectiveName, objectiveCoeffs, constraints }) {
  const M = 1000
  const numVars = objectiveCoeffs.length
  const tableaux = []

  const rows = []
  const basis = []
  const cb = []

  // First pass: count total slack and artificial variables
  let slackCount = 0
  let artificialCount = 0
  constraints.forEach(c => {
    if (c.sign === "<=") slackCount++
    if (c.sign === ">=") {
      slackCount++  // surplus
      artificialCount++
    }
    if (c.sign === "=") artificialCount++
  })

  const totalSlack = slackCount
  const totalArtificial = artificialCount

  // Second pass: build aligned tableau rows
  let slackIndex = 0
  let artificialIndex = 0

  constraints.forEach((constraint, idx) => {
    const row = []

    // Original vars
    for (let i = 0; i < numVars; i++) {
      row.push(parseFloat(constraint.coeffs[i]) || 0)
    }

    // Slack/surplus vars
    for (let i = 0; i < totalSlack; i++) {
      row.push(0)
    }

    // Artificial vars
    for (let i = 0; i < totalArtificial; i++) {
      row.push(0)
    }

    // Set appropriate slack/surplus/artificial
    if (constraint.sign === "<=") {
      row[numVars + slackIndex] = 1
      basis.push(`s${slackIndex + 1}`)
      cb.push(0)
      slackIndex++
    }

    if (constraint.sign === ">=") {
      row[numVars + slackIndex] = -1
      row[numVars + totalSlack + artificialIndex] = 1
      basis.push(`a${artificialIndex + 1}`)
      cb.push(-M)
      slackIndex++
      artificialIndex++
    }

    if (constraint.sign === "=") {
      row[numVars + totalSlack + artificialIndex] = 1
      basis.push(`a${artificialIndex + 1}`)
      cb.push(-M)
      artificialIndex++
    }

    // Z and RHS columns
    row.push(0) // Z
    row.push(parseFloat(constraint.rhs) || 0)

    rows.push(row)
  })

  const totalCols = numVars + totalSlack + totalArtificial

  // Build cj: original coeffs, then 0 for slack, -M for artificial, then Z and RHS
  const cj = []
  for (let i = 0; i < numVars; i++) cj.push(parseFloat(objectiveCoeffs[i]) || 0)
  for (let i = 0; i < totalSlack; i++) cj.push(0)
  for (let i = 0; i < totalArtificial; i++) cj.push(-M)
  cj.push(1) // Z
  cj.push(0) // RHS

  // Build headers
  const headers = []
  for (let i = 0; i < numVars; i++) headers.push(`x${i + 1}`)
  for (let i = 0; i < totalSlack; i++) headers.push(`s${i + 1}`)
  for (let i = 0; i < totalArtificial; i++) headers.push(`a${i + 1}`)
  headers.push(objectiveName)
  headers.push("RHS")

  const computeZj = () => {
    const zj = Array(headers.length).fill(0)
    for (let col = 0; col < headers.length; col++) {
      let sum = 0
      for (let row = 0; row < rows.length; row++) {
        sum += cb[row] * rows[row][col]
      }
      zj[col] = +sum.toFixed(2)
    }
    return zj
  }

  const computeZjMinusCj = (zj) =>
    zj.map((z, i) => +(z - cj[i]).toFixed(2))

  const snapshot = (pivotCol = null) => {
    const zj = computeZj()
    const zjMinusCj = computeZjMinusCj(zj)
    const qi = rows.map(row => {
      if (
        pivotCol === null ||
        pivotCol < 0 ||
        pivotCol >= row.length ||
        row[pivotCol] <= 0
      ) return null
      const rhs = row[headers.length - 1]
      if (isNaN(rhs)) return null
      return toFraction(rhs / row[pivotCol])
    })
  
    tableaux.push({
      headers,
      rows: rows.map(r => r.map(n => toFraction(n))),
      basis: [...basis],
      cb: cb.map(toFraction),
      zj: zj.map(toFraction),
      zjMinusCj: zjMinusCj.map(toFraction),
      qi
    })
  }
  

  snapshot(null)

  // Iterate
  while (true) {
    const zj = computeZj()
    const zjMinusCj = computeZjMinusCj(zj)

    const pivotCol = zjMinusCj.findIndex(val => val < 0)
    if (pivotCol === -1) break

    let minRatio = Infinity
    let pivotRow = -1
    for (let i = 0; i < rows.length; i++) {
      const divisor = rows[i][pivotCol]
      if (divisor > 0) {
        const ratio = rows[i][headers.length - 1] / divisor
        if (ratio < minRatio) {
          minRatio = ratio
          pivotRow = i
        }
      }
    }

    if (pivotRow === -1) break

    const pivotElement = rows[pivotRow][pivotCol]
    rows[pivotRow] = rows[pivotRow].map(val => val / pivotElement)

    for (let i = 0; i < rows.length; i++) {
      if (i !== pivotRow) {
        const multiplier = rows[i][pivotCol]
        for (let j = 0; j < rows[i].length; j++) {
          rows[i][j] -= multiplier * rows[pivotRow][j]
        }
      }
    }

    basis[pivotRow] = headers[pivotCol]
    cb[pivotRow] = cj[pivotCol]

    snapshot(pivotCol)
  }

  console.log("Total tableaux generated:", tableaux.length)
  return tableaux
}
