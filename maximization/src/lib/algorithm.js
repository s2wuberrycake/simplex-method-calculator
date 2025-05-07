import { formatBigM } from "./helper/formatDisplayValue"

export function solveBigM({ objectiveName, objectiveCoeffs, constraints }) {
  const M = 1000
  const numVars = objectiveCoeffs.length
  const tableaux = []

  const rows = []
  const basis = []
  const cb = []

  let slackCount = 0
  let artificialCount = 0
  constraints.forEach(c => {
    if (c.sign === "<=") slackCount++
    if (c.sign === ">=") {
      slackCount++
      artificialCount++
    }
    if (c.sign === "=") artificialCount++
  })

  const totalSlack = slackCount
  const totalArtificial = artificialCount

  let slackIndex = 0
  let artificialIndex = 0

  constraints.forEach((constraint, idx) => {
    const row = []

    for (let i = 0; i < numVars; i++) {
      row.push(parseFloat(constraint.coeffs[i]) || 0)
    }

    for (let i = 0; i < totalSlack; i++) row.push(0)
    for (let i = 0; i < totalArtificial; i++) row.push(0)

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

    row.push(parseFloat(constraint.rhs) || 0) // Only RHS (no Z column)
    rows.push(row)
  })

  const totalCols = numVars + totalSlack + totalArtificial

  const cj = []
  for (let i = 0; i < numVars; i++) cj.push(parseFloat(objectiveCoeffs[i]) || 0)
  for (let i = 0; i < totalSlack; i++) cj.push(0)
  for (let i = 0; i < totalArtificial; i++) cj.push(-M)
  cj.push(0) // RHS

  const headers = []
  for (let i = 0; i < numVars; i++) headers.push(`x${i + 1}`)
  for (let i = 0; i < totalSlack; i++) headers.push(`s${i + 1}`)
  for (let i = 0; i < totalArtificial; i++) headers.push(`a${i + 1}`)
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

  const computeTotalZ = () => {
    let total = 0
    for (let i = 0; i < rows.length; i++) {
      total += cb[i] * rows[i][headers.length - 1]
    }
    return +total.toFixed(2)
  }

  const snapshot = (pivotCol = null) => {
    const zj = computeZj()
    const zjMinusCj = computeZjMinusCj(zj)
    const qi = rows.map(row => {
      if (pivotCol === null || row[pivotCol] <= 0) return null
      const rhs = row[headers.length - 1]
      return +(rhs / row[pivotCol]).toFixed(6)
    })

    const activeArtificialVars = basis.filter(b => b.startsWith("a"))
    const displayIndices = headers.map((h, i) => {
      if (h.startsWith("a") && !activeArtificialVars.includes(h)) return null
      return i
    }).filter(i => i !== null)

    const totalZ = computeTotalZ()

    tableaux.push({
      headers: displayIndices.map(i => headers[i]),
      rows: rows.map(r => displayIndices.map(i => formatBigM(r[i]))),
      basis: [...basis],
      cb: cb.map(c => formatBigM(c)),
      zj: displayIndices.map(i => formatBigM(zj[i])),
      zjMinusCj: displayIndices.map(i => formatBigM(zjMinusCj[i])),
      qi: qi.map(q => q === null ? null : formatBigM(q)),
      totalZ: formatBigM(totalZ)
    })
  }

  snapshot(null)

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

  return tableaux
}
