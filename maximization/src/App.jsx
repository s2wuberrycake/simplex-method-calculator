import React, { useState } from "react"
import ObjectiveInput from "./components/ObjectiveInput"
import EquationInput from "./components/EquationInput"
import TableauDisplay from "./components/TableauDisplay"
import { solveBigM } from "./lib/algorithm"
import { Button } from "@/components/ui/button"

export default function App() {
  const [numVars, setNumVars] = useState(2)
  const [numConstraints, setNumConstraints] = useState(2)

  const [objectiveName, setObjectiveName] = useState("Z")
  const [objectiveCoeffs, setObjectiveCoeffs] = useState(Array(numVars).fill(""))

  const [constraints, setConstraints] = useState(
    Array(numConstraints).fill(null).map(() => ({
      coeffs: Array(numVars).fill(""),
      sign: "<=",
      rhs: ""
    }))
  )

  const [tableau, setTableau] = useState(null)

  const handleSolve = () => {
    const result = solveBigM({
      objectiveName,
      objectiveCoeffs,
      constraints
    })
    setTableau(result)
  }

  const handleNumVarsChange = val => {
    const n = parseInt(val) || 0
    setNumVars(n)
    setObjectiveCoeffs(Array(n).fill(""))

    setConstraints(prev =>
      prev.map(c => ({
        ...c,
        coeffs: Array(n).fill("")
      }))
    )
  }

  const handleNumConstraintsChange = val => {
    const m = parseInt(val) || 0
    const newConstraints = Array(m).fill(null).map(() => ({
      coeffs: Array(numVars).fill(""),
      sign: "<=",
      rhs: ""
    }))
    setNumConstraints(m)
    setConstraints(newConstraints)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Big M Method Solver (Maximization)</h1>

      <div className="flex gap-4">
        <div>
          <label className="block font-semibold">Number of Variables:</label>
          <input
            type="number"
            min="1"
            value={numVars}
            onChange={e => handleNumVarsChange(e.target.value)}
            className="border px-2 py-1 w-24"
          />
        </div>

        <div>
          <label className="block font-semibold">Number of Constraints:</label>
          <input
            type="number"
            min="1"
            value={numConstraints}
            onChange={e => handleNumConstraintsChange(e.target.value)}
            className="border px-2 py-1 w-24"
          />
        </div>
      </div>

      <ObjectiveInput
        objectiveName={objectiveName}
        setObjectiveName={setObjectiveName}
        objectiveCoeffs={objectiveCoeffs}
        setObjectiveCoeffs={setObjectiveCoeffs}
      />

      <EquationInput
        constraints={constraints}
        setConstraints={setConstraints}
      />

      <Button className="mt-4" onClick={handleSolve}>
        Solve
      </Button>

      {tableau &&
  tableau.map((t, i) => (
    <div key={i} className="mb-8">
      <h3 className="font-bold text-lg mb-2">Tableau {i + 1}</h3>
      <TableauDisplay tableau={t} />
    </div>
  ))}

    </div>
  )
}
