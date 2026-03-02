// src/screens/SellerDashboardScreen.tsx
// Unique seller dashboard with metrics, sales, and orders

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import * as sellerAPI from '../api/seller.api';

type NavigationProp = NativeStackNavigationProp<any, any>;

interface Props {
  navigation: NavigationProp;
}

interface SellerMetrics {
  businessName: string;
  status: string;
  totalProducts: number;
  totalOrders: number;
  totalEarnings: number;
  deliveryRadius: number;
  lastUpdated: string;
}

const SellerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [metrics, setMetrics] = useState<SellerMetrics>({
    businessName: 'Your Store',
    status: 'APPROVED',
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    deliveryRadius: 10,
    lastUpdated: new Date().toLocaleTimeString(),
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [locationRes, productsRes] = await Promise.all([
        sellerAPI.getSellerLocation(),
        sellerAPI.getSellerProducts(),
      ]);

      setMetrics({
        businessName: locationRes.data.businessName || 'Your Store',
        status: locationRes.data.status || 'APPROVED',
        totalProducts: productsRes.data?.products?.length || 0,
        totalOrders: 0, // Will be updated when order APIs are available
        totalEarnings: 0, // Will be updated when analytics APIs are available
        deliveryRadius: locationRes.data.deliveryRadiusKm || 10,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
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
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.storeName}>{metrics.businessName}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, styles.approvedStatus]}>
              ✓ {metrics.status}
            </Text>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <MetricCard
            icon="📦"
            label="Products"
            value={metrics.totalProducts.toString()}
            trend="View all"
            onPress={() => navigation.navigate('SellerProducts')}
          />
          <MetricCard
            icon="📋"
            label="Orders"
            value={metrics.totalOrders.toString()}
            trend="Pending"
            onPress={() => {}}
          />
          <MetricCard
            icon="💰"
            label="Earnings"
            value={`₹${metrics.totalEarnings}`}
            trend="This month"
            onPress={() => {}}
          />
          <MetricCard
            icon="🚚"
            label="Delivery Radius"
            value={`${metrics.deliveryRadius}km`}
            trend="Update"
            onPress={() => navigation.navigate('SellerLocation')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <ActionButton
              icon="➕"
              title="Add Product"
              description="Create new product"
              onPress={() => navigation.navigate('ProductForm')}
              color={colors.primary}
            />
            <ActionButton
              icon="📍"
              title="Update Location"
              description="Set store location"
              onPress={() => navigation.navigate('SellerLocation')}
              color={colors.info}
            />
            <ActionButton
              icon="📊"
              title="View Analytics"
              description="Sales & metrics"
              onPress={() => {}}
              color={colors.success}
            />
            <ActionButton
              icon="⚙️"
              title="Settings"
              description="Account settings"
              onPress={() => {}}
              color={colors.warning}
            />
          </View>
        </View>

        {/* Store Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Overview</Text>
          <View style={styles.overviewCard}>
            <OverviewItem
              icon="📱"
              label="Store Name"
              value={metrics.businessName}
            />
            <OverviewItem
              icon="⚡"
              label="Seller Status"
              value={metrics.status}
            />
            <OverviewItem
              icon="🚚"
              label="Delivery Coverage"
              value={`${metrics.deliveryRadius} km radius`}
            />
            <OverviewItem
              icon="🔄"
              label="Last Updated"
              value={metrics.lastUpdated}
            />
          </View>
        </View>

        {/* Getting Started Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Getting Started Checklist</Text>
          <View style={styles.checklistContainer}>
            <ChecklistItem completed={!!metrics.businessName} text="Store name set up" />
            <ChecklistItem completed={metrics.status === 'APPROVED'} text="Account approved" />
            <ChecklistItem completed={metrics.totalProducts > 0} text="Products added" />
            <ChecklistItem completed={metrics.deliveryRadius > 0} text="Delivery radius set" />
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <View style={styles.helpGrid}>
            <HelpButton
              icon="📖"
              title="Documentation"
              onPress={() =>
                Linking.openURL('https://docs.vyapkart.com/seller')
              }
            />
            <HelpButton
              icon="❓"
              title="FAQ"
              onPress={() => Linking.openURL('https://vyapkart.com/faq')}
            />
            <HelpButton
              icon="💬"
              title="Support Chat"
              onPress={() => Alert.alert('Support', 'Chat coming soon!')}
            />
            <HelpButton
              icon="📞"
              title="Call Us"
              onPress={() => Linking.openURL('tel:+919999999999')}
            />
          </View>
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

// Metric Card Component
const MetricCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  trend: string;
  onPress: () => void;
}> = ({ icon, label, value, trend, onPress }) => (
  <TouchableOpacity style={styles.metricCard} onPress={onPress}>
    <Text style={styles.metricIcon}>{icon}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricTrend}>{trend}</Text>
  </TouchableOpacity>
);

// Action Button Component
const ActionButton: React.FC<{
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  color: string;
}> = ({ icon, title, description, onPress, color }) => (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: color + '15', borderColor: color }]}
    onPress={onPress}
  >
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={[styles.actionTitle, { color }]}>{title}</Text>
    <Text style={styles.actionDescription}>{description}</Text>
  </TouchableOpacity>
);

// Overview Item Component
const OverviewItem: React.FC<{
  icon: string;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.overviewItem}>
    <Text style={styles.overviewIcon}>{icon}</Text>
    <View style={styles.overviewContent}>
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={styles.overviewValue}>{value}</Text>
    </View>
  </View>
);

// Checklist Item Component
const ChecklistItem: React.FC<{ completed: boolean; text: string }> = ({
  completed,
  text,
}) => (
  <View style={styles.checklistItem}>
    <View
      style={[
        styles.checkbox,
        completed && { backgroundColor: colors.success },
      ]}
    >
      {completed && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={[styles.checklistText, completed && styles.completedText]}>
      {text}
    </Text>
  </View>
);

// Help Button Component
const HelpButton: React.FC<{
  icon: string;
  title: string;
  onPress: () => void;
}> = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.helpButton} onPress={onPress}>
    <Text style={styles.helpIcon}>{icon}</Text>
    <Text style={styles.helpTitle}>{title}</Text>
  </TouchableOpacity>
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  greeting: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: colors.success + '20',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.success,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  approvedStatus: {
    color: colors.success,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    elevation: 2,
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  metricTrend: {
    fontSize: 11,
    color: colors.info,
    fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Quick Actions
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: 11,
    color: colors.textLight,
  },

  // Overview Card
  overviewCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  overviewItem: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  overviewIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  overviewContent: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  // Checklist
  checklistContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkmark: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  checklistText: {
    fontSize: 13,
    color: colors.text,
  },
  completedText: {
    color: colors.success,
    textDecorationLine: 'line-through',
  },

  // Help Grid
  helpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  helpButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  helpIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  helpTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
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

export default SellerDashboardScreen;
