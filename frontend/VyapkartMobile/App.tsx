import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getProducts } from './src/api/catalog.api';

export default function App() {
  const [status, setStatus] = useState('Connecting...');
  const [products, setProducts] = useState<string[]>([]);

  useEffect(() => {
    getProducts()
      .then(res => {
        setProducts(res.data);
        setStatus('✅ Backend connected');
      })
      .catch(err => {
        console.error(err);
        setStatus('❌ Backend NOT connected');
      });
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        Vyapkart App
      </Text>

      <Text style={{ marginTop: 10 }}>
        {status}
      </Text>

      {products.map(item => (
        <Text key={item}>• {item}</Text>
      ))}
    </View>
  );
}
