import { afterEach, beforeEach, describe, it } from "node:test"
import assert from "node:assert/strict"

import {
  isValidCatalogPriceList,
  normalizeSessionPriceList,
  resolvePriceListForClient,
} from "@/lib/price-list"
import {
  addToCart,
  cartNeedsReprice,
  getCart,
  getCartPriceList,
  getSession,
  repriceCart,
  setCart,
  setSession,
} from "@/lib/session"
import { syncCartWithPriceList } from "@/hooks/use-cart-price-sync"
import { createOrder, OrderRepriceRequiredError } from "@/services/api"
import type { ApiCatalogItem, CreateOrderPayload } from "@/services/api"
import type { ClientSession, Product } from "@/types/catalog"

const realFetch = globalThis.fetch

function product(id: number, price: number, extra: Partial<Product> = {}): Product {
  return {
    id,
    name: `Producto ${id}`,
    type: "ABARROTES",
    image: "/icon.svg",
    price,
    stock: 100,
    barcode: `78000${id}`,
    sale_type: "UNITARIO",
    quantity_step: 1,
    ...extra,
  }
}

function apiItem(id: number, price: number | null): ApiCatalogItem {
  return {
    id,
    name: `Producto ${id}`,
    type: "ABARROTES",
    barcode: `78000${id}`,
    stock: 100,
    image: null,
    price,
    sale_type: "UNITARIO",
    quantity_step: 1,
  }
}

function session(extra: Partial<ClientSession> = {}): ClientSession {
  return {
    client_id: 500,
    name: "Cliente",
    rut: "11111111-1",
    city: "Quellón",
    is_melinka: false,
    ...extra,
  }
}

function mockFetch(handler: (url: string, init?: RequestInit) => Response) {
  const calls: string[] = []
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push(url)
    return handler(url, init)
  }) as typeof fetch
  return calls
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

beforeEach(() => sessionStorage.clear())
afterEach(() => {
  globalThis.fetch = realFetch
})

describe("lista de precios por ciudad", () => {
  it("Melinka usa la 16 y cualquier otra ciudad o sin ciudad la 13", () => {
    assert.equal(resolvePriceListForClient({ is_melinka: true }), "melinka")
    assert.equal(resolvePriceListForClient({ is_melinka: false }), "factura")
  })

  it("COMODITI y la 14 no son listas válidas", () => {
    for (const v of ["comoditi", "COMODITI", "14", "", null]) {
      assert.equal(isValidCatalogPriceList(v), false)
    }
    assert.equal(isValidCatalogPriceList("factura"), true)
    assert.equal(isValidCatalogPriceList("melinka"), true)
  })

  it("una sesión antigua con COMODITI se corrige a la lista de su ciudad", () => {
    const quellon = normalizeSessionPriceList(session({ price_list: "comoditi" }))
    assert.equal(quellon.session.price_list, "factura")
    assert.equal(quellon.changed, true)

    sessionStorage.setItem(
      "quillotana_session",
      JSON.stringify(session({ is_melinka: true, price_list: "comoditi" }))
    )
    assert.equal(getSession()?.price_list, "melinka")
  })
})

