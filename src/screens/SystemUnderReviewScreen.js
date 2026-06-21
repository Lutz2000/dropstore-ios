import React from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
  StatusBar, Dimensions,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function SystemUnderReviewScreen() {
  const spin  = React.useRef(new Animated.Value(0)).current;
  const pulse = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1, duration: 4000,
        easing: Easing.linear, useNativeDriver: true,
      })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulse }] }]}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <MaterialCommunityIcons name="cog-outline" size={80} color="#FFA100" />
        </Animated.View>
      </Animated.View>
      <Text style={styles.title}>Under Maintenance</Text>
      <Text style={styles.sub}>
        DropStore is currently undergoing scheduled maintenance.{'\n'}
        We'll be back shortly — thank you for your patience!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#1a1a1a',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  iconWrap: { marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16, textAlign: 'center' },
  sub:   { fontSize: 15, color: '#aaa', textAlign: 'center', lineHeight: 24 },
});
