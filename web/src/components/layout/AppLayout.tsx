import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { SosFab } from './SosFab'
import { TopNav } from './TopNav'
import { Toast } from './Toast'

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0">
        <Header />
        <TopNav />
        <main className="animate-fade-in mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-8">
          <Outlet />
        </main>
        <BottomNav />
        <SosFab />
        <Toast />
      </div>
    </div>
  )
}
