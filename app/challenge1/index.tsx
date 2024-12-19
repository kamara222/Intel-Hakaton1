import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Text, StyleSheet, Image, Dimensions, Animated, KeyboardAvoidingView,Platform} from 'react-native';
import { Send, FileDown, Mic, Paperclip, X } from 'lucide-react-native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

// Définition des types pour une meilleure typage
type MediaType = 'image' | 'video' | 'audio';

// Interface pour structurer les messages de manière enrichie
interface Message {
  id: string;
  text?: string;
  media?: {
    type: MediaType;
    uri: string;
  };
  isUser: boolean;
  timestamp: Date;
  showDownload?: boolean;
}

// Obtenir la largeur de l'écran pour des calculs responsifs
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_CHARACTERS = 220; // Limite de caractères

export default function HomeScreen() {
  // États pour gérer différents aspects de l'application
  const [messages, setMessages] = useState<Message[]>([]); // Liste des messages
  const [inputText, setInputText] = useState(''); // Texte de l'input
  const [attachedImage, setAttachedImage] = useState<string | null>(null); // Image attachée
  const [isLoading, setIsLoading] = useState(false); // État de chargement
  const [hasStartedConversation, setHasStartedConversation] = useState(false); // Début de conversation
  const { t } = useTranslation("home");

  // Références et animations
  const scrollViewRef = useRef<ScrollView>(null);
  const loadingAnimation = useRef<Animated.Value>(new Animated.Value(0)).current;

  // Gestion de la limitation des caractères
  const handleTextChange = (text: string) => {
    // Limiter à 220 caractères
    if (text.length <= MAX_CHARACTERS) {
      setInputText(text);
    }
  };

  // Effet pour gérer l'animation de chargement
  useEffect(() => {
    if (isLoading) {
      // Animation en boucle avec pulsation
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(loadingAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [isLoading]);

  // Bouton de téléchargement pour les messages
  const DownloadButton: React.FC<{ message: Message }> = ({ message }) => {
    // Génération de PDF avec contenu du message
    const generatePDF = async () => {
      try {
        const html = `
          <html>
            <body style="font-family: Arial; padding: 20px;">
              <h1>Contenu du Message</h1>
              ${message.text ? `<p>${message.text}</p>` : ''}
              ${message.media?.type === 'image' ? `<img src="${message.media.uri}" style="max-width: 100%; height: auto;" />` : ''}
            </body>
          </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        await shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Télécharger le message'
        });
      } catch (error) {
        console.error('Erreur de génération PDF', error);
      }
    };

    return (
      <TouchableOpacity onPress={generatePDF} style={styles.downloadButton}>
        <FileDown color="white" size={20} />
        <Text style={{ color: 'white', marginLeft: 8 }}>{t("chat.telechargement")}</Text>
      </TouchableOpacity>
    );
  };

  // Simulation de génération de réponse automatique
  const generateAutoResponse = (userMessage: string, userImage?: string): Promise<Message> => {
    return new Promise((resolve) => {
      // Simulation de temps de traitement
      setTimeout(() => {
        const responses = [
          {
            text: "Merci pour votre message! Voici un exemple de réponse avec image.",
            media: {
              type: 'image',
              uri: 'https://picsum.photos/200/300'
            }
          },
          {
            text: "Je comprends votre message. Laissez-moi vous montrer quelque chose.",
            media: {
              type: 'image',
              uri: 'https://picsum.photos/300/200'
            }
          },
          {
            text: "Voici une réponse textuelle sans image.",
          }
        ];

        const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

        resolve({
          id: `msg-${Date.now()}`,
          text: selectedResponse.text,
          media: selectedResponse.media as { type: MediaType, uri: string },
          isUser: false,
          timestamp: new Date(),
        });
      }, 2000); // Délai de 2 secondes pour simuler le traitement
    });
  };

  // Envoi de message avec gestion de l'état et de l'animation
  const sendMessage = async () => {
    // Validation de l'entrée
    if (inputText.trim() === '' && !attachedImage) return;

    // Marquer le début de la conversation
    if (!hasStartedConversation) {
      setHasStartedConversation(true);
    }

    // Créer un message utilisateur
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: inputText,
      media: attachedImage ? { type: 'image', uri: attachedImage } : undefined,
      isUser: true,
      timestamp: new Date(),
    };

    // Ajouter le message utilisateur
    setMessages(prev => [...prev, userMessage]);

    // Activer l'animation de chargement
    setIsLoading(true);

    try {
      // Générer une réponse automatique
      const autoResponse = await generateAutoResponse(inputText, attachedImage);

      // Désactiver l'animation de chargement
      setIsLoading(false);

      // Ajouter la réponse
      setMessages(prev => [...prev, autoResponse]);
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse', error);
      setIsLoading(false);
    }

    // Réinitialiser l'entrée et l'image
    setInputText('');
    setAttachedImage(null);

    // Défiler vers le bas
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Sélection d'image depuis la bibliothèque
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setAttachedImage(result.assets[0].uri);
    }
  };

  // Rendu d'un message individuel
  const renderMessage = (message: Message) => {
    const MessageContent = () => (
      <View style={[
        message.isUser ? styles.userBubble : styles.responseBubble,
        { paddingBottom: message.media ? 0 : 10 }
      ]}>
        {message.media?.type === 'image' && (
          <Image
            source={{ uri: message.media.uri }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        )}
        {message.text && (
          <Text style={message.isUser ? styles.userText : styles.responseText}>
            {message.text}
          </Text>
        )}
      </View>
    );

    return (
      <TouchableOpacity
        key={message.id}
        onLongPress={() => {
          // Basculer la visibilité du bouton de téléchargement
          setMessages(prev =>
            prev.map(m =>
              m.id === message.id
                ? { ...m, showDownload: !m.showDownload }
                : m
            )
          );
        }}
        delayLongPress={500}
        style={styles.messageContainer}
      >
        <MessageContent />
        {!message.isUser && message.showDownload && (
          <DownloadButton message={message} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0  : 0}
    >
      {/* <View style={styles.container}> */}
        {/* Header de l'application */}
        <View style={styles.header}>
          <View>
            <TouchableOpacity style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{t("chat.title")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Écran de bienvenue avec animation Lottie */}
        {!hasStartedConversation && (
          <View style={styles.lottiePlaceholder}>
            <LottieView
              source={require('../../assets/Lotti/Welcom.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <Text style={styles.welcomeText}>{t("chat.description1")}</Text>
            <Text style={styles.DesciptionText}>{t("chat.description2")}</Text>
          </View>
        )}

        {/* Liste des messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          // keyboardShouldPersistTaps="handled"
        >
          {messages.map(renderMessage)}

          {/* Indicateur de chargement animé */}
          {isLoading && (
            <Animated.View
              style={[
                styles.loadingIndicator,
                {
                  opacity: loadingAnimation,
                  transform: [{
                    scale: loadingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.loadingText}>Chargement...</Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Prévisualisation de l'image attachée */}
        {attachedImage && (
          <View style={styles.attachedImagePreview}>
            <Image
              source={{ uri: attachedImage }}
              style={styles.attachedImageThumbnail}
            />
            <TouchableOpacity onPress={() => setAttachedImage(null)}>
              <X color="red" size={24} />
            </TouchableOpacity>
          </View>
        )}

        {/* Conteneur de saisie */}
        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Votre message..."
            style={styles.input}
            multiline
            maxLength={MAX_CHARACTERS}
          />

          {/* Nouveau compteur de caractères */}
          <View style={{ position: 'absolute', bottom: 5, right: 50, backgroundColor: '#ECF0F1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, }}>
            <Text style={{ fontSize: 13, color: '#7F8C8D', }}>
              {inputText.length}/{MAX_CHARACTERS}
            </Text>
          </View>

          <TouchableOpacity onPress={sendMessage}>
            <Send color="#3498DB" size={25} />
          </TouchableOpacity>
        </View>
      {/* </View> */}
    </KeyboardAvoidingView>
  );
}

// Styles de l'application
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',

  },
  header: {
    padding: 10,
    margin: 20,
    marginTop: '15%',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 10,
    elevation: 8,
  },
  headerTitleContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 50
  },
  headerTitle: {
    color: '#2C3E50'
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 8,
  },
  userBubble: {
    backgroundColor: '#3498DB',
    alignSelf: 'flex-end',
    borderRadius: 15,
    padding: 10,
    maxWidth: '80%',
  },
  responseBubble: {
    backgroundColor: '#ECF0F1',
    alignSelf: 'flex-start',
    borderRadius: 15,
    padding: 10,
    maxWidth: '80%',
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  responseText: {
    color: '#2C3E50',
    fontSize: 16,
  },
  mediaImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: 10,
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 30,
    bottom: "4%",
    width: '90%',
    marginLeft: '5%',
    marginTop: 20,
    elevation: 5,
    paddingBottom: 30
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  lottiePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC'
  },
  lottieAnimation: {
    width: 350,
    height: 350,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#2C3E50',
    marginTop: 20
  },
  DesciptionText: {
    fontSize: 14,
    color: '#2C3E50',
    marginTop: 5
  },
  loadingIndicator: {
    alignSelf: 'center',
    backgroundColor: '#ECF0F1',
    padding: 15,
    borderRadius: 20,
    marginTop: 10
  },
  loadingText: {
    color: '#3498DB',
    fontSize: 16
  },
  attachedImagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white'
  },
  attachedImageThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10
  }
});