describe("carrito", () => {
  it("no agrega productos sin precio vigente", () => {
    setSession(session())
    addToCart(product(1, 0))
    assert.deepEqual(getCart(), [])
  })

  it("un carrito antiguo (cotizado con COMODITI, sin etiqueta) requiere recotizar", () => {
    setSession(session())
    setCart([{ product: product(1, 999), quantity: 2 }])
    assert.equal(cartNeedsReprice("factura"), true)
  })

  it("recotizar actualiza precios, quita productos sin precio y etiqueta la lista", () => {
    setSession(session())
    setCart([
      { product: product(1, 999), quantity: 2 },
      { product: product(2, 500), quantity: 1 },
      { product: product(3, 700), quantity: 1 },
    ])
    const result = repriceCart([product(1, 1200), product(2, 0)], "factura")
    assert.deepEqual(
      result.cart.map((i) => [i.product.id, i.product.price, i.quantity]),
      [[1, 1200, 2]]
    )
    assert.deepEqual(result.changed, [
      { name: "Producto 1", oldPrice: 999, newPrice: 1200 },
    ])
    assert.deepEqual(result.removed, ["Producto 2", "Producto 3"])
    assert.equal(getCartPriceList(), "factura")
    assert.equal(cartNeedsReprice("factura"), false)
  })

  it("al cambiar de ciudad a Melinka el carrito se recotiza con la lista 16", async () => {
    setSession(session())
    addToCart(product(1, 1200), 2)
    assert.equal(getCartPriceList(), "factura")

    setSession(session({ city: "Melinka", is_melinka: true }))
    const priceList = getSession()?.price_list ?? ""
    assert.equal(priceList, "melinka")
    assert.equal(cartNeedsReprice(priceList), true)

    const calls = mockFetch(() => json([apiItem(1, 1250)]))
    const result = await syncCartWithPriceList(priceList)
    assert.match(calls[0], /price_list=melinka/)
    assert.equal(result.cart[0].product.price, 1250)
    assert.equal(getCartPriceList(), "melinka")
  })

  it("al dejar Melinka el carrito vuelve a la lista 13", async () => {
    setSession(session({ city: "Melinka", is_melinka: true }))
    addToCart(product(1, 1250), 1)
    setSession(session({ city: "Ancud", is_melinka: false }))
    assert.equal(cartNeedsReprice("factura"), true)

    mockFetch(() => json([apiItem(1, 1200)]))
    const result = await syncCartWithPriceList("factura")
    assert.equal(result.cart[0].product.price, 1200)
  })

  it("nunca pide el catálogo con COMODITI", async () => {
    const calls = mockFetch(() => json([]))
    await assert.rejects(syncCartWithPriceList("comoditi"))
    assert.equal(calls.length, 0)
  })
})

describe("pedido", () => {
  const order: CreateOrderPayload = {
    client: { id: 500, name: "Cliente", rut: "11111111-1" },
    items: [{ id: 1, name: "Producto 1", barcode: "780001", quantity: 2, price: 1200 }],
    total: 2400,
    price_list: "factura",
    payment_method: "transferencia",
    document_type: "factura",
    contact_name: "",
    contact_phone: "+56 9 1234 5678",
    delivery_date: "",
    notes: "",
  }

  it("envía la lista vigente y devuelve el pedido creado", async () => {
    let sent: Record<string, unknown> = {}
    mockFetch((_url, init) => {
      sent = JSON.parse(String(init?.body))
      return json({ status: "ok", order_id: 77, price_list_id: 13, total: 2400 })
    })
    const res = await createOrder(order)
    assert.equal(res.order_id, 77)
    assert.equal(sent.price_list, "factura")
  })

  it("rechaza COMODITI sin llamar al backend", async () => {
    const calls = mockFetch(() => json({}))
    await assert.rejects(createOrder({ ...order, price_list: "comoditi" }))
    assert.equal(calls.length, 0)
  })

  it("precio desactualizado (409) pide recotizar el carrito", async () => {
    mockFetch(() =>
      json(
        {
          detail: {
            error: "price_mismatch",
            message: "Algunos precios de tu carrito cambiaron.",
            items: [{ id: 1, reason: "precio_distinto", sent_price: 1200, current_price: 1300 }],
          },
        },
        409
      )
    )
    await assert.rejects(createOrder(order), (err: unknown) => {
      assert.ok(err instanceof OrderRepriceRequiredError)
      assert.equal(err.reason, "price_mismatch")
      assert.equal(err.message, "Algunos precios de tu carrito cambiaron.")
      return true
    })
  })

  it("lista incorrecta para la ciudad (409) informa la lista esperada", async () => {
    mockFetch(() =>
      json(
        {
          detail: {
            error: "price_list_mismatch",
            message: "Tu lista de precios cambió.",
            expected_price_list: "melinka",
          },
        },
        409
      )
    )
    await assert.rejects(createOrder(order), (err: unknown) => {
      assert.ok(err instanceof OrderRepriceRequiredError)
      assert.equal(err.reason, "price_list_mismatch")
      assert.equal(err.expectedPriceList, "melinka")
      return true
    })
  })

  it("otros errores del backend se muestran como mensaje", async () => {
    mockFetch(() => json({ detail: "La lista COMODITI está descontinuada" }, 400))
    await assert.rejects(createOrder(order), (err: unknown) => {
      assert.ok(!(err instanceof OrderRepriceRequiredError))
      assert.equal((err as Error).message, "La lista COMODITI está descontinuada")
      return true
    })
  })
})
