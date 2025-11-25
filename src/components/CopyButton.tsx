import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1000)
      }}
      aria-label="Copy"
    >
      <Copy className={copied ? 'text-green-600' : ''} />
    </Button>
  )
}

