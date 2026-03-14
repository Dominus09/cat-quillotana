import type { Client, Product, Order, CreateOrderPayload } from '@/lib/types'

const API_BASE_URL = 'https://api.quillotana.cl'

// Mock data for test mode
const MOCK_PRODUCTS: Product[] = [
  {
    product_id: 1,
    product_name: 'Arroz Grano Largo 1kg',
    variant_id: 1,
    sku: 'ARR-001',
    price: 1290,
    stock: 150,
    product_type: 'Abarrotes',
    company_id: 3,
  },
  {
    product_id: 2,
    product_name: 'Aceite Vegetal 1L',
    variant_id: 2,
    sku: 'ACE-001',
    price: 2490,
    stock: 80,
    product_type: 'Abarrotes',
    company_id: 3,
  },
  {
    product_id: 3,
    product_name: 'Fideos Spaghetti 400g',
    variant_id: 3,
    sku: 'FID-001',
    price: 890,
    stock: 200,
    product_type: 'Abarrotes',
    company_id: 3,
  },
  {
    product_id: 4,
    product_name: 'Azúcar Granulada 1kg',
    variant_id: 4,
    sku: 'AZU-001',
    price: 990,
    stock: 120,
    product_type: 'Abarrotes',
    company_id: 3,
  },
  {
    product_id: 5,
    product_name: 'Harina Sin Preparar 1kg',
    variant_id: 5,
    sku: 'HAR-001',
    price: 790,
    stock: 5,
    product_type: 'Abarrotes',
    company_id: 3,
  },
  {
    product_id: 6,
    product_name: 'Leche Entera 1L',
    variant_id: 6,
    sku: 'LEC-001',
    price: 1190,
    stock: 0,
    product_type: 'Lácteos',
    company_id: 3,
  },
  {
    product_id: 7,
    product_name: 'Queso Mantecoso 250g',
    variant_id: 7,
    sku: 'QUE-001',
    price: 2990,
    stock: 45,
    product_type: 'Lácteos',
    company_id: 3,
  },
  {
    product_id: 8,
    product_name: 'Yogurt Natural 1L',
    variant_id: 8,
    sku: 'YOG-001',
    price: 1690,
    stock: 60,
    product_type: 'Lácteos',
    company_id: 3,
  },
  {
    product_id: 9,
    product_name: 'Detergente Líquido 3L',
    variant_id: 9,
    sku: 'DET-001',
    price: 5990,
    stock: 30,
    product_type: 'Limpieza',
    company_id: 3,
  },
  {
    product_id: 10,
    product_name: 'Jabón de Tocador 3 Pack',
    variant_id: 10,
    sku: 'JAB-001',
    price: 1490,
    stock: 100,
    product_type: 'Limpieza',
    company_id: 3,
  },
  {
    product_id: 11,
    product_name: 'Bebida Cola 2L',
    variant_id: 11,
    sku: 'BEB-001',
    price: 1790,
    stock: 250,
    product_type: 'Bebidas',
    company_id: 3,
  },
  {
    product_id: 12,
    product_name: 'Agua Mineral 1.5L',
    variant_id: 12,
    sku: 'AGU-001',
    price: 690,
    stock: 300,
    product_type: 'Bebidas',
    company_id: 3,
  },
]

export async function validateClient(rut: string): Promise<Client | null> {
  // Test mode
  if (rut.toLowerCase() === 'test') {
    return {
      client_id: 0,
      name: 'Cliente Demo',
      price_list_id: 1,
      rut: 'test',
      company_id: 3,
      office_id: 1,
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/catalog/client/${rut}`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return {
      ...data,
      rut,
      company_id: 3,
      office_id: 1,
    }
  } catch (error) {
    console.error('Error validating client:', error)
    return null
  }
}

export async function getProducts(): Promise<Product[]> {
  // Check if we're in test mode
  const session = typeof window !== 'undefined' ? localStorage.getItem('quillotana_session') : null
  if (session) {
    const client = JSON.parse(session) as Client
    if (client.rut === 'test') {
      return MOCK_PRODUCTS
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/catalog/products`)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    const data = await response.json()
    // Filter by company_id = 3
    return data.filter((p: Product) => p.company_id === 3)
  } catch (error) {
    console.error('Error fetching products:', error)
    // Return mock data as fallback
    return MOCK_PRODUCTS
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  // Check if we're in test mode
  const session = typeof window !== 'undefined' ? localStorage.getItem('quillotana_session') : null
  if (session) {
    const client = JSON.parse(session) as Client
    if (client.rut === 'test') {
      // Mock order creation
      const mockOrder: Order = {
        id: Math.floor(Math.random() * 10000),
        client_id: payload.client_id,
        company_id: payload.company_id,
        office_id: payload.office_id,
        created_at: new Date().toISOString(),
        status: 'PENDIENTE',
        total: payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
      // Store in localStorage for demo
      const orders = JSON.parse(localStorage.getItem('quillotana_orders') || '[]')
      orders.push({ ...mockOrder, items: payload.items })
      localStorage.setItem('quillotana_orders', JSON.stringify(orders))
      return mockOrder
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/catalog/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error('Failed to create order')
    }
    return response.json()
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export async function getClientOrders(clientId: number): Promise<Order[]> {
  // Check if we're in test mode
  const session = typeof window !== 'undefined' ? localStorage.getItem('quillotana_session') : null
  if (session) {
    const client = JSON.parse(session) as Client
    if (client.rut === 'test') {
      const orders = JSON.parse(localStorage.getItem('quillotana_orders') || '[]')
      return orders
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/catalog/orders/${clientId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export function getProductImageUrl(sku: string): string {
  return `https://raw.githubusercontent.com/quillotana/catalog-images/main/products/${sku}.webp`
}
