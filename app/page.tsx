'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { loginClient } from '@/services/api'
import { saveSession } from '@/lib/session'

export default function LoginPage() {
  const router = useRouter()
  const [rut, setRut] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const client = await validateClient(rut.trim())
      
      if (client) {
        saveSession(client)
        router.push('/catalog')
      } else {
        setError('Tu RUT no está registrado. Contacta a tu ejecutivo de ventas.')
      }
    } catch {
      setError('Error al validar el RUT. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--quillotana-light)] relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%201-gJM6SQT6MRQSxwUtV0PzXsCUPapEMO.png"
          alt=""
          width={800}
          height={800}
          className="w-[800px] h-[800px] object-contain"
          priority
        />
      </div>

      <div className="w-full max-w-md mx-auto px-6">
        <div className="bg-card rounded-xl shadow-lg p-8 relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%201-gJM6SQT6MRQSxwUtV0PzXsCUPapEMO.png"
              alt="Quillotana Distribuidora"
              width={180}
              height={180}
              className="w-44 h-44 object-contain"
              priority
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--quillotana-blue)] mb-2 text-balance">
              Bienvenido al catálogo mayorista
            </h1>
            <p className="text-muted-foreground">
              Ingresa tu RUT para acceder a precios exclusivos.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field>
              <FieldLabel htmlFor="rut">RUT cliente</FieldLabel>
              <Input
                id="rut"
                type="text"
                placeholder="12.345.678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                className="h-12 text-lg"
                disabled={isLoading}
                autoComplete="off"
              />
            </Field>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-[var(--quillotana-red)] hover:bg-[var(--quillotana-red-dark)] text-white"
              disabled={isLoading || !rut.trim()}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-5 h-5" />
                  Verificando...
                </span>
              ) : (
                'Entrar al catálogo'
              )}
            </Button>
          </form>

          {/* Test mode hint */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Modo prueba: escribe <span className="font-mono bg-muted px-1.5 py-0.5 rounded">test</span>
          </p>
        </div>
      </div>
    </main>
  )
}
