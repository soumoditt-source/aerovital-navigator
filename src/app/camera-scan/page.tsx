import dynamic from 'next/dynamic'
const CameraScan = dynamic(() => import('@/components/camera/CameraScan'), { ssr: false })
import AppDock from '@/components/ui/AppDock'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
    title: 'AI Camera Scan - AeroVital',
    description: 'Real-time AI camera pollution analysis and AR health shield.',
}

export default function CameraScanPage() {
    return (
        <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-blue-500/30">
            <div className="fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6">
                <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Command</span>
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-red-500/30">
                        Live Optics
                    </span>
                </div>
            </div>

            <main className="pt-20 pb-32 px-4 h-screen max-w-lg mx-auto">
                <CameraScan />
            </main>

            <AppDock />
        </div>
    )
}
