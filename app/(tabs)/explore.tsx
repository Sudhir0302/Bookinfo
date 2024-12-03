import { StyleSheet, Image, Platform, ScrollView } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <ScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore Famous Books</ThemedText>
      </ThemedView>
      
      <Collapsible title="Harry Potter">
        <ThemedText>
          Written by J.K. Rowling, the *Harry Potter* series follows the journey of a young wizard, Harry, and his friends Hermione and Ron, as they battle the dark wizard Lord Voldemort.
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="The Hobbit">
        <ThemedText>
          *The Hobbit* by J.R.R. Tolkien is a fantasy novel that tells the story of Bilbo Baggins, a hobbit who embarks on a thrilling quest to recover a treasure guarded by the dragon Smaug.
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Pride and Prejudice">
        <ThemedText>
          Jane Austen’s classic novel, *Pride and Prejudice*, explores themes of love, class, and family through the story of Elizabeth Bennet and Mr. Darcy.
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="1984">
        <ThemedText>
          George Orwell’s dystopian novel *1984* delves into themes of surveillance, totalitarianism, and the loss of individuality in a grim future society.
        </ThemedText>
      </Collapsible>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
    marginTop:30
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    marginTop:35
  },
});
