import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

function ModalNewRoom({ setVisible, setUpdateScreen }) {
  const [roomName, setRoomName] = useState('');
  const user = auth().currentUser.toJSON();

  function handleButtonCreate() {
    console.log('criar')
    if (roomName === '') return;

    //deixar apenas cada usuario criar 4 grupos
    firestore().collection('MESSAGE_THREADS')
      .get()
      .then((snapshot) => {
        let myThreads = 0;

        snapshot.docs.map(docItem => {
          if (docItem.data().owner === user.uid) {
            myThreads += 1;
          }
        })
        if (myThreads >= 4) {
          alert('Você já atingiu o limite de grupos por usuario');
        } else {
          createRoom();
        }
      })
  }

  // Criar nova sala no firestore (banco do firebase)
  function createRoom() {
    firestore()
      .collection('MESSAGE_THREADS')
      .add({
        name: roomName,
        owner: user.uid,
        lastMessage: {
          text: `Grupo ${roomName} criado. Bem vindo(a)!`,
          createdAt: firestore.FieldValue.serverTimestamp(),
        }
      })
      .then((docRef) => {
        docRef.collection('MESSAGES').add({
          text: `Grupo ${roomName} criado. Bem vindo(a)!`,
          createdAt: firestore.FieldValue.serverTimestamp(),
          system: true,
        })
          .then(() => {
            setVisible();
            setUpdateScreen();
          })

      })
      .catch((err) => {
        console.log(err);
      })

  }

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={setVisible}>
        <View style={styles.modal}></View>
      </TouchableWithoutFeedback>

      <View style={styles.modalContent}>
        <Text style={styles.title}>Criar um novo Grupo?</Text>
        <TextInput
          value={roomName}
          onChangeText={(text) => setRoomName(text)}
          placeholder="Nome para sua sala?"
          style={styles.input}
        />

        <TouchableOpacity style={styles.buttonCreate} onPress={handleButtonCreate}>
          <Text style={styles.buttonText}>Criar sala</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={setVisible}>
          <Text>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ModalNewRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(34, 34, 34, 0.4)'
  },
  modal: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 15,
  },
  title: {
    marginTop: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 19,
  },
  input: {
    borderRadius: 4,
    height: 45,
    backgroundColor: '#DDD',
    marginVertical: 15,
    fontSize: 16,
    paddingHorizontal: 5,
  },
  buttonCreate: {
    borderRadius: 4,
    backgroundColor: '#2E54D4',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFF'
  },
  backButton: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center'
  }
})