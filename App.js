// Working code
import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import { StyleSheet, View, Text, Image, useColorScheme } from 'react-native';

const App = () => {
  const [messages, setMessages] = useState([]);
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    startChat();
  }, []);

  const startChat = async () => {
    try {
      const response = await fetch('http://192.168.75.176:8000/start-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const sendMessage = useCallback(async (messages = []) => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.text.trim()) {
      try {
        setMessages((prevMessages) =>
          GiftedChat.append(prevMessages, [
            { _id: prevMessages.length, text: lastMessage.text, createdAt: new Date(), user: { _id: 1 } },
          ])
        );

        const response = await fetch('http://192.168.75.176:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: lastMessage.text }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        setMessages((prevMessages) =>
          GiftedChat.append(prevMessages, [
            { _id: prevMessages.length + 1, text: data.response, createdAt: new Date(), user: { _id: 2 } },
          ])
        );
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }, []);

  const renderSend = (props) => {
    const sendButtonStyles = {
      backgroundColor: isDarkMode ? 'blue' : 'black',
      marginRight: 15,
      marginBottom: 5,
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
    };

    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <View style={sendButtonStyles}>
          <Text style={{ color: isDarkMode ? 'black' : 'white', fontWeight: 'bold' }}>Send</Text>
        </View>
      </Send>
    );
  };

  const renderAvatar = (props) => {
    return (
      <Image
        source={require('./assets/5.png')}
        style={styles.avatar}
      />
    );
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={sendMessage}
      user={{ _id: 1 }}
      renderSend={renderSend}
      renderAvatar={renderAvatar}
      alwaysShowSend
    />
  );
};

const styles = StyleSheet.create({
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 15,
  },
});

export default App;
