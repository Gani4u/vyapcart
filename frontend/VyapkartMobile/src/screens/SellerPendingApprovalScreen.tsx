// src/screens/SellerPendingApprovalScreen.tsx
// Screen shown to sellers waiting for admin approval

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

interface SellerInfo {
  businessName: string;
  onboardedAt: string;
  status: string;
}

const SellerPendingApprovalScreen: React.FC = () => {
  const [sellerInfo, setSellerInfo] = useState<SellerInfo>({
    businessName: 'Your Store',
    onboardedAt: new Date().toISOString(),
    status: 'PENDING',
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSellerInfo();
    }, [])
  );

  const loadSellerInfo = async () => {
    try {
      setLoading(true);
      const userDataString = await AsyncStorage.getItem('USER_DATA');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setSellerInfo({
          businessName: userData.fullName || 'Your Store',
          onboardedAt: new Date().toISOString(),
          status: userData.sellerStatus || 'PENDING',
        });
      }
    } catch (error) {
      console.error('Error loading seller info:', error);
      // Use defaults on error - don't crash
      setSellerInfo({
        businessName: 'Your Store',
        onboardedAt: new Date().toISOString(),
        status: 'PENDING',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const userDataString = await AsyncStorage.getItem('USER_DATA');
      if (userDataString) {
        const userData = JSON.parse(userDataString);

        // Check if status changed to APPROVED
        if (userData.sellerStatus === 'APPROVED') {
          Alert.alert(
            '🎉 Congratulations!',
            'Your seller account has been approved! You can now start managing your products.',
            [{ text: 'OK', onPress: () => {} }]
          );
          // Navigation will automatically update because SellerNavigator is listening
          return;
        }

        setSellerInfo({
          businessName: userData.fullName || 'Your Store',
          onboardedAt: new Date().toISOString(),
          status: userData.sellerStatus || 'PENDING',
        });
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      Alert.alert('Error', 'Failed to check status. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Us',
          onPress: () => Linking.openURL('tel:+919999999999'),
        },
        {
          text: 'Email Us',
          onPress: () => Linking.openURL('mailto:support@vyapkart.com'),
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await AsyncStorage.removeItem('USER_DATA');
            await AsyncStorage.removeItem('AUTH_TOKEN');
            // Parent navigator will detect logout and show auth screens
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.pendingIcon}>⏳</Text>
          <Text style={styles.title}>Approval Pending</Text>
          <Text style={styles.subtitle}>
            Your seller account is under review
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>🔄 {sellerInfo.status}</Text>
            </View>
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.businessName}>{sellerInfo.businessName}</Text>
            <Text style={styles.submissionDate}>
              📅 Submitted on{' '}
              {new Date(sellerInfo.onboardedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What's happening?</Text>

          <View style={styles.infoList}>
            <InfoItem
              icon="📋"
              title="Documents Verification"
              description="Our team is verifying your business documents"
            />
            <InfoItem
              icon="🔒"
              title="Background Check"
              description="We're conducting background verification for security"
            />
            <InfoItem
              icon="✅"
              title="Final Review"
              description="Our team will do final verification and approve your account"
            />
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.timelineTitle}>Expected Timeline</Text>
          <Text style={styles.timelineText}>
            We typically approve seller accounts within <Text style={styles.highlight}>24-48 hours</Text>.
          </Text>
          <Text style={styles.timelineText}>
            You'll receive a notification via email once your account is approved.
          </Text>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips while you wait</Text>
          <View style={styles.tipsList}>
            <TipItem text="Make sure your store location is accurate" />
            <TipItem text="Prepare your product list with descriptions" />
            <TipItem text="Set up your delivery radius preferences" />
            <TipItem text="Ensure your contact details are correct" />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.refreshButtonText}>🔄 Check Status</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.supportButtonText}>📞 Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

          <FAQItem
            question="Why is my approval pending?"
            answer="We verify all seller accounts to ensure quality and trustworthiness of our marketplace. This process typically takes 24-48 hours."
          />

          <FAQItem
            question="What if my account is rejected?"
            answer="If rejected, you'll receive an email with the reason. You can contact support to know more or reapply with corrections."
          />

          <FAQItem
            question="Can I add products while pending approval?"
            answer="No, you can only add products once your account is approved. This ensures all products are from verified sellers."
          />

          <FAQItem
            question="How will I know when I'm approved?"
            answer="You'll receive an email notification immediately when your account is approved. You can also check by refreshing this page."
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Info Item Component
const InfoItem: React.FC<{
  icon: string;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={styles.infoItemContent}>
      <Text style={styles.infoItemTitle}>{title}</Text>
      <Text style={styles.infoItemDescription}>{description}</Text>
    </View>
  </View>
);

// Tip Item Component
const TipItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.tipItem}>
    <Text style={styles.tipBullet}>•</Text>
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

// FAQ Item Component
const FAQItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => (
  <View style={styles.faqItem}>
    <Text style={styles.faqQuestion}>Q: {question}</Text>
    <Text style={styles.faqAnswer}>A: {answer}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textLight,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    paddingVertical: spacing['2xl'],
  },
  pendingIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },

  // Status Card
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  statusBadge: {
    backgroundColor: colors.warning + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning,
  },
  statusContent: {
    marginTop: spacing.md,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  submissionDate: {
    fontSize: 13,
    color: colors.textLight,
  },

  // Info Section
  infoSection: {
    marginBottom: spacing['2xl'],
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoList: {
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  infoItemContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoItemDescription: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },

  // Timeline Section
  timelineSection: {
    backgroundColor: colors.info + '15',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing['2xl'],
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.info,
    marginBottom: spacing.md,
  },
  timelineText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  highlight: {
    fontWeight: '700',
    color: colors.info,
  },

  // Tips Section
  tipsSection: {
    marginBottom: spacing['2xl'],
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  tipsList: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginRight: spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },

  // Button Container
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  supportButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },

  // FAQ Section
  faqSection: {
    marginBottom: spacing['2xl'],
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  faqItem: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  faqAnswer: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },

  // Logout Button
  logoutButton: {
    backgroundColor: colors.danger + '20',
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SellerPendingApprovalScreen;
