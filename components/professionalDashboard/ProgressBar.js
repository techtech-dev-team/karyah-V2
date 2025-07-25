import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProgressBar({ percent = 0, isIssue = false }) {
  const yellowWidth = percent <= 33 ? percent : 33;
  const orangeWidth = percent > 33 ? (percent <= 66 ? percent - 33 : 33) : 0;
  const blueWidth = percent > 66 ? percent - 66 : 0;

  return (
    <View style={styles.progressBarContainer}>
      {isIssue ? (
        <View style={[styles.progressBar, { width: '100%', backgroundColor: '#FF4D4F' }]} />
      ) : (
        <>
          {yellowWidth > 0 && (
            <View style={[styles.progressBar, { width: `${yellowWidth}%`, backgroundColor: '#FFD600' }]} />
          )}
          {orangeWidth > 0 && (
            <View style={[styles.progressBar, { width: `${orangeWidth}%`, backgroundColor: '#FFA500' }]} />
          )}
          {blueWidth > 0 && (
            <View style={[styles.progressBar, { width: `${blueWidth}%`, backgroundColor: '#4F6CFF' }]} />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  progressBarContainer: {
    flexDirection: 'row',
    height: 6,
    width: '100%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 0,
  },
});