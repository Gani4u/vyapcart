// /src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { logout } from '../services/firebaseAuth.service';
import { useEffect } from 'react';
import { getToken } from '../services/token.service';

export default function HomeScreen() {

  useEffect(() => {
    getToken().then(token => {
      console.log('📦 Stored JWT:', token);
    });
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome to Vyapkart 🎉</Text>

      <Button title="Logout" onPress={logout} />
    </View>
  );
}
