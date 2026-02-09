"use client";

import React from "react";

// ============================================================================
// TripBanner - Alert banner rendered above the main layout
// ============================================================================

interface TripBannerProps {
  tripActive: boolean;
  tripReason: string | null;
  initError?: string | null;
  variant: "freeplay" | "training" | "legacy";
}

export default function TripBanner({
  tripActive,
  tripReason,
  initError,
  variant,
}: TripBannerProps) {
  const styles = bannerVariants[variant];

  return (
    <>
      {initError && (
        <div style={styles.banner}>
          <span style={styles.icon}>⚠</span>
          <span>INITIALIZATION ERROR: {initError}</span>
        </div>
      )}
      {tripActive && tripReason && (
        <div style={styles.banner}>
          <span style={styles.icon}>⚠</span>
          <span>REACTOR TRIP: {tripReason}</span>
        </div>
      )}
    </>
  );
}

// ============================================================================
// TripResetControls - Reset section rendered inside the controls column
// ============================================================================

interface TripResetControlsProps {
  tripActive: boolean;
  onResetTrip: () => void;
  variant: "freeplay" | "training";
}

export function TripResetControls({
  tripActive,
  onResetTrip,
  variant,
}: TripResetControlsProps) {
  if (!tripActive) return null;

  const styles = resetVariants[variant];

  return (
    <div style={styles.section}>
      <button style={styles.button} onClick={onResetTrip}>
        🔄 RESET TRIP
      </button>
      <div style={styles.hint}>
        Clears SCRAM and re-enables controls
      </div>
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const bannerVariants = {
  freeplay: {
    banner: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "16px 20px",
      marginBottom: "16px",
      background: "rgba(239, 68, 68, 0.15)",
      border: "2px solid #ef4444",
      borderRadius: "6px",
      color: "#ef4444",
      fontSize: "15px",
      fontWeight: "bold",
      letterSpacing: "0.5px",
      fontFamily: "'Inter', sans-serif",
      animation: "blink 0.5s infinite",
    } as React.CSSProperties,
    icon: {
      fontSize: "28px",
      animation: "pulse 1s ease-in-out infinite",
    } as React.CSSProperties,
  },
  training: {
    banner: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 20px",
      marginBottom: "20px",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "8px",
      color: "#991b1b",
      fontSize: "15px",
      fontWeight: "bold",
      letterSpacing: "0px",
      fontFamily: "'Inter', sans-serif",
      textTransform: "none",
      boxShadow: "0 0 30px rgba(255, 0, 0, 0.8), inset 0 2px 0 rgba(255,255,255,0.3), 0 4px 0 rgba(0,0,0,0.3)",
      textShadow: "0 1px 0 rgba(255,255,255,0.5)",
    } as React.CSSProperties,
    icon: {
      fontSize: "28px",
    } as React.CSSProperties,
  },
  legacy: {
    banner: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      marginBottom: "16px",
      background: "rgba(255, 0, 0, 0.15)",
      border: "2px solid #ff0000",
      borderRadius: "4px",
      color: "#ff5555",
      fontSize: "14px",
      fontWeight: "bold",
      letterSpacing: "1px",
      animation: "blink 1s infinite",
    } as React.CSSProperties,
    icon: {
      fontSize: "20px",
    } as React.CSSProperties,
  },
};

const resetVariants = {
  freeplay: {
    section: {
      marginBottom: "16px",
      padding: "12px",
      background: "rgba(255, 85, 85, 0.1)",
      border: "1px solid #ff5555",
      borderRadius: "6px",
    } as React.CSSProperties,
    button: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ff5555",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "bold",
      letterSpacing: "1px",
      cursor: "pointer",
      background: "#ef4444",
      color: "#fff",
    } as React.CSSProperties,
    hint: {
      marginTop: "8px",
      fontSize: "10px",
      color: "#ff9999",
      textAlign: "center",
    } as React.CSSProperties,
  },
  training: {
    section: {
      marginBottom: "16px",
      padding: "12px",
      background: "rgba(255, 85, 85, 0.1)",
      border: "1px solid #ff5555",
      borderRadius: "6px",
    } as React.CSSProperties,
    button: {
      width: "100%",
      padding: "10px",
      border: "none",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "bold",
      letterSpacing: "1px",
      cursor: "pointer",
      background: "linear-gradient(135deg, #ff5555, #ff3333)",
      color: "#fff",
    } as React.CSSProperties,
    hint: {
      marginTop: "8px",
      fontSize: "10px",
      color: "#ff9999",
      textAlign: "center",
    } as React.CSSProperties,
  },
};
