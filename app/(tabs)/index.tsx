import React, { useState, useEffect } from 'react';
import {
  Linking,
  Dimensions,
  Share,
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
  infoLink?: string;
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
  const [favorites, setFavorites] = useState<Book[]>([]); 
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(false); 
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false); 

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
        setShowSearchResults(true); 
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://www.googleapis.com/books/v1/volumes?q=bestsellers'
      );
      const data = await response.json();
      if (data.items) {
        setBooks(data.items as Book[]);
        setSearchQuery("");
        setShowSearchResults(false); 
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching default books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultBooks();
  }, []);

  const handleBookPress = (book: Book) => {
    setSelectedBook(book);
    setModalVisible(true);
  };

  const handleShare = async () => {
    if (selectedBook) {
      const { title, authors, previewLink, buyLink } = selectedBook.volumeInfo;
      const message = `Check out this book: ${title} by ${authors?.join(', ')}`;
      try {
        await Share.share({
          message: `${message}\nPreview: ${previewLink || 'N/A'}\nBuy: ${buyLink || 'N/A'}`,
        });
      } catch (error) {
        console.error('Error sharing book:', error);
      }
    }
  };

  const handleFavorite = (book: Book) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.some((fav) => fav.id === book.id)) {
        return prevFavorites.filter((fav) => fav.id !== book.id); 
      } else {
        return [...prevFavorites, book]; 
      }
    });
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    const { title, imageLinks } = item.volumeInfo;
    const thumbnail = imageLinks?.thumbnail;

    const isFavorite = favorites.some((fav) => fav.id === item.id);

    return (
      <TouchableOpacity onPress={() => handleBookPress(item)}>
        <View style={styles.bookItem}>
          {thumbnail && <Image source={{ uri: thumbnail }} style={styles.bookImage} />}
          <ThemedText type="title" style={styles.bookTitle}>
            {title}
          </ThemedText>
          <Button
            title={isFavorite ? '❤️' : '🤍'}
            onPress={() => handleFavorite(item)}
          />y
        </View>
      </TouchableOpacity>
    );
  };

  const renderBookDetails = () => {
    if (!selectedBook) return null;

    const { title, authors, description, previewLink, buyLink, infoLink } = selectedBook.volumeInfo;
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
          {infoLink && (
            <Button
              title="Preview"
              onPress={() => {
                Linking.openURL(infoLink).catch((err) =>
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
          {previewLink && (
            <Button
              title="Read"
              onPress={() => {
                Linking.openURL(previewLink).catch((err) =>
                  console.error('Failed to open reading link', err)
                );
              }}
            />
          )}
          <Button title="Share" onPress={handleShare} />
        </View>
        <Button title="Close" onPress={() => setModalVisible(false)} />
      </ScrollView>
    );
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const toggleFavoritesView = () => {
    setShowFavorites(!showFavorites);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.topBar}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Search for books"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button title="Search" onPress={fetchBooks} />
        {showSearchResults && <Button title="Back" onPress={fetchDefaultBooks} />}
      </View>

      <View style={styles.topBarButtons}>
        <Button title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`} onPress={toggleDarkMode} />
        <Button title="View Favorites" onPress={toggleFavoritesView} />
      </View>

      {showFavorites ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderBookItem}
          contentContainerStyle={styles.bookList}
        />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={renderBookItem}
          contentContainerStyle={styles.bookList}
        />
      )}

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
  darkContainer: {
    backgroundColor: '#333',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#000',
    width: 200,
  },
  darkInput: {
    backgroundColor: '#555',
    color: '#FFF',
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
    backgroundColor: '#123',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalImage: {
    width: 120,
    height: 180,
    marginBottom: 16,
    borderRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalAuthor: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop:30
  },
  topBarButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

