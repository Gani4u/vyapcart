// src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const globalStyles = StyleSheet.create({
  // ==================== LAYOUT ====================
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },

  contentContainer: {
    flexGrow: 1,
    paddingVertical: spacing.lg,
  },

  // ==================== TYPOGRAPHY ====================
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },

  subHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },

  text: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
  },

  textSmall: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 18,
  },

  textSecondary: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 19,
  },

  textBold: {
    fontWeight: '700',
  },

  textMuted: {
    color: colors.textSecondary,
  },

  // ==================== INPUTS ====================
  input: {
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    color: colors.text,
    minHeight: 48,
  },

  inputError: {
    borderColor: colors.error,
  },

  inputFocus: {
    borderColor: colors.primary,
  },

  inputDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.6,
  },

  // ==================== BUTTONS ====================
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },

  buttonDanger: {
    backgroundColor: colors.error,
  },

  buttonSuccess: {
    backgroundColor: colors.success,
  },

  buttonWarning: {
    backgroundColor: '#F59E0B',
  },

  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },

  buttonLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
  },

  buttonTextSecondary: {
    color: colors.text,
  },

  buttonTextSmall: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ==================== CARDS & CONTAINERS ====================
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardHighlight: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.primary,
    borderWidth: 2,
  },

  cardElevated: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  section: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  sectionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // ==================== ERROR & SUCCESS MESSAGES ====================
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.error,
    marginTop: spacing.xs,
  },

  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  errorBorder: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },

  successText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.success,
    marginTop: spacing.xs,
  },

  successContainer: {
    backgroundColor: '#DCFCE7',
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  // ==================== INFO BOXES ====================
  infoBox: {
    backgroundColor: colors.infoBg,
    borderColor: colors.info,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },

  infoText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.info,
    lineHeight: 20,
  },

  warningBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },

  // ==================== FORM ELEMENTS ====================
  formGroup: {
    marginBottom: spacing.lg,
  },

  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  formRowItem: {
    flex: 1,
  },

  formField: {
    marginBottom: spacing.lg,
  },

  // ==================== DIVIDER & SEPARATOR ====================
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  dividerSmall: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // ==================== BADGES & TAGS ====================
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.background,
  },

  badgeSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  badgeSecondaryText: {
    color: colors.text,
  },

  // ==================== LOADING & EMPTY STATES ====================
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },

  // ==================== FLEX UTILITIES ====================
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==================== SPACING UTILITIES ====================
  gap: {
    gap: spacing.md,
  },

  gapSmall: {
    gap: spacing.sm,
  },

  gapLarge: {
    gap: spacing.lg,
  },

  // ==================== SHADOWS ====================
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  shadowSmall: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  shadowLarge: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  // ==================== LIST & ITEMS ====================
  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  listItemLast: {
    borderBottomWidth: 0,
  },

  // ==================== HEADER ====================
  headerContainer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
  },

  headerText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.background,
  },

  // ==================== OVERLAY ====================
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  overlayDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // ==================== ADDITIONAL UTILITIES ====================
  flexOne: {
    flex: 1,
  },

  flexRow: {
    flexDirection: 'row',
  },

  flexColumn: {
    flexDirection: 'column',
  },

  flexWrap: {
    flexWrap: 'wrap',
  },

  flexGrow: {
    flexGrow: 1,
  },

  justifyCenter: {
    justifyContent: 'center',
  },

  alignCenter: {
    alignItems: 'center',
  },

  justifyAlignCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  justifyBetween: {
    justifyContent: 'space-between',
  },

  justifyAround: {
    justifyContent: 'space-around',
  },

  alignStart: {
    alignItems: 'flex-start',
  },

  alignEnd: {
    alignItems: 'flex-end',
  },

  // ==================== BORDER RADIUS ====================
  roundedSmall: {
    borderRadius: 4,
  },

  rounded: {
    borderRadius: 8,
  },

  roundedMedium: {
    borderRadius: 12,
  },

  roundedLarge: {
    borderRadius: 16,
  },

  roundedFull: {
    borderRadius: 999,
  },

  // ==================== BORDER ====================
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  borderLeft: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },

  borderLeftSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },

  borderLeftError: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },

  // ==================== OPACITY ====================
  opacity50: {
    opacity: 0.5,
  },

  opacity70: {
    opacity: 0.7,
  },

  opacity80: {
    opacity: 0.8,
  },

  opacity90: {
    opacity: 0.9,
  },

  // ==================== TEXT SIZING ====================
  textXS: {
    fontSize: 11,
  },

  textSM: {
    fontSize: 12,
  },

  textBase: {
    fontSize: 14,
  },

  textLG: {
    fontSize: 16,
  },

  textXL: {
    fontSize: 18,
  },

  text2XL: {
    fontSize: 20,
  },

  // ==================== FONT WEIGHT ====================
  fontRegular: {
    fontWeight: '400',
  },

  fontMedium: {
    fontWeight: '500',
  },

  fontSemibold: {
    fontWeight: '600',
  },

  fontBold: {
    fontWeight: '700',
  },

  fontBlack: {
    fontWeight: '800',
  },

  // ==================== LINE HEIGHT ====================
  lineHeightTight: {
    lineHeight: 18,
  },

  lineHeightNormal: {
    lineHeight: 20,
  },

  lineHeightRelaxed: {
    lineHeight: 22,
  },

  // ==================== COMBINATIONS ====================
  textBody: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },

  textBodyBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  textCaption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },

  titleSection: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.lg,
    color: colors.text,
  },

  // ==================== PADDING ====================
  padSmall: {
    padding: spacing.sm,
  },

  padMedium: {
    padding: spacing.md,
  },

  padLarge: {
    padding: spacing.lg,
  },

  padXL: {
    padding: spacing.xl,
  },

  padHorizontal: {
    paddingHorizontal: spacing.lg,
  },

  padVertical: {
    paddingVertical: spacing.lg,
  },

  // ==================== MARGIN ====================
  marginSmall: {
    marginBottom: spacing.sm,
  },

  marginMedium: {
    marginBottom: spacing.md,
  },

  marginLarge: {
    marginBottom: spacing.lg,
  },

  marginXL: {
    marginBottom: spacing.xl,
  },

  marginTopSmall: {
    marginTop: spacing.sm,
  },

  marginTopMedium: {
    marginTop: spacing.md,
  },

  marginTopLarge: {
    marginTop: spacing.lg,
  },

  marginHorizontal: {
    marginHorizontal: spacing.lg,
  },
});
