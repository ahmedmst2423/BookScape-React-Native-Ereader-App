import { Image, StyleSheet, View } from 'react-native'
import { Text, MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper'
import { useEffect } from 'react'

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    setTimeout(() => {
    
      navigation.replace('BottomTabs');
    }, 3000)
  }, [])

  return (
    <PaperProvider theme={MD3DarkTheme}>
      <View style={styles.container}>
        <Image 
          style={styles.image} 
          source={require('../assets/books.png')}
          resizeMode="contain"
        />
        <Text variant="displayMedium" style={styles.heading}>BookScape!</Text>
      </View>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MD3DarkTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  heading: {
    color: MD3DarkTheme.colors.onBackground,
    textAlign: 'center',

  }
})