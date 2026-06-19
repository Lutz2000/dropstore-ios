import React from 'react';
import {
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
  View, Text, StyleSheet, Animated, Easing,
  StatusBar, Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SystemUnderReviewScreen() {
  const spin = React.useRef(new Animated.Value(0)).current;
  const pulse = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />

      {/* Background gradient dots */}
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

      {/* Gear icon */}
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulse }] }]}>
        <Animated.View style={[styles.gearIcon, { transform: [{ rotate }] }]}>
          <MaterialCommunityIcons name="cog" size={64} color="#f97316" />
        </Animated.View>
      </Animated.View>

      {/* Brand */}
      <View style={styles.brandRow}>
        <Text style={styles.brandDrop}>Drop</Text>
        <Text style={styles.brandStore}>Store</Text>
      </View>

      {/* Status badge */}
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>SYSTEM UNDER REVIEW</Text>
      </View>

      {/* Heading */}
      <Text style={styles.heading}>Under{'\n'}<Text style={styles.headingAccent}>Review</Text></Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Description */}
      <Text style={styles.desc}>
        We are currently performing scheduled maintenance and system improvements.
        We will be back shortly with an even better experience for you.
      </Text>

      {/* Info cards */}
      <View style={styles.cards}>
        {[
          { icon: 'wrench', title: 'Maintenance', sub: 'System updates in progress' },
          { icon: 'lock-outline', title: 'Your Data',   sub: 'Safe and secure' },
          { icon: 'lightning-bolt', title: 'Coming Back', sub: 'Better than ever' },
        ].map((c, i) => (
          <View key={i} style={styles.card}>
            <MaterialCommunityIcons name={c.icon} size={24} color="#f97316" />
            <Text style={styles.cardTitle}>{c.title}</Text>
            <Text style={styles.cardSub}>{c.sub}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Contact us: info@dropstore.click{'\n'}+256 200 907 146
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute', top: -100, left: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(255,161,0,0.08)',
  },
  bgOrb2: {
    position: 'absolute', bottom: -120, right: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(30,58,95,0.5)',
  },
  iconWrap: {
    width: 90, height: 90, borderRadius: 24,
    backgroundColor: 'rgba(255,161,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,161,0,0.3)',
  },
  gearIcon: { fontSize: 44 },
  brandRow: { flexDirection: 'row', marginBottom: 20 },
  brandDrop:  { fontSize: 26, fontWeight: '900', color: '#FFA100' },
  brandStore: { fontSize: 26, fontWeight: '900', color: '#fff' },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,161,0,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,161,0,0.3)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    marginBottom: 20,
  },
  badgeDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#FFA100', marginRight: 7,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFA100', letterSpacing: 1.5 },
  heading: {
    fontSize: 40, fontWeight: '900', color: '#fff',
    textAlign: 'center', lineHeight: 46, marginBottom: 14,
  },
  headingAccent: { color: '#FFA100' },
  divider: {
    width: 50, height: 3,
    backgroundColor: '#FFA100', borderRadius: 2,
    marginBottom: 16,
  },
  desc: {
    fontSize: 13.5, color: 'rgba(255,255,255,0.55)',
    textAlign: 'center', lineHeight: 22,
    marginBottom: 28, maxWidth: 320,
  },
  cards: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  card: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, padding: 12, alignItems: 'center',
  },
  cardIcon:  { fontSize: 22, marginBottom: 6 },
  cardTitle: { fontSize: 11, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 3 },
  cardSub:   { fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  footer: {
    fontSize: 11, color: 'rgba(255,255,255,0.25)',
    textAlign: 'center', lineHeight: 18,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    paddingTop: 16, width: '100%',
  },
});
