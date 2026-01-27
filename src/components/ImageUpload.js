"use client";
import { useState, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import styles from './ImageUpload.module.css';

export default function ImageUpload({ value, onChange, label = "Upload Image" }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async (file) => {
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setError("Please upload an image file.");
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'placeholder_preset');

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await response.json();
            onChange(data.secure_url);
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleUpload(file);
    }, []);

    const onFileSelect = (e) => {
        const file = e.target.files[0];
        handleUpload(file);
    };

    const removeImage = (e) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>

            <div
                className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${value ? styles.hasValue : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !uploading && document.getElementById(`file-input-${label}`).click()}
            >
                <input
                    id={`file-input-${label}`}
                    type="file"
                    className={styles.hiddenInput}
                    onChange={onFileSelect}
                    accept="image/*"
                />

                {uploading ? (
                    <div className={styles.statusBox}>
                        <Loader2 className={styles.spinner} size={32} />
                        <p>Uploading to Cloudinary...</p>
                    </div>
                ) : value ? (
                    <div className={styles.previewContainer}>
                        <img src={value} alt="Preview" className={styles.previewImage} />
                        <div className={styles.previewOverlay}>
                            <div className={styles.successBadge}>
                                <CheckCircle2 size={16} /> Ready
                            </div>
                            <button className={styles.removeBtn} onClick={removeImage}>
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.prompt}>
                        <div className={styles.iconCircle}>
                            <Upload size={24} />
                        </div>
                        <div className={styles.textGroup}>
                            <p className={styles.mainText}>Click or drag image here</p>
                            <p className={styles.subText}>PNG, JPG, WebP up to 10MB</p>
                        </div>
                    </div>
                )}
            </div>

            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
}
