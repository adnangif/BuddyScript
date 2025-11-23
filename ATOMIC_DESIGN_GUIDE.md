# Atomic Design System Guide

## 📖 What is Atomic Design?

Atomic Design is a methodology for creating design systems by breaking UI components into hierarchical levels, inspired by chemistry:

1. **Atoms** - Basic building blocks (buttons, inputs, labels)
2. **Molecules** - Simple combinations of atoms (form fields, filters, cards)
3. **Organisms** - Complex components built from molecules and atoms (modals, forms, tables)

### Benefits
- **Consistency**: Same components everywhere, same behavior
- **Maintainability**: Fix once, fixes everywhere
- **Efficiency**: Build features faster with reusable components
- **Quality**: Tested, accessible components out of the box
- **No Compromises**: All features preserved during migration

---

## 🏗️ File Structure

```
app/ui/atomic/
├── atoms/                    # Basic building blocks
│   ├── Button.tsx           # Primary UI buttons (5 variants)
│   ├── IconButton.tsx       # Icon-only buttons
│   ├── Tooltip.tsx          # Tooltips
│   ├── Label.tsx            # Form labels with required indicators
│   ├── Input.tsx            # Text inputs
│   ├── Textarea.tsx         # Multi-line text inputs (auto-resize)
│   ├── Select.tsx           # Dropdowns
│   ├── ErrorMessage.tsx     # Error display
│   ├── TableCell.tsx        # Table data cells
│   └── TableHeader.tsx      # Table header cells
│
├── molecules/               # Composed components
│   ├── ActionButtons.tsx    # CreateButton, EditButton, DeleteButton
│   ├── FormField.tsx        # Complete form field (label + input + error)
│   ├── DetailSection.tsx    # Section wrapper for detail views
│   ├── DetailField.tsx      # Label-value display with icons
│   ├── DetailGrid.tsx       # Responsive grid layout
│   ├── DetailDocument.tsx   # Document display with view/download
│   ├── DetailNotes.tsx      # Notes display component
│   ├── TableRow.tsx         # Table row with consistent styling
│   ├── MobileCard.tsx       # Mobile view card for tables
│   ├── TableActions.tsx     # Standard table action buttons
│   ├── CampaignFilter.tsx   # Reusable campaign filter dropdown
│   ├── DateRangeFilter.tsx  # Reusable date range filter
│   └── MultiSelectFilter.tsx # Generic multi-select filter
│
├── organisms/               # Complex components
│   ├── Modal.tsx            # Base modal (wraps Headless UI)
│   ├── ConfirmationModal.tsx # Delete/warning confirmations
│   ├── FormModal.tsx        # Modal with form (for Create/Edit)
│   ├── DetailsModal.tsx     # Modal for read-only details (drawer)
│   └── Table.tsx            # Responsive table with filters
│
├── examples/               # Usage examples
│   ├── FormExamples.tsx
│   ├── DetailsModalExamples.tsx
│   └── TableExamples.tsx
│
└── index.ts                # Central exports (import from here!)
```

---

## 🚀 Quick Start

### 1. Always Import from Atomic

```tsx
// ✅ DO THIS - Import from atomic system
import {
  Button,
  FormField,
  CreateButton,
  EditButton,
  DeleteButton,
  DetailsModal,
  DetailSection,
  DetailField,
  Table,
  TableColumn,
  MobileCard,
  CampaignFilter,
  DateRangeFilter,
  MultiSelectFilter,
} from '@/app/ui/atomic';

// ❌ DON'T DO THIS - Direct imports
import Button from '@/app/ui/atomic/atoms/Button';
```

### 2. Component Selection Guide

**When you need...**

| Need | Use | Example |
|------|-----|---------|
| A button | `Button` | `<Button variant="primary">Save</Button>` |
| Create/Edit/Delete actions | `CreateButton`, `EditButton`, `DeleteButton` | `<CreateButton onClick={...} />` |
| Form input | `FormField` | `<FormField label="Email" name="email" type="email" />` |
| Detail view modal | `DetailsModal` | See "Creating Detail Views" below |
| Create/Edit modal | `FormModal` | See "Creating Forms" below |
| Confirmation dialog | `ConfirmationModal` | For delete confirmations |
| **Table** | `Table` | **Responsive table with filters** |
| **Campaign Filter** | `CampaignFilter` | In table `renderHeader` |
| **Date Filter** | `DateRangeFilter` | In table `renderHeader` |
| **Generic Filter** | `MultiSelectFilter` | For any multi-select filter |

