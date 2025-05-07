import React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table"

export default function TableauDisplay({ tableau }) {
  if (!tableau || !tableau.headers || !tableau.rows) return null

  const { headers, rows, basis = [], cb = [], zj = [], zjMinusCj = [], qi = [] } = tableau

  return (
    <div className="mt-6 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">CB</TableHead>
            <TableHead className="text-center">Basis</TableHead>
            {headers.map((h, i) => (
              <TableHead key={i} className="text-center">{h}</TableHead>
            ))}
            <TableHead className="text-center">Qᵢ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
        {rows.map((row, i) => (

            <TableRow key={i}>
              <TableCell className="text-center">{cb[i]}</TableCell>
              <TableCell className="text-center">{basis[i]}</TableCell>
              {row.map((val, j) => (
                <TableCell key={j} className="text-center">{val}</TableCell>
              ))}
              <TableCell className="text-center">{qi[i] ?? "-"}</TableCell>
            </TableRow>
          ))}

          <TableRow className="bg-muted font-semibold">
            <TableCell colSpan={2} className="text-center">Z<sub>j</sub></TableCell>
            {zj.map((val, i) => (
              <TableCell key={i} className="text-center">{val}</TableCell>
            ))}
            <TableCell className="text-center">-</TableCell>
          </TableRow>

          <TableRow className="bg-muted font-semibold">
            <TableCell colSpan={2} className="text-center">Z<sub>j</sub> - C<sub>j</sub></TableCell>
            {zjMinusCj.map((val, i) => (
              <TableCell key={i} className="text-center">{val}</TableCell>
            ))}
            <TableCell className="text-center">-</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
