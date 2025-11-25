import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { SuiteWithRelations } from '@/lib/queries/suites'
import { SuiteForm, type SuiteFormValues } from '@/components/admin/suites/SuiteForm'
import { AmenityIcon } from '@/components/AmenityIcon'
import { BookedDatesList } from '@/components/admin/suites/BookedDatesList'

interface Props {
  mode: 'create' | 'edit' | 'view'
  open: boolean
  onOpenChange: (open: boolean) => void
  suite?: SuiteWithRelations | null
  initialValues?: Partial<SuiteFormValues>
  onSubmit?: (values: SuiteFormValues) => void
  onCancel?: () => void
}

export const SuiteDialog: React.FC<Props> = ({ mode, open, onOpenChange, suite, initialValues, onSubmit, onCancel }) => {
  const title = mode === 'create' ? 'Add New Suite' : mode === 'edit' ? 'Edit Suite' : 'Suite Details'
  const description = mode === 'create' ? 'Create a new suite with details and images.' : mode === 'edit' ? 'Update suite details and images.' : 'Suite details and amenities.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {mode === 'view' && suite ? (
          <div className="space-y-4">
            <img src={suite.main_image_url ?? ''} alt={suite.name} className="w-full h-64 object-cover rounded" />
            <p className="text-sm text-muted-foreground">{suite.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {suite.gallery_urls.map((url, idx) => (
                <img key={idx} src={url} alt="Suite" className="w-full h-24 object-cover rounded border" />
              ))}
            </div>
                    <div className="flex flex-wrap gap-2">
                      {suite.amenities.map((a) => (
                        <span key={`${suite.id}-${a.id}`} className="px-2 py-1 rounded bg-primary/10 text-primary text-sm inline-flex items-center gap-1">
                          <AmenityIcon iconKey={a.icon_key} className="h-3 w-3" />
                          {a.name}
                        </span>
                      ))}
                    </div>
            <BookedDatesList suiteId={suite.id} />
          </div>
        ) : null}

        {(mode === 'create' || mode === 'edit') && (
          <div className="space-y-6">
            <SuiteForm isEdit={mode === 'edit'} initialValues={initialValues} onSubmit={(v) => onSubmit && onSubmit(v)} onCancel={() => onCancel && onCancel()} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

