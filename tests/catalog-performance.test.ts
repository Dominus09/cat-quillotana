import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { filterCatalogProducts, matchesCatalogSearch } from "@/lib/catalog-filters"
import { catalogPageWindow, catalogFilterKey, CATALOG_PAGE_SIZE } from "@/lib/catalog-page-window"
import { buildProductKeyContext, getProductReactKey } from "@/lib/product-key"
import type { Product } from "@/types/catalog"

const products: Product[] = Array.from({length: 7602}, (_, i) => ({
  id: i + 1, name: "PRODUCTO " + i, type: i % 2 === 0 ? "CERVEZAS" : "BEBIDAS",
  barcode: String(i + 1).padStart(13, "0"), stock: i % 25, price: 1200,
  image: "/icon.svg", units_per_box: 24, sale_type: "ENTERA", quantity_step: 24,
}))
const defaults = { searchQuery: "", selectedCategory: null, stockFilter: "all" } as const

describe("bounded catalog grid", () => {
  it("renders at most 48 cards, with every product accessible", () => {
    const seen: number[] = []
    const first = catalogPageWindow(products, 0)
    assert.equal(first.items.length, CATALOG_PAGE_SIZE)
    for (let page = 0; page < first.pageCount; page++) {
      const current = catalogPageWindow(products, page)
      assert.ok(current.items.length <= CATALOG_PAGE_SIZE)
      seen.push(...current.items.map(p => p.id))
    }
    assert.deepEqual(seen, products.map(p => p.id))
    assert.equal(catalogPageWindow(products, 99999).page, first.pageCount - 1)
    assert.equal(catalogPageWindow([], 20).items.length, 0)
  })
  it("finds a barcode beyond the initial page and preserves leading zeros", () => {
    const target = products[7601]
    const matches = filterCatalogProducts(products, {...defaults, searchQuery: target.barcode!})
    assert.deepEqual(matches, [target])
    assert.deepEqual(catalogPageWindow(matches, 0).items, [target])
  })
  it("combines filters with the same previous search and stock semantics", () => {
    for (const stockFilter of ["all", "available", "low"] as const) {
      const filters = {searchQuery: "producto 12", selectedCategory: "CERVEZAS", stockFilter}
      const expected = products.filter(p => matchesCatalogSearch(p, filters.searchQuery))
        .filter(p => p.type === filters.selectedCategory)
        .filter(p => stockFilter === "all" || (stockFilter === "available" ? p.stock > 10 : p.stock > 0 && p.stock <= 10))
      assert.deepEqual(filterCatalogProducts(products, filters), expected)
    }
    assert.equal(filterCatalogProducts(products, defaults), products)
  })
  it("changes page scope when any filter changes", () => {
    const key = catalogFilterKey(defaults, true)
    for (const filters of [{...defaults, searchQuery:"123"}, {...defaults, selectedCategory:"CERVEZAS"}, {...defaults, stockFilter:"low" as const}]) {
      assert.notEqual(catalogFilterKey(filters, true), key)
    }
    assert.notEqual(catalogFilterKey(defaults, false), key)
  })
  it("keeps duplicate row keys unique across page boundaries", () => {
    const duplicate = {...products[0]}
    const items = [...products.slice(0, 48), duplicate, ...products.slice(48)]
    const ctx = buildProductKeyContext(items)
    const first = catalogPageWindow(items, 0)
    const next = catalogPageWindow(items, 1)
    assert.notEqual(getProductReactKey(first.items[0], first.start, ctx), getProductReactKey(next.items[0], next.start, ctx))
  })
})
