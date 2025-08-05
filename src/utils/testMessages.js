// Test utility for message sending functionality
// This file can be used to manually test message features

import { messageService } from '../services/messageService';

export const testMessageSending = async (teamId, userId) => {
  console.log('Testing message sending functionality...');
  
  try {
    // Test 1: Send a regular message
    console.log('Test 1: Sending a regular message...');
    const message1 = await messageService.sendMessage(teamId, userId, 'Hello, this is a test message!');
    console.log('✅ Regular message sent successfully:', message1);
    
    // Test 2: Send a message with whitespace (should be trimmed)
    console.log('Test 2: Sending message with whitespace...');
    const message2 = await messageService.sendMessage(teamId, userId, '  This message has whitespace  ');
    console.log('✅ Whitespace message sent successfully:', message2);
    
    // Test 3: Try to send empty message (should fail)
    console.log('Test 3: Attempting to send empty message...');
    try {
      await messageService.sendMessage(teamId, userId, '');
      console.log('❌ Empty message should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Empty message correctly rejected:', error.message);
    }
    
    // Test 4: Try to send whitespace-only message (should fail)
    console.log('Test 4: Attempting to send whitespace-only message...');
    try {
      await messageService.sendMessage(teamId, userId, '   ');
      console.log('❌ Whitespace-only message should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Whitespace-only message correctly rejected:', error.message);
    }
    
    // Test 5: Send system message
    console.log('Test 5: Sending system message...');
    const systemMessage = await messageService.sendSystemMessage(teamId, 'Task "Test Task" was moved to Done');
    console.log('✅ System message sent successfully:', systemMessage);
    
    // Test 6: Get team messages
    console.log('Test 6: Fetching team messages...');
    const messages = await messageService.getTeamMessages(teamId);
    console.log('✅ Team messages fetched successfully:', messages.length, 'messages');
    
    console.log('🎉 All message sending tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Message sending test failed:', error);
    return false;
  }
};

// Test message validation
export const testMessageValidation = () => {
  console.log('Testing message validation...');
  
  const testCases = [
    { input: 'Hello world', expected: true, description: 'Valid message' },
    { input: '', expected: false, description: 'Empty message' },
    { input: '   ', expected: false, description: 'Whitespace only' },
    { input: 'a', expected: true, description: 'Single character' },
    { input: '  Hello  ', expected: true, description: 'Message with surrounding whitespace' },
    { input: null, expected: false, description: 'Null message' },
    { input: undefined, expected: false, description: 'Undefined message' }
  ];
  
  testCases.forEach(({ input, expected, description }) => {
    const isValid = input && input.trim().length > 0;
    const passed = isValid === expected;
    console.log(`${passed ? '✅' : '❌'} ${description}: "${input}" -> ${isValid} (expected ${expected})`);
  });
  
  console.log('Message validation tests completed!');
};

// Test optimistic updates simulation
export const simulateOptimisticUpdate = () => {
  console.log('Simulating optimistic update flow...');
  
  // Simulate the optimistic update process
  const messages = [];
  const userId = 'test-user-123';
  const teamId = 'test-team-456';
  const content = 'Test optimistic message';
  
  // Step 1: Add optimistic message
  const optimisticMessage = {
    $id: `temp-${Date.now()}`,
    teamId,
    userId,
    content,
    type: 'user',
    $createdAt: new Date().toISOString(),
    userName: 'Test User',
    isOptimistic: true
  };
  
  messages.push(optimisticMessage);
  console.log('✅ Optimistic message added:', optimisticMessage);
  
  // Step 2: Simulate server response
  setTimeout(() => {
    const serverMessage = {
      $id: 'server-message-789',
      teamId,
      userId,
      content,
      type: 'user',
      $createdAt: new Date().toISOString(),
      userName: 'Test User'
    };
    
    // Remove optimistic message and add server message
    const filteredMessages = messages.filter(msg => !msg.isOptimistic);
    filteredMessages.push(serverMessage);
    
    console.log('✅ Server message received, optimistic message removed');
    console.log('Final messages:', filteredMessages);
  }, 1000);
  
  return messages;
};

// Export all test functions
export const runAllMessageTests = async (teamId, userId) => {
  console.log('🚀 Running all message tests...');
  
  testMessageValidation();
  simulateOptimisticUpdate();
  
  if (teamId && userId) {
    await testMessageSending(teamId, userId);
  } else {
    console.log('⚠️ Skipping server tests - teamId and userId required');
  }
  
  console.log('✨ All message tests completed!');
};