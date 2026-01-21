"use client";
import { motion } from 'framer-motion';
import styles from './LoadingOverlay.module.css';

export default function LoadingOverlay({ progress, visible }) {
    if (!visible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.content}>
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={styles.logo}
                >
                    Cafe Da Vina
                </motion.h1>

                <div className={styles.progressBarWrapper}>
                    <div
                        className={styles.progressBar}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className={styles.percentage}>Loading {progress}%</p>
            </div>
        </div>
    );
}
