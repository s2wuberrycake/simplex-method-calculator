import React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export default function ConstraintRow({ index, coeffs = [], sign, rhs, onChange, variableCount }) {
  const handleCoeffChange = (i, val) => {
    const updatedCoeffs = [...coeffs]
    updatedCoeffs[i] = val
    onChange(index, { coeffs: updatedCoeffs, sign, rhs })
  }

  const handleSignChange = value => {
    onChange(index, { coeffs, sign: value, rhs })
  }

  const handleRHSChange = e => {
    onChange(index, { coeffs, sign, rhs: e.target.value })
  }

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: variableCount }).map((_, i) => (
        <Input
          key={i}
          type="text"
          value={coeffs[i] || ""}
          onChange={e => handleCoeffChange(i, e.target.value)}
          placeholder={`x${i + 1}`}
          className="w-16 text-center"
        />
      ))}

      <Select value={sign} onValueChange={handleSignChange}>
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="<=">{"<="}</SelectItem>
          <SelectItem value=">=">{">="}</SelectItem>
          <SelectItem value="=">{"="}</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="text"
        value={rhs}
        onChange={handleRHSChange}
        placeholder="RHS"
        className="w-20 text-center"
      />
    </div>
  )
}
