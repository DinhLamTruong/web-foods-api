# Task: Implement Single Product Selection in OrderModal

## Steps to Complete

### 1. Add Radio Selection State and Handler
- [x] Introduce `selectedProductId` state (string, e.g., "1" or "1_2").
- [x] Add `handleProductSelect(id)`: Parse id to productId/variantId, set selectedItem, set quantity=1, update Formik products to [id].

### 2. Update Product Grid UI
- [x] In the flattened options map: Add <Field type="radio" name="productSelection" value={option.id} checked={selectedProductId === option.id} onChange={() => handleProductSelect(option.id)} /> inside each div (hidden radio, styled label).
- [x] Remove old onClick; use label for radio.
- [x] Keep visual indicators based on selectedProductId.

### 3. Update Top Checkbox and Quantity Buttons
- Top checkbox: onChange clears selectedProductId, selectedItem, products.
- Quantity +/-: Use selectedProductId for id to repeat in products array. On - to 0: Clear selection.

### 4. Update Price Display and Order Summary
- Price: Use selectedProductId to find product/variant price * quantity.
- Summary: Base on selectedProductId and quantity (single item).

### 5. Validation and Edge Cases
- Ensure Yup validation passes (already single-type).
- Disable submit if !selectedProductId.
- Handle no variants.

### 6. Testing
- Run client dev server.
- Open modal, select one product: Only one radio checked, tick shows.
- Adjust quantity: Products array updates correctly.
- Deselect: Clears all.
- Submit: Payload correct.

### 7. Cleanup
- Update TODO.md with completions.
- Verify no console errors.
