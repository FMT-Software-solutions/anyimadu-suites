import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useSuites, useCreateSuite, useUpdateSuite, useDeleteSuite, type SuiteWithRelations } from '@/lib/queries/suites'
import { type SuiteFormValues } from '@/components/admin/suites/SuiteForm'
import { SuitesGrid } from '@/components/admin/suites/SuitesGrid'
import { SuitesStats } from '@/components/admin/suites/SuitesStats'
import { SuiteDialog } from '@/components/admin/suites/SuiteDialog'
import { DeleteConfirmDialog } from '@/components/admin/suites/DeleteConfirmDialog'

export const Suites = () => {
  const { data: suitesData } = useSuites()
  const createSuite = useCreateSuite()
  const updateSuite = useUpdateSuite()
  const deleteSuite = useDeleteSuite()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingSuite, setEditingSuite] = useState<SuiteWithRelations | null>(null)
  const [viewSuite, setViewSuite] = useState<SuiteWithRelations | null>(null)
  const [deleteSuiteId, setDeleteSuiteId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const suiteStats = useMemo(() => {
    const suites = suitesData || []
    const totalSuites = suites.length
    const avgPrice = totalSuites === 0 ? 0 : Math.round(suites.reduce((sum, s) => sum + Number(s.price), 0) / totalSuites)
    const totalCapacity = suites.reduce((sum, s) => sum + Number(s.capacity), 0)
    const highestPrice = totalSuites === 0 ? 0 : Math.max(...suites.map((s) => Number(s.price)))
    return { totalSuites, averagePrice: avgPrice, totalCapacity, highestPrice }
  }, [suitesData])

  const handleCreate = async (values: SuiteFormValues) => {
    await createSuite.mutateAsync({
      suite: {
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        capacity: parseInt(values.capacity),
        main_image_url: values.mainImageUrl,
        gallery_urls: values.galleryUrls,
      },
      amenityIds: values.amenityIds,
      galleryUrls: values.galleryUrls,
    })
    setShowCreateDialog(false)
  }

  const handleEditOpen = (suite: SuiteWithRelations) => {
    setEditingSuite(suite)
    setShowEditDialog(true)
  }

  const handleViewOpen = (suite: SuiteWithRelations) => {
    setViewSuite(suite)
  }

  const handleUpdate = async (values: SuiteFormValues) => {
    if (!editingSuite) return
    await updateSuite.mutateAsync({
      id: editingSuite.id,
      suite: {
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        capacity: parseInt(values.capacity),
        main_image_url: values.mainImageUrl,
        gallery_urls: values.galleryUrls,
      },
      amenityIds: values.amenityIds,
    })
    setShowEditDialog(false)
    setEditingSuite(null)
  }

  const handleDelete = async (id: string) => {
    setDeleteSuiteId(id)
    setShowDeleteDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suites</h1>
          <p className="text-muted-foreground">
            Manage your suite inventory and details.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Suite
        </Button>
        <SuiteDialog
          mode="create"
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateDialog(false)}
        />
      </div>

      {/* Stats Cards */}
      <SuitesStats stats={suiteStats} />

      {/* Suites Grid */}
      <SuitesGrid suites={suitesData || []} onView={handleViewOpen} onEdit={handleEditOpen} onDelete={handleDelete} />

      {/* Edit Dialog */}
      <SuiteDialog
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        suite={editingSuite || undefined}
        initialValues={editingSuite ? {
          name: editingSuite.name,
          description: editingSuite.description,
          price: String(editingSuite.price),
          capacity: String(editingSuite.capacity),
          mainImageUrl: editingSuite.main_image_url ?? '',
          amenityIds: editingSuite.amenities.map((a) => a.id),
          galleryUrls: editingSuite.gallery_urls ?? [],
        } : undefined}
        onSubmit={handleUpdate}
        onCancel={() => {
          setShowEditDialog(false)
          setEditingSuite(null)
        }}
      />

      {/* View Dialog */}
      <SuiteDialog
        mode="view"
        open={!!viewSuite}
        onOpenChange={(open) => { if (!open) setViewSuite(null) }}
        suite={viewSuite || undefined}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={async () => {
          if (deleteSuiteId) {
            await deleteSuite.mutateAsync(deleteSuiteId)
            setShowDeleteDialog(false)
            setDeleteSuiteId(null)
          }
        }}
      />
    </div>
  );
};
