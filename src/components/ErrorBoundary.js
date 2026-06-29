import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.sub}>Please restart the app.</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', padding: 32 },
  title:     { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  sub:       { color: '#aaa', fontSize: 15, textAlign: 'center', marginBottom: 32 },
  btn:       { backgroundColor: '#FFA100', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
});
