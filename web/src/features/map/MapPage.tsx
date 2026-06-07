import { PageHeader } from '@/components/ui/PageHeader'

export function MapPage() {
  return (
    <div>
      <PageHeader
        title="🗺️ Карта бережных мест"
        subtitle="Места отдыха и поддержки рядом с вами"
      />
      <div className="overflow-hidden rounded-2xl shadow-lg">
        <iframe
          title="Карта добрых мест"
          src="https://www.google.com/maps/d/embed?mid=1G8w_bj137owwx2AcyYF9hm-UdH5RJAA&ehbc=2E312F"
          className="aspect-video w-full min-h-[400px] border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  )
}
