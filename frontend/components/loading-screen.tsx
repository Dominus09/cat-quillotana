'use client'

import Image from 'next/image'

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--quillotana-light)]">
      <div className="animate-pulse">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%201-gJM6SQT6MRQSxwUtV0PzXsCUPapEMO.png"
          alt="Cargando..."
          width={150}
          height={150}
          className="w-36 h-36 object-contain"
          priority
        />
      </div>
      <p className="mt-4 text-muted-foreground text-sm">Cargando catálogo...</p>
    </div>
  )
}
