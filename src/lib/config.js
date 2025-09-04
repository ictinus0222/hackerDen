/**
 * @fileoverview Environment configuration and validation
 * Centralizes environment variable management with validation and defaults
 */

/**
 * Environment configuration with validation
 */
class Config {
  constructor() {
    this.validateEnvironment();
  }

  // Appwrite configuration
  get appwrite() {
    return {
      endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
      projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
      databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '68903612000c89d5889b'
    };
  }

  // Storage bucket configuration
  get storage() {
    return {
      teamFiles: import.meta.env.VITE_TEAM_FILES_BUCKET_ID || 'team-files',
      customEmoji: import.meta.env.VITE_CUSTOM_EMOJI_BUCKET_ID || 'custom-emoji',
      default: 'default'
    };
  }

  // Feature flags
  get features() {
    return {
      fileSharing: import.meta.env.VITE_FEATURE_FILE_SHARING !== 'false',
      gamification: import.meta.env.VITE_FEATURE_GAMIFICATION !== 'false',
      polling: import.meta.env.VITE_FEATURE_POLLING !== 'false',
      botEnhancements: import.meta.env.VITE_FEATURE_BOT !== 'false'
    };
  }

  // File upload limits
  get fileUpload() {
    return {
      maxSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      allowedTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 
        'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/markdown,text/csv,application/json,text/javascript,text/css,text/html,application/zip,application/x-zip-compressed'
      ).split(',')
    };
  }

  // Development configuration
  get development() {
    return {
      isDev: import.meta.env.DEV,
      isProd: import.meta.env.PROD,
      logLevel: import.meta.env.VITE_LOG_LEVEL || 'info'
    };
  }

  /**
   * Validate required environment variables
   * @throws {Error} If required variables are missing
   */
  validateEnvironment() {
    const required = [
      'VITE_APPWRITE_PROJECT_ID'
    ];

    const missing = required.filter(key => !import.meta.env[key]);
    
    if (missing.length > 0) {
      const error = `Missing required environment variables: ${missing.join(', ')}`;
      console.error('❌ Configuration Error:', error);
      
      if (import.meta.env.PROD) {
        throw new Error(error);
      } else {
        console.warn('⚠️ Running in development mode with missing environment variables');
      }
    }
  }

  /**
   * Get bucket ID with fallback logic
   * @param {string} bucketType - Type of bucket (TEAM_FILES, CUSTOM_EMOJI)
   * @returns {string} Bucket ID
   */
  getBucketId(bucketType) {
    const bucketMap = {
      TEAM_FILES: this.storage.teamFiles,
      CUSTOM_EMOJI: this.storage.customEmoji
    };

    return bucketMap[bucketType] || this.storage.default;
  }

  /**
   * Check if feature is enabled
   * @param {string} featureName - Name of feature to check
   * @returns {boolean} Whether feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.features[featureName] ?? false;
  }

  /**
   * Get configuration summary for debugging
   * @returns {Object} Configuration summary (without sensitive data)
   */
  getSummary() {
    return {
      appwrite: {
        endpoint: this.appwrite.endpoint,
        projectId: this.appwrite.projectId ? '***configured***' : 'missing',
        databaseId: this.appwrite.databaseId
      },
      storage: this.storage,
      features: this.features,
      development: this.development
    };
  }
}

// Export singleton instance
export const config = new Config();
export default config;