import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { localCatalogPhoto, uniqueCatalogBarcodes } from "@/lib/local-catalog-photo"
import { productInStockMissingCatalogPhoto } from "@/lib/product-photo"
import type { Product } from "@/types/catalog"

const version = "0123456789abcdef"
const manifest = { "00123": version }

describe("verified catalog static photos", () => {
  it("uses only a real build asset, retains leading zeros, busts cache by content", () => {
    assert.equal(localCatalogPhoto("00123", null, manifest), "/products/00123.webp?v=" + version)
    assert.equal(localCatalogPhoto("00123", "/products/00123.webp", manifest), "/products/00123.webp?v=" + version)
    assert.equal(localCatalogPhoto("00123", "https://cat.quillotana.cl/products/00123.webp", manifest), "/products/00123.webp?v=" + version)
    assert.equal(localCatalogPhoto("00123", "/placeholder2.webp", manifest), "/products/00123.webp?v=" + version)
    assert.equal(localCatalogPhoto("123", null, manifest), null)
    assert.equal(localCatalogPhoto("../00123", null, manifest), null)
    assert.equal(localCatalogPhoto("00123", null, {}), null)
  })
  it("does not replace unrelated API image or another barcode", () => {
    assert.equal(localCatalogPhoto("00123", "https://example.com/product.jpg", manifest), null)
    assert.equal(localCatalogPhoto("00123", "/products/00456.webp", manifest), null)
  })
  it("does not use shared barcode for two distinct variants", () => {
    const unique = uniqueCatalogBarcodes([
      { id: 1, barcode: "00123" }, { id: 2, barcode: "00123" },
      { id: 3, barcode: "00456" }, { id: 3, barcode: "00456" },
    ])
    assert.equal(unique.has("00123"), false)
    assert.equal(unique.has("00456"), true)
  })
  it("a verified local photo counts as present; a broken photo still counts as missing", () => {
    const product: Product = { id: 1, name: "Test", type: "Test", price: 100, stock: 1,
      barcode: "00123", image: "/products/00123.webp?v=" + version, imageFromLocal: true, imageFromApi: false, catalogImageRaw: "/placeholder.png" }
    assert.equal(productInStockMissingCatalogPhoto(product), false)
    assert.equal(productInStockMissingCatalogPhoto(product, new Set([1])), true)
  })
})