---

## 📋 Creating Tables

### Basic Table

```tsx
import { Table, TableColumn } from '@/app/ui/atomic';

interface User {
  id: string;
  name: string;
  email: string;
}

const columns: TableColumn<User>[] = [
  {
    label: 'Name',
    key: 'name',
    render: (user) => <span>{user.name}</span>,
  },
  {
    label: 'Email',
    key: 'email',
    render: (user) => <span>{user.email}</span>,
  },
];

const mobileCard: MobileCardRenderer<User> = {
  render: (user) => (
    <MobileCard>
      <p className="font-medium">{user.name}</p>
      <p className="text-sm text-gray-500">{user.email}</p>
    </MobileCard>
  ),
};

<Table
  data={users}
  columns={columns}
  mobileCard={mobileCard}
  emptyMessage="No users found"
/>
```

### Table with Filters

```tsx
import { 
  Table, 
  TableColumn, 
  CampaignFilter, 
  DateRangeFilter,
  MultiSelectFilter 
} from '@/app/ui/atomic';

const columns: TableColumn<Donation>[] = [
  {
    label: 'Campaign',
    key: 'campaign',
    renderHeader: () => (
      <CampaignFilter
        campaigns={campaigns}
        selectedCampaigns={selectedCampaigns}
        onChange={setSelectedCampaigns}
        onApply={applyFilters}
      />
    ),
    render: (donation) => <span>{donation.campaignName}</span>,
  },
  {
    label: 'Date',
    key: 'date',
    renderHeader: () => (
      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        onApply={applyFilters}
      />
    ),
    render: (donation) => <DateWithIcon date={donation.date} />,
  },
  {
    label: 'Payment Type',
    key: 'paymentType',
    renderHeader: () => (
      <MultiSelectFilter
        label="Payment Type"
        options={paymentTypes}
        selectedOptions={selectedTypes}
        onChange={setSelectedTypes}
        onApply={applyFilters}
        formatOption={(type) => type.toUpperCase()}
      />
    ),
    render: (donation) => <span>{donation.paymentType}</span>,
  },
];
```

### Table with Actions

```tsx
import { Table, TableColumn, TableActions } from '@/app/ui/atomic';

const columns: TableColumn<Item>[] = [
  // ... other columns
  {
    label: '',
    key: 'actions',
    align: 'right',
    render: (item) => (
      <TableActions
        onEdit={() => handleEdit(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
  },
];
```

### Sortable Table

```tsx
const [sortColumn, setSortColumn] = useState<string>('name');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

const columns: TableColumn<User>[] = [
  {
    label: 'Name',
    key: 'name',
    sortable: true,
    sortDirection: sortColumn === 'name' ? sortDirection : null,
  },
];

<Table
  data={sortedData}
  columns={columns}
  mobileCard={mobileCard}
  onSort={(key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  }}
/>
```

---

## 🎨 Creating Forms

### Simple Form Modal

```tsx
import { FormModal, FormField } from '@/app/ui/atomic';

<FormModal
  open={open}
  onClose={() => setOpen(false)}
  title="Create User"
  size="lg"
  onSubmit={async (data) => {
    await createUser(data);
  }}
>
  <FormField
    label="Name"
    name="name"
    required
  />
<FormField
  label="Email"
  name="email"
  type="email"
  required
/>
<FormField
    label="Bio"
    name="bio"
  type="textarea"
    rows={4}
  />
</FormModal>
```

### Form with Select & Date

```tsx
<FormModal
  open={open}
  onClose={() => setOpen(false)}
  title="Create Donation"
  defaultValues={donation}
  onSubmit={handleSubmit}
>
  <FormField
    label="Campaign"
    name="campaignId"
    type="select"
    options={campaigns}
    required
  />
  <FormField
    label="Amount"
    name="amount"
    type="number"
    step="0.01"
    required
  />
  <FormField
    label="Date"
    name="date"
    type="date"
    required
  />
</FormModal>
```

---

## 🔍 Creating Detail Views

### Basic Details Modal

```tsx
import { DetailsModal, DetailSection, DetailField, DetailGrid } from '@/app/ui/atomic';

<DetailsModal
  open={open}
  onClose={() => setOpen(false)}
  title="User Details"
>
  <DetailSection title="Personal Information">
    <DetailGrid>
      <DetailField label="Name" value={user.name} />
      <DetailField label="Email" value={user.email} icon={<EnvelopeIcon />} />
      <DetailField label="Phone" value={user.phone} icon={<PhoneIcon />} />
      <DetailField label="Status" value={user.status} />
    </DetailGrid>
  </DetailSection>
</DetailsModal>
```

