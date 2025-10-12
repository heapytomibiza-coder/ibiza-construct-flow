/**
 * Test Helpers
 * Phase 23: Testing & Quality Assurance System
 * 
 * Utility functions for common testing scenarios
 */

import userEvent from '@testing-library/user-event';

// Note: Import screen, within, fireEvent from testing library in your test files
// These are available globally when using vitest with jsdom environment

/**
 * Type into an input field
 * Usage: await typeIntoInput(screen, 'Email', 'test@example.com')
 */
export async function typeIntoInput(
  screen: any,
  labelText: string,
  value: string
): Promise<void> {
  const input = screen.getByLabelText(labelText);
  await userEvent.type(input, value);
}

/**
 * Click a button by text or role
 * Usage: await clickButton(screen, 'Submit')
 */
export async function clickButton(screen: any, text: string | RegExp): Promise<void> {
  const button = screen.getByRole('button', { name: text });
  await userEvent.click(button);
}

/**
 * Select an option from a select element
 * Usage: await selectOption(screen, 'Country', 'USA')
 */
export async function selectOption(
  screen: any,
  labelText: string,
  optionText: string
): Promise<void> {
  const select = screen.getByLabelText(labelText);
  await userEvent.selectOptions(select, optionText);
}

/**
 * Check a checkbox
 * Usage: await checkCheckbox(screen, 'Accept terms')
 */
export async function checkCheckbox(screen: any, labelText: string): Promise<void> {
  const checkbox = screen.getByLabelText(labelText);
  if (!checkbox.hasAttribute('checked')) {
    await userEvent.click(checkbox);
  }
}

/**
 * Uncheck a checkbox
 * Usage: await uncheckCheckbox(screen, 'Remember me')
 */
export async function uncheckCheckbox(screen: any, labelText: string): Promise<void> {
  const checkbox = screen.getByLabelText(labelText);
  if (checkbox.hasAttribute('checked')) {
    await userEvent.click(checkbox);
  }
}

/**
 * Fill out a form with multiple fields
 * Usage: await fillForm(screen, { 'Email': 'test@example.com', 'Password': '123' })
 */
export async function fillForm(
  screen: any,
  fields: Record<string, string>
): Promise<void> {
  for (const [label, value] of Object.entries(fields)) {
    await typeIntoInput(screen, label, value);
  }
}

/**
 * Submit a form
 * Usage: await submitForm(screen)
 */
export async function submitForm(screen: any): Promise<void> {
  const form = screen.getByRole('form') || document.querySelector('form');
  if (form) {
    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
  }
}

/**
 * Wait for a toast message
 * Usage: await waitForToast(screen, 'Success')
 */
export async function waitForToast(
  screen: any,
  message: string | RegExp
): Promise<HTMLElement> {
  return screen.findByText(message);
}

/**
 * Get all table rows
 * Usage: const rows = getTableRows(within, screen, 'table')
 */
export function getTableRows(within: any, screen: any, tableRole: string = 'table'): HTMLElement[] {
  const table = screen.getByRole(tableRole);
  return within(table).getAllByRole('row');
}

/**
 * Get table cell value
 * Usage: const value = getTableCellValue(within, row, 0)
 */
export function getTableCellValue(
  within: any,
  row: HTMLElement,
  columnIndex: number
): string {
  const cells = within(row).getAllByRole('cell');
  return cells[columnIndex]?.textContent || '';
}

/**
 * Check if element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  return element.style.display !== 'none' && 
         element.style.visibility !== 'hidden' &&
         element.offsetHeight > 0;
}

/**
 * Get all errors in form
 * Usage: const errors = getFormErrors(screen)
 */
export function getFormErrors(screen: any): string[] {
  const errors = screen.queryAllByRole('alert');
  return errors.map((error: any) => error.textContent || '');
}

/**
 * Wait for loading to complete
 * Usage: await waitForLoadingToComplete(screen)
 */
export async function waitForLoadingToComplete(screen: any): Promise<void> {
  const loading = screen.queryByText(/loading/i);
  if (loading) {
    await screen.findByText(/loading/i, {}, { timeout: 0 });
  }
}
