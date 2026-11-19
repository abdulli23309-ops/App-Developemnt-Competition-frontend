/**
 * @file CampusConnect Domain Types & JSDoc Definitions
 * Defines entities planned in the CampusConnect Master Plan.
 */

/**
 * @typedef {'Student' | 'DeptAdmin' | 'SuperAdmin'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} fullName
 * @property {UserRole} role
 * @property {number|null} departmentId
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} Department
 * @property {number} id
 * @property {string} name
 * @property {string} [code]
 * @property {string} [description]
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {number} departmentId
 * @property {string} [description]
 */

/**
 * @typedef {Object} IssueType
 * @property {number} id
 * @property {string} name
 * @property {number} categoryId
 * @property {string} [description]
 */

/**
 * @typedef {'Submitted' | 'UnderReview' | 'Assigned' | 'InProgress' | 'Resolved' | 'Rejected' | 'Closed'} ComplaintStatus
 */

/**
 * @typedef {'Low' | 'Medium' | 'High' | 'Urgent'} ComplaintPriority
 */

/**
 * @typedef {Object} Complaint
 * @property {number} id
 * @property {string} trackingNumber
 * @property {string} title
 * @property {string} description
 * @property {ComplaintStatus} status
 * @property {ComplaintPriority} priority
 * @property {number} submitterId
 * @property {number} departmentId
 * @property {number} categoryId
 * @property {number} [issueTypeId]
 * @property {number|null} [assignedToId]
 * @property {string} createdAt
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} ComplaintAttachment
 * @property {number} id
 * @property {number} complaintId
 * @property {string} fileName
 * @property {string} fileUrl
 * @property {string} fileType
 * @property {number} fileSize
 * @property {string} uploadedAt
 */

/**
 * @typedef {Object} ComplaintResponse
 * @property {number} id
 * @property {number} complaintId
 * @property {number} authorId
 * @property {string} message
 * @property {boolean} isInternal
 * @property {string} createdAt
 */

/**
 * @typedef {Object} StatusHistory
 * @property {number} id
 * @property {number} complaintId
 * @property {ComplaintStatus} previousStatus
 * @property {ComplaintStatus} newStatus
 * @property {number} changedById
 * @property {string} [notes]
 * @property {string} changedAt
 */

/**
 * @typedef {Object} Notification
 * @property {number} id
 * @property {number} userId
 * @property {string} title
 * @property {string} message
 * @property {boolean} isRead
 * @property {string} [actionUrl]
 * @property {string} createdAt
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {T} [data]
 * @property {string[]} [errors]
 * @property {string} [timestamp]
 */

