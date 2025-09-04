/**
 * @fileoverview Type definitions for file-related operations
 * Provides TypeScript-like documentation for better IDE support and code clarity
 */

/**
 * @typedef {Object} FileDocument
 * @property {string} $id - Unique document identifier
 * @property {string} teamId - Team identifier
 * @property {string} uploadedBy - User ID who uploaded the file
 * @property {string} fileName - Original file name
 * @property {string} fileType - MIME type of the file
 * @property {number} fileSize - File size in bytes
 * @property {string} storageId - Appwrite Storage file identifier
 * @property {string|null} previewUrl - Preview URL for images
 * @property {number} annotationCount - Number of annotations on this file
 * @property {string} createdAt - ISO timestamp of creation
 * @property {string} updatedAt - ISO timestamp of last update
 */

/**
 * @typedef {Object} FileAnnotation
 * @property {string} $id - Unique annotation identifier
 * @property {string} fileId - File document identifier
 * @property {string} userId - User who created the annotation
 * @property {string} content - Annotation text content
 * @property {AnnotationPosition} position - Position data for the annotation
 * @property {'point'|'area'|'line'} type - Type of annotation
 * @property {string} createdAt - ISO timestamp of creation
 */

/**
 * @typedef {Object} AnnotationPosition
 * @property {number} x - X coordinate (pixels or percentage)
 * @property {number} y - Y coordinate (pixels or percentage)
 * @property {number} [width] - Width for area annotations
 * @property {number} [height] - Height for area annotations
 */

/**
 * @typedef {Object} FileUploadOptions
 * @property {string} teamId - Team identifier
 * @property {File} file - File object to upload
 * @property {string} uploadedBy - User ID of uploader
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} FileValidationResult
 * @property {boolean} isValid - Whether file passes validation
 * @property {string[]} errors - Array of validation error messages
 * @property {Object} fileInfo - Extracted file information
 */

export {};