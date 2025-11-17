import * as cron from 'node-cron';
import { checkAndNotifyAllUsers, setSessionId } from './utils';
import './bot'; // Initialize bot

// Function to check the website and send a message if content is found
const checkWebsiteAndSendMessage = async () => {
  try {
    await checkAndNotifyAllUsers();
  } catch (error) {
    console.error('Error checking website:', error);
  }
};

// Set default token
const DEFAULT_TOKEN = process.env.DEFAULT_TOKEN;
setSessionId(DEFAULT_TOKEN)

// Schedule the check to run every X seconds (e.g., every 60 seconds)
cron.schedule('*/20 * * * * *', () => {
  checkWebsiteAndSendMessage();
});

console.log('Monitoring website for available passages...');