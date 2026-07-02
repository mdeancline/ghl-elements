# ghl-elements

A framework for building custom element behavior on [GoHighLevel](https://www.gohighlevel.com/) pages. `ghl-elements` is written in TypeScript and ships with full declarations, but works equally well in plain JavaScript. TypeScript is entirely optional. If you do use TypeScript, version 5.0 or later is required.

## Installation

```bash
npm i @mdcline/ghl-elements
```

If your HighLevel page uses Stripe as a payment integration and you plan to develop against it using `ghl-elements`, install `@stripe/stripe-js` as a dev dependency. HighLevel loads it during runtime, so you don't need it in production. The correct version will be resolved automatically.

```bash
npm i -D @stripe/stripe-js
```

---

## Overview

`ghl-elements` provides a structured way to interact with HighLevel's page elements programmatically via custom JavaScript injected into your HighLevel pages. It automatically registers and manages elements like order forms, order bumps, and accordions, exposing a clean API to interact with them programmatically.

The library is intended to be bundled and injected into your HighLevel pages via the **Custom HTML/JavaScript** element in HighLevel's page builder. It is not intended for use in a standard web application outside of a HighLevel page.

The library exposes a single entry point, `hldocument`, which acts as the central registry for all managed elements on the page.

All examples below are written as plain code. Nothing in them is TypeScript-specific, so every example works identically if pasted into a `.js` file.

---

## Quick Start

```typescript
import { hldocument, OrderForm, OrderBump, Accordion } from '@mdcline/ghl-elements';

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
import { hldocument } from '@mdcline/ghl-elements';
```

#### Methods

##### `getElementByNode<T>(node: HTMLElement, constructor: Constructor<T>): T | undefined`

Retrieves a registered element by its DOM element reference. Useful when you already have a reference to the DOM node and want to get the corresponding managed element wrapper.

```typescript
const node = document.getElementById('one-step-order-IjosAGseXl');
const form = hldocument.getElementByNode(node, OrderForm);
```

##### `getElementById<T>(id: string, constructor: Constructor<T>): T | undefined`

Retrieves a registered element by its DOM element ID.

```typescript
const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
form?.submitCoupon('SAVE20');
```

##### `getElementsByType<T>(constructor: Constructor<T>): readonly T[]`

Retrieves all registered elements of a given type.

```typescript
const forms = hldocument.getElementsByType(OrderForm);
const bumps = hldocument.getElementsByType(OrderBump);
const accordions = hldocument.getElementsByType(Accordion);
```

##### `getFirstElementByType<T>(constructor: Constructor<T>): T | undefined`

Retrieves the first registered element of a given type. Useful when you know there is only one element of that type on the page.

```typescript
const form = hldocument.getFirstElementByType(OrderForm);
form?.submitCoupon('SAVE20');
```

##### `addEventListener(type, listener, options?)`

Listens for document-level events dispatched by the library. Use this to react to elements being registered on the page.

```typescript
hldocument.addEventListener('elementloaded', event => {
    console.log('Element loaded:', event.detail);
});
```

#### Document Event Map

| Event | Detail Type | Fired When |
|---|---|---|
| `elementloaded` | `HighLevelElement` | A managed element is registered and ready to use |

---

### `HighLevelElement`

The base for all HighLevel DOM element wrappers (`OrderForm`, `OrderBump`, `Accordion`). Provides a typed event system and lifecycle management for GoHighLevel's available components, or if available, custom ones. You won't construct this directly, but its members are available on every element you retrieve from `hldocument`.

#### Methods

##### `addEventListener(type, listener, options?)`

Adds a listener for one of this element's events. Typed to the element's own event map, so `type` and the listener's event parameter are checked against the events that element can actually fire.

##### `removeEventListener(type, listener, options?)`

Removes a previously added event listener. Same typed signature as `addEventListener`.

##### `dispatchEvent(event): boolean`

Dispatches an event on this element. Typed to the element's own event map.

#### Properties

| Property | Type | Description |
|---|---|---|
| `domElement` | `T` | The underlying DOM element this wrapper manages |

```typescript
const form = hldocument.getFirstElementByType(OrderForm);
form?.domElement.scrollIntoView();
```

---

### `KeyboardAccessibleElement`

Extends `HighLevelElement` and is the base class for elements that support toggling the keyboard accessibility behavior this library adds on top of HighLevel's default markup. Currently, `Accordion` is the only built-in element that extends it.

Keyboard accessibility is enabled by default. Set `keyboardAccessible` to `false` on an element if this library's default keyboard handling conflicts with your own.

#### Properties

| Property | Type | Description |
|---|---|---|
| `keyboardAccessible` | `boolean` | Whether this library's keyboard accessibility behavior is active for this element. Defaults to `true`. |

```typescript
// Disable keyboard accessibility on a specific accordion
const faqChild = hldocument.getElementById('faq-sR-MbONj3oUV-child-2', Accordion);
if (faqChild) {
    faqChild.keyboardAccessible = false;
}
```

#### Element Events

| Event | Detail Type | Fired When |
|---|---|---|
| `keyboardaction` | `KeyboardActionDetails` | A keyboard interaction is handled by this library |

#### `KeyboardActionDetails`

The shape of `event.detail` for keyboard interaction events. Not a named export; TypeScript infers it automatically from `event.detail`. No import is needed to use it.

| Property | Type | Description |
|---|---|---|
| `cause` | `KeyboardEvent` | The original keyboard event that triggered the interaction |

---

### `OrderForm`

Represents a HighLevel order form element. Provides access to Stripe Elements, order bumps, and coupon submission.

#### Retrieving Order Forms

```typescript
// All order forms on the page
const forms = hldocument.getElementsByType(OrderForm);

// First order form
const form = hldocument.getFirstElementByType(OrderForm);

// Specific order form by DOM ID
const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
```

#### Methods

##### `submitCoupon(code: string): boolean`

Programmatically submits a coupon code to the order form. Fires all coupon-related events from the event map on this element.

Returns `true` if submitted successfully, `false` if a submission is already in progress, the input element is unavailable, or coupon codes are not enabled for this order form.

```typescript
// Apply a coupon code to the order form
const success = form.submitCoupon('SAVE20');
```

##### `hasCouponsEnabled(): boolean`

Returns whether coupon codes are enabled for this order form. When this returns `true`, `couponButton` is guaranteed to be non-null within the same block, allowing direct access without a null check.

```typescript
// Submit a coupon and disable the button while it processes
if (form.hasCouponsEnabled()) {
    form.submitCoupon('SAVE20');
    form.couponButton.disabled = true;
}
```

##### `hasCouponApplied(): boolean`

Returns whether a coupon code is currently applied to this order form.

```typescript
// Check if a coupon is active before attempting to submit another
if (!form.hasCouponApplied()) {
    form.submitCoupon('SAVE20');
}
```

##### `getStripeElement<K>(name: K): StripeElement | null`

Retrieves a mounted Stripe element by its type name. Returns immediately without waiting for Stripe to load. Use `hasStripeAvailable()` to check whether Stripe is ready before calling this, or use `getStripeElements()` to wait for Stripe to load first.

Returns `null` if Stripe has not yet loaded, no element of that type has been mounted, or the Stripe Elements container has been removed from the DOM.

**Note:** Due to typing limitations with Stripe JS at the time of this library version, the return type is always the general `StripeElement` union. It is not narrowed to the specific element type for the `name` you pass in. If you need the specific type (e.g. `StripePaymentElement` for `'payment'`), narrow it yourself via a type assertion or a runtime type guard. TypeScript will not catch an incorrect assertion (e.g. casting the result of `getStripeElement('card')` to `StripePaymentElement`) at compile time.

```typescript
// Collapse the payment element immediately if Stripe is already available
if (form.hasStripeAvailable()) {
    const paymentElement = form.getStripeElement('payment') as StripePaymentElement | null;
    paymentElement?.collapse();
}
```

```javascript
// JavaScript: no type assertion syntax, so just call the method directly.
// `paymentElement` is whatever object Stripe actually returns at runtime.
if (form.hasStripeAvailable()) {
    const paymentElement = form.getStripeElement('payment');
    paymentElement?.collapse();
}
```

##### `getStripeElements(): Promise<StripeElements>`

Returns a Promise that resolves to the `StripeElements` instance once Stripe JS has loaded and been initialized by HighLevel. If Stripe JS has already loaded, the Promise resolves shortly after being called.

The Promise never resolves if Stripe is not configured as a payment integration on this order form.

The Stripe Elements container may be removed from the DOM during coupon submission or when HighLevel re-renders the available payment methods. When this happens, the resolved instance is no longer valid. Call this method again to get the new instance. Do not cache the resolved value across re-renders.

```typescript
const elements = await form.getStripeElements();
elements.update({ appearance });
```

```typescript
// Re-acquire after Stripe re-mounts following a coupon clear
form.addEventListener('couponclear', () => {
    form.getStripeElements().then(elements => {
        elements.update({ appearance });
    });
});
```

##### `hasStripeAvailable(): boolean`

Returns whether Stripe JS has loaded and a `StripeElements` instance is currently available on this order form. Use this as a synchronous check before calling `getStripeElement()` when you need an immediate result and do not want to wait for a Promise.

Returns `false` if Stripe is not configured as a payment integration, has not yet finished loading, or if the Stripe Elements container has been removed from the DOM and not yet re-mounted.

```typescript
if (form.hasStripeAvailable()) {
    form.getStripeElement('payment')?.collapse();
}
```

#### Properties

| Property | Type | Description |
|---|---|---|
| `orderBumps` | `Iterable<OrderBump>` | The order bumps within this form |
| `couponButton` | `HTMLButtonElement \| null` | The coupon apply button, or `null` if coupon codes are not enabled |

#### Element Events

| Event | Detail Type | Fired When |
|---|---|---|
| `couponsubmit` | `CouponUsageDetails` | A coupon code is submitted |
| `couponprocessed` | `CouponUsageDetails` | A coupon submission has concluded, regardless of whether it succeeded or failed |
| `couponsuccess` | `CouponUsageDetails` | A coupon code is successfully applied |
| `couponerror` | `CouponUsageDetails` | There is an error applying a coupon code |
| `couponclear` | `CouponUsageDetails` | An applied coupon code is cleared from the order form |

```typescript
form.addEventListener('couponsuccess', event => {
    console.log('Coupon applied:', event.detail.coupon);
});

form.addEventListener('couponclear', () => {
    form.getStripeElements().then(elements => {
        elements.update({ appearance });
    });
});
```

#### `CouponUsageDetails`

The shape of `event.detail` for coupon-related events. Not a named export; TypeScript infers it automatically from `event.detail`, as shown in the example above. No import is needed to use it.

| Property | Type | Description |
|---|---|---|
| `coupon` | `string` | The coupon code that was submitted |

---

### `OrderBump`

Represents a HighLevel order bump, an optional add-on offer displayed within an order form.

#### Retrieving Order Bumps

Order bumps do not have native IDs in HighLevel's DOM. This library assigns them automatically using the format `{orderFormId}-bump-{index}`, where `index` is one-based.

```typescript
// All order bumps across all order forms
const bumps = hldocument.getElementsByType(OrderBump);

// Specific order bump by generated ID (one-based index)
const bump = hldocument.getElementById('one-step-order-IjosAGseXl-bump-1', OrderBump);

// Order bumps from a specific form
const form = hldocument.getElementById('one-step-order-IjosAGseXl', OrderForm);
for (const bump of form?.orderBumps ?? []) {
    bump.select();
}
```

#### Methods

##### `select(): void`

Programmatically selects the order bump, as if the customer checked it. Fires the `select` event on this element.

##### `deselect(): void`

Programmatically deselects the order bump, as if the customer unchecked it. Fires the `deselect` event on this element.

##### `isSelected(): boolean`

Returns whether the order bump is currently selected.

```typescript
bump.select();
bump.deselect();

if (bump.isSelected()) {
    console.log('Bump is selected');
}
```

#### Element Events

| Event | Detail Type | Fired When |
|---|---|---|
| `select` | `OrderBumpSelectionDetails` | The order bump is selected |
| `deselect` | `OrderBumpSelectionDetails` | The order bump is deselected |

```typescript
bump.addEventListener('select', event => {
    console.log('Selected from form:', event.detail.orderForm);
});
```

#### `OrderBumpSelectionDetails`

The shape of `event.detail` for selection events. Not a named export; TypeScript infers it automatically from `event.detail`, as shown in the example above. No import is needed to use it.

| Property | Type | Description |
|---|---|---|
| `orderForm` | `OrderForm` | The order form that contains the order bump |

---

### `Accordion`

Represents a HighLevel accordion element, either a custom accordion (`.accordion`) or an FAQ child (`.hl-faq-child`). Extends `KeyboardAccessibleElement`.

Accordions are not keyboard accessible by default in HighLevel. This library automatically adds keyboard support: when an accordion is focused, pressing `Enter` or `Space` toggles it. See [`KeyboardAccessibleElement`](#keyboardaccessibleelement) to disable this behavior.

#### Retrieving Accordions

**Custom accordions** are retrieved by their DOM element ID.

**FAQ child accordions** do not have IDs in HighLevel's DOM. This library assigns them automatically using the format `{faqElementId}-child-{index}`, where `index` is one-based.

```typescript
// All accordions on the page
const accordions = hldocument.getElementsByType(Accordion);

// Custom accordion by DOM ID
const accordion = hldocument.getElementById('my-custom-accordion', Accordion);

// FAQ child accordion (second child, one-based index)
const faqChild = hldocument.getElementById('faq-sR-MbONj3oUV-child-2', Accordion);
```

#### Methods

##### `open(): void`

Opens the accordion. Has no effect if already open. Fires the `open` event on this element.

##### `close(): void`

Closes the accordion. Has no effect if already closed. Fires the `close` event on this element.

##### `toggle(): void`

Toggles between open and closed states. Opens if currently closed, closes if currently open.

##### `isActive(): boolean`

Returns whether the accordion is currently open.

```typescript
accordion?.open();
accordion?.close();
accordion?.toggle();

if (accordion?.isActive()) {
    console.log('Accordion is open');
}
```

#### Element Events

| Event | Detail Type | Fired When |
|---|---|---|
| `open` | `AccordionInteractionDetails` | The accordion opens |
| `close` | `AccordionInteractionDetails` | The accordion closes |
| `keyboardaction` | `KeyboardActionDetails` | A keyboard interaction is handled by this library (inherited from `KeyboardAccessibleElement`) |

```typescript
accordion.addEventListener('open', event => {
    if (event.detail.cause) {
        console.log('Opened by user interaction');
    } else {
        console.log('Opened programmatically');
    }
});
```

#### `AccordionInteractionDetails`

The shape of `event.detail` for interaction events. Not a named export; TypeScript infers it automatically from `event.detail`, as shown in the example above. No import is needed to use it.

| Property | Type | Description |
|---|---|---|
| `cause` | `UIEvent \| undefined` | The UI event that triggered the interaction. Absent if triggered programmatically. |

---

### `GHLElementsError`

The base error class for all errors thrown by `ghl-elements`. Lets you distinguish errors originating from this library from your own application errors or other dependencies via `instanceof`, without relying on parsing error message text.

```typescript
import { GHLElementsError } from '@mdcline/ghl-elements';

try {
    form.getStripeElement('payment');
} catch (error) {
    if (error instanceof GHLElementsError) {
        // Came from ghl-elements specifically.
    } else {
        throw error;
    }
}
```

`GHLElementsError` extends the built-in `Error` and adds no additional properties beyond `message`. It is thrown for internal invariant violations, such as calling a method before the library has finished initializing, or when the library detects it is running on a page that is not a GoHighLevel page.

---

## License

[Apache 2.0](https://github.com/mdeancline/ghl-elements/blob/main/LICENSE)