### Details with Documents & Notes

```tsx
<DetailsModal
  open={open}
  onClose={() => setOpen(false)}
  title="Donation Details"
>
  <DetailSection title="Donation Information">
    <DetailGrid>
      <DetailField label="Amount" value={formatCurrency(donation.amount)} />
      <DetailField label="Date" value={formatDate(donation.date)} />
    </DetailGrid>
  </DetailSection>

  <DetailDocument
    label="Receipt"
    url={donation.receiptUrl}
    onView={() => viewReceipt(donation.receiptUrl)}
    onDownload={() => downloadReceipt(donation.receiptUrl)}
  />

  <DetailNotes notes={donation.notes} />
</DetailsModal>
```

---

## 🎯 Filter Components

### CampaignFilter

Reusable dropdown filter for campaigns with checkbox selection.

```tsx
<CampaignFilter
  campaigns={allCampaigns}
  selectedCampaigns={selectedCampaigns}
  onChange={setSelectedCampaigns}
  onApply={applyFilters}
/>
```

**Props:**
- `campaigns`: Array of `{ id: string, name: string }`
- `selectedCampaigns`: Array of selected campaign names
- `onChange`: Callback when selection changes
- `onApply`: Callback when "Apply" is clicked

### DateRangeFilter

Reusable date range filter with from/to inputs.

```tsx
<DateRangeFilter
  dateFrom={dateFrom}
  dateTo={dateTo}
  onChange={(from, to) => {
    setDateFrom(from);
    setDateTo(to);
  }}
  onApply={applyFilters}
  label="Date"
/>
```

**Props:**
- `dateFrom`: Start date value
- `dateTo`: End date value
- `onChange`: Callback with (from, to) dates
- `onApply`: Callback when "Apply" is clicked
- `label`: Optional label (default: "Date")

### MultiSelectFilter

Generic multi-select filter for any options.

```tsx
<MultiSelectFilter
  label="Payment Type"
  options={['credit_card', 'bank_transfer', 'cash']}
  selectedOptions={selectedTypes}
  onChange={setSelectedTypes}
  onApply={applyFilters}
  formatOption={(type) => type.replace('_', ' ').toUpperCase()}
/>
```

**Props:**
- `label`: Filter label
- `options`: Array of string options
- `selectedOptions`: Array of selected options
- `onChange`: Callback when selection changes
- `onApply`: Callback when "Apply" is clicked
- `formatOption`: Optional function to format display

---

## 🎨 Component Variants

### Button Variants

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// With icons
<Button variant="primary" icon={<PlusIcon />}>
  Add Item
</Button>

// Loading state
<Button variant="primary" loading>
  Saving...
</Button>
```

### Modal Sizes

```tsx
<FormModal size="sm" />   // Small (max-w-md)
<FormModal size="md" />   // Medium (max-w-lg) - default
<FormModal size="lg" />   // Large (max-w-2xl)
<FormModal size="xl" />   // Extra Large (max-w-4xl)
<FormModal size="full" /> // Full Width (max-w-7xl)
```

### Confirmation Modal Variants

```tsx
<ConfirmationModal
  variant="danger"    // Red theme for destructive actions
  variant="warning"   // Yellow theme for warnings
  variant="info"      // Blue theme for information
/>
```

---

## ✅ Best Practices

### 1. Component Composition

```tsx
// ✅ Good - Compose components
<FormModal title="Create User" onSubmit={handleSubmit}>
  <FormField label="Name" name="name" required />
  <FormField label="Email" name="email" type="email" required />
</FormModal>

// ❌ Bad - Reinventing the wheel
<Dialog open={open}>
  <input type="text" placeholder="Name" />
  <input type="email" placeholder="Email" />
</Dialog>
```

### 2. Type Safety

```tsx
// ✅ Good - Use TypeScript interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

const columns: TableColumn<User>[] = [
  // TypeScript will ensure 'user' has correct type
  { label: 'Name', key: 'name', render: (user) => user.name }
];

// ❌ Bad - Using 'any'
const columns: TableColumn<any>[] = [...]
```

### 3. Reuse Filters

```tsx
// ✅ Good - Reuse CampaignFilter across tables
import { CampaignFilter } from '@/app/ui/atomic';

