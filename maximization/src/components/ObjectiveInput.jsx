import React from "react"
import { Input } from "@/components/ui/input"

export default function ObjectiveInput({ objectiveName, setObjectiveName, objectiveCoeffs, setObjectiveCoeffs }) {
  return (
    <div>
      <label className="font-bold">Objective:</label>
      <div className="flex gap-2 mt-1 items-center">
        <Input
          type="text"
          value={objectiveName}
          onChange={e => setObjectiveName(e.target.value)}
          className="w-12"
        />
        <span>=</span>
        {objectiveCoeffs.map((val, i) => (
          <Input
            key={i}
            type="text"
            placeholder={`x${i + 1}`}
            value={val}
            onChange={e => {
              const newCoeffs = [...objectiveCoeffs]
              newCoeffs[i] = e.target.value
              setObjectiveCoeffs(newCoeffs)
            }}
            className="w-20"
          />
        ))}
      </div>
    </div>
  )
}
