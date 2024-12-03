import React, { useState } from 'react';
import { Linking, Dimensions } from 'react-native';
import {
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  View,
  Modal,
  TouchableOpacity,
  Button,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';

const { width, height } = Dimensions.get('window');

interface VolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  imageLinks?: { thumbnail: string };
  previewLink?: string;
  buyLink?: string;
}

interface Book {
  id: string;
  volumeInfo: VolumeInfo;
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const fetchBooks = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      if (data.items) {
        setBooks(data.items as Book[]);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (book: Book) => {
    setSelectedBook(book);
    setModalVisible(true);
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    const { title, imageLinks } = item.volumeInfo;
    const thumbnail = imageLinks?.thumbnail;

    return (
      <TouchableOpacity onPress={() => handleBookPress(item)}>
        <View style={styles.bookItem}>
          {thumbnail && <Image source={{ uri: thumbnail }} style={styles.bookImage} />}
          <ThemedText type="title" style={styles.bookTitle}>
            {title}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBookDetails = () => {
    if (!selectedBook) return null;

    const { title, authors, description, previewLink, buyLink } =
      selectedBook.volumeInfo;
    const thumbnail = selectedBook.volumeInfo.imageLinks?.thumbnail;

    return (
      <ScrollView contentContainerStyle={styles.modalContent}>
        {thumbnail && <Image source={{ uri: thumbnail }} style={styles.modalImage} />}
        <ThemedText type="title" style={styles.modalTitle}>
          {title}
        </ThemedText>
        <ThemedText style={styles.modalAuthor}>
          {authors ? `By: ${authors.join(', ')}` : 'Author info unavailable'}
        </ThemedText>
        <ThemedText style={styles.modalDescription}>
          {description || 'No description available'}
        </ThemedText>
        <View style={styles.buttonContainer}>
          {previewLink && (
            <Button
              title="Preview"
              onPress={() => {
                Linking.openURL(previewLink).catch((err) =>
                  console.error('Failed to open preview link', err)
                );
              }}
            />
          )}
          {buyLink && (
            <Button
              title="Buy"
              onPress={() => {
                Linking.openURL(buyLink).catch((err) =>
                  console.error('Failed to open buy link', err)
                );
              }}
            />
          )}
        </View>
        <Button title="Close" onPress={() => setModalVisible(false)} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for books"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={fetchBooks} />
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        contentContainerStyle={styles.bookList}
      />
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>{renderBookDetails()}</View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    marginTop: 40,
    backgroundColor: '#F9F9F9',
    color: '#000',
  },
  bookList: {
    paddingBottom: 16,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#F0F0F0',
  },
  bookImage: {
    width: 50,
    height: 75,
    marginRight: 12,
    borderRadius: 4,
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalImage: {
    width: '60%',
    height: height * 0.3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalAuthor: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#555',
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 16,
  },
});