// Use in Donations table
<CampaignFilter campaigns={campaigns} ... />

// Use in Expenses table
<CampaignFilter campaigns={campaigns} ... />

// Use in Pledges table
<CampaignFilter campaigns={campaigns} ... />

// ❌ Bad - Custom filter for each table
// Don't recreate the same filter logic
```

### 4. Mobile-First Design

```tsx
// ✅ Good - Always provide mobileCard for responsive tables
const mobileCard: MobileCardRenderer<Item> = {
  render: (item) => (
    <MobileCard clickable onClick={() => handleClick(item)}>
      <p className="font-medium">{item.name}</p>
      <p className="text-sm">{item.description}</p>
    </MobileCard>
  ),
};

<Table data={items} columns={columns} mobileCard={mobileCard} />

// ❌ Bad - Desktop-only tables
// Always ensure mobile experience
```

---

## 🔧 Advanced Usage

### Custom Cell Rendering

```tsx
const columns: TableColumn<Product>[] = [
  {
    label: 'Product',
    key: 'name',
    render: (product) => (
      <div className="flex items-center gap-3">
        <img src={product.image} className="w-10 h-10 rounded" />
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-xs text-gray-500">{product.sku}</p>
        </div>
      </div>
    ),
  },
  {
    label: 'Price',
    key: 'price',
    render: (product) => (
      <span className={product.onSale ? 'text-red-600' : 'text-gray-900'}>
        {formatCurrency(product.price)}
      </span>
    ),
  },
];
```

### Custom Header with Filters

```tsx
const columns: TableColumn<Expense>[] = [
  {
    label: 'Campaign',
    key: 'campaign',
    // Custom header content - can be anything!
    renderHeader: () => (
      <div className="flex items-center gap-2">
        <span>Campaign</span>
        <CampaignFilter
          campaigns={campaigns}
          selectedCampaigns={selected}
          onChange={setSelected}
        />
      </div>
    ),
    render: (expense) => <span>{expense.campaign}</span>,
  },
];
```

### Row Click Handler

```tsx
<Table
  data={items}
  columns={columns}
  mobileCard={mobileCard}
  onRowClick={(item) => {
    // Open detail modal
    setSelectedItem(item);
    setModalOpen(true);
  }}
/>
```

---

## 📚 Common Patterns

### CRUD Operations

```tsx
// List with Create button
<div>
  <div className="flex justify-between mb-4">
    <h1>Users</h1>
    <CreateButton onClick={() => setCreateModalOpen(true)} />
</div>

  <Table
    data={users}
    columns={columns}
    mobileCard={mobileCard}
  />

  <FormModal
    open={createModalOpen}
    onClose={() => setCreateModalOpen(false)}
    title="Create User"
    onSubmit={handleCreate}
  >
    <FormField label="Name" name="name" required />
    <FormField label="Email" name="email" type="email" required />
</FormModal>
</div>
```

### Master-Detail Pattern

```tsx
const [selectedItem, setSelectedItem] = useState(null);

<Table
  data={items}
  columns={columns}
  mobileCard={mobileCard}
  onRowClick={(item) => setSelectedItem(item)}
/>

<DetailsModal
  open={!!selectedItem}
  onClose={() => setSelectedItem(null)}
  title="Item Details"
>
  <DetailSection title="Information">
    <DetailGrid>
      <DetailField label="Name" value={selectedItem?.name} />
      <DetailField label="Status" value={selectedItem?.status} />
    </DetailGrid>
  </DetailSection>
</DetailsModal>
```

### Filter + Search Pattern

```tsx
const [search, setSearch] = useState('');
const [selectedCampaign, setSelectedCampaign] = useState([]);
const [filteredData, setFilteredData] = useState(data);

const applyFilters = () => {
  let filtered = data;
  
  if (search) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (selectedCampaign.length > 0) {
    filtered = filtered.filter(item =>
      selectedCampaign.includes(item.campaign)
    );
  }
  
  setFilteredData(filtered);
};

<Table
  data={filteredData}
  columns={[
    {
      label: 'Campaign',
      key: 'campaign',
      renderHeader: () => (
        <CampaignFilter
          campaigns={campaigns}
          selectedCampaigns={selectedCampaign}
          onChange={setSelectedCampaign}
          onApply={applyFilters}
        />
      ),
    },
  ]}
  mobileCard={mobileCard}
