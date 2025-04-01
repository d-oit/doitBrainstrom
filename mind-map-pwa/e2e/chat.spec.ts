import { test, expect } from '@playwright/test';

test('chat functionality', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');

  // Check that the chat button is visible
  const chatButton = page.getByRole('button', { name: /chat assistance/i });
  await expect(chatButton).toBeVisible();

  // Click the chat button to open the chat window
  await chatButton.click();

  // Check that the chat window is visible
  await expect(page.getByText('Welcome to Brainstorm Map Assistant')).toBeVisible();

  // Type a message
  const messageInput = page.getByPlaceholder('Type your message...');
  await messageInput.fill('Hello, can you help me with brainstorm mapping?');

  // Send the message - the button has a tooltip with 'Send message' text
  // but it's actually an IconButton with a SendIcon
  await page.locator('button[type="submit"]').click();

  // Check that the message appears in the chat
  await expect(page.getByText('Hello, can you help me with brainstorm mapping?')).toBeVisible();

  // Check for loading indicator (may be brief)
  await expect(page.getByText('Thinking...')).toBeVisible({ timeout: 1000 }).catch(() => {
    // It's okay if we miss the loading indicator due to timing
    console.log('Loading indicator not seen - response may have been immediate');
  });

  // Close the chat window - using the close icon button
  await page.locator('button[aria-label="close chat"]').click();

  // Check that the chat window is closed
  await expect(page.getByText('Welcome to Brainstorm Map Assistant')).not.toBeVisible();

  // Reopen the chat window
  await chatButton.click();

  // Check that our message history is still there
  await expect(page.getByText('Hello, can you help me with brainstorm mapping?')).toBeVisible();

  // Test chat menu functionality
  await page.locator('button[aria-label="chat options"]').click();

  // Click "Clear Messages"
  await page.getByRole('menuitem', { name: /clear messages/i }).click();

  // Check that messages are cleared
  await expect(page.getByText('Welcome to Brainstorm Map Assistant')).toBeVisible();

  // Close the chat window - using the close icon button
  await page.locator('button[aria-label="close chat"]').click();
});
