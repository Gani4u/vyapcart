// src/components/LocationPermissionDialog.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

interface LocationPermissionDialogProps {
  visible: boolean;
  appName?: string;
  onPrecisePermission: (duration: 'always' | 'once') => Promise<void>;
  onApproximatePermission: (duration: 'always' | 'once') => Promise<void>;
  onDeny: () => Promise<void>;
  loading?: boolean;
  isBlocked?: boolean;
  onOpenSettings?: () => void;
}

type PermissionType = 'precise' | 'approximate' | null;
type PermissionDuration = 'while-using' | 'only-this-time' | 'deny';

interface AccuracyOption {
  id: PermissionType;
  label: string;
  description: string;
  icon: string;
  selected: boolean;
}

const { width } = Dimensions.get('window');

export const LocationPermissionDialog: React.FC<LocationPermissionDialogProps> = ({
  visible,
  appName = 'Vyapkart',
  onPrecisePermission,
  onApproximatePermission,
  onDeny,
  loading = false,
  isBlocked = false,
  onOpenSettings,
}) => {
  const [selectedAccuracy, setSelectedAccuracy] = useState<PermissionType>('precise');
  const [selectedDuration, setSelectedDuration] = useState<PermissionDuration>('while-using');
  const [isProcessing, setIsProcessing] = useState(false);

  const accuracyOptions: AccuracyOption[] = [
    {
      id: 'precise',
      label: 'Precise',
      description: 'Accurate to ~5 meters',
      icon: '📍',
      selected: selectedAccuracy === 'precise',
    },
    {
      id: 'approximate',
      label: 'Approximate',
      description: 'Accurate to ~1.6 kilometers',
      icon: '🗺️',
      selected: selectedAccuracy === 'approximate',
    },
  ];

  const durationOptions: { id: PermissionDuration; label: string }[] = [
    { id: 'while-using', label: 'While using the app' },
    { id: 'only-this-time', label: 'Only this time' },
    { id: 'deny', label: "Don't allow" },
  ];

  const handleAllow = async () => {
    try {
      setIsProcessing(true);

      if (selectedDuration === 'deny') {
        await onDeny();
        return;
      }

      const duration = selectedDuration === 'while-using' ? 'always' : 'once';

      if (selectedAccuracy === 'precise') {
        await onPrecisePermission(duration);
      } else if (selectedAccuracy === 'approximate') {
        await onApproximatePermission(duration);
      }
    } catch (error) {
      console.error('Error handling location permission:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Blocked permission UI
  if (isBlocked) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.dialogContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.locationIcon}>⚙️</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              Location Permission Blocked
            </Text>

            {/* Description */}
            <Text style={styles.description}>
              To use location features, please enable location permission in your device settings.
            </Text>

            {/* Instructions */}
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>How to enable:</Text>
              <Text style={styles.instructionText}>
                1. Go to Settings{'\n'}
                2. Find Apps or Permissions{'\n'}
                3. Select {appName}{'\n'}
                4. Tap Permissions{'\n'}
                5. Enable Location
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.secondaryButton]}
                onPress={onDeny}
                disabled={isProcessing}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.allowButton,
                  isProcessing && styles.allowButtonDisabled,
                ]}
                onPress={() => {
                  setIsProcessing(true);
                  if (onOpenSettings) {
                    onOpenSettings();
                  }
                  setIsProcessing(false);
                }}
                disabled={isProcessing}
              >
                <Text style={styles.allowButtonText}>
                  {isProcessing ? 'Opening...' : 'Open Settings'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Normal permission UI
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.locationIcon}>📍</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Allow {appName} to access this device's location?
          </Text>

          {/* Accuracy Selection */}
          <View style={styles.accuracySection}>
            <Text style={styles.sectionLabel}>Location Accuracy</Text>
            <View style={styles.accuracyContainer}>
              {accuracyOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.accuracyCard,
                    option.selected && styles.accuracyCardSelected,
                  ]}
                  onPress={() => setSelectedAccuracy(option.id)}
                  disabled={isProcessing || loading}
                >
                  <Text style={styles.accuracyIcon}>{option.icon}</Text>
                  <Text style={styles.accuracyLabel}>{option.label}</Text>
                  <Text style={styles.accuracyDescription}>{option.description}</Text>
                  {option.selected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Duration Selection */}
          <View style={styles.durationSection}>
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.durationButton,
                  selectedDuration === option.id && styles.durationButtonSelected,
                ]}
                onPress={() => setSelectedDuration(option.id)}
                disabled={isProcessing || loading}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    selectedDuration === option.id && styles.durationButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.allowButton,
              (isProcessing || loading) && styles.allowButtonDisabled,
            ]}
            onPress={handleAllow}
            disabled={isProcessing || loading}
          >
            <Text style={styles.allowButtonText}>
              {isProcessing || loading ? 'Processing...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  dialogContainer: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: spacing.lg,
    width: '100%',
    maxWidth: width - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  locationIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  accuracySection: {
    marginBottom: spacing.lg,
  },
  accuracyContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  accuracyCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
    position: 'relative',
  },
  accuracyCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  accuracyIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  accuracyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  accuracyDescription: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  durationSection: {
    marginBottom: spacing.lg,
  },
  durationButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationButtonSelected: {
    backgroundColor: `${colors.primary}12`,
    borderColor: colors.primary,
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  durationButtonTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  allowButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: spacing.sm,
  },
  allowButtonDisabled: {
    opacity: 0.6,
  },
  allowButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  instructionsBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'Menlo',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
