import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Boxes,
  ClipboardList,
  Contact,
  DollarSign,
  FolderOpen,
  HelpCircle,
  Home,
  Info,
  LifeBuoy,
  Mail,
  MessageCircle,
  Package,
  Receipt,
  Search,
  Send,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ColoredIcon } from '@/components/ui/colored-icon';
import type { IconColor } from '@/lib/icon-colors';
import { cn } from '@/lib/cn';

interface Guide {
  id: string;
  category: string;
  title: string;
  summary: string;
  to?: string;
  sections: { heading: string; body: string[] }[];
}

const GUIDES: Guide[] = [
  {
    id: 'dashboard-overview',
    category: 'Getting started',
    title: 'Dashboard overview',
    summary: 'Understand the main dashboard, live KPIs and how to navigate the system.',
    to: '/dashboard',
    sections: [
      {
        heading: 'Home screen',
        body: [
          'The dashboard home shows your shop at a glance — today\u2019s sales, low-stock warnings, recent orders, and quick shortcuts to the tools you use most.',
          'A "Recent orders" card on the dashboard lists your latest sales and orders so you can keep an eye on activity without leaving the home screen.',
          'Use the left sidebar to move between modules. A dot next to a group name groups related tools together (Operations, Catalog, Inventory, Customers, Insights, Configure).',
        ],
      },
      {
        heading: 'Quick actions',
        body: [
          'Start a sale directly from POS, add a product, or open your customer-facing storefront. The sidebar keeps everything one click away.',
        ],
      },
    ],
  },
  {
    id: 'products',
    category: 'Catalog & inventory',
    title: 'Add and manage products',
    summary: 'Create products, set prices, attach categories and upload images.',
    to: '/dashboard/products',
    sections: [
      {
        heading: 'Adding a product',
        body: [
          'Go to Products → New product. Enter the product name, category, selling price, cost price and unit (e.g. kg, pcs, litre).',
          'Optional fields like SKU, barcode, supplier and an image help you identify stock quickly at the counter.',
        ],
      },
      {
        heading: 'Editing & deleting',
        body: [
          'Click a product to open its detail page, then Edit to change details or Delete to remove it. Deleting a product is permanent.',
        ],
      },
    ],
  },
  {
    id: 'categories',
    category: 'Catalog & inventory',
    title: 'Categories & labels',
    summary: 'Add, rename and delete categories to organise your catalog.',
    to: '/dashboard/categories',
    sections: [
      {
        heading: 'Adding a category',
        body: [
          'Categories keep your catalog organised and let customers filter your storefront (e.g. Bakery, Dairy, Drinks, Electronics).',
          'Find Categories in the sidebar under Catalog → Categories, or click the "Categories" button on the POS screen.',
          'Click "New category", type a name (e.g. Snacks) and Save. You can rename or delete categories from the same screen.',
        ],
      },
      {
        heading: 'Using categories',
        body: [
          'Assign products to a category, then filter by it on the POS and the storefront. Categories with products still in them can\u2019t be deleted.',
        ],
      },
    ],
  },
  {
    id: 'pos',
    category: 'Selling',
    title: 'Sell at the counter (POS)',
    summary: 'Add items to the cart, take payment and print a receipt in seconds.',
    to: '/dashboard/sales',
    sections: [
      {
        heading: 'Building a sale',
        body: [
          'Open Sales (POS). Search products or tap them to add them to the cart on the right. Adjust quantities directly in the cart line with the minus/plus buttons.',
          'Use the category filter (All, Bakery, Dairy, etc.) to narrow the product list. All categories stay visible so nothing is hidden.',
        ],
      },
      {
        heading: 'Payment & receipt',
        body: [
          'Optionally add a customer and a discount, choose the payment method (M-Pesa, cash, card or other), confirm the sale, and the receipt prints automatically. Each completed sale creates a receipt you can re-print from Sales History.',
        ],
      },
    ],
  },
  {
    id: 'orders',
    category: 'Selling',
    title: 'Orders & recent orders',
    summary: 'Track and fulfil orders, and review your latest ones fast.',
    to: '/dashboard/orders',
    sections: [
      {
        heading: 'All orders vs recent orders',
        body: [
          'The Orders page has two tabs: "All orders" (searchable, filterable, paginated) and "Recent orders" (a quick view of your latest 8). Use the tabs to switch between them.',
          'Update an order\u2019s status so your customer sees accurate tracking.',
        ],
      },
    ],
  },
  {
    id: 'stock',
    category: 'Inventory',
    title: 'Stock & low-stock alerts',
    summary: 'Monitor quantities, mark low stock and avoid running out.',
    to: '/dashboard/stock',
    sections: [
      {
        heading: 'Reading stock levels',
        body: [
          'The Inventory page lists every product with current quantity. Products below their low-stock threshold are highlighted so you can reorder before they sell out.',
        ],
      },
      {
        heading: 'Adjusting stock',
        body: [
          'Use an adjustment to correct counts after stock-takes, damages or returns. Record adjustments accurately — they feed your reports.',
        ],
      },
    ],
  },
  {
    id: 'purchases',
    category: 'Inventory',
    title: 'Purchases & suppliers',
    summary: 'Record stock you buy in and track who you buy from.',
    to: '/dashboard/purchases',
    sections: [
      {
        heading: 'Recording a purchase',
        body: [
          'Add purchases when you restock. Link them to a supplier so ordering history stays organised, then update stock when the goods arrive.',
        ],
      },
      {
        heading: 'Managing suppliers',
        body: ['Keep supplier names, contacts and payment terms up to date under Suppliers.'],
      },
    ],
  },
  {
    id: 'customers',
    category: 'Customer',
    title: 'Customers',
    summary: 'See who buys from you and build repeat business.',
    to: '/dashboard/customers',
    sections: [
      {
        heading: 'Customer records',
        body: [
          'Customers who place online orders or give a name at the counter are saved automatically. Review purchase history to spot your best regulars.',
        ],
      },
    ],
  },
  {
    id: 'reports',
    category: 'Insights',
    title: 'Reports & expenses',
    summary: 'Understand profitability with sales and expense reporting.',
    to: '/dashboard/reports',
    sections: [
      {
        heading: 'Sales & expenses',
        body: [
          'Reports shows revenue, cost and profit over time. Log daily expenses so profit figures reflect your real running costs.',
        ],
      },
    ],
  },
  {
    id: 'storefront',
    category: 'Storefront',
    title: 'Your online storefront',
    summary: 'Publish and design your customer-facing shop.',
    to: '/dashboard/storefront',
    sections: [
      {
        heading: 'Publishing your shop',
        body: [
          'The storefront is what customers see online. Use the Storefront settings to add your hero message, categories, products and contact details.',
          'Choose your brand colors, buttons style and font to match your business. Everything updates live.',
        ],
      },
      {
        heading: 'Previewing',
        body: ['Use "View storefront" (or preview) to see your shop exactly as customers will.'],
      },
    ],
  },
  {
    id: 'settings',
    category: 'Storefront',
    title: 'Settings & notifications',
    summary: 'Manage shop details, alerts and preferences.',
    to: '/dashboard/settings',
    sections: [
      {
        heading: 'Shop settings',
        body: [
          'Update your shop name, currency, contact details and other business info under Settings.',
        ],
      },
      {
        heading: 'Notifications',
        body: [
          'Under Notifications you\u2019ll see important system notifications like low-stock warnings.',
        ],
      },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Getting started': 'bg-primary-light text-brand-700 ring-brand-200',
  'Catalog & inventory': 'bg-primary-light text-brand-700 ring-brand-200',
  Selling: 'bg-primary-light text-brand-700 ring-brand-200',
  Inventory: 'bg-primary-light text-brand-700 ring-brand-200',
  Customer: 'bg-amber-50 text-amber-700 ring-amber-200',
  Insights: 'bg-slate-100 text-slate-600 ring-slate-200',
  Storefront: 'bg-primary-light text-brand-700 ring-brand-200',
};

const CATEGORY_ICONS: Record<string, typeof Home> = {
  'Getting started': Home,
  'Catalog & inventory': Package,
  Selling: ShoppingCart,
  Inventory: Boxes,
  Customer: Users,
  Insights: ClipboardList,
  Storefront: Send,
};

const QUICK_LINKS: { label: string; to: string; icon: typeof Home; tone: IconColor }[] = [
  { label: 'Sell at POS', to: '/dashboard/sales', icon: ShoppingCart, tone: 'orange' },
  { label: 'Add a product', to: '/dashboard/products/new', icon: Package, tone: 'blue' },
  { label: 'Manage categories', to: '/dashboard/categories', icon: FolderOpen, tone: 'teal' },
  { label: 'Check stock', to: '/dashboard/stock', icon: Boxes, tone: 'amber' },
  { label: 'View orders', to: '/dashboard/orders', icon: ShoppingBag, tone: 'blue' },
  { label: 'Record a purchase', to: '/dashboard/purchases', icon: Truck, tone: 'purple' },
  { label: 'Track a supplier', to: '/dashboard/suppliers', icon: Users, tone: 'slate' },
  { label: 'Run reports', to: '/dashboard/reports', icon: ClipboardList, tone: 'blue' },
  { label: 'Manage expenses', to: '/dashboard/expenses', icon: DollarSign, tone: 'red' },
  { label: 'Edit storefront', to: '/dashboard/storefront', icon: Send, tone: 'orange' },
  { label: 'Adjust inventory', to: '/dashboard/stock', icon: Boxes, tone: 'amber' },
  { label: 'View customers', to: '/dashboard/customers', icon: Contact, tone: 'teal' },
  { label: 'Shop settings', to: '/dashboard/settings', icon: Settings, tone: 'slate' },
];

const FAQS = [
  {
    q: 'How do I start a sale quickly?',
    a: 'Open POS from the sidebar. Search or tap products to add them, choose payment, then confirm the sale. A receipt prints automatically.',
  },
  {
    q: 'Why is a product highlighted as low stock?',
    a: 'Products show a low-stock warning when current quantity falls at or below their low-stock threshold. Restock by recording a purchase.',
  },
  {
    q: 'How do I show products to customers online?',
    a: 'Publish your storefront under Storefront settings. Products you add in the dashboard appear in your shop once the storefront is published.',
  },
  {
    q: 'Can I reprint a past receipt?',
    a: 'Yes. Go to Sales History, open the sale, and use Print to reprint its receipt at any time.',
  },
  {
    q: 'How do receipts and expenses affect profit?',
    a: 'Reports combine your recorded sales and expenses to show true profit. Keep purchases and daily expenses up to date for accurate numbers.',
  },
];

export function HelpPage() {
  const [query, setQuery] = useState('');
  const [openGuide, setOpenGuide] = useState<string | null>(null);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return GUIDES;
    return GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.sections.some((s) => s.heading.toLowerCase().includes(q) || s.body.some((b) => b.toLowerCase().includes(q))),
    );
  }, [q]);

  const categories = useMemo(() => {
    const order: string[] = [];
    for (const g of GUIDES) if (!order.includes(g.category)) order.push(g.category);
    return order;
  }, []);

  const toggleGuide = (id: string) => setOpenGuide((cur) => (cur === id ? null : id));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Documentation"
        subtitle="Guides on how to use DukaStock — search for a topic, browse a category, or contact support."
        actions={
          <Badge tone="blue" className="px-3 py-1">
            <LifeBuoy className="h-3.5 w-3.5" /> Support
          </Badge>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand/30">
        <Search className="h-5 w-5 shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a topic, e.g. stock, receipt, storefront…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          aria-label="Search help and documentation"
        />
        {q && (
          <button onClick={() => setQuery('')} className="text-xs font-medium text-muted hover:text-ink">
            Clear
          </button>
        )}
      </div>

      {/* Quick links */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold text-ink">Quick links</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand/40 hover:bg-brand-50/40 hover:text-brand"
            >
              <ColoredIcon icon={l.icon} color={l.tone} size="xs" iconSizeClass="h-4 w-4" />
              <span className="truncate">{l.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Guides grouped by category */}
      {q ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-ink">
            {filtered.length > 0 ? `${filtered.length} result${filtered.length > 1 ? 's' : ''}` : 'No results'}
          </h2>
          {filtered.map((g) => (
            <GuideAccordion key={g.id} guide={g} open={openGuide === g.id} onToggle={() => toggleGuide(g.id)} />
          ))}
          {filtered.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted">
              No guides match “{query}”. Try a keyword like “stock”, “receipt” or “storefront”.
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-7">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] ?? BookOpen;
            const groupGuides = GUIDES.filter((g) => g.category === cat);
            return (
              <div key={cat}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn('flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset', CATEGORY_COLORS[cat])}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">{cat}</h2>
                </div>
                <div className="space-y-2">
                  {groupGuides.map((g) => (
                    <GuideAccordion key={g.id} guide={g} open={openGuide === g.id} onToggle={() => toggleGuide(g.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold text-ink">Frequently asked questions</h2>
        </div>
        <div className="space-y-1.5">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-lg border border-line bg-surface p-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink">
                {f.q}
                <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Card>

      {/* Still stuck */}
      <Card className="bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold">Still stuck?</h2>
              <p className="mt-0.5 text-sm text-white/80">
                Reach out and we\u2019ll help you get back to running your shop.
              </p>
            </div>
          </div>
          <a
            href="mailto:support@dukastock.com"
            className="inline-flex items-center gap-2 rounded-lg bg-surface px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            <Mail className="h-4 w-4" /> Email support
          </a>
        </div>
      </Card>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-xs text-muted">
        <Info className="h-3.5 w-3.5" /> Tip: use the sidebar or search at the top to jump to any module.
        <Wrench className="ml-2 h-3.5 w-3.5" /> <Receipt className="h-3.5 w-3.5" /> <Package className="h-3.5 w-3.5" />
      </p>
    </div>
  );
}

function GuideAccordion({ guide, open, onToggle }: { guide: Guide; open: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface transition-shadow hover:shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
              CATEGORY_COLORS[guide.category],
            )}
          >
            <BookOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink">{guide.title}</h3>
            <p className="truncate text-xs text-muted">{guide.summary}</p>
          </div>
        </div>
        <ArrowRight className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-90')} />
      </button>
      {open && (
        <div className="space-y-4 border-t border-line px-4 py-4">
          {guide.sections.map((s) => (
            <div key={s.heading}>
              <h4 className="text-sm font-semibold text-ink">{s.heading}</h4>
              <div className="mt-1 space-y-1.5">
                {s.body.map((b, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted">
                    {b}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {guide.to && (
            <Link to={guide.to} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
              Open {guide.title} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}


