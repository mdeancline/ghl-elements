# ghl-elements

A framework for building custom element behavior on [GoHighLevel](https://www.gohighlevel.com/) pages. `ghl-elements` is written in TypeScript and ships with full declarations. TypeScript 5.0 or later is recommended.

## Installation

```bash
npm install ghl-elements
```

If you are using Stripe as a payment integration on your HighLevel page, install the peer dependency as well:

```bash
npm install @stripe/stripe-js
```

---

## Overview

`ghl-elements` provides a structured way to interact with HighLevel's page elements programmatically via custom JavaScript injected into your HighLevel pages. It automatically registers and manages elements like order forms, order bumps, and FAQ children, exposing a clean API to interact with them programmatically.

The library is intended to be bundled and injected into your HighLevel pages via the **Custom HTML/JavaScript** element in HighLevel's page builder. It is not intended for use in a standard web application outside of a HighLevel page.

The library exposes a single entry point, `hldocument`, which acts as the central registry for all managed elements on the page.

---

## Quick Start

```typescript
import { hldocument, OrderForm, OrderBump, Accordion } from 'ghl-elements';

// Retrieve all order forms
const forms = hldocument.getElementsByType(OrderForm);

// Retrieve a specific order form by its DOM element ID
const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);

// Programmatically apply a coupon
form?.submitCoupon('SAVE20');
```

---

## API Reference

### `hldocument`

The singleton entry point for the library. All registered elements are accessible through it.

```typescript
import { hldocument } from 'ghl-elements';
```

#### Methods

##### `getElementById<T>(id: string, constructor: Constructor<T>): T | undefined`

Retrieves a registered element by its DOM element ID.

```typescript
const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
form?.submitCoupon('SAVE20');
```

##### `getElementsByType<T>(constructor: Constructor<T>): T[]`

Retrieves all registered elements of a given type.

```typescript
const forms = hldocument.getElementsByType(OrderForm);
const bumps = hldocument.getElementsByType(OrderBump);
const accordions = hldocument.getElementsByType(Accordion);
```

##### `addEventListener(type, listener, options?)`

Listens for document-level events dispatched by the library.

```typescript
hldocument.addEventListener('accordionopen', event => {
    console.log('An accordion opened:', event.detail);
});

hldocument.addEventListener('beforecouponsubmit', event => {
    console.log('Coupon being submitted:', event.detail.couponCode);
});

hldocument.addEventListener('aftercouponsubmit', event => {
    console.log('Coupon submitted:', event.detail.couponCode);
});

hldocument.addEventListener('couponsuccess', event => {
    console.log('Coupon applied:', event.detail.couponCode);
});

hldocument.addEventListener('couponerror', event => {
    console.log('Invalid coupon:', event.detail.couponCode);
});

hldocument.addEventListener('couponreset', event => {
    console.log('Coupon reset:', event.detail.couponCode);
});

hldocument.addEventListener('orderbumpselect', event => {
    console.log('Order bump selected:', event.detail.orderBump);
});

hldocument.addEventListener('orderbumpdeselect', event => {
    console.log('Order bump deselected:', event.detail.orderBump);
});
```

#### Document Event Map

| Event | Fired When |
|---|---|
| `accordionopen` | Any accordion opens |
| `accordionclose` | Any accordion closes |
| `beforecouponsubmit` | A coupon is about to be submitted |
| `aftercouponsubmit` | A coupon has been submitted, regardless of outcome |
| `couponsuccess` | A coupon is successfully applied |
| `couponerror` | A coupon code is invalid |
| `couponreset` | A coupon error state is cleared |
| `orderbumpselect` | An order bump is selected |
| `orderbumpdeselect` | An order bump is deselected |

---

### `OrderForm`

Represents a HighLevel order form element.

#### Retrieving Order Forms

```typescript
// All order forms
const forms = hldocument.getElementsByType(OrderForm);

// Specific order form by DOM ID
const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
```

#### Methods

##### `submitCoupon(code: string): boolean`

Programmatically submits a coupon code to the order form.

Returns `true` if submitted successfully, `false` if the input is unavailable or a submission is already in progress.

```typescript
const success = form.submitCoupon('SAVE20');
```

##### `getStripeElement<K>(name: K): StripeElementTypeMap[K] | undefined`

Retrieves a mounted Stripe element by its type name. Returns `undefined` if Stripe has not yet loaded or if no element of that type has been mounted.

```typescript
// Wait for Stripe to load first
await form.getStripeElements();

const paymentElement = form.getStripeElement('payment');
```

##### `getStripeElements(): Promise<StripeElements>`

Returns a Promise that resolves to the Stripe Elements instance once Stripe JS has loaded and been initialized by HighLevel. The Promise is rejected with an error after 10 seconds if Stripe JS fails to load.

```typescript
try {
    const elements = await form.getStripeElements();
    elements.update({ appearance });
} catch (e) {
    console.warn(e.message);
}
```

#### Properties

| Property | Type | Description |
|---|---|---|
| `orderBumps` | `Iterable<OrderBump>` | The order bumps within this form |

#### Element Events

Listen for events on a specific order form element:

```typescript
form.addEventListener('beforecouponsubmit', event => {
    console.log('Coupon code:', event.detail.couponCode);
});

form.addEventListener('aftercouponsubmit', event => {
    console.log('Coupon submitted:', event.detail.couponCode);
});

form.addEventListener('couponsuccess', event => {
    console.log('Coupon applied:', event.detail.couponCode);
});

form.addEventListener('couponerror', event => {
    console.log('Invalid coupon:', event.detail.couponCode);
});

form.addEventListener('couponreset', event => {
    console.log('Coupon reset:', event.detail.couponCode);
});
```

---

### `OrderBump`

Represents a HighLevel order bump, an optional add-on offer displayed within an order form.

#### Retrieving Order Bumps

Order bumps are registered automatically. They can be retrieved either directly from `hldocument` or through their parent `OrderForm`.

Order bumps are stored under their DOM element ID if one exists, otherwise under the format `{orderFormId}-bump-{index}` where index is one-based.

```typescript
// All order bumps across all order forms
const bumps = hldocument.getElementsByType(OrderBump);

// Select an order bump programmatically
bumps[0]?.select();

// Specific order bump by generated ID (one-based index)
const bump = hldocument.getElementById('one-step-order-IjosAGseXl-bump-1', OrderBump);

// Order bumps from a specific form
const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
const bumps = form?.orderBumps ?? [];
```

#### Methods

| Method | Description |
|---|---|
| `select()` | Programmatically selects the order bump |
| `deselect()` | Programmatically deselects the order bump |

```typescript
bump.select();
bump.deselect();
```

#### Properties

| Property | Type | Description |
|---|---|---|
| `header` | `HTMLDivElement` | The bump's header element |
| `headline` | `HTMLSpanElement` | The one-time offer headline element |
| `description` | `HTMLSpanElement` | The bump's description element |

#### Element Events

| Event | Fired When |
|---|---|
| `select` | The order bump is selected |
| `deselect` | The order bump is deselected |

```typescript
bump.addEventListener('select', event => {
    console.log('Bump selected:', event.detail);
});
```

---

### `Accordion`

Represents a HighLevel accordion element, either a custom accordion (`.accordion`) or an FAQ child (`.hl-faq-child`).

#### Retrieving Accordions

**Custom accordions** are retrieved by their DOM element ID.

**FAQ child accordions** do not have IDs in HighLevel's DOM. This library assigns them automatically using the format `{faqElementId}-child-{index}` where index is one-based.

```typescript
// All accordions
const accordions = hldocument.getElementsByType(Accordion);

// Custom accordion by DOM ID
const accordion = hldocument.getElementById('my-custom-accordion', Accordion);

// FAQ child accordion (second child, one-based index)
const faqChild = hldocument.getElementById('faq-sR-MbONj3oUV-child-2', Accordion);
```

#### Methods

| Method | Description |
|---|---|
| `open()` | Opens the accordion. No effect if already open. |
| `close()` | Closes the accordion. No effect if already closed. |
| `toggle()` | Toggles between open and closed. |

```typescript
accordion?.open();
accordion?.close();
accordion?.toggle();
```

#### Properties

| Property | Type | Description |
|---|---|---|
| `isActive` | `boolean` | Whether the accordion is currently open |

#### Element Events

| Event | Fired When |
|---|---|
| `open` | The accordion opens |
| `close` | The accordion closes |

```typescript
accordion.addEventListener('open', () => {
    console.log('Accordion opened');
});
```

---

## License

[Apache 2.0](./LICENSE) © 2026 Matthew Cline