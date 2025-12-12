import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showHomeButton?: boolean;
  onHomePress?: () => void;
  rightContent?: React.ReactNode;
  showHelpButton?: boolean;
  onHelpPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showHomeButton = true,
  onHomePress,
  rightContent,
  showHelpButton = true,
  onHelpPress
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        )}
        {showHomeButton && !showBackButton && (
          <TouchableOpacity
            style={styles.homeButton}
            onPress={onHomePress}
          >
            <Ionicons name="home" size={24} color={COLORS.primary} />
            <Text style={styles.homeText}>Home</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.centerSection}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Zenith Nutrition</Text>
      </View>
      
      <View style={styles.rightSection}>
        {rightContent}
        {showHelpButton && (
          <TouchableOpacity
            style={styles.helpButton}
            onPress={onHelpPress}
          >
            <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.helpText}>Need Help?</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    minHeight: 80
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start'
  },
  centerSection: {
    flex: 2,
    alignItems: 'center'
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end'
  },
  title: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 2
  },
  iconButton: {
    padding: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.background
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.background
  },
  homeText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    marginLeft: SIZES.spacing.xs,
    fontWeight: '600'
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.background
  },
  helpText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    marginLeft: SIZES.spacing.xs,
    fontWeight: '500'
  }
});