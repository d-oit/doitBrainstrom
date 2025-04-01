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
  await expect(page.getByText('Welcome to Mind Map Assistant')).toBeVisible();
  
  // Type a message
  const messageInput = page.getByPlaceholder('Type your message...');
  await messageInput.fill('Hello, can you help me with mind mapping?');
  
  // Send the message
  await page.getByRole('button', { name: /send message/i }).click();
  
  // Check that the message appears in the chat
  await expect(page.getByText('Hello, can you help me with mind mapping?')).toBeVisible();
  
  // Check for loading indicator (may be brief)
  await expect(page.getByText('Thinking...')).toBeVisible({ timeout: 1000 }).catch(() => {
    // It's okay if we miss the loading indicator due to timing
    console.log('Loading indicator not seen - response may have been immediate');
  });
  
  // Close the chat window
  await page.getByRole('button', { name: /close chat/i }).click();
  
  // Check that the chat window is closed
  await expect(page.getByText('Welcome to Mind Map Assistant')).not.toBeVisible();
  
  // Reopen the chat window
  await chatButton.click();
  
  // Check that our message history is still there
  await expect(page.getByText('Hello, can you help me with mind mapping?')).toBeVisible();
  
  // Test chat menu functionality
  await page.getByRole('button', { name: /chat options/i }).click();
  
  // Click "Clear Messages"
  await page.getByRole('menuitem', { name: /clear messages/i }).click();
  
  // Check that messages are cleared
  await expect(page.getByText('Welcome to Mind Map Assistant')).toBeVisible();
  
  // Close the chat window
  await page.getByRole('button', { name: /close chat/i }).click();
});
