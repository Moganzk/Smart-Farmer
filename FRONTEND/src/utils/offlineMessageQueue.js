/**
 * Offline Message Queue - Client Implementation
 * 
 * This file demonstrates how a client-side implementation would
 * handle offline message queueing.
 * 
 * In a real mobile app, this would be implemented in React Native,
 * Flutter, or another mobile framework.
 */

class OfflineMessageQueue {
  constructor(apiClient) {
    this.queue = [];
    this.apiClient = apiClient;
    this.isOnline = navigator.onLine;
    this.isProcessing = false;
    
    // Set up online/offline event listeners
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));
  }
  
  /**
   * Handle online status change
   * @param {boolean} isOnline - Whether device is online
   */
  handleOnlineStatus(isOnline) {
    this.isOnline = isOnline;
    
    if (isOnline && this.queue.length > 0) {
      this.processQueue();
    }
  }
  
  /**
   * Queue a message for sending
   * @param {object} message - Message to be sent
   * @returns {string} Client ID of queued message
   */
  queueMessage(message) {
    // Generate a unique client ID for tracking this message
    const clientId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedMessage = {
      ...message,
      clientId,
      queuedAt: new Date()
    };
    
    // Add to queue
    this.queue.push(queuedMessage);
    
    // Save queue to local storage for persistence
    this.persistQueue();
    
    // Try to process immediately if online
    if (this.isOnline && !this.isProcessing) {
      this.processQueue();
    }
    
    return clientId;
  }
  
  /**
   * Process the message queue
   */
  async processQueue() {
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Send all queued messages to the server
      const response = await this.apiClient.post('/api/message-queue/sync', {
        messages: this.queue
      });
      
      // Handle successful messages
      if (response.data.successes && response.data.successes.length > 0) {
        // Remove successful messages from the queue
        const successIds = response.data.successes.map(success => success.clientId);
        this.queue = this.queue.filter(message => !successIds.includes(message.clientId));
      }
      
      // Update queue in local storage
      this.persistQueue();
      
      // Notify any listeners about the results
      this.notifyQueueProcessed(response.data);
    } catch (error) {
      console.error('Error processing message queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Get queue status
   * @returns {object} Current queue status
   */
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      isOnline: this.isOnline,
      isProcessing: this.isProcessing
    };
  }
  
  /**
   * Persist queue to local storage
   */
  persistQueue() {
    try {
      localStorage.setItem('messageQueue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving queue to local storage:', error);
    }
  }
  
  /**
   * Load queue from local storage
   */
  loadQueue() {
    try {
      const saved = localStorage.getItem('messageQueue');
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading queue from local storage:', error);
      this.queue = [];
    }
  }
  
  /**
   * Notify listeners about queue processing results
   * @param {object} results - Queue processing results
   */
  notifyQueueProcessed(results) {
    // This would dispatch events or call callbacks in a real implementation
    console.log('Queue processed:', results);
  }
}

// Usage example:
// const apiClient = axios.create({ baseURL: 'https://api.smartfarmer.com' });
// const messageQueue = new OfflineMessageQueue(apiClient);
// 
// // Queue a message when user sends it
// const clientId = messageQueue.queueMessage({
//   groupId: 123,
//   content: 'Hello, this is an offline message',
//   hasAttachment: false
// });
// 
// // Show UI feedback that message is queued
// showQueuedMessageIndicator(clientId);

export default OfflineMessageQueue;