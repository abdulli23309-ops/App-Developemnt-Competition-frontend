import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  FileImage,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye,
} from 'lucide-react';
import IconRenderer from './IconRenderer';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_FILES = 3;

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function FileUpload({
  files = [], // Array of File objects or { file, preview, name, size }
  onChange, // (newFilesArray) => void
  disabled = false,
  maxFiles = MAX_FILES,
  maxSizeBytes = MAX_FILE_SIZE_BYTES,
  className = '',
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const inputRef = useRef(null);

  const validateAndAddFiles = (incomingFileList) => {
    setErrorMessage('');
    const incoming = Array.from(incomingFileList);

    if (files.length + incoming.length > maxFiles) {
      setErrorMessage(`Maximum limit reached: you can upload up to ${maxFiles} image attachments.`);
      return;
    }

    const validNewFiles = [];

    for (const file of incoming) {
      const extension = '.' + (file.name.split('.').pop() || '').toLowerCase();
      const isTypeAllowed =
        ALLOWED_MIME_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension);

      if (!isTypeAllowed) {
        setErrorMessage(`"${file.name}" has an unsupported format. Only PNG, JPG, JPEG, and WEBP are permitted.`);
        return;
      }

      if (file.size > maxSizeBytes) {
        setErrorMessage(`"${file.name}" exceeds the 2 MB limit (${formatFileSize(file.size)}). Please choose a smaller image.`);
        return;
      }

      // Create local preview blob URL
      const previewUrl = URL.createObjectURL(file);
      validNewFiles.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: previewUrl,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      });
    }

    if (validNewFiles.length > 0) {
      onChange?.([...files, ...validNewFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && files.length < maxFiles) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || files.length >= maxFiles) return;

    if (e.dataTransfer && e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      // Reset input value so re-selecting same file triggers onChange
      e.target.value = '';
    }
  };

  const handleRemove = (indexToRemove) => {
    const target = files[indexToRemove];
    if (target?.preview && target.preview.startsWith('blob:')) {
      URL.revokeObjectURL(target.preview);
    }
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    onChange?.(updated);
    setErrorMessage('');
  };

  return (
    <div className={`cc-file-upload-container ${className}`.trim()}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || files.length >= maxFiles}
      />

      {/* Drop Zone Box */}
      {files.length < maxFiles && (
        <div
          className={`cc-dropzone ${isDragOver ? 'cc-dropzone-active' : ''} ${disabled ? 'cc-dropzone-disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          aria-label="Upload evidence photos"
        >
          <div className="cc-dropzone-icon-box">
            <UploadCloud size={28} strokeWidth={2} />
          </div>
          <div className="cc-dropzone-text">
            <div className="cc-dropzone-primary-text">
              <span className="cc-dropzone-cta">Click to upload</span> or drag and drop images
            </div>
            <div className="cc-dropzone-hints">
              PNG, JPG, JPEG, WEBP &bull; Max 2 MB each &bull; Up to {maxFiles} attachments ({maxFiles - files.length} remaining)
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="cc-upload-error-box" role="alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
          <button
            type="button"
            className="cc-upload-error-dismiss"
            onClick={() => setErrorMessage('')}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Previews List */}
      {files.length > 0 && (
        <div className="cc-attachment-previews-grid">
          {files.map((item, index) => {
            const previewSrc = item.preview || item.fileUrl || item.url;
            return (
              <div key={item.id || index} className="cc-attachment-card">
                <div className="cc-attachment-thumb">
                  {previewSrc ? (
                    <img src={previewSrc} alt={item.name || 'Attachment'} />
                  ) : (
                    <div className="cc-attachment-fallback-icon">
                      <FileImage size={24} />
                    </div>
                  )}
                  {previewSrc && (
                    <button
                      type="button"
                      className="cc-thumb-preview-action"
                      onClick={() => setPreviewModalUrl(previewSrc)}
                      title="Enlarge preview"
                      aria-label="Preview image"
                    >
                      <Eye size={15} />
                    </button>
                  )}
                </div>

                <div className="cc-attachment-info">
                  <span className="cc-attachment-name" title={item.name}>
                    {item.name}
                  </span>
                  <span className="cc-attachment-size">
                    {formatFileSize(item.size || item.fileSizeBytes || 0)}
                  </span>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    className="cc-attachment-remove-btn"
                    onClick={() => handleRemove(index)}
                    aria-label={`Remove ${item.name}`}
                    title="Remove attachment"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Enlarge Lightbox Modal */}
      {previewModalUrl && (
        <div
          className="cc-lightbox-overlay"
          onClick={() => setPreviewModalUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="cc-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewModalUrl} alt="Enlarged attachment preview" />
            <button
              type="button"
              className="cc-lightbox-close"
              onClick={() => setPreviewModalUrl(null)}
              aria-label="Close enlarged preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
