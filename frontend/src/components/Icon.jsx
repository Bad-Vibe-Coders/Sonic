import * as Lucide from 'lucide-react'

export default function Icon({ name, size = 18, className = '' }) {
  const Cmp = Lucide[name] || Lucide.Circle
  return <Cmp size={size} className={className} strokeWidth={1.8} />
}
