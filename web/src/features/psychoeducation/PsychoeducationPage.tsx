import { PageHeader } from '@/components/ui/PageHeader'
import { Anatomy2D } from './Anatomy2D'

export function PsychoeducationPage() {
  return (
    <div>
      <PageHeader
        title="🧬 Анатомия стресса"
        subtitle="Нажмите на орган — узнайте, что происходит в теле и как себе помочь. (2D; 3D — позже)"
      />
      <Anatomy2D />
    </div>
  )
}
