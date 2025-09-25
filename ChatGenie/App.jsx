import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store, persistor} from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingSpinner from './src/components/ui/LoadingSpinner';
import {LogBox} from 'react-native';

// Ignore specific warnings for development
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Warning: Each child in a list should have a unique "key" prop',
]);

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate
          loading={<LoadingSpinner text="Initializing ChatGenie..." />}
          persistor={persistor}>
          <AppNavigator />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;