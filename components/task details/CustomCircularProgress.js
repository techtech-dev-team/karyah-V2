import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const CustomCircularProgress = ({ size = 52, strokeWidth = 4, percentage = 75 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const theme = useTheme();

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={theme ? theme.avatarBg : "#ECF0FF"}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={theme ? theme.primary : "#366CD9"}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[styles.text, { color: theme ? theme.text : "#fff" }]}>{percentage}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    alignSelf: 'center',
    top: '40%',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
});

export default CustomCircularProgress;