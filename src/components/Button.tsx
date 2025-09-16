import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary : COLORS.text.white}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  
  // Sizes
  small: {
    paddingHorizontal: SIZES.spacing.md,
    minHeight: SIZES.touchTarget.small,
  },
  medium: {
    paddingHorizontal: SIZES.spacing.lg,
    minHeight: SIZES.touchTarget.medium,
  },
  large: {
    paddingHorizontal: SIZES.spacing.xl,
    minHeight: SIZES.touchTarget.large,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.text.white,
  },
  secondaryText: {
    color: COLORS.text.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  
  // Text sizes
  smallText: {
    fontSize: SIZES.font.sm,
  },
  mediumText: {
    fontSize: SIZES.font.md,
  },
  largeText: {
    fontSize: SIZES.font.lg,
  },
  
  // Disabled states
  disabled: {
    backgroundColor: COLORS.button.disabled,
    borderColor: COLORS.button.disabled,
  },
  disabledText: {
    color: COLORS.text.light,
  },
});