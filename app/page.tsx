"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { setSession } from "@/lib/session"
import { loginClient } from "@/services/api"
import type { ClientSession } from "@/types/catalog"

function validateRutForSubmit(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return "Por favor ingresa tu RUT"
  if (trimmed.includes(".")) {
    return "No uses puntos en el RUT. Ejemplo: 12345678-9"
  }
  if (!trimmed.includes("-")) {
    return "El RUT debe incluir el guion verificador (ej: 12345678-9)"
  }
  return null
}

export default function LoginPage() {
  const [rut, setRut] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const trimmed = rut.trim()
    const trimmedLower = trimmed.toLowerCase()

    if (trimmedLower !== "test") {
      const rutErr = validateRutForSubmit(trimmed)
      if (rutErr) {
        setError(rutErr)
        setLoading(false)
        return
      }
    }

    if (trimmedLower === "test") {
      const testSession: ClientSession = {
        client_id: 0,
        name: "Cliente Demo",
        price_list: "factura",
        rut: "test",
        city: "",
        is_melinka: false,
        isTestMode: true,
      }
      setSession(testSession)
      setLoading(false)
      router.push("/catalog")
      return
    }

    try {
      const data = await loginClient(trimmed)
      const session: ClientSession = {
        client_id: data.id,
        name: data.name,
        rut: trimmed,
        city: data.city,
        is_melinka: data.is_melinka,
        price_list: data.is_melinka ? "melinka" : "factura",
      }
      setSession(session)
      router.push("/catalog")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle background watermark for large screens */}
      <div className="hidden lg:block fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
          <Image
            src="/logo-seal.png"
            alt=""
            width={600}
            height={600}
            className="select-none"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg p-8 relative z-10">
          <div className="flex flex-col items-center gap-6">
            {/* Logo */}
            <Image
              src="/logo-main.png"
              alt="Distribuidora La Quillotana"
              width={200}
              height={120}
              priority
              className="object-contain"
            />

            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground text-balance">
                Bienvenido al catálogo mayorista
              </h1>
              <p className="text-secondary mt-1 font-medium">
                Distribuidora La Quillotana
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="space-y-2">
                <label htmlFor="rut" className="text-sm font-medium text-foreground">
                  RUT cliente
                </label>
                <Input
                  id="rut"
                  type="text"
                  placeholder="12345678-9"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  className="h-12 text-base bg-background border-border focus:border-primary focus:ring-primary"
                  autoComplete="off"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-[#c90510] transition-colors"
              >
                {loading ? "Cargando..." : "Entrar al catálogo"}
              </Button>
            </form>

            {/* Test mode hint */}
            <p className="text-sm text-muted-foreground text-center">
              Modo prueba: escribe <span className="font-mono font-semibold text-secondary">test</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
