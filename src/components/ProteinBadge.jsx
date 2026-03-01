/**
 * Small pill badge showing protein info.
 * protein_ratio = protein_g * 100 / calories (g per 100 cal)
 */
export default function ProteinBadge({ proteinG, proteinRatio }) {
  if (!proteinG && !proteinRatio) return null

  const isHigh = (proteinRatio ?? 0) >= 8

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
        isHigh
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {proteinG ? `${Math.round(proteinG)}g protein` : `${Math.round(proteinRatio)}g/100cal`}
    </span>
  )
}
