// src/components/PremiumProductCard.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { designSystem, premiumStyles } from '../styles/designSystem';

interface PremiumProductCardProps {
  productId: number;
  name: string;
  businessName: string;
  price: number;
  originalPrice?: number;
  distance: number;
  rating?: number;
  reviews?: number;
  badge?: string;
  image?: string;
  onPress?: () => void;
  onAddToCart?: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 48 = 16*3 (padding)

export const PremiumProductCard: React.FC<PremiumProductCardProps> = ({
  productId,
  name,
  businessName,
  price,
  originalPrice,
  distance,
  rating = 4.5,
  reviews = 128,
  badge,
  image,
  onPress,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const discountPercent = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <View style={[styles.container, { width: cardWidth }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={() => setIsHovered(true)}
        onPressOut={() => setIsHovered(false)}
        style={[premiumStyles.cardPremium, isHovered && styles.cardHovered]}
      >
        {/* Badge */}
        {badge && (
          <View style={premiumStyles.cardPremiumBadge}>
            <Text style={premiumStyles.cardPremiumBadgeText}>{badge}</Text>
          </View>
        )}

        {/* Image Section */}
        <View style={premiumStyles.cardPremiumImage}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 48 }}>📦</Text>
          )}

          {/* Discount Badge */}
          {discountPercent !== null && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={premiumStyles.cardPremiumContent}>
          {/* Name */}
          <View style={premiumStyles.cardPremiumHeader}>
            <Text
              style={premiumStyles.cardPremiumName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
          </View>

          {/* Seller Name */}
          <Text
            style={premiumStyles.cardPremiumSeller}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {businessName}
          </Text>

          {/* Rating */}
          <View style={premiumStyles.cardPremiumRating}>
            <Text style={styles.star}>★</Text>
            <Text style={premiumStyles.cardPremiumRatingText}>
              {rating} ({reviews})
            </Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceContainer}>
            <Text style={premiumStyles.cardPremiumPrice}>₹{price}</Text>
            {originalPrice && originalPrice > price && (
              <Text style={premiumStyles.cardPremiumOriginalPrice}>
                ₹{originalPrice}
              </Text>
            )}
          </View>

          {/* Distance Badge */}
          <Text style={premiumStyles.cardPremiumDistance}>
            📍 {distance.toFixed(1)} km away
          </Text>

          {/* Action Button */}
          <View style={premiumStyles.cardPremiumFooter}>
            <TouchableOpacity
              style={premiumStyles.cardPremiumButton}
              onPress={onAddToCart}
              activeOpacity={0.8}
            >
              <Text style={premiumStyles.cardPremiumButtonText}>
                Add to Cart
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: designSystem.spacing.lg,
  },

  cardHovered: {
    ...designSystem.shadows.xl,
    transform: [{ translateY: -4 }],
  },

  discountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: designSystem.colors.danger,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },

  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: designSystem.spacing.sm,
    marginBottom: designSystem.spacing.md,
  },

  star: {
    color: '#FCD34D',
    fontSize: 16,
  },
});

export default PremiumProductCard;