/>
```

---

## 🎯 Migration Checklist

When migrating a new component to atomic design:

- [ ] Replace custom buttons with atomic `Button` or action buttons
- [ ] Replace form inputs with `FormField`
- [ ] Replace custom modals with `FormModal` or `DetailsModal`
- [ ] Replace table markup with atomic `Table` component
- [ ] Add `mobileCard` for responsive design
- [ ] Use filter molecules (`CampaignFilter`, `DateRangeFilter`, etc.)
- [ ] Import everything from `@/app/ui/atomic`
- [ ] Remove old custom components
- [ ] Test on mobile and desktop
- [ ] Verify all functionality preserved

---

## 📝 Files Migrated

**Summary:** 5 Tables, 6 Detail Modals, 7 Form Modals - All core user-facing components ✅

### Tables (All Features Preserved ✅)
- ✅ `DonorsTableClient.tsx` - Edit/Delete actions, avatar display
- ✅ `CampaignsTableClient.tsx` - Status badges, date formatting
- ✅ `ExpensesTableClient.tsx` - Campaign & Date filters, receipt upload
- ✅ `DonationsTableClient.tsx` - Campaign, Payment Type & Date filters (URL-based), file upload
- ✅ `PledgeTableShared.tsx` - Pledge types, status calculation, notify/edit/delete actions

### Detail Modals
- ✅ `DonationDetailsModal.tsx` - Full detail view with actions
- ✅ `DonorDetailsModal.tsx` - Contact info, stats, documents
- ✅ `ExpenseDetailsModal.tsx` - Receipt viewing, vendor info
- ✅ `PledgeDetailsModal.tsx` - Pledge details with installment tracking
- ✅ `CampaignSummaryDetailsModal.tsx` - Campaign summary metrics
- ✅ `ActivityLogDetailsModal.tsx` - Activity tracking details

### Form Modals
- ✅ All Create/Edit modals use `FormModal`
- ✅ All form inputs use `FormField`
- ✅ All action buttons use atomic components
- ✅ `EditCampaignModal.tsx` - Create/Edit campaign with validation
- ✅ `CreateDonationModal.tsx` - Donation creation with pledge association
- ✅ `EditDonationModal.tsx` - Donation editing with campaign/donor selection
- ✅ `MatchDonationModal.tsx` - Donation matching functionality
- ✅ `EditDonorModal.tsx` - Donor management with address fields
- ✅ `CreatePledgeModal.tsx` - Pledge creation with complex logic
- ✅ `EditPledgeModal.tsx` - Pledge editing with installment calculations

### Not Yet Migrated (Using Legacy Dialog/Transition)
The following modals still use Headless UI directly and could be migrated to atomic design in the future:
- ⏳ `CreateExpenseModal.tsx` - Expense creation form
- ⏳ `EditExpenseModal.tsx` - Expense editing form
- ⏳ `CreateCampaignSummaryModal.tsx` - Campaign summary creation
- ⏳ `EditCampaignSummaryModal.tsx` - Campaign summary editing
- ⏳ Various utility modals (LoginModal, BookDemoModal, PricingModal, etc.)

---

## 🚀 What's Next?

The atomic design system is **production-ready** and widely adopted! The majority of user-facing components have been migrated:

✅ **All buttons** using unified Button system
✅ **All tables** using Table organism with filters
✅ **All detail views** using DetailsModal
✅ **All filters** reusable across tables
✅ **Core CRUD modals** for Campaigns, Donations, Donors, and Pledges using FormModal
✅ **6 Detail Modals** using DetailsModal organism
✅ **7 Form Modals** using FormModal organism

### Future Enhancements (Optional)
- Migrate remaining expense and campaign summary modals to atomic design
- Add more filter types (number range, multi-date, etc.)
- Create more specialized molecules for common patterns
- Add animation/transition atoms
- Expand examples for edge cases

---

## 💡 Tips

1. **Always check examples** - See `examples/` folder for real-world usage
2. **Use TypeScript** - Helps catch errors early
3. **Compose components** - Build complex UIs from simple pieces
4. **Think mobile-first** - Always provide mobile card for tables
5. **Reuse filters** - Don't recreate filter logic, use existing molecules
6. **Stay consistent** - One pattern for similar features
7. **No compromises** - All features must work perfectly

---

## 📞 Questions?

- Check the `examples/` folder for real implementations
- Look at migrated files for patterns
- All components are fully typed - IntelliSense will help!

**Remember: Import everything from `@/app/ui/atomic` - one source of truth!** 🎯
