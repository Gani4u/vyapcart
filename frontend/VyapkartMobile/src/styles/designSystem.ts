// src/styles/designSystem.ts
// Comprehensive Design System exported from global.css

import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const designSystem = {
  // Color Tokens
  colors: {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    primaryDark: '#1E40AF',
    primaryHover: '#1D4ED8',
    
    success: '#10B981',
    successLight: '#D1FAE5',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#EFF6FF',
    
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceAlt: '#F3F4F6',
    surfaceLight: '#E5E7EB',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textLight: '#D1D5DB',
    border: '#D1D5DB',
    borderLight: '#E5E7EB',
    divider: '#F3F4F6',
  },

  // Shadows
  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
      elevation: 12,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },

  // Border Radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    full: 9999,
  },
};

export const premiumStyles = StyleSheet.create({
  // ==================== CARDS ====================
  cardPremium: {
    backgroundColor: designSystem.colors.background,
    borderTopLeftRadius: designSystem.radius.xl,
    borderTopRightRadius: designSystem.radius.xl,
    borderBottomLeftRadius: designSystem.radius.xl,
    borderBottomRightRadius: designSystem.radius.xl,
    overflow: 'hidden',
    ...designSystem.shadows.lg,
  },

  cardPremiumImage: {
    width: '100%',
    height: 200,
    backgroundColor: designSystem.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardPremiumContent: {
    padding: designSystem.spacing.lg,
  },

  cardPremiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: designSystem.spacing.sm,
  },

  cardPremiumName: {
    fontSize: 16,
    fontWeight: '700',
    color: designSystem.colors.text,
    flex: 1,
    marginRight: designSystem.spacing.md,
  },

  cardPremiumPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: designSystem.colors.primary,
  },

  cardPremiumOriginalPrice: {
    fontSize: 14,
    color: designSystem.colors.textSecondary,
    textDecorationLine: 'line-through',
  },

  cardPremiumSeller: {
    fontSize: 13,
    color: designSystem.colors.textSecondary,
    marginBottom: designSystem.spacing.md,
  },

  cardPremiumDistance: {
    backgroundColor: designSystem.colors.successLight,
    color: designSystem.colors.success,
    paddingVertical: designSystem.spacing.xs,
    paddingHorizontal: designSystem.spacing.md,
    borderRadius: designSystem.radius.full,
    fontSize: 12,
    fontWeight: '600',
    marginTop: designSystem.spacing.sm,
    overflow: 'hidden',
  },

  cardPremiumRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing.md,
    marginTop: designSystem.spacing.md,
  },

  cardPremiumRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: designSystem.colors.text,
    marginLeft: designSystem.spacing.sm,
  },

  cardPremiumBadge: {
    position: 'absolute',
    top: designSystem.spacing.md,
    right: designSystem.spacing.md,
    backgroundColor: designSystem.colors.danger,
    paddingVertical: designSystem.spacing.xs,
    paddingHorizontal: designSystem.spacing.md,
    borderRadius: designSystem.radius.md,
  },

  cardPremiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  cardPremiumFooter: {
    flexDirection: 'row',
    gap: designSystem.spacing.sm,
    marginTop: designSystem.spacing.lg,
    paddingTop: designSystem.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.divider,
  },

  cardPremiumButton: {
    flex: 1,
    paddingVertical: designSystem.spacing.md,
    paddingHorizontal: designSystem.spacing.lg,
    backgroundColor: designSystem.colors.primary,
    borderRadius: designSystem.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardPremiumButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // ==================== GRID LAYOUT ====================
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing.lg,
    paddingHorizontal: designSystem.spacing.lg,
    paddingBottom: designSystem.spacing.xl,
  },

  gridItem2: {
    width: '48%',
  },

  // ==================== ADDRESS INPUT ====================
  addressContainer: {
    backgroundColor: designSystem.colors.surface,
    borderRadius: designSystem.radius.lg,
    padding: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.lg,
    borderWidth: 1.5,
    borderColor: designSystem.colors.border,
  },

  addressContainerActive: {
    borderColor: designSystem.colors.primary,
    backgroundColor: `${designSystem.colors.primary}08`,
  },

  addressInputRow: {
    flexDirection: 'row',
    gap: designSystem.spacing.md,
    marginBottom: designSystem.spacing.md,
  },

  addressInputFlex1: {
    flex: 1,
  },

  addressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: designSystem.colors.text,
    marginBottom: designSystem.spacing.sm,
  },

  // ==================== SECTION HEADER ====================
  sectionHeader: {
    paddingHorizontal: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: designSystem.colors.divider,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: designSystem.colors.text,
    marginBottom: designSystem.spacing.sm,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: designSystem.colors.textSecondary,
  },

  // ==================== PRODUCT LIST ====================
  productListContainer: {
    paddingHorizontal: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.lg,
  },

  productListEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: designSystem.spacing['3xl'],
  },

  productListEmptyText: {
    fontSize: 16,
    color: designSystem.colors.textSecondary,
    marginTop: designSystem.spacing.lg,
  },

  // ==================== TAB NAVIGATION ====================
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.lg,
    gap: designSystem.spacing.md,
  },

  tabButton: {
    paddingVertical: designSystem.spacing.md,
    paddingHorizontal: designSystem.spacing.lg,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },

  tabButtonActive: {
    borderBottomColor: designSystem.colors.primary,
  },

  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: designSystem.colors.textSecondary,
  },

  tabButtonTextActive: {
    color: designSystem.colors.primary,
  },

  // ==================== HEADER ====================
  headerContainer: {
    backgroundColor: designSystem.colors.primary,
    paddingHorizontal: designSystem.spacing.lg,
    paddingTop: designSystem.spacing.xl,
    paddingBottom: designSystem.spacing.lg,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: designSystem.spacing.sm,
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // ==================== FILTER CHIPS ====================
  filterChipsContainer: {
    flexDirection: 'row',
    gap: designSystem.spacing.sm,
    paddingHorizontal: designSystem.spacing.lg,
    marginVertical: designSystem.spacing.md,
    flexWrap: 'wrap',
  },

  filterChip: {
    paddingVertical: designSystem.spacing.sm,
    paddingHorizontal: designSystem.spacing.lg,
    borderRadius: designSystem.radius.full,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },

  filterChipActive: {
    backgroundColor: designSystem.colors.primary,
    borderColor: designSystem.colors.primary,
  },

  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: designSystem.colors.text,
  },

  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // ==================== BOTTOM SHEET ====================
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  bottomSheetContent: {
    backgroundColor: designSystem.colors.background,
    borderTopLeftRadius: designSystem.radius['2xl'],
    borderTopRightRadius: designSystem.radius['2xl'],
    paddingHorizontal: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.xl,
  },

  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: designSystem.colors.divider,
    borderRadius: designSystem.radius.full,
    alignSelf: 'center',
    marginBottom: designSystem.spacing.lg,
  },
});
