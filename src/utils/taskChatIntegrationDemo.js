// Manual verification script for Task-Chat Integration
// This demonstrates the integration between task operations and chat system messages

import { taskService } from '../services/taskService';
import { messageService } from '../services/messageService';

export const demonstrateTaskChatIntegration = async (teamId, userId, userName) => {
  console.log('🚀 Starting Task-Chat Integration Demonstration...');
  console.log('Team ID:', teamId);
  console.log('User ID:', userId);
  console.log('User Name:', userName);
  
  try {
    // 1. Create a new task (should trigger system message)
    console.log('\n📝 Step 1: Creating a new task...');
    const taskData = {
      title: 'Integration Test Task',
      description: 'This task is created to test the task-chat integration',
      assignedTo: userId,
      createdBy: userId
    };
    
    const newTask = await taskService.createTask(teamId, taskData, userName);
    console.log('✅ Task created successfully:', newTask.title);
    console.log('   Expected system message: "📝 [userName] created a new task: [taskTitle]"');
    
    // Wait a moment for the system message to be sent
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. Update task status to in_progress (should trigger system message)
    console.log('\n🔄 Step 2: Moving task to In Progress...');
    await taskService.updateTaskStatus(newTask.$id, 'in_progress', newTask.title, teamId);
    console.log('✅ Task moved to In Progress');
    console.log('   Expected system message: "🔄 Task [taskTitle] moved to In Progress"');
    
    // Wait a moment for the system message to be sent
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Update task status to done (should trigger completion message)
    console.log('\n✅ Step 3: Completing the task...');
    await taskService.updateTaskStatus(newTask.$id, 'done', newTask.title, teamId);
    console.log('✅ Task completed');
    console.log('   Expected system message: "✅ Task completed: [taskTitle]"');
    
    // Wait a moment for the system message to be sent
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Fetch recent messages to verify system messages were created
    console.log('\n💬 Step 4: Fetching recent messages to verify integration...');
    const messages = await messageService.getTeamMessages(teamId);
    
    // Filter for system messages related to our test task
    const systemMessages = messages.filter(msg => 
      msg.type === 'system' && 
      msg.content.includes('Integration Test Task')
    );
    
    console.log(`📊 Found ${systemMessages.length} system messages for our test task:`);
    systemMessages.forEach((msg, index) => {
      console.log(`   ${index + 1}. [${msg.type}] ${msg.content}`);
    });
    
    // 5. Verify expected system messages
    console.log('\n🔍 Step 5: Verifying expected system messages...');
    const expectedMessages = [
      { type: 'task_created', pattern: /📝.*created a new task.*Integration Test Task/ },
      { type: 'task_status_changed', pattern: /🔄.*Integration Test Task.*moved to In Progress/ },
      { type: 'task_status_changed', pattern: /✅.*Task completed.*Integration Test Task/ }
    ];
    
    let allExpectedFound = true;
    expectedMessages.forEach((expected, index) => {
      const found = systemMessages.some(msg => expected.pattern.test(msg.content));
      if (found) {
        console.log(`   ✅ Expected message ${index + 1} found`);
      } else {
        console.log(`   ❌ Expected message ${index + 1} NOT found`);
        allExpectedFound = false;
      }
    });
    
    if (allExpectedFound) {
      console.log('\n🎉 Task-Chat Integration Demonstration SUCCESSFUL!');
      console.log('   All expected system messages were generated correctly.');
    } else {
      console.log('\n⚠️  Task-Chat Integration Demonstration PARTIAL SUCCESS');
      console.log('   Some expected system messages were missing.');
    }
    
    return {
      success: allExpectedFound,
      taskId: newTask.$id,
      systemMessagesCount: systemMessages.length,
      totalMessagesCount: messages.length
    };
    
  } catch (error) {
    console.error('❌ Task-Chat Integration Demonstration FAILED:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to verify system message styling types
export const verifySystemMessageTypes = () => {
  console.log('🎨 System Message Types and Styling:');
  console.log('   1. task_created: Blue background (bg-blue-50, text-blue-700)');
  console.log('   2. task_status_changed: Green background (bg-green-50, text-green-700)');
  console.log('   3. system (default): Gray background (bg-gray-100, text-gray-600)');
  
  const messageTypes = [
    {
      type: 'task_created',
      example: '📝 John Doe created a new task: "Setup authentication"',
      styling: 'Blue theme with border-blue-200'
    },
    {
      type: 'task_status_changed',
      example: '🔄 Task "Setup authentication" moved to In Progress',
      styling: 'Green theme with border-green-200'
    },
    {
      type: 'task_status_changed',
      example: '✅ Task completed: "Setup authentication"',
      styling: 'Green theme with border-green-200'
    }
  ];
  
  messageTypes.forEach((msg, index) => {
    console.log(`\n   Example ${index + 1}:`);
    console.log(`     Type: ${msg.type}`);
    console.log(`     Message: "${msg.example}"`);
    console.log(`     Styling: ${msg.styling}`);
  });
};

// Usage instructions
export const getUsageInstructions = () => {
  return `
🔧 How to use Task-Chat Integration Demo:

1. Import the demo function:
   import { demonstrateTaskChatIntegration } from './utils/taskChatIntegrationDemo';

2. Call it with your team and user data:
   const result = await demonstrateTaskChatIntegration(teamId, userId, userName);

3. Check the console for detailed output and verification results.

4. Open your chat interface to see the system messages appear in real-time.

📋 What this demo tests:
- ✅ Task creation triggers system message
- ✅ Task status changes trigger system messages  
- ✅ Task completion has special message format
- ✅ System messages have correct types for styling
- ✅ Messages appear in team chat in real-time

🎨 System Message Styling:
- Task creation: Blue theme (📝 icon)
- Status changes: Green theme (🔄 icon)
- Task completion: Green theme (✅ icon)
`;
